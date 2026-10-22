import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, equalRational as equal, type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { inverse, product, type ExactMatrix } from "./linearAlgebraMath";
import { teaching } from "./teaching";

type Equation = Extract<LinearAlgebraProblem,{kind:"linear-matrix-equation"}>;
const compact=(m:ExactMatrix)=>`[${m.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const same=(a:ExactMatrix,b:ExactMatrix)=>a.length===b.length &&
  a.every((row,i)=>row.length===b[i].length&&row.every((value,j)=>equal(value,b[i][j])));
const scale=(k:Rational,a:ExactMatrix)=>a.map(row=>row.map(v=>mul(k,v)));
const plus=(a:ExactMatrix,b:ExactMatrix)=>a.map((row,i)=>row.map((v,j)=>add(v,b[i][j])));

/** Constructible 2×2 matrices with nonzero determinant for every variant. */
function nonsingular(v:number,level:Difficulty):ExactMatrix {
  const upper:ExactMatrix=[
    [r(level==="medium"?1:level==="hard"?2:level==="advanced"?3:4),r(v-11,level==="expert"?2:1)],
    [r(0),r(v%2?-2:3)],
  ];
  const multiple=r((v%3)+1);
  return [upper[0],upper[1].map((value,j)=>add(value,mul(multiple,upper[0][j])))];
}
function target(v:number,level:Difficulty):ExactMatrix {
  return [
    [r(v-11,level==="expert"?2:1),r(v%7-3)],
    [r((v*2)%9-4),r(v%5-2,level==="advanced"?2:1)],
  ];
}
function create(v:number,level:Difficulty,mode:Equation["mode"]):Equation {
  if(!Number.isInteger(v)||v<0||v>=24)throw Error("Variant out of range");
  const p=nonsingular(v,level),x=target(v,level);
  if(mode==="ax-shift"){
    const shift=r(4);
    const a=p.map((row,i)=>row.map((value,j)=>i===j?add(value,shift):value));
    return {kind:"linear-matrix-equation",mode,left:a,rhs:product(p,x),shift};
  }
  const b=nonsingular((v+7)%24,level);
  return {kind:"linear-matrix-equation",mode,left:p,right:b,rhs:product(product(p,x),b)};
}
export const advancedMatrixEquationFamilies: readonly UniversityFamily[]=[
  {id:"matrix-ax-shift",category:"matrices",
   titles:{pl:"Równanie macierzowe AX = 4X + B",en:"Matrix equation AX = 4X + B"},
   supportedDifficulties:["medium","hard","advanced","expert"],
   create:(v,level)=>create(v,level,"ax-shift")},
  {id:"matrix-axb",category:"matrices",
   titles:{pl:"Równanie macierzowe AXB = C",en:"Matrix equation AXB = C"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(v,level)=>create(v,level,"axb")},
];
export function presentAdvancedMatrixEquation(p:Equation,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const first=p.left, second=p.rhs;
  if(first.length!==2||first.some(row=>row.length!==2)||second.length!==2||second.some(row=>row.length!==2))
    throw Error("Matrix equation requires 2×2 matrices");
  if(p.mode==="ax-shift"){
    const reduced=first.map((row,i)=>row.map((value,j)=>i===j?sub(value,p.shift):value));
    lesson.work(`AX = ${f(p.shift)}X + B ⇒ (A − ${f(p.shift)}I)X=B`,
      t("Przenosimy składnik z X na lewą stronę. Nie wolno odejmować skalaru od macierzy bez macierzy jednostkowej.",
        "Move the term containing X to the left. A scalar multiple of the identity is required."));
    lesson.work(`A − ${f(p.shift)}I = ${compact(reduced)}`,
      t("Odejmij skalar wyłącznie od elementów na głównej przekątnej.",
        "Subtract the scalar only from diagonal entries."));
    const inv=inverse(reduced);
    if(!inv.value)throw Error("Shifted matrix must be invertible");
    for(const step of inv.reduction.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,
      t("Stosujemy dokładne operacje na wierszach [A−4I|I].",
        "Use exact row operations on [A−4I|I]."));
    const x=product(inv.value,second);
    lesson.work(`(A−${f(p.shift)}I)⁻¹=${compact(inv.value)}; X=(A−${f(p.shift)}I)⁻¹B=${compact(x)}`,
      t("Mnożymy macierz odwrotną z lewej strony.", "Multiply by the inverse on the left."));
    const lhs=product(first,x),rhs=plus(scale(p.shift,x),second);
    if(!same(lhs,rhs))throw Error("Failed shifted equation substitution");
    lesson.work(`AX=${compact(lhs)}=${f(p.shift)}X+B`,
      t("Sprawdzamy każdy element pierwotnego równania.",
        "Verify every entry of the original equation."));
    return lesson.finish(
      t(`Rozwiąż AX = ${f(p.shift)}X + B dla A=${compact(first)}, B=${compact(second)}. Podaj macierz X.`,
        `Solve AX = ${f(p.shift)}X + B for A=${compact(first)}, B=${compact(second)}. Enter matrix X.`),
      {kind:"matrix",values:x},
      t("Wyłącz X z lewej strony: (A−4I)X=B.",
        "Factor X on the left: (A−4I)X=B."),
      t("Najpierw odejmij 4I, następnie policz odwrotność i pomnóż przez B.",
        "Subtract 4I first, then invert the matrix and multiply by B."));
  }
  const b=p.right;
  const ia=inverse(first),ib=inverse(b);
  if(!ia.value||!ib.value)throw Error("Matrix multipliers must be invertible");
  lesson.work("AXB=C ⇒ XB=A⁻¹C ⇒ X=A⁻¹CB⁻¹",
    t("Najpierw usuwamy A przez mnożenie z lewej, następnie B przez mnożenie z prawej.",
      "Remove A on the left, then B on the right."));
  for(const step of ia.reduction.steps)lesson.work(`A: ${step.action}: ${compact(step.matrix)}`,
    t("Wyznaczamy A⁻¹ metodą Gaussa–Jordana.","Find A⁻¹ by Gauss–Jordan elimination."));
  for(const step of ib.reduction.steps)lesson.work(`B: ${step.action}: ${compact(step.matrix)}`,
    t("Wyznaczamy B⁻¹ metodą Gaussa–Jordana.","Find B⁻¹ by Gauss–Jordan elimination."));
  const x=product(product(ia.value,second),ib.value);
  lesson.work(`A⁻¹=${compact(ia.value)}; B⁻¹=${compact(ib.value)}; X=${compact(x)}`,
    t("Nie przestawiamy kolejności czynników.", "Preserve matrix multiplication order."));
  if(!same(product(product(first,x),b),second))throw Error("Failed AXB substitution");
  lesson.work(`AXB=${compact(product(product(first,x),b))}=C`,
    t("Podstawiamy otrzymaną macierz X.", "Substitute the resulting matrix X."));
  return lesson.finish(
    t(`Rozwiąż AXB=C dla A=${compact(first)}, B=${compact(b)}, C=${compact(second)}. Podaj X.`,
      `Solve AXB=C for A=${compact(first)}, B=${compact(b)}, C=${compact(second)}. Enter X.`),
    {kind:"matrix",values:x},
    t("Pomnóż równanie przez A⁻¹ z lewej i przez B⁻¹ z prawej.",
      "Multiply on the left by A⁻¹ and on the right by B⁻¹."),
    t("Wynik ma postać X=A⁻¹CB⁻¹. Sprawdź go w równaniu AXB=C.",
      "The answer is X=A⁻¹CB⁻¹. Verify it in AXB=C."));
}
