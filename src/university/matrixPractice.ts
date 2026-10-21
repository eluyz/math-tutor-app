import { rational as r } from "../rational";
import { formatRational as f } from "../answers";
import { addMatrices, subtractMatrices, scaleMatrix, multiplyMatrices, transposeMatrix,
  matrixShape, type Matrix } from "../matrices";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type Practice = Extract<LinearAlgebraProblem, { kind: "linear-matrix-practice" }>;
type Shape = Readonly<{ rows: number; columns: number }>;
type Node = { kind: "input"; name: "A" | "B" | "C" }
  | { kind: "sum" | "product"; left: Node; right: Node };
const input = (name: "A" | "B" | "C"): Node => ({kind:"input",name});
const binary = (kind: "sum" | "product", left: Node, right: Node): Node =>
  ({kind,left,right});
const titleOf = (n: Node): string => n.kind === "input" ? n.name
  : `(${titleOf(n.left)} ${n.kind === "sum" ? "+" : "·"} ${titleOf(n.right)})`;
const dims = (s: Shape): string => `${s.rows}×${s.columns}`;
const matrixText = (a: Matrix): string =>
  `[${a.map(row => row.map(f).join(", ")).join("; ")}]`;
const levelNumber: Record<Difficulty, number> = {easy:0,medium:1,hard:2,advanced:3,expert:4};
const variants = 24;

function data(v: number, level: Difficulty, rows: number, columns: number, salt: number): Matrix {
  const rank = levelNumber[level];
  return Array.from({length:rows},(_,i)=>Array.from({length:columns},(_,j)=>{
    if (i===0 && j===0) return r(v + 1 + salt * 2,rank + 1);
    const value = ((v * (i+2) + j*7 + i*j*3 + salt*5 + rank*9) % 9) - 4;
    return r(value,rank >= 3 && (i+j)%2===0 ? 2 : 1);
  }));
}
const shape = (rows:number,columns:number):Shape=>({rows,columns});
const switchSize = (x:number)=>x===2?3:2;
const dimOptions = (locale:Locale) =>
  [{value:"not-possible",label:locale==="pl"?"Nie można wykonać":"Not possible"},
   ...[2,3].flatMap(i=>[2,3].map(j=>({value:`${i}x${j}`,label:`${i} × ${j}`})))];

function tree(p:Practice): Node {
  const A=input("A"), B=input("B"), C=input("C");
  switch(p.expression){
    case "A+B": return binary("sum",A,B);
    case "AB": return binary("product",A,B);
    case "BA": return binary("product",B,A);
    case "AB+C": return binary("sum",binary("product",A,B),C);
    case "A(B+C)": return binary("product",A,binary("sum",B,C));
    case "A(BC)": return binary("product",A,binary("product",B,C));
    default: throw Error("Unsupported dimensions expression");
  }
}
function shapeSteps(p:Practice): {result:Shape|null; steps:readonly {expression:string; left:string; right:string; kind:"sum"|"product";result:Shape|null}[]} {
  const items=p.matrices;
  const trace: {expression:string;left:string;right:string;kind:"sum"|"product";result:Shape|null}[]=[];
  const evalNode=(node:Node):Shape|null=>{
    if(node.kind==="input"){
      const matrix=items.find(m=>m.label===node.name);
      if(!matrix)throw Error("Missing input matrix");
      return matrixShape(matrix.values);
    }
    const left=evalNode(node.left),right=evalNode(node.right);
    if(!left||!right)return null;
    const works=node.kind==="sum" ? left.rows===right.rows && left.columns===right.columns : left.columns===right.rows;
    const result=works ? (node.kind==="sum" ? left : shape(left.rows,right.columns)) : null;
    trace.push({expression:titleOf(node),left:dims(left),right:dims(right),kind:node.kind,result});
    return result;
  };
  return {result:evalNode(tree(p)),steps:trace};
}

/** Each case varies both operand dimensions and permits as well as forbids operations. */
export function makeMatrixPractice(mode:Practice["mode"], v:number,level:Difficulty):Practice {
  if(!Number.isInteger(v)||v<0||v>=variants)throw Error("Invalid matrix variant");
  const n=level==="expert"||level==="advanced"?3:2;
  if(mode==="power"){
    const exponent=(level==="hard"||level==="expert")?(v%4===0?2:3):2;
    return {kind:"linear-matrix-practice",mode,expression:exponent===2?"A²":"A³",
      matrices:[{label:"A",values:data(v,level,n,n,0)}]};
  }
  if(mode==="composite"){
    const expr:Practice["expression"]=level==="hard" ? (v%2?"(A+B)C":"AB−C")
      : level==="advanced" ? (v%2?"A(B−C)":"(AB)ᵀ−C")
      : (v%2?"(AB)ᵀ−(3/2)C":"A(B−C)");
    return {kind:"linear-matrix-practice",mode,expression:expr,
      matrices:[{label:"A",values:data(v,level,n,n,0)},
        {label:"B",values:data(v,level,n,n,1)},
        {label:"C",values:data(v,level,n,n,2)}]};
  }
  const ar=2+v%2,ac=2+Math.floor(v/2)%2;
  if(mode==="compatibility"){
    const expression:Practice["expression"]=(["A+B","AB","BA"] as const)[v%3];
    let br:number,bc:number;
    if(expression==="A+B"){
      br=v%4===0?ar:switchSize(ar);
      bc=v%4===0?ac:2+Math.floor(v/3)%2;
    }else if(expression==="AB"){
      br=v%4<2?ac:switchSize(ac);
      bc=2+Math.floor(v/4)%2;
    }else{
      br=2+Math.floor(v/4)%2;
      bc=v%4<2?ar:switchSize(ar);
    }
    return {kind:"linear-matrix-practice",mode,expression,
      matrices:[{label:"A",values:data(v,level,ar,ac,0)},
        {label:"B",values:data(v,level,br,bc,1)}]};
  }
  const expression:Practice["expression"]=(["AB+C","A(B+C)","A(BC)"] as const)[v%3];
  const br=2+Math.floor(v/3)%2,bc=2+Math.floor(v/6)%2;
  const scenario=Math.floor(v/3)%4;
  let a:Shape,b:Shape,c:Shape;
  if(expression==="AB+C"){
    a=shape(ar,ac);b=shape(scenario%2===0?ac:switchSize(ac),bc);
    c=shape(scenario<2?ar:switchSize(ar),bc);
  } else if(expression==="A(B+C)"){
    a=shape(ar,scenario%2===0?br:switchSize(br));b=shape(br,bc);
    c=shape(scenario<2?br:switchSize(br),bc);
  } else {
    a=shape(ar,scenario%2===0?br:switchSize(br));b=shape(br,bc);
    c=shape(scenario<2?bc:switchSize(bc),2+Math.floor(v/8)%2);
  }
  return {kind:"linear-matrix-practice",mode,expression,
    matrices:[{label:"A",values:data(v,level,a.rows,a.columns,0)},
      {label:"B",values:data(v,level,b.rows,b.columns,1)},
      {label:"C",values:data(v,level,c.rows,c.columns,2)}]};
}

export const matrixPracticeFamilies: readonly UniversityFamily[]=[
  {id:"matrix-powers",category:"matrices",
    titles:{pl:"Potęgi macierzy A² i A³",en:"Matrix powers A² and A³"},
    supportedDifficulties:["medium","hard","advanced","expert"],
    create:(v,level)=>makeMatrixPractice("power",v,level)},
  {id:"matrix-composite-operations",category:"matrices",
    titles:{pl:"Złożone działania na macierzach",en:"Composite matrix operations"},
    supportedDifficulties:["hard","advanced","expert"],
    create:(v,level)=>makeMatrixPractice("composite",v,level)},
  {id:"matrix-compatibility",category:"matrices",
    titles:{pl:"Wykonalność i wymiar A+B, AB, BA",en:"Compatibility and dimensions of A+B, AB, BA"},
    supportedDifficulties:["easy","medium","hard","advanced","expert"],
    create:(v,level)=>makeMatrixPractice("compatibility",v,level)},
  {id:"matrix-chained-dimensions",category:"matrices",
    titles:{pl:"Wykonalność wyrażeń złożonych",en:"Compatibility of chained matrix expressions"},
    supportedDifficulties:["medium","hard","advanced","expert"],
    create:(v,level)=>makeMatrixPractice("chain",v,level)},
];

export function presentMatrixPractice(p:Practice,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const by=(name:string):Matrix=>{
    const found=p.matrices.find(item=>item.label===name);
    if(!found)throw Error("Missing matrix "+name);
    return found.values;
  };
  const A=by("A");
  if(p.mode==="power"){
    const exponent=p.expression==="A²"?2:p.expression==="A³"?3:0;
    if(!exponent)throw Error("Bad power expression");
    const s=matrixShape(A);
    if(s.rows!==s.columns)throw Error("Matrix powers require square matrices");
    lesson.work(`dim(A) = ${dims(s)}`,t("Potęgować można tylko macierz kwadratową; zachowujemy kolejność mnożenia.",
      "A matrix power requires a square matrix; retain multiplication order."));
    let result:Matrix=A;
    for(let power=2;power<=exponent;power++){
      result=multiplyMatrices(result,A);
      lesson.work(`A^${power} = ${power===2?"AA":`A^${power-1}A`} = ${matrixText(result)}`,
        t("Każdy element to iloczyn wiersza pierwszej macierzy i kolumny drugiej; sumujemy wyniki dokładnie.",
          "Each entry is the dot product of the left row and right column; add all products exactly."));
    }
    lesson.work(`${p.expression} = ${matrixText(result)}`,
      t("Sprawdź wszystkie komórki wyniku, w szczególności znaki i ułamki.",
        "Verify each resulting entry, especially signs and fractions."));
    return lesson.finish(t(`Oblicz ${p.expression}. Wpisz całą macierz wynikową.`,
      `Calculate ${p.expression}. Enter the entire resulting matrix.`),
      {kind:"matrix",values:result},
      t("Zacznij od iloczynu AA, a przy A³ pomnóż A² przez A.",
        "Start with AA, then multiply A² by A for the cube."),
      t("Nie podnoś każdej komórki do potęgi — wykonuj mnożenie macierzy wiersz razy kolumna.",
        "Do not exponentiate entries individually; multiply rows by columns."));
  }
  if(p.mode==="composite"){
    const B=by("B"),C=by("C");
    lesson.work(`${p.expression} — ${dims(matrixShape(A))}`,
      t("Najpierw rozpatrz nawiasy, później mnożenie, a na końcu dodawanie lub odejmowanie.",
        "Evaluate brackets first, then products, and finally additions or subtractions."));
    let result:Matrix;
    if(p.expression==="AB−C"){
      const first=multiplyMatrices(A,B);
      lesson.work(`AB = ${matrixText(first)}`,
        t("Wylicz wszystkie iloczyny wiersz razy kolumna przed odejmowaniem.",
          "Compute every row-by-column dot product before subtracting."));
      result=subtractMatrices(first,C);
    }else if(p.expression==="(A+B)C"){
      const first=addMatrices(A,B);
      lesson.work(`A+B = ${matrixText(first)}`,
        t("Dodaj odpowiednie komórki obu macierzy w nawiasie.",
          "Add corresponding matrix entries inside the brackets."));
      result=multiplyMatrices(first,C);
    }else if(p.expression==="A(B−C)"){
      const first=subtractMatrices(B,C);
      lesson.work(`B−C = ${matrixText(first)}`,
        t("Wykonaj odejmowanie w nawiasie, zachowując znaki.",
          "Subtract inside brackets, preserving signs."));
      result=multiplyMatrices(A,first);
    }else if(p.expression==="(AB)ᵀ−C"||p.expression==="(AB)ᵀ−(3/2)C"){
      const product=multiplyMatrices(A,B),transposed=transposeMatrix(product);
      lesson.work(`AB = ${matrixText(product)}`,
        t("Najpierw oblicz produkt AB; kolejność mnożenia ma znaczenie.",
          "First calculate AB; multiplication order matters."));
      lesson.work(`(AB)ᵀ = ${matrixText(transposed)}`,
        t("Zamień wiersze produktu z jego kolumnami.",
          "Transpose the product by exchanging its rows and columns."));
      result=subtractMatrices(transposed,
        p.expression==="(AB)ᵀ−C"?C:scaleMatrix(C,r(3,2)));
    }else throw Error("Unsupported composite expression");
    lesson.work(`${p.expression} = ${matrixText(result)}`,
      t("Sprawdź znak każdego elementu i ostateczny wymiar wyniku.",
        "Check the sign of each entry and the final result dimensions."));
    return lesson.finish(t(`Oblicz ${p.expression}. Wpisz całą macierz wynikową.`,
      `Calculate ${p.expression}. Enter the entire resulting matrix.`),
      {kind:"matrix",values:result},
      t("Zapisz wynik działania z nawiasu albo produktu jako osobną macierz.",
        "First write the result of the bracketed expression or product as a separate matrix."),
      t("Dopiero potem wykonaj pozostałe działania, pilnując kolejności i transpozycji.",
        "Only then perform the remaining operations, checking the order and transposition."));
  }
  const decision=shapeSteps(p);
  for(const m of p.matrices)lesson.work(`dim(${m.label}) = ${dims(matrixShape(m.values))}`,
    t("Wymiar to liczba wierszy razy liczba kolumn, w tej kolejności.",
      "Dimensions are rows times columns, in that order."));
  for(const step of decision.steps)lesson.work(
    `${step.expression}: ${step.left} ${step.kind==="sum"?"+":"·"} ${step.right} ⇒ ${step.result?dims(step.result):"∄"}`,
    step.kind==="sum"?
      t("Dodawanie wymaga dwóch dokładnie takich samych wymiarów.",
        "Addition requires identical dimensions on both sides.")
      :t("Mnożenie wymaga tylu samo kolumn po lewej, ile wierszy po prawej.",
        "Multiplication requires left columns to equal right rows."));
  if(!decision.result)lesson.work(`dim(${p.expression}) = ∄`,
    t("Co najmniej jeden krok jest niewykonalny; późniejsze działania nie naprawiają wcześniejszej niezgodności.",
      "At least one step is impossible; later operations cannot fix an earlier dimension mismatch."));
  else lesson.work(`dim(${p.expression}) = ${dims(decision.result)}`,
    t("Wynik ma wymiary ostatniego poprawnie wykonanego działania.",
      "The result has the dimensions of the final valid operation."));
  const expected=decision.result?`${decision.result.rows}x${decision.result.columns}`:"not-possible";
  return lesson.finish(
    t(`Określ, czy działanie ${p.expression} można wykonać, i podaj wymiar wyniku. Jeśli nie, wybierz «Nie można wykonać».`,
      `Decide whether ${p.expression} is possible and give the result dimensions. Otherwise choose “Not possible”.`),
    {kind:"choice",value:expected,options:dimOptions(locale)},
    t("Zapisz wymiary wszystkich macierzy i rozpatruj działania od wewnętrznych nawiasów.",
      "Write each matrix's dimensions and evaluate operations from the innermost brackets."),
    t("Dodawanie: jednakowe rozmiary. Mnożenie: zgodne rozmiary wewnętrzne. Wynik iloczynu: wiersze lewej × kolumny prawej.",
      "Addition: identical dimensions. Product: matching inner sizes. Result: left rows × right columns.")
  );
}
