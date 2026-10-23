import { rational as r, addRational as add, multiplyRational as mul, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { classifySystem, gaussianElimination, parameterization, type ExactMatrix } from "./linearAlgebraMath";
import { teaching } from "./teaching";

type Linear = Extract<LinearAlgebraProblem,{kind:"linear-system"}>;
const compact=(m:ExactMatrix)=>`[${m.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const zero=r(0),one=r(1);
const varNames=["x","y","z","w"];

/** Canonical affine coefficients for x_j=c_j+sum_k alpha_jk*t_k.
 *  t_k is exactly the kth free variable, in left-to-right column order. */
export function affineCoefficients(result:ReturnType<typeof classifySystem>,n:number):readonly (readonly Rational[])[] {
  if(result.kind!=="system-many"||result.freeColumns.length<1||result.freeColumns.length>2)
    throw Error("Parametric Gauss exercise needs one or two free columns");
  return Array.from({length:n},(_,j)=>{
    const freeIndex=result.freeColumns.indexOf(j);
    if(freeIndex>=0)return [zero,...result.freeColumns.map((_,k)=>k===freeIndex?one:zero)];
    const row=result.reduction.pivots.indexOf(j);
    if(row<0)throw Error("Pivot not found");
    return [result.reduction.matrix[row][n],
      ...result.freeColumns.map(col=>mul(r(-1),result.reduction.matrix[row][col]))];
  });
}

function construct(v:number,level:Difficulty,free:number):Linear {
  if(!Number.isInteger(v)||v<0||v>=24)throw Error("Invalid variant");
  const n=level==="hard"?3:4;
  if(free<1||free>2||free>=n)throw Error("Invalid number of free variables");
  const freeCols=free===1?[v%n]:[v%n,(v%n+1)%n].sort((a,b)=>a-b);
  const pivotCols=Array.from({length:n},(_,j)=>j).filter(j=>!freeCols.includes(j));
  const rank=n-free;
  const rows:Rational[][]=[];
  const rhs:Rational[]=[];
  // Build an exact independent row basis, then apply only invertible row operations.
  for(let i=0;i<rank;i++){
    const row=Array.from({length:n},()=>zero);
    row[pivotCols[i]]=one;
    for(let k=0;k<freeCols.length;k++){
      const raw=(v+3*i+2*k)%5-2;
      row[freeCols[k]]=r(raw===0?(i+k)%2?2:-1:raw,level==="expert"?2:1);
    }
    const coefficient=r((v*3+2*i)%9-4,level==="expert"?2:1);
    const factor=level==="expert"?r(i%2?-2:3):r(i%2?-1:2);
    rows.push(row.map(x=>mul(factor,x)));
    rhs.push(mul(factor,coefficient));
  }
  for(let i=rank;i<n;i++){
    const a=r(i%2?1:2),b=r((v+i)%2?-1:1);
    rows.push(rows[0].map((x,j)=>add(mul(a,x),mul(b,rows[rank-1][j]))));
    rhs.push(add(mul(a,rhs[0]),mul(b,rhs[rank-1])));
  }
  const rotate=v%n;
  const matrix=Array.from({length:n},(_,i)=>rows[(i+rotate)%n]);
  const values=Array.from({length:n},(_,i)=>rhs[(i+rotate)%n]);
  return {kind:"linear-system",method:"parameters",matrix,rhs:values};
}

export const gaussParameterFamilies:readonly UniversityFamily[]=[
  {id:"gauss-parameters-one",category:"systems",
   titles:{pl:"Gauss: pełne rozwiązanie z parametrem t1",en:"Gauss: full solution with one parameter t1"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(variant,level)=>construct(variant,level,1)},
  {id:"gauss-parameters-two",category:"systems",
   titles:{pl:"Gauss: pełne rozwiązanie z parametrami t1 i t2",en:"Gauss: full solution with parameters t1 and t2"},
   supportedDifficulties:["advanced","expert"],
   create:(variant,level)=>construct(variant,level,2)},
];

export function presentGaussParameters(problem:Linear,locale:Locale) {
  if(problem.method!=="parameters")throw Error("Not a parametric Gauss exercise");
  const lesson=teaching(locale),{t}=lesson;
  const n=problem.matrix[0].length;
  const rectangular=problem.matrix.length!==n;
  const names=varNames.slice(0,n);
  const augmented=problem.matrix.map((row,i)=>[...row,problem.rhs[i]]);
  const result=classifySystem(problem.matrix,problem.rhs);
  if(result.kind!=="system-many")throw Error("Constructed system must be consistent and underdetermined");
  const forward=gaussianElimination(problem.matrix,problem.rhs);
  lesson.work(`[A|b] = ${compact(augmented)}`,
    t("Zapisz układ jako macierz rozszerzoną i eliminuj współczynniki pod pivotami.",
      "Write the augmented matrix and eliminate entries below the pivots."));
  for(const step of forward.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,
    t("Operacja wierszowa zachowuje zbiór wszystkich rozwiązań.",
      "Row operations preserve the full solution set."));
  lesson.work(`rank(A)=rank([A|b])=${result.rankA}<n=${n}`,
    t("Układ ma nieskończenie wiele rozwiązań; liczba parametrów jest równa n−rank(A).",
      "The system has infinitely many solutions; there are n−rank(A) free parameters."));
  lesson.work(`RREF([A|b])=${compact(result.reduction.matrix)}`,
    t("Doprowadzamy układ do zredukowanej postaci schodkowej.",
      "Compute the reduced row echelon form."));
  const coefficients=affineCoefficients(result,n);
  const formulas=parameterization(result,names);
  lesson.work(formulas.join("; "),
    t("Oznacz zmienne swobodne od lewej przez t1, t2. Każdą pozostałą wyraź jako stałą i liniową kombinację parametrów.",
      "Name the free variables t1, t2 from left to right. Express all other variables as constants plus parameter terms."));
  for(let i=0;i<problem.matrix.length;i++){
    const lhs=Array.from({length:coefficients[0].length},(_,k)=>problem.matrix[i]
      .reduce((sum,value,j)=>add(sum,mul(value,coefficients[j][k])),zero));
    if(lhs[0].numerator!==problem.rhs[i].numerator||lhs[0].denominator!==problem.rhs[i].denominator
      ||lhs.slice(1).some(value=>value.numerator!==0n))
      throw Error("Parametric solution does not satisfy the original system");
    if(rectangular)lesson.work(
      `R${i+1}: `+lhs.map((_,k)=>
        `${k===0?t("stała","constant"):`t${k}`}: `+
        problem.matrix[i].map((value,j)=>`(${f(value)})·(${f(coefficients[j][k])})`).join(" + ")+
        ` = ${f(k===0?problem.rhs[i]:zero)}`).join("; "),
      t("Podstawiamy części stałe i oddzielnie współczynniki każdego parametru do tego oryginalnego równania.",
        "Substitute the constants and each parameter's coefficients separately into this original equation."));
  }
  lesson.work(t("Sprawdzenie: wyrazy stałe spełniają Ax=b, a wszystkie współczynniki przy t spełniają Ax=0.",
    "Verification: constant terms satisfy Ax=b, and all parameter coefficients satisfy Ax=0."),
    t("Sprawdzamy równania oddzielnie dla części stałej i każdego parametru, nie tylko dla t=0.",
      "Verify the constant and each parameter coefficient separately, not only t=0."));
  const labels=names.flatMap(name=>[
    t(`${name}: stała`,`${name}: constant`),
    ...result.freeColumns.map((_,i)=>`${name}: t${i+1}`),
  ]);
  const values=coefficients.flat();
  const answer:AnswerSpec={kind:"list",labels,values};
  const freeText=result.freeColumns.map((col,i)=>`${names[col]}=t${i+1}`).join(", ");
  const example=result.freeColumns.length===1?"x=c+at1":"x=c+at1+bt2";
  const prompt=t(
    `Rozwiąż metodą Gaussa: [A|b]=${compact(augmented)}. Zmienne swobodne: ${freeText}. Wpisz dla każdej niewiadomej STAŁĄ oraz WSPÓŁCZYNNIKI przy t1${result.freeColumns.length===2?" i t2":""}, np. ${example}. Nie wpisuj całego wyrażenia do jednego pola.`,
    `Solve by Gaussian elimination: [A|b]=${compact(augmented)}. Free variables: ${freeText}. For each unknown, enter the CONSTANT and the COEFFICIENTS of t1${result.freeColumns.length===2?" and t2":""}, e.g. ${example}. Do not enter an entire expression in one field.`);
  return lesson.finish(prompt,answer,
    t(`Najpierw oblicz rzędy i wybierz zmienne swobodne: ${freeText}.`,
      `Find ranks and identify free variables: ${freeText}.`),
    t("W postaci RREF odczytaj wyrazy stałe; przenieś współczynniki zmiennych swobodnych na prawą stronę ze zmienionym znakiem.",
      "In RREF, read constants and move free-variable coefficients to the right with opposite signs."));
}
