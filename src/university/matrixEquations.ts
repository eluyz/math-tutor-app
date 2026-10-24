import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, equalRational as equal, type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { identity, inverse, product, type ExactMatrix } from "./linearAlgebraMath";
import { teaching } from "./teaching";

type Equation = Extract<LinearAlgebraProblem,{kind:"linear-matrix-equation"}>;
const compact=(m:ExactMatrix)=>`[${m.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const same=(a:ExactMatrix,b:ExactMatrix)=>a.length===b.length &&
  a.every((row,i)=>row.length===b[i].length&&row.every((value,j)=>equal(value,b[i][j])));
const scale=(k:Rational,a:ExactMatrix)=>a.map(row=>row.map(v=>mul(k,v)));
const plus=(a:ExactMatrix,b:ExactMatrix)=>a.map((row,i)=>row.map((v,j)=>add(v,b[i][j])));
const minus=(a:ExactMatrix,b:ExactMatrix)=>a.map((row,i)=>row.map((v,j)=>sub(v,b[i][j])));

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
  if(mode==="inverse-plus"){
    // B is invertible by construction, so X=(B⁻¹−A)/4 exists uniquely.
    const b=p,inv=inverse(b).value;
    if(!inv)throw Error("Noninvertible constructed B");
    return {kind:"linear-matrix-equation",mode,left:minus(inv,scale(r(4),x)),rhs:b,shift:r(4)};
  }
  if(mode==="bx-shift"){
    // B−3I=P and det(P)≠0, so (B−3I)X=A has a unique solution.
    const b=plus(p,scale(r(3),identity(2)));
    return {kind:"linear-matrix-equation",mode,left:product(p,x),rhs:b,shift:r(3)};
  }
  const b=nonsingular((v+7)%24,level);
  return {kind:"linear-matrix-equation",mode,left:p,right:b,rhs:product(product(p,x),b)};
}

/** Invertible 3×3 matrices: triangular core plus determinant-preserving row additions. */
function nonsingularThree(v:number,level:Difficulty,salt:number):ExactMatrix {
  const a:Rational[][]=[
    [r(1+(v+salt)%2),r((v+salt)%5-2),r((2*v+salt)%5-2)],
    [r(0),r((v+salt)%2===0?-1:2),r((v+3*salt)%3-1)],
    [r(0),r(0),r((v+salt)%3===0?-2:1)],
  ];
  if(level!=="medium"){
    a[1]=a[1].map((value,j)=>add(value,a[0][j]));
    a[2]=a[2].map((value,j)=>add(value,mul(r(v%2===0?1:-1),a[1][j])));
  }
  if(level==="advanced"||level==="expert")
    a[0]=a[0].map((value,j)=>add(value,a[2][j]));
  return a;
}
function targetThree(v:number,level:Difficulty):ExactMatrix {
  const d=level==="advanced"||level==="expert"?2:1;
  return [
    [r(v-11,d),r(v%5-2),r((2*v)%7-3)],
    [r((v+2)%9-4),r((3*v)%7-3,d),r((v+4)%5-2)],
    [r((2*v+1)%7-3),r(v%6-2),r((v+5)%8-4,d)],
  ];
}
function createThree(v:number,level:Difficulty,mode:"ax-shift"|"axb"):Equation {
  if(!Number.isInteger(v)||v<0||v>=24)throw Error("Variant out of range");
  const a=nonsingularThree(v,level,1),x=targetThree(v,level);
  if(mode==="ax-shift")
    return {kind:"linear-matrix-equation",mode,
      left:plus(a,scale(r(4),identity(3))),rhs:product(a,x),shift:r(4)};
  const b=nonsingularThree((v+7)%24,level,3);
  return {kind:"linear-matrix-equation",mode,left:a,right:b,rhs:product(product(a,x),b)};
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
  {id:"matrix-inverse-plus",category:"matrices",
   titles:{pl:"Równanie macierzowe (A + 4X)⁻¹ = B",en:"Matrix equation (A + 4X)⁻¹ = B"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(v,level)=>create(v,level,"inverse-plus")},
  {id:"matrix-bx-shift",category:"matrices",
   titles:{pl:"Równanie macierzowe 3X + A = BX",en:"Matrix equation 3X + A = BX"},
   supportedDifficulties:["medium","hard","advanced","expert"],
   create:(v,level)=>create(v,level,"bx-shift")},
  {id:"matrix-ax-shift-three",category:"matrices",
   titles:{pl:"Równanie AX = 4X + B (3×3)",en:"Matrix equation AX = 4X + B (3×3)"},
   supportedDifficulties:["medium","hard","advanced"],
   create:(v,level)=>createThree(v,level,"ax-shift")},
  {id:"matrix-axb-three",category:"matrices",
   titles:{pl:"Równanie AXB = C (3×3)",en:"Matrix equation AXB = C (3×3)"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(v,level)=>createThree(v,level,"axb")},
];
export function presentAdvancedMatrixEquation(p:Equation,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const first=p.left, second=p.rhs;
  if(![2,3].includes(first.length)||first.some(row=>row.length!==first.length)||second.length!==first.length||second.some(row=>row.length!==first.length))
    throw Error("Matrix equation requires compatible 2×2 or 3×3 matrices");
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
  if(p.mode==="inverse-plus"){
    const bInverse=inverse(second);
    if(!bInverse.value)throw Error("B must be invertible");
    lesson.work(`(A+${f(p.shift)}X)⁻¹=B ⇒ A+${f(p.shift)}X=B⁻¹ ⇒ X=(B⁻¹−A)/${f(p.shift)}`,
      t("Odwracamy obie strony, a następnie odejmujemy A i dzielimy przez skalar. Nie odwracamy elementów macierzy pojedynczo.",
        "Invert both sides, then subtract A and divide by the scalar. Do not invert matrix entries one by one."));
    for(const step of bInverse.reduction.steps)lesson.work(`B: ${step.action}: ${compact(step.matrix)}`,
      t("Wyznaczamy B⁻¹ przez operacje Gaussa–Jordana.","Find B⁻¹ by Gauss–Jordan row operations."));
    const difference=minus(bInverse.value,first);
    const x=scale(r(1,4),difference);
    lesson.work(`B⁻¹=${compact(bInverse.value)}; B⁻¹−A=${compact(difference)}; X=${compact(x)}`,
      t("Odejmujemy odpowiednie elementy, następnie dzielimy każdy element przez 4.",
        "Subtract corresponding entries, then divide each entry by four."));
    const original=plus(first,scale(p.shift,x));
    if(!same(product(original,second),identity(2))||!same(product(second,original),identity(2)))
      throw Error("Failed inverse matrix equation substitution");
    lesson.work(`(A+${f(p.shift)}X)B=B(A+${f(p.shift)}X)=I`,
      t("Sprawdzamy oba iloczyny z B, by potwierdzić relację odwrotności.",
        "Verify both products with B to confirm the inverse relation."));
    return lesson.finish(
      t(`Rozwiąż (A + ${f(p.shift)}X)⁻¹ = B dla A=${compact(first)}, B=${compact(second)}. Podaj X.`,
        `Solve (A + ${f(p.shift)}X)⁻¹ = B for A=${compact(first)}, B=${compact(second)}. Enter X.`),
      {kind:"matrix",values:x},
      t("Najpierw odwróć B: A+4X=B⁻¹.",
        "First invert B: A+4X=B⁻¹."),
      t("Oblicz X=(B⁻¹−A)/4 i sprawdź, czy (A+4X)B=I.",
        "Compute X=(B⁻¹−A)/4 and check (A+4X)B=I."));
  }
  if(p.mode==="bx-shift"){
    const reduced=minus(second,scale(p.shift,identity(2)));
    lesson.work(`${f(p.shift)}X+A=BX ⇒ (B−${f(p.shift)}I)X=A`,
      t("Wyłączamy X przez odjęcie wielokrotności macierzy jednostkowej od B.",
        "Factor X by subtracting a multiple of the identity matrix from B."));
    lesson.work(`B−${f(p.shift)}I=${compact(reduced)}`,
      t("Odejmujemy 3 tylko od elementów przekątnej B.",
        "Subtract three only from the diagonal of B."));
    const inv=inverse(reduced);
    if(!inv.value)throw Error("B−3I must be invertible");
    for(const step of inv.reduction.steps)lesson.work(`B−3I: ${step.action}: ${compact(step.matrix)}`,
      t("Wyznaczamy dokładną macierz odwrotną metodą Gaussa–Jordana.",
        "Find the exact inverse using Gauss–Jordan elimination."));
    const x=product(inv.value,first);
    lesson.work(`(B−${f(p.shift)}I)⁻¹=${compact(inv.value)}; X=${compact(x)}`,
      t("Mnożymy odwrotność przez A z lewej strony.",
        "Multiply A by the inverse on the left."));
    if(!same(plus(scale(p.shift,x),first),product(second,x)))
      throw Error("Failed BX matrix equation substitution");
    lesson.work(`${f(p.shift)}X+A=BX=${compact(product(second,x))}`,
      t("Podstawiamy X do obu stron początkowego równania.",
        "Substitute X into both sides of the original equation."));
    return lesson.finish(
      t(`Rozwiąż ${f(p.shift)}X + A = BX dla A=${compact(first)}, B=${compact(second)}. Podaj X.`,
        `Solve ${f(p.shift)}X + A = BX for A=${compact(first)}, B=${compact(second)}. Enter X.`),
      {kind:"matrix",values:x},
      t("Przekształć równanie do (B−3I)X=A.",
        "Rewrite the equation as (B−3I)X=A."),
      t("Policz odwrotność B−3I i pomnóż ją przez A z lewej strony.",
        "Invert B−3I and multiply A on the left."));
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
