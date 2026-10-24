import {rational as r, addRational as add, multiplyRational as mul, divideRational as div, subtractRational as sub, type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {DeterminantProblem, DeterminantRowOperation as RowOp, SquareDeterminantMatrix as Square, UniversityFamily} from "./schema";
import {teaching,calculate} from "./teaching";

const zero=(v:Rational)=>v.numerator===0n;
const compact=(matrix:Square)=>matrix.map(row=>"["+row.map(f).join(", ")+"]").join("; ");

function transform(matrix:Square,op:RowOp):Square{
  const next=matrix.map(row=>[...row]);
  if(op.kind==="swap"){
    [next[op.first],next[op.second]]=[next[op.second],next[op.first]];
  }else if(op.kind==="add"){
    next[op.target]=next[op.target].map((v,j)=>add(v,mul(op.multiple,next[op.source][j])));
  }else{
    next[op.row]=next[op.row].map(v=>mul(v,op.factor));
  }
  return next;
}

/** Mixed 4×4/5×5 matrices: some singular, some with fractions; the first displayed pivot is zero. */
function makeGaussian(variant:number,level:Difficulty,n:4|5):DeterminantProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24)throw Error("Invalid P0E1 variant");
  const tier=level==="medium"?1:level==="hard"?2:level==="advanced"?3:4;
  const diag=Array.from({length:n},(_,i)=>i===0?r(variant+1+24*tier,tier+1):
    i===n-1&&variant%6===0?r(0):r((variant+i)%4+1));
  const upper:Square=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>
    j<i?r(0):i===j?diag[i]:i===0&&j===n-1?r(variant-11):r((variant+2*i+3*j+tier)%5-2)));
  let matrix=transform(upper,{kind:"swap",first:0,second:n-1});
  for(let i=1;i<n;i++){
    const multiplier=r((variant+i)%2===0?-1:2,i%2===0&&tier>=2?2:1);
    matrix=transform(matrix,{kind:"add",target:i,source:i-1,multiple:multiplier});
  }
  if(tier>=2)
    for(let i=n-2;i>=1;i--)
      matrix=transform(matrix,{kind:"add",target:i,source:i+1,multiple:r(i%2===0?1:-1)});
  if(tier>=3)
    matrix=transform(matrix,{kind:"scale",row:1,factor:r(-3,2)});
  if(tier===4)
    matrix=transform(matrix,{kind:"scale",row:n-2,factor:r(2,3)});
  return {kind:"determinant",method:n===4?"gaussian-four":"gaussian-five",matrix};
}

export const gaussianPivotFamilies:readonly UniversityFamily[]=[
  {id:"determinant-gaussian-pivot-four",category:"determinants",
   titles:{pl:"Wyznacznik 4×4: dobór pivota w eliminacji",en:"4×4 determinant: Gaussian pivot selection"},
   supportedDifficulties:["medium","hard","advanced"],
   create:(v,level)=>makeGaussian(v,level,4)},
  {id:"determinant-gaussian-pivot-five",category:"determinants",
   titles:{pl:"Wyznacznik 5×5: dobór pivota w eliminacji",en:"5×5 determinant: Gaussian pivot selection"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(v,level)=>makeGaussian(v,level,5)},
];

export type GaussianPivotStep=Readonly<{operation:RowOp;matrix:Square}>;
export type GaussianPivotTrace=Readonly<{
  steps:readonly GaussianPivotStep[];
  matrix:Square;
  singularColumn:number|null;
  swaps:number;
  value:Rational;
}>;

/** Exact row additions and swaps only, with a zero-pivot termination for singular matrices. */
export function gaussianPivotTrace(input:Square):GaussianPivotTrace{
  const n=input.length;
  if((n!==4&&n!==5)||input.some(row=>row.length!==n))throw Error("Expected 4×4 or 5×5 matrix");
  let matrix:Square=input.map(row=>[...row]),swaps=0;
  const steps:GaussianPivotStep[]=[];
  const apply=(op:RowOp)=>{
    matrix=transform(matrix,op);
    steps.push({operation:op,matrix});
  };
  for(let col=0;col<n;col++){
    const pivot=matrix.findIndex((row,i)=>i>=col&&!zero(row[col]));
    if(pivot===-1)return {steps,matrix,singularColumn:col,swaps,value:r(0)};
    if(pivot!==col){
      apply({kind:"swap",first:col,second:pivot});
      swaps++;
    }
    for(let row=col+1;row<n;row++){
      if(zero(matrix[row][col]))continue;
      const factor=sub(r(0),div(matrix[row][col],matrix[col][col]));
      apply({kind:"add",target:row,source:col,multiple:factor});
    }
  }
  const diagonal=matrix.map((row,i)=>row[i]);
  const product=diagonal.reduce(mul,r(1));
  return {steps,matrix,singularColumn:null,swaps,value:mul(r(swaps%2?-1:1),product)};
}

export function presentGaussianPivot(p:DeterminantProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const n=p.method==="gaussian-four"?4:5;
  if(p.matrix.length!==n||p.matrix.some(row=>row.length!==n))
    throw Error("Invalid Gaussian determinant size");
  const trace=gaussianPivotTrace(p.matrix);
  lesson.work("A = "+compact(p.matrix),
    t("Sprawdzamy pivot od pierwszej kolumny. Jeśli jest zerowy, szukamy niezerowego poniżej.",
      "Inspect the pivot from the first column. If it is zero, look for a nonzero entry below."));
  for(const step of trace.steps){
    const op=step.operation;
    const action=op.kind==="swap"?"R"+(op.first+1)+" ↔ R"+(op.second+1)
      :op.kind==="add"?"R"+(op.target+1)+" ← R"+(op.target+1)+" + ("+f(op.multiple)+")R"+(op.source+1)
      :"R"+(op.row+1)+" ← ("+f(op.factor)+")R"+(op.row+1);
    lesson.work(action+": "+compact(step.matrix),
      op.kind==="swap"?t("Zamiana dwóch wierszy zmienia znak wyznacznika.",
          "Swapping two rows reverses the determinant sign.")
        :t("Dodajemy wielokrotność wiersza pivota, aby uzyskać zero poniżej; wyznacznik pozostaje bez zmiany.",
          "Add a multiple of the pivot row to eliminate below it; the determinant stays unchanged."));
  }
  if(trace.singularColumn!==null){
    lesson.work(t("Kolumna "+(trace.singularColumn+1)+": brak niezerowego pivota; det(A)=0",
      "Column "+(trace.singularColumn+1)+": no nonzero pivot; det(A)=0"),
      t("Nie można wybrać kolejnego pivota. Wyznacznik wynosi zero; nigdy nie dzielimy przez zero.",
        "No nonzero pivot remains. The determinant is zero; never divide by zero."));
  }else{
    const diagonal=trace.matrix.map((row,i)=>row[i]);
    lesson.work("det(A) = (−1)^"+trace.swaps+" · "+diagonal.map(v=>"("+f(v)+")").join(" · ")+" = "+f(trace.value),
      t("Mnożymy przekątną macierzy trójkątnej i uwzględniamy znak każdej zamiany wierszy.",
        "Multiply the upper-triangular diagonal and apply the sign of every row swap."),
      calculate("product",r(trace.swaps%2?-1:1),...diagonal));
  }
  return lesson.finish(
    t("Oblicz det(A) metodą eliminacji Gaussa dla A="+compact(p.matrix)+". Wybieraj niezerowe pivoty i kontroluj znak.",
      "Find det(A) by Gaussian elimination for A="+compact(p.matrix)+". Choose nonzero pivots and track the sign."),
    {kind:"scalar",value:trace.value},
    t("Jeżeli pivot to zero, zamień wiersze i zapisz zmianę znaku.",
      "If a pivot is zero, swap rows and record the sign change."),
    t("Dodawanie wielokrotności wiersza zachowuje wyznacznik; brak pivota daje det(A)=0.",
      "Row additions preserve the determinant; a missing pivot gives det(A)=0."));
}
