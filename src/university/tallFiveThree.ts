import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { parameterization, type Reduction, type ExactMatrix } from "./linearAlgebraMath";

type Problem = Extract<LinearAlgebraProblem, { kind: "linear-rectangular" }>;
const zero=(x:Rational)=>x.numerator===0n;
const dot=(row:readonly Rational[],values:readonly Rational[])=>row.reduce((s,c,j)=>add(s,mul(c,values[j])),r(0));
const combine=(a:readonly Rational[],b:readonly Rational[],k:number,l:number)=>a.map((value,i)=>add(mul(r(k),value),mul(r(l),b[i])));
const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const choice=(locale:Locale):AnswerSpec=>({kind:"choice",value:"system-one",options:[
  {value:"system-one",label:locale==="pl"?"Jedno rozwiązanie":"Exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Brak rozwiązań":"No solutions"},
  {value:"system-many",label:locale==="pl"?"Nieskończenie wiele rozwiązań":"Infinitely many solutions"},
]});

export function makeTallFiveThree(variant:number,level:Difficulty):Problem {
  const k=variant%7-3,q=Math.floor(variant/3)%5-2,kind=variant%3;
  const a=[r(1),r(k),r(0)];
  const b=[r(0),r(1),r(q)];
  const c=kind===0?[r(0),r(0),r(1)]:combine(a,b,1,1);
  const rows=[a,b,c,combine(a,b,2,-1),combine(b,c,-1,2)];
  const target=[
    r(variant%9-4,level==="expert"?2:1),
    r((variant+2)%7-3,level==="advanced"?2:1),
    r((variant+5)%11-5,level==="expert"?3:1),
  ];
  const scales=[r(1),r(-2),r(3,level==="expert"?2:1),r(-1),r(2)];
  const scaled=rows.map((row,i)=>row.map(value=>mul(value,scales[i])));
  const rhs=scaled.map(row=>dot(row,target));
  if(kind===1)rhs[4]=add(rhs[4],r(1)); // inconsistent only in the extra equation
  if(variant%2) {
    [scaled[0],scaled[4]]=[scaled[4],scaled[0]];
    [rhs[0],rhs[4]]=[rhs[4],rhs[0]];
  }
  return {kind:"linear-rectangular",matrix:scaled,rhs};
}

/** Local bounded exact Gauss–Jordan for precisely five equations, three unknowns.
 * Avoids changing the existing 1–4-row linear algebra engine used by other units. */
export function classifyTallFiveThree(p:Problem) {
  if(p.matrix.length!==5||p.rhs.length!==5||p.matrix.some(row=>row.length!==3))
    throw Error("U06 requires precisely a 5x3 coefficient matrix");
  const rows=p.matrix.map((row,i)=>[...row,p.rhs[i]]);
  const steps:{action:string;matrix:ExactMatrix}[]=[];
  const pivots:number[]=[];
  const record=(action:string)=>steps.push({action,matrix:rows.map(row=>[...row])});
  let leading=0;
  for(let column=0;column<3&&leading<5;column++) {
    const pivot=rows.findIndex((row,i)=>i>=leading&&!zero(row[column]));
    if(pivot===-1)continue;
    if(pivot!==leading){[rows[pivot],rows[leading]]=[rows[leading],rows[pivot]];record(`R${leading+1} ↔ R${pivot+1}`);}
    const factor=rows[leading][column];
    if(!equalRational(factor,r(1))) {
      rows[leading]=rows[leading].map(value=>div(value,factor));
      record(`R${leading+1} ← R${leading+1} / (${f(factor)})`);
    }
    for(let i=0;i<5;i++)if(i!==leading&&!zero(rows[i][column])) {
      const scale=rows[i][column];
      rows[i]=rows[i].map((v,j)=>sub(v,mul(scale,rows[leading][j])));
      record(`R${i+1} ← R${i+1} − (${f(scale)})R${leading+1}`);
    }
    pivots.push(column);leading++;
  }
  const rankA=pivots.length;
  const inconsistent=rows.some(row=>row.slice(0,3).every(zero)&&!zero(row[3]));
  const rankAugmented=rankA+(inconsistent?1:0);
  const kind: "system-one"|"system-none"|"system-many"=inconsistent?"system-none":rankA===3?"system-one":"system-many";
  const values=kind==="system-one"?rows.slice(0,3).map(row=>row[3]):[];
  const reduction:Reduction={matrix:rows,pivots,steps};
  return {kind,values,rankA,rankAugmented,reduction,freeColumns:[0,1,2].filter(col=>!pivots.includes(col))};
}

export const tallFiveThreeFamilies:readonly UniversityFamily[]=[{
  id:"system-rectangular-5x3-classification",
  category:"systems",
  titles:{pl:"U06: klasyfikacja układu 5×3 przez rzędy",en:"U06: classify a 5×3 system by ranks"},
  supportedDifficulties:["hard","advanced","expert"],
  create:makeTallFiveThree,
}];

export function presentTallFiveThree(p:Problem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  const result=classifyTallFiveThree(p);
  const augmented=p.matrix.map((row,i)=>[...row,p.rhs[i]]);
  lesson.work(`[A|b]=${compact(augmented)}`,t("Budujemy macierz rozszerzoną pięciu równań z trzema niewiadomymi.","Form the augmented matrix of five equations in three unknowns."));
  for(const step of result.reduction.steps)
    lesson.work(`${step.action}: ${compact(step.matrix)}`,t("Odwracalna operacja wierszowa zachowuje rozwiązania.","Reversible row operations preserve solutions."));
  lesson.work(`RREF([A|b])=${compact(result.reduction.matrix)}`,t("Wskazujemy pivoty i wiersze sprzeczne.","Identify pivots and contradictory rows."));
  lesson.work(`rank(A)=${result.rankA}; rank([A|b])=${result.rankAugmented}; n=3`,t("Stosujemy twierdzenie Kroneckera–Capellego: porównujemy rzędy z liczbą niewiadomych.","Apply Rouché–Capelli: compare the two ranks and the number of unknowns."));
  if(result.kind==="system-none"){
    const bad=result.reduction.matrix.find(row=>row.slice(0,3).every(zero)&&!zero(row[3]));
    if(!bad)throw Error("Inconsistent 5x3 result lacks contradiction");
    lesson.work(`0=${f(bad[3])}`,t("Sprzeczne równanie oznacza brak rozwiązań.","The contradiction proves there is no solution."));
  }else if(result.kind==="system-many") {
    lesson.work(parameterization(result,["x","y","z"]).join("; "),t("Wspólny rząd jest mniejszy od trzech, dlatego występuje zmienna swobodna.","The common rank is below three, so a free variable exists."));
  }else {
    for(let i=0;i<5;i++){
      if(!equalRational(dot(p.matrix[i],result.values),p.rhs[i]))throw Error("U06 exact Ax=b mismatch");
      lesson.work(`${p.matrix[i].map((v,j)=>`(${f(v)})·(${f(result.values[j])})`).join(" + ")} = ${f(p.rhs[i])}`,t("Podstawiamy rozwiązanie do oryginalnego równania.","Substitute into the original equation."));
    }
  }
  const spec=choice(locale);
  if(spec.kind!=="choice")throw Error("U06 requires a choice answer");
  const answer:AnswerSpec={...spec,value:result.kind};
  return lesson.finish(t(`Sklasyfikuj układ pięciu równań z trzema niewiadomymi: [A|b]=${compact(augmented)}. Oblicz rank(A), rank([A|b]) i wybierz liczbę rozwiązań.`,`Classify this system of five equations in three unknowns: [A|b]=${compact(augmented)}. Compute rank(A), rank([A|b]) and choose the number of solutions.`),answer,t("Sprawdź pivoty w trzech kolumnach A, a następnie ewentualny wiersz [0,0,0|c].","Check pivots in the three coefficient columns and look for [0,0,0|c]."),t("Różne rzędy = brak; równe 3 = jedno; równe mniejsze od 3 = wiele rozwiązań.","Unequal ranks = none; both 3 = unique; equal but less than 3 = infinitely many."));
}
