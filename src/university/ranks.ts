import { rational as r, addRational as add, multiplyRational as mul } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { classifySystem, parameterization, reduceRows, type ExactMatrix } from "./linearAlgebraMath";
import { reduceTallRank } from "./rankTall";
const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const options=(locale:Locale)=>[
  {value:"system-one",label:locale==="pl"?"Jedno rozwiązanie":"Exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Brak rozwiązań":"No solutions"},
  {value:"system-many",label:locale==="pl"?"Nieskończenie wiele rozwiązań":"Infinitely many solutions"},
];
const choice=(value:string,locale:Locale):AnswerSpec=>({kind:"choice",value,options:options(locale)});
function rows(v:number,dimensions:2|3|4,columns:3|4):ExactMatrix {
  if(v===0) return Array.from({length:dimensions},()=>Array.from({length:columns},()=>r(0)));
  const u=[r(1),r(v-11),r((v%5)-2),r((v%7)-3)].slice(0,columns);
  const w=[r(0),r(1),r((v%3)-1),r((v%4)-2)].slice(0,columns);
  const t=[r(0),r(0),r(1),r(v%3)].slice(0,columns);
  const second=v%4===0?u.map(x=>mul(x,r(v%3+1))):w;
  if(dimensions===2) return v%2?[second,u]:[u,second];
  const third=v%4===0?u.map(x=>mul(x,r(-1))):v%4===1?u.map((x,j)=>add(x,mul(r((v%3)+1),w[j]))):t;
  return v%2?[second,third,u]:[u,second,third];
}
function capelli(v:number,level:Difficulty):Extract<LinearAlgebraProblem,{kind:"linear-capelli"}> {
  const n=level==="hard"?3:4;
  const u=[r(1),r(v-11),r((v%5)-2),r(v%3-1)].slice(0,n);
  const w=[r(0),r(1),r(v%3-1),r(v%5-2)].slice(0,n);
  const t=[r(0),r(0),r(1),r((v%4)-1)].slice(0,n);
  const mode=v%3; // unique for n=3, otherwise a consistent/contradictory 3×4 system
  const dependent=mode!==0 || n===4;
  const third=dependent?u.map((x,j)=>add(x,mul(r(v%2?2:-1),w[j]))):t;
  const matrix=v%2?[third,u,w]:[u,w,third];
  const x=Array.from({length:n},(_,j)=>r((v+j)%5-2));
  const rhs=matrix.map(row=>row.reduce((sum,c,j)=>add(sum,mul(c,x[j])),r(0)));
  if(mode===1) rhs[v%2?0:2]=add(rhs[v%2?0:2],r(1));
  if(level==="advanced"){
    matrix[1]=matrix[1].map(value=>mul(value,r(1,2)));
    rhs[1]=mul(rhs[1],r(1,2));
  }
  return {kind:"linear-capelli",matrix,rhs};
}
export const rankFamilies:readonly UniversityFamily[]=[
  {id:"matrix-rank",category:"matrices",titles:{pl:"Rząd macierzy",en:"Matrix rank"},supportedDifficulties:["medium","hard","advanced"],create:(v,d)=>{const matrix=rows(v,d==="medium"?2:3,d==="advanced"?4:3);return {kind:"linear-rank",matrix:d==="medium"?matrix:matrix.map((row,i)=>i===0?row.map(value=>mul(value,r(1,2))):row)};}},
  {id:"capelli-given-ranks",category:"systems",titles:{pl:"Twierdzenie Kroneckera–Capellego z rang",en:"Kronecker–Capelli from ranks"},supportedDifficulties:["easy"],create:(v)=>{
    const n=2+(Math.floor(v/3)%4), equations=n+Math.floor(v/12), mode=v%3;
    const rankA=mode===0?n:mode===1?n-1:Math.max(0,n-2),rankAugmented=mode===1?rankA+1:rankA;
    return {kind:"linear-rank-given",rankA,rankAugmented,variables:n,equations};
  }},
  {id:"capelli-matrices",category:"systems",titles:{pl:"Kronecker–Capelli z macierzy",en:"Kronecker–Capelli from matrices"},supportedDifficulties:["hard","advanced"],create:(v,d)=>capelli(v,d)},
];
export function presentRank(p:Extract<LinearAlgebraProblem,{kind:"linear-rank"|"linear-capelli"|"linear-rank-given"}>,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  if(p.kind==="linear-rank-given"){
    const kind=p.rankA<p.rankAugmented?"system-none":p.rankA===p.variables?"system-one":"system-many";
    lesson.work(`rank(A) = ${p.rankA}, rank([A|b]) = ${p.rankAugmented}, n = ${p.variables}`,t("Porównaj najpierw rzędy macierzy współczynników i rozszerzonej.","First compare the coefficient and augmented matrix ranks."));
    lesson.work(kind==="system-none"?"rank(A) < rank([A|b])":kind==="system-one"?"rank(A) = rank([A|b]) = n":"rank(A) = rank([A|b]) < n",kind==="system-none"?t("Sprzeczny wiersz 0=c≠0 wyklucza rozwiązania.","An inconsistent row 0=c≠0 excludes all solutions."):kind==="system-one"?t("Pivot każdej niewiadomej daje dokładnie jedno rozwiązanie.","A pivot for every variable gives exactly one solution."):t("Brak sprzeczności i co najmniej jedna zmienna swobodna oznaczają nieskończenie wiele rozwiązań nad R.","Consistency and at least one free variable give infinitely many solutions over the reals."));
    return lesson.finish(t(`Układ ma ${p.equations} równań i ${p.variables} niewiadomych, rank(A) = ${p.rankA}, rank([A|b]) = ${p.rankAugmented}. Ile ma rozwiązań?`,`A system has ${p.equations} equations and ${p.variables} unknowns, rank(A) = ${p.rankA}, rank([A|b]) = ${p.rankAugmented}. How many solutions?`),choice(kind,locale),t("Porównaj dwa rzędy, a potem liczbę niewiadomych.","Compare the two ranks, then the number of unknowns."),t("Różne rzędy: brak; równe n: jedno; równe mniejsze od n: nieskończenie wiele.","Different ranks: none; equal to n: one; equal below n: infinitely many."));
  }
  if(p.kind==="linear-rank"){
    const reduction=p.matrix.length>4?reduceTallRank(p.matrix):reduceRows(p.matrix),value=reduction.pivots.length;
    lesson.work(`A = ${compact(p.matrix)}`,t("Rząd to liczba pivotów, czyli niezerowych wierszy po eliminacji.","Rank is the number of pivots, or nonzero rows after elimination."));
    for(const step of reduction.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,t("Elementarne operacje wierszowe nie zmieniają rzędu; pivot jest zawsze niezerowy.","Elementary row operations preserve rank; a chosen pivot is always nonzero."));
    lesson.work(`RREF(A) = ${compact(reduction.matrix)}; rank(A) = ${value}`,t("Liczymy niezerowe wiersze, także dla macierzy prostokątnej; zerowy wyznacznik sam nie określa rzędu.","Count nonzero rows, including for rectangular matrices; a zero determinant alone does not determine rank."));
    return lesson.finish(t(`Oblicz rząd macierzy A = ${compact(p.matrix)}.`,`Find the rank of matrix A = ${compact(p.matrix)}.`),{kind:"scalar",value:r(value)},t("Redukuj wiersze i licz niezerowe wiersze schodkowe.","Row-reduce and count nonzero echelon rows."),t("Jeśli bieżąca kolumna nie ma pivota, przejdź do następnej; nie dziel przez zero.","If the current column has no pivot, move to the next; never divide by zero."));
  }
  const result=classifySystem(p.matrix,p.rhs), augmented=p.matrix.map((row,i)=>[...row,p.rhs[i]]);
  lesson.work(`A = ${compact(p.matrix)}; [A|b] = ${compact(augmented)}`,t("Zestawiamy macierz współczynników i rozszerzoną.","Write the coefficient and augmented matrices."));
  for(const step of result.reduction.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,t("Wykonujemy tę samą operację na wszystkich kolumnach, także b.","Apply each row operation to all columns, including b."));
  lesson.work(`rank(A) = ${result.rankA}; rank([A|b]) = ${result.rankAugmented}; n = ${p.matrix[0].length}`,result.kind==="system-none"?t("Wiersz [0 … 0 | c], c≠0, jest sprzeczny.","A row [0 … 0 | c], c≠0, is inconsistent."):result.kind==="system-one"?t("Każda niewiadoma ma pivot i nie ma sprzeczności.","Every unknown has a pivot and there is no contradiction."):t("Rzędy są równe, ale mniejsze niż liczba niewiadomych.","The ranks agree but are below the number of unknowns."));
  if(result.kind==="system-many")lesson.work(parameterization(result,["x","y","z","w"].slice(0,p.matrix[0].length)).join("; "),t("Zmienne bez pivotów są dowolnymi parametrami rzeczywistymi; formularz prosi tylko o klasyfikację.","Nonpivot variables are arbitrary real parameters; the form asks only for classification."));
  return lesson.finish(t(`Na podstawie A = ${compact(p.matrix)} i b = ${compact(p.rhs.map(x=>[x]))} sklasyfikuj układ Ax=b.`,`Using A = ${compact(p.matrix)} and b = ${compact(p.rhs.map(x=>[x]))}, classify Ax=b.`),choice(result.kind,locale),t("Porównaj rank(A), rank([A|b]) i liczbę niewiadomych.","Compare rank(A), rank([A|b]), and the number of unknowns."),t("Szukaj wiersza [0 … 0 | c] i licz pivoty.","Look for a row [0 … 0 | c] and count pivots."));
}
