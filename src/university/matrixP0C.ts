import { rational as r } from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import { addMatrices, subtractMatrices, multiplyMatrices, transposeMatrix, scaleMatrix, matrixShape, type Matrix } from "../matrices";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { Practice } from "./matrixPractice";
import { teaching } from "./teaching";

type P0C = Practice & {mode:"rectangular"|"transpose-dimensions"};
type Shape = Readonly<{rows:number; columns:number}>;
const dims=(m:Shape)=>m.rows+"×"+m.columns;
const printed=(m:Matrix)=>"["+m.map(row=>row.map(fmt).join(", ")).join("; ")+"]";
const opposite=(n:number)=>n===2?3:2;
function data(v:number,level:Difficulty,rows:number,cols:number,salt:number):Matrix{
  return Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>{
    const value=i===0&&j===0 ? v%5-2+salt%2 :
      i===0&&j===1 ? Math.floor(v/5)-2+salt%2 :
      (v+2*i+3*j+2*salt)%5-2;
    return r(value+(level==="medium"&&i===0&&j===0?6:0),level==="hard"&&(i+j)%2===1?2:1);
  }));
}
function dimensionsCase(v:number,level:Difficulty):{expression:P0C["expression"];shapes:readonly Shape[]}{
  const rows=2+v%2, inner=opposite(rows), columns=2+Math.floor(v/2)%2;
  const valid=level==="medium" ? Math.floor(v/2)%2===0 : level==="hard"?Math.floor(v/4)%2===0:v%2===0;
  const a={rows,columns:inner},br=valid?rows:inner;
  const scenario=level==="easy"?0:level==="medium"?v%2:v%4;
  switch(scenario){
    case 0: return {expression:level==="easy"?"AᵀB":"Aᵀ(B+C)",
      shapes:level==="easy"?[a,{rows:br,columns}]:[a,{rows,columns},{rows:valid?rows:inner,columns}]};
    case 1: return {expression:"(AB)ᵀ+C",shapes:[a,{rows:valid?inner:rows,columns},{rows:columns,columns:rows}]};
    case 2: return {expression:"ABᵀ+C",shapes:[a,{rows:columns,columns:valid?inner:rows},{rows,columns}]};
    default:return {expression:"(A+Bᵀ)C",shapes:[a,{rows:valid?inner:rows,columns:rows},{rows:inner,columns}]};
  }
}
export function makeMatrixP0C(mode:P0C["mode"],v:number,level:Difficulty):P0C{
  if(!Number.isInteger(v)||v<0||v>=24||!["easy","medium","hard"].includes(level))throw Error("Unsupported P0C variant");
  if(mode==="transpose-dimensions"){
    const setup=dimensionsCase(v,level);
    return {kind:"linear-matrix-practice",mode,expression:setup.expression,
      matrices:setup.shapes.map((s,i)=>({label:["A","B","C"][i],values:data(v,level,s.rows,s.columns,i)}))};
  }
  // Two existing variant profiles now represent whole source exercise forms:
  // M01: scalar multiplication followed by subtraction on a 2×3 matrix;
  // M02: a 3×3 square matrix added to its own transpose.
  // No new family, level or variant: the catalogue count stays unchanged.
  if(v%6===0)return {kind:"linear-matrix-practice",mode,expression:"3A−B",
    matrices:[{label:"A",values:data(v,level,2,3,0)},
      {label:"B",values:data(v,level,2,3,1)}]};
  if(v%6===2)return {kind:"linear-matrix-practice",mode,expression:"A+Aᵀ",
    matrices:[{label:"A",values:data(v,level,3,3,0)}]};
  const rows=2+v%2, inner=opposite(rows), columns=2+Math.floor(v/2)%2;
  const expression:P0C["expression"]=level==="easy"?(v%2?"AB+C":"(A+B)C"):
    level==="medium"? (["AB+C","(A+B)C","A(B−C)"] as const)[v%3]:
    v%2?"(AB)ᵀ−C":"(AB)ᵀ−(3/2)C";
  let shapes:readonly Shape[];
  if(expression==="(A+B)C")shapes=[{rows,columns:inner},{rows,columns:inner},{rows:inner,columns}];
  else if(expression==="A(B−C)")shapes=[{rows,columns:inner},{rows:inner,columns},{rows:inner,columns}];
  else shapes=[{rows,columns:inner},{rows:inner,columns},
    expression.startsWith("(AB)ᵀ")?{rows:columns,columns:rows}:{rows,columns}];
  return {kind:"linear-matrix-practice",mode,expression,
    matrices:shapes.map((s,i)=>({label:["A","B","C"][i],values:data(v,level,s.rows,s.columns,i)}))};
}

export const matrixP0CFamilies:readonly UniversityFamily[]=[
  {id:"matrix-rectangular-evaluation",category:"matrices",
    titles:{pl:"Obliczenia na macierzach prostokątnych",en:"Rectangular matrix expression calculations"},
    supportedDifficulties:["easy","medium","hard"],create:(v,d)=>makeMatrixP0C("rectangular",v,d)},
  {id:"matrix-transpose-dimensions",category:"matrices",
    titles:{pl:"Wymiary działań z transpozycją",en:"Dimensions of expressions with transposes"},
    supportedDifficulties:["easy","medium","hard"],create:(v,d)=>makeMatrixP0C("transpose-dimensions",v,d)},
];
const dimOptions=(locale:Locale)=>[
  {value:"not-possible",label:locale==="pl"?"Nie można wykonać":"Not possible"},
  ...[2,3].flatMap(i=>[2,3].map(j=>({value:i+"x"+j,label:i+" × "+j}))),
];
const S=(r:number,c:number):Shape=>({rows:r,columns:c});
const productShape=(a:Shape|null,b:Shape|null):Shape|null=>a&&b&&a.columns===b.rows?S(a.rows,b.columns):null;
const sumShape=(a:Shape|null,b:Shape|null):Shape|null=>
  a&&b&&a.rows===b.rows&&a.columns===b.columns?a:null;
const transShape=(a:Shape|null):Shape|null=>a?S(a.columns,a.rows):null;
export function presentMatrixP0C(p:P0C,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const by=(name:string):Matrix=>{
    const value=p.matrices.find(m=>m.label===name);
    if(!value)throw Error("Missing matrix "+name);
    return value.values;
  };
  const A=by("A"),B=p.matrices.some(m=>m.label==="B")?by("B"):null,C=p.matrices.length>2?by("C"):null;
  for(const input of p.matrices){
    lesson.work("dim("+input.label+") = "+dims(matrixShape(input.values)),
      t("Wypisz osobno liczby wierszy i kolumn; nie zamieniaj ich kolejności.",
        "Count rows and columns separately; do not reverse their order."));
  }
  if(p.mode==="rectangular"){
    if(p.expression==="3A−B"){
      if(!B)throw Error("3A−B requires B");
      const threeA=scaleMatrix(A,r(3)), result=subtractMatrices(threeA,B);
      lesson.work("3A = "+printed(threeA),
        t("Najpierw pomnóż każdy element A przez 3.",
          "First multiply every entry of A by 3."));
      for(let i=0;i<result.length;i++)for(let j=0;j<result[i].length;j++)
        lesson.work("c"+(i+1)+(j+1)+" = 3·("+fmt(A[i][j])+") − ("+fmt(B[i][j])+") = "+fmt(result[i][j]),
          t("Odejmuj element B z tej samej pozycji i zachowaj znak.",
            "Subtract B at the same entry position and preserve the sign."));
      lesson.work("3A−B = "+printed(result),
        t("Sprawdź wynikowy wymiar 2×3 i wszystkie sześć pól.",
          "Verify the 2×3 result shape and all six entries."));
      return lesson.finish(
        t("Oblicz 3A−B. Wpisz całą macierz wynikową.",
          "Calculate 3A−B. Enter the entire resulting matrix."),
        {kind:"matrix",values:result},
        t("Najpierw oblicz 3A, dopiero potem odejmij B.",
          "Calculate 3A first, then subtract B."),
        t("Minus przed ujemnym elementem B zmienia znak na plus.",
          "Subtracting a negative B entry changes the sign to plus."));
    }
    if(p.expression==="A+Aᵀ"){
      const shape=matrixShape(A);
      if(shape.rows!==3||shape.columns!==3)throw Error("A+Aᵀ requires 3×3");
      const transpose=transposeMatrix(A), result=addMatrices(A,transpose);
      lesson.work("Aᵀ = "+printed(transpose),
        t("Transpozycja zamienia wiersze z kolumnami macierzy A.",
          "Transposition exchanges rows and columns of A."));
      for(let i=0;i<3;i++)for(let j=0;j<3;j++)
        lesson.work("c"+(i+1)+(j+1)+" = ("+fmt(A[i][j])+") + ("+fmt(A[j][i])+") = "+fmt(result[i][j]),
          t("Dodaj aᵢⱼ do aⱼᵢ, nie do tego samego pola po przestawieniu.",
            "Add aᵢⱼ to aⱼᵢ, not to an unchanged-position entry."));
      lesson.work("A+Aᵀ = "+printed(result),
        t("Wynik musi być symetryczny: cᵢⱼ = cⱼᵢ.",
          "The result must be symmetric: cᵢⱼ = cⱼᵢ."));
      return lesson.finish(
        t("Oblicz A+Aᵀ dla macierzy 3×3. Wpisz wynik.",
          "Calculate A+Aᵀ for the 3×3 matrix. Enter the result."),
        {kind:"matrix",values:result},
        t("Zamień wiersze A na kolumny, potem dodawaj odpowiadające sobie pola.",
          "Swap rows of A for columns, then add matching entries."),
        t("Element na przekątnej wyniku jest podwójnym elementem A.",
          "A result diagonal entry is twice the corresponding A entry."));
    }
    if(!B||!C)throw Error("Composite operation needs B and C");
    let result:Matrix;
    if(p.expression==="AB+C"||p.expression==="(AB)ᵀ−C"||p.expression==="(AB)ᵀ−(3/2)C"){
      const ab=multiplyMatrices(A,B);
      lesson.work("AB = "+printed(ab),
        t("Każdą komórkę oblicz jako sumę iloczynów wiersza A i kolumny B.",
          "Compute each entry as the sum of products from a row of A and a column of B."));
      if(p.expression==="AB+C")result=addMatrices(ab,C);
      else{
        const abt=transposeMatrix(ab);
        lesson.work("(AB)ᵀ = "+printed(abt),
          t("Dopiero po mnożeniu zamień wiersze otrzymanej macierzy z jej kolumnami.",
            "Only after multiplication, interchange rows and columns of the product."));
        const subtrahend=p.expression==="(AB)ᵀ−C"?C:scaleMatrix(C,r(3,2));
        if(p.expression==="(AB)ᵀ−(3/2)C")
          lesson.work("(3/2)C = "+printed(subtrahend),
            t("Pomnóż każdy element macierzy C przez trzy drugie przed odejmowaniem.",
              "Multiply every entry of C by three halves before subtracting."));
        result=subtractMatrices(abt,subtrahend);
      }
    }else if(p.expression==="(A+B)C"){
      const ab=addMatrices(A,B);
      lesson.work("A+B = "+printed(ab),
        t("Macierze o identycznych wymiarach dodajemy element po elemencie.",
          "Add matrices of the same dimensions entry by entry."));
      result=multiplyMatrices(ab,C);
    }else if(p.expression==="A(B−C)"){
      const bc=subtractMatrices(B,C);
      lesson.work("B−C = "+printed(bc),
        t("Najpierw odejmij elementy w nawiasie, zachowując znaki liczb.",
          "First subtract the corresponding entries inside the parentheses."));
      result=multiplyMatrices(A,bc);
    }else throw Error("Unsupported P0C rectangular expression");
    lesson.work(p.expression+" = "+printed(result),
      t("Oblicz końcowe działanie w podanej kolejności i sprawdź każdy element.",
        "Perform the final operation in the given order and check every entry."));
    return lesson.finish(
      t("Oblicz "+p.expression+" i wpisz wszystkie elementy macierzy wynikowej.",
        "Calculate "+p.expression+" and enter every entry of the result matrix."),
      {kind:"matrix",values:result},
      t("Zacznij od nawiasów, następnie mnożenia, a na końcu dodawania lub odejmowania.",
        "Start with parentheses, then multiplication, then addition or subtraction."),
      t("Przy mnożeniu łącz wiersz pierwszej macierzy z kolumną drugiej.",
        "For products, combine a row from the left matrix with a column from the right."));
  }
  if(p.mode!=="transpose-dimensions")throw Error("Unknown P0C mode");
  if(!B)throw Error("Dimension expression requires B");
  const sa=matrixShape(A),sb=matrixShape(B),sc=C?matrixShape(C):null;
  let result:Shape|null;
  if(p.expression==="AᵀB"){
    const at=transShape(sa)!;
    lesson.work("dim(Aᵀ) = "+dims(at),
      t("Transpozycja wymienia liczby wierszy i kolumn macierzy A.",
        "Transposition swaps A's row and column counts."));
    result=productShape(at,sb);
  }else if(p.expression==="Aᵀ(B+C)"){
    const bc=sumShape(sb,sc);
    lesson.work("dim(B+C) = "+(bc?dims(bc):"∄"),
      t("Dodawanie B+C wymaga dokładnie takich samych wymiarów obu macierzy.",
        "The sum B+C requires the dimensions of B and C to match exactly."));
    const at=transShape(sa)!;
    lesson.work("dim(Aᵀ) = "+dims(at),
      t("Wynik transpozycji ma tyle wierszy co A kolumn i odwrotnie.",
        "The transpose has as many rows as A has columns, and vice versa."));
    result=productShape(at,bc);
  }else if(p.expression==="(AB)ᵀ+C"){
    const ab=productShape(sa,sb),abt=transShape(ab);
    lesson.work("dim((AB)ᵀ) = "+(abt?dims(abt):"∄"),
      t("Najpierw sprawdź zgodność mnożenia AB, a potem zamień wymiary wyniku.",
        "First check whether AB is defined, then transpose its dimensions."));
    result=sumShape(abt,sc);
  }else if(p.expression==="ABᵀ+C"){
    const bt=transShape(sb)!;
    lesson.work("dim(Bᵀ) = "+dims(bt),
      t("Transponujemy macierz B przed wykonaniem mnożenia przez A.",
        "Transpose B before multiplying it on the left by A."));
    const abt=productShape(sa,bt);
    lesson.work("dim(ABᵀ) = "+(abt?dims(abt):"∄"),
      t("Porównaj liczbę kolumn A z liczbą wierszy B po transpozycji.",
        "Compare columns of A with rows of B after transposition."));
    result=sumShape(abt,sc);
  }else if(p.expression==="(A+Bᵀ)C"){
    const bt=transShape(sb)!;
    const ab=sumShape(sa,bt);
    lesson.work("dim(A+Bᵀ) = "+(ab?dims(ab):"∄"),
      t("Po transpozycji B sprawdź, czy A i Bᵀ mają identyczne wymiary.",
        "After transposing B, check whether A and Bᵀ have identical dimensions."));
    result=productShape(ab,sc);
  }else throw Error("Unsupported P0C dimensions expression");
  const value=result?result.rows+"x"+result.columns:"not-possible";
  lesson.work("dim("+p.expression+") = "+(result?dims(result):"∄"),
    result
      ?t("Wszystkie poddziałania są wykonalne; wynik ma ustalone wymiary.",
          "All intermediate operations are defined and give these dimensions.")
      :t("Co najmniej jedno poddziałanie jest niewykonalne — całe wyrażenie nie istnieje.",
          "At least one required intermediate operation cannot be performed, so the expression is impossible."));
  const answer:AnswerSpec={kind:"choice",value,options:dimOptions(locale)};
  return lesson.finish(
    t("Określ, czy można wykonać "+p.expression+" i podaj wymiar wyniku albo wybierz brak możliwości.",
      "Decide whether "+p.expression+" is defined and give its dimensions, or select Not possible."),
    answer,
    t("Najpierw rozpatrz transpozycję i nawiasy, dopiero potem sprawdzaj mnożenie.",
      "First evaluate transposes and parentheses, then check products."),
    t("Dodawanie wymaga równych wymiarów, a iloczyn zgodnych wymiarów wewnętrznych.",
      "Addition needs matching dimensions; multiplication needs matching inner sizes."));
}
