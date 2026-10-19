import { rational as r, multiplyRational as mul, addRational as add, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { backSubstitute, classifySystem, gaussianElimination, parameterization, type ExactMatrix } from "./linearAlgebraMath";
const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const dot=(a:readonly Rational[],x:readonly Rational[])=>a.reduce((sum,c,j)=>add(sum,mul(c,x[j])),r(0));
const options=(locale:Locale)=>[
  {value:"system-one",label:locale==="pl"?"Jedno rozwiązanie":"Exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Brak rozwiązań":"No solutions"},
  {value:"system-many",label:locale==="pl"?"Nieskończenie wiele rozwiązań":"Infinitely many solutions"},
];
function create(v:number,d:Difficulty,method:"gauss"|"classification"):Extract<LinearAlgebraProblem,{kind:"linear-system"}>{
  const n=d==="medium"||d==="hard"?3:4;
  const matrix:Rational[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>j<i?r(0):j===i?r(i%2?-2:1):r(i===0&&j===n-1?v-11:((v+2*i+j)%7)-3)));
  if(d==="hard"||d==="expert")matrix[0]=matrix[0].map(x=>mul(x,r(1,2)));
  if(d==="expert") for(let j=0;j<n;j++)matrix[n-2][j]=add(matrix[n-2][j],mul(r(-2),matrix[0][j]));
  if(v%2)[matrix[0],matrix[1]]=[matrix[1],matrix[0]];
  const x=Array.from({length:n},(_,j)=>r((v+3*j)%7-3,j===1&&(d==="hard"||d==="expert")?2:1));
  let rhs=matrix.map(row=>dot(row,x));
  if(method==="classification" && v%3!==0){
    matrix[n-1]=matrix[0].map((a,j)=>add(a,mul(r(v%2?2:-1),matrix[1][j])));
    rhs[n-1]=add(rhs[0],mul(r(v%2?2:-1),rhs[1]));
    if(v%3===1)rhs[n-1]=add(rhs[n-1],r(1));
  }
  return {kind:"linear-system",matrix,rhs,method};
}
export const gaussFamilies:readonly UniversityFamily[]=[
  {id:"gauss-unique",category:"systems",titles:{pl:"Eliminacja Gaussa: wyznacz niewiadome",en:"Gaussian elimination: find the unknowns"},supportedDifficulties:["medium","hard","advanced","expert"],create:(v,d)=>create(v,d,"gauss")},
  {id:"gauss-classification",category:"systems",titles:{pl:"Eliminacja Gaussa: klasyfikacja",en:"Gaussian elimination: classify"},supportedDifficulties:["hard","advanced","expert"],create:(v,d)=>create(v,d,"classification")},
];
export function presentGauss(p:Extract<LinearAlgebraProblem,{kind:"linear-system"}>,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,n=p.matrix[0].length, names=["x","y","z","w"].slice(0,n);
  const result=classifySystem(p.matrix,p.rhs), forward=gaussianElimination(p.matrix,p.rhs);
  const augmented=p.matrix.map((row,i)=>[...row,p.rhs[i]]);
  lesson.work(`[A|b] = ${compact(augmented)}`,t("Tworzymy macierz rozszerzoną; każde równanie obejmuje prawą stronę.","Form the augmented matrix; each equation includes the right-hand side."));
  for(const step of forward.steps)lesson.work(`${step.action}: ${compact(step.matrix)}`,t("Ta operacja zachowuje zbiór rozwiązań i eliminuje współczynnik pod niezerowym pivotem.","This operation preserves the solution set and eliminates the coefficient below a nonzero pivot."));
  lesson.work(`rank(A) = ${result.rankA}; rank([A|b]) = ${result.rankAugmented}; n = ${n}`,result.kind==="system-none"?t("Po eliminacji pojawia się wiersz [0 … 0 | c] z c≠0; to równanie 0=c.","Elimination yields a row [0 … 0 | c] with c≠0; it states 0=c."):result.kind==="system-many"?t("Rzędy są równe, lecz mniejsze od n; zmienne bez pivotów są swobodne.","Ranks agree but are below n; nonpivot variables are free."):t("Rzędy są równe n, więc każdy z n pivotów określa jedną niewiadomą.","The ranks equal n, so every one of the n pivots determines a variable."));
  if(result.kind==="system-none"){
    const contradiction=forward.matrix.find(row=>row.slice(0,n).every(value=>value.numerator===0n)&&row[n].numerator!==0n);
    if(!contradiction)throw new Error("Inconsistent system lacks a concrete contradiction row");
    lesson.work(`${compact([contradiction])}: 0 = ${f(contradiction[n])}`,t("To konkretne równanie jest fałszywe dla każdej wartości niewiadomych; układ jest sprzeczny.","This concrete equation is false for every assignment; the system is inconsistent."));
  }
  let answer:AnswerSpec;
  if(result.kind==="system-one"){
    const values=backSubstitute(forward,n);
    for(let i=n-1;i>=0;i--){
      const row=forward.matrix[i];
      const equation=row.slice(i,n).map((coefficient,j)=>`(${f(coefficient)})·${names[i+j]}`).join(" + ");
      lesson.work(t(`Podstawienie wsteczne w R${i+1}: ${equation} = ${f(row[n])} ⇒ ${names[i]} = ${f(values[i])}`,`Back substitution in R${i+1}: ${equation} = ${f(row[n])} ⇒ ${names[i]} = ${f(values[i])}`),t("Podstawiamy już wyznaczone niewiadome do równania schodkowego i dzielimy tylko przez niezerowy pivot.","Substitute the values already found into the echelon equation and divide only by a nonzero pivot."));
    }
    for(let i=0;i<n;i++) lesson.work(`${p.matrix[i].map((c,j)=>`(${f(c)})·(${f(values[j])})`).join(" + ")} = ${f(dot(p.matrix[i],values))} = ${f(p.rhs[i])}`,t("Sprawdzenie przez podstawienie do oryginalnego równania, nie tylko do zredukowanej macierzy.","Verify by substitution into the original equation, not just the reduced matrix."));
    answer=p.method==="gauss"?{kind:"system",classification:"system-one",variables:names,values}:{kind:"choice",value:"system-one",options:options(locale)};
  }else{
    if(result.kind==="system-many"){
      const formulas=parameterization(result,names);
      lesson.work(`RREF([A|b]) = ${compact(result.reduction.matrix)}`,t("Redukujemy dalej, aby wyrazić pivotowe niewiadome przez parametry.","Reduce further to express pivot variables using parameters."));
      lesson.work(formulas.join("; "),t("Parametry t1, t2, … mogą być dowolnymi liczbami rzeczywistymi. Formularz sprawdza tylko klasyfikację, nie dowolny zapis symboliczny.","Parameters t1, t2, … may be any real numbers. The form checks only the classification, not arbitrary symbolic expressions."));
    }
    answer={kind:"choice",value:result.kind,options:options(locale)};
  }
  const question=p.method==="gauss"?t(`Rozwiąż układ ${names.join(", ")} metodą Gaussa: [A|b] = ${compact(augmented)}. Podaj klasyfikację i wszystkie niewiadome.`,`Solve the ${names.join(", ")} system by Gaussian elimination: [A|b] = ${compact(augmented)}. Give the classification and all unknowns.`):t(`Sklasyfikuj układ metodą Gaussa: [A|b] = ${compact(augmented)}. Formularz wymaga tylko liczby rozwiązań.`,`Classify the system by Gaussian elimination: [A|b] = ${compact(augmented)}. The form asks only for the number of solutions.`);
  return lesson.finish(question,answer,t("Szukaj niezerowego pivota; jeśli potrzeba, zamień wiersze. Uwzględnij kolumnę b.","Find a nonzero pivot; swap rows if needed. Include column b."),t("Po eliminacji szukaj sprzeczności 0=c; w przypadku jednoznacznym podstawiaj wstecz.","After elimination look for a contradiction 0=c; for a unique system, back-substitute."));
}
