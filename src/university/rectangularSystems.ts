import { rational as r, multiplyRational as mul, addRational as add, equalRational, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { classifySystem, gaussianElimination, parameterization, type ExactMatrix } from "./linearAlgebraMath";

type Problem=Extract<LinearAlgebraProblem,{kind:"linear-rectangular"}>;
const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const dot=(a:readonly Rational[],x:readonly Rational[])=>a.reduce((acc,c,j)=>add(acc,mul(c,x[j])),r(0));
const sum=(a:readonly Rational[],b:readonly Rational[],aScale=1,bScale=1)=>a.map((v,j)=>add(mul(r(aScale),v),mul(r(bScale),b[j])));
const options=(locale:Locale)=>[
  {value:"system-one",label:locale==="pl"?"Jedno rozwiązanie":"Exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Brak rozwiązań":"No solutions"},
  {value:"system-many",label:locale==="pl"?"Nieskończenie wiele rozwiązań":"Infinitely many solutions"},
];
function create(v:number,level:Difficulty,variables:2|3):Problem {
  const k=v%5-2,q=Math.floor(v/3)%5-2,kind=v%3;
  const first=variables===2?[r(1),r(k)]:[r(1),r(k),r(0)];
  const second=variables===2
    ?kind===2?first.map(z=>mul(r(2),z)):[r(0),r(1)]
    :[r(0),r(1),r(q)];
  const rows:Rational[][]=[first,second];
  if(variables===2){
    rows.push(kind===2?sum(first,second,-1,1):sum(first,second,1,2));
  }else{
    const third=kind===2?sum(first,second,1,1):[r(0),r(0),r(1)];
    rows.push(third);
    rows.push(kind===2?sum(first,second,1,-1):sum(sum(first,second),third,1,-1));
  }
  const target=Array.from({length:variables},(_,j)=>r((v+2*j)%13-6,level==="expert"?2:1));
  const rhs=rows.map(row=>dot(row,target));
  if(kind===1)rhs[rows.length-1]=add(rhs[rows.length-1],r(1));
  // Nonzero row scalings and swaps preserve ranks and the solution set.
  const scaled=rows.map((row,i)=>{
    const factor=level==="hard"?r((i+v)%2?-3:2,2):r((i+v)%2?-2:3,level==="expert"?2:1);
    return {row:row.map(c=>mul(c,factor)),rhs:mul(rhs[i],factor)};
  });
  if(v%2===1)[scaled[0],scaled[scaled.length-1]]=[scaled[scaled.length-1],scaled[0]];
  return {kind:"linear-rectangular",matrix:scaled.map(x=>x.row),rhs:scaled.map(x=>x.rhs)};
}
export const rectangularFamilies:readonly UniversityFamily[]=[
  {id:"system-rectangular-3x2",category:"systems",
   titles:{pl:"Układ prostokątny 3 równania / 2 niewiadome",
           en:"Rectangular system: 3 equations / 2 unknowns"},
   supportedDifficulties:["medium","hard"],
   create:(v,d)=>create(v,d,2)},
  {id:"system-rectangular-4x3",category:"systems",
   titles:{pl:"Układ prostokątny 4 równania / 3 niewiadome",
           en:"Rectangular system: 4 equations / 3 unknowns"},
   supportedDifficulties:["advanced","expert"],
   create:(v,d)=>create(v,d,3)},
];
export function presentRectangular(p:Problem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson,n=p.matrix[0].length,m=p.matrix.length;
  const names=["x","y","z"].slice(0,n);
  const augmented=p.matrix.map((row,i)=>[...row,p.rhs[i]]);
  const classified=classifySystem(p.matrix,p.rhs);
  const forward=gaussianElimination(p.matrix,p.rhs);
  lesson.work(`[A|b]=${compact(augmented)}`,
    t("W układzie prostokątnym liczba równań i niewiadomych jest różna. Tworzymy macierz rozszerzoną.",
      "A rectangular system has different numbers of equations and unknowns. Form the augmented matrix."));
  for(const step of forward.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,
    t("Stosujemy odwracalne operacje na całych wierszach, łącznie z wyrazem wolnym.",
      "Perform reversible operations on entire rows, including the right-hand side."));
  lesson.work(`RREF([A|b])=${compact(classified.reduction.matrix)}`,
    t("Zredukowana postać schodkowa pozwala wykryć wszystkie pivoty i sprzeczności.",
      "Reduced row echelon form reveals all pivots and contradictions."));
  lesson.work(`rank(A)=${classified.rankA}; rank([A|b])=${classified.rankAugmented}; n=${n}; m=${m}`,
    t("Porównujemy rzędy i liczbę niewiadomych, nie zakładamy, że macierz A jest kwadratowa.",
      "Compare the ranks and number of unknowns; do not assume A is square."));
  if(classified.kind==="system-none"){
    const bad=classified.reduction.matrix.find(row=>row.slice(0,n).every(c=>c.numerator===0n)&&row[n].numerator!==0n);
    if(!bad)throw Error("Missing contradiction row");
    lesson.work(t(`Sprzeczność: 0 = ${f(bad[n])}`,`Contradiction: 0 = ${f(bad[n])}`),
      t("Fałszywa równość świadczy o sprzeczności; sam brak macierzy odwrotnej jej nie dowodzi.",
        "A false equality proves inconsistency; the absence of an inverse does not."));
  }else if(classified.kind==="system-many"){
    lesson.work(parameterization(classified,names).join("; "),
      t("Zmienne bez pivotów są swobodne; podajemy pełną parametryzację wszystkich rozwiązań.",
        "Nonpivot variables are free; give a full parameterization of all solutions."));
  }else{
    for(const [i,row] of p.matrix.entries())
      if(!equalRational(dot(row,classified.values),p.rhs[i]))
        throw Error(`Rectangular Ax=b mismatch in row ${i}`);
    lesson.work(t("Rozwiązanie: ","Solution: ")+names.map((name,j)=>`${name}=${f(classified.values[j])}`).join("; "),
      t("Każda niewiadoma ma pivot. Podstawiamy rozwiązanie do wszystkich równań, również dodatkowych.",
        "Every variable has a pivot. Substitute into all equations, including the extra rows."));
  }
  const answer:AnswerSpec={kind:"choice",value:classified.kind,options:options(locale)};
  return lesson.finish(
    t(`Sklasyfikuj układ ${m} równań z ${n} niewiadomymi na podstawie macierzy [A|b]=${compact(augmented)}. Wybierz liczbę rozwiązań.`,
      `Classify the ${m}-equation, ${n}-unknown system with augmented matrix [A|b]=${compact(augmented)}. Choose the number of solutions.`),
    answer,
    t("Policz rank(A) oraz rank([A|b]). Jeśli są różne, układ jest sprzeczny.",
      "Find rank(A) and rank([A|b]). If they differ, the system is inconsistent."),
    t("Jeśli rzędy są równe n, rozwiązanie jest jedno; jeśli równe i mniejsze od n — nieskończenie wiele.",
      "If the ranks equal n, the solution is unique; if they agree but are smaller than n, there are infinitely many."));
}
