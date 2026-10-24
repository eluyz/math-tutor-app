import { rational as r, addRational as add, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { exactDeterminant } from "./determinants";
import { classifySystem, parameterization, type ExactMatrix } from "./linearAlgebraMath";
import { teaching } from "./teaching";

type Problem = Extract<LinearAlgebraProblem, { kind: "linear-cramer-diagnostic" }>;
const show = (a: ExactMatrix) => "[" + a.map(row=>"[" + row.map(f).join(", ") + "]").join("; ") + "]";
const dot = (row:readonly Rational[],x:readonly Rational[]) => row.reduce((sum,c,i)=>add(sum,mul(c,x[i])),r(0));
const choices = (locale:Locale) => [
  {value:"system-one",label:locale==="pl"?"Tak, D≠0: jedno rozwiązanie":"Yes, D≠0: exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Nie, D=0: brak rozwiązań":"No, D=0: no solutions"},
  {value:"system-many",label:locale==="pl"?"Nie, D=0: nieskończenie wiele rozwiązań":"No, D=0: infinitely many solutions"},
];

/** Rank n−1 when singular; unlike a generic D=0 example this controls both
 * consistent and contradictory systems and keeps the teaching cases distinct. */
export function createCramerDiagnostic(variant:number,level:Difficulty,target:"eligibility"|"minors"):Problem {
  if(!Number.isInteger(variant)||variant<0||variant>=24 || !["easy","medium","hard"].includes(level))
    throw Error("Unsupported Cramer diagnostic");
  const n=target==="minors"?4:level==="easy"?2:level==="medium"?3:4;
  const A:Rational[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>
    r(j<i?0:j===i?(i===0?1+variant%6:1+(variant+i)%3):
      i===0&&j===1?1+Math.floor(variant/6):(variant+2*i+j)%3-1)));
  const mode=variant%3; // 0: unique; 1: singular consistent; 2: singular inconsistent
  if(mode!==0){
    A[n-1]=A[0].map((c,j)=>add(mul(r(2),c),n>2?A[1][j]:r(0)));
  }
  const solution=Array.from({length:n},(_,j)=>r((variant+2*j)%5-2));
  const b=A.map(row=>dot(row,solution));
  if(mode===2)b[n-1]=add(b[n-1],r(1));
  // Increasing difficulty: row additions, then a swap plus sign change.
  if(level!=="easy"){
    const k=r(variant%2?1:-1);
    A[1]=A[1].map((c,j)=>add(c,mul(k,A[0][j])));
    b[1]=add(b[1],mul(k,b[0]));
  }
  if(level==="hard"){
    [A[0],A[1]]=[A[1],A[0]];
    [b[0],b[1]]=[b[1],b[0]];
    A[0]=A[0].map(c=>mul(r(-1),c));
    b[0]=mul(r(-1),b[0]);
  }
  return {kind:"linear-cramer-diagnostic",target,matrix:A,rhs:b};
}

export const cramerDiagnosticFamilies:readonly UniversityFamily[]=[
  {id:"cramer-applicability",category:"systems",
   titles:{pl:"Cramer: czy można zastosować metodę?",en:"Cramer's rule: can you apply it?"},
   supportedDifficulties:["easy","medium","hard"],
   create:(v,d)=>createCramerDiagnostic(v,d,"eligibility")},
  {id:"cramer-four-singular-minors",category:"systems",
   titles:{pl:"Cramer 4×4: D i D₁–D₄ przy D=0 i D≠0",en:"Cramer 4×4: D and D₁–D₄ including D=0"},
   supportedDifficulties:["easy","medium","hard"],
   create:(v,d)=>createCramerDiagnostic(v,d,"minors")},
];

export function presentCramerDiagnostic(p:Problem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,A=p.matrix,b=p.rhs,n=A.length;
  if(n<2||n>4||A.some(row=>row.length!==n)||b.length!==n)throw Error("Cramer matrix must be 2×2 through 4×4");
  const result=classifySystem(A,b);
  const D=exactDeterminant(A);
  if((D.numerator!==0n)!==(result.kind==="system-one"))
    throw Error("Cramer determinant inconsistent with system rank");
  lesson.work("A = "+show(A)+"; b = "+show(b.map(v=>[v])),
    t("W metodzie Cramera pracujemy z macierzą kwadratową i wektorem prawych stron.",
      "Cramer's rule uses a square coefficient matrix and the right-hand-side vector."));
  lesson.work("D = det(A) = "+f(D),
    t("Jeśli D≠0, można dzielić Dᵢ przez D. Jeśli D=0, nie wolno dzielić przez zero.",
      "When D≠0, Dᵢ/D is allowed. When D=0, dividing by D is forbidden."));
  let answer:AnswerSpec;
  if(p.target==="minors"){
    const values:Rational[]=[D];
    for(let j=0;j<n;j++){
      const replaced=A.map((row,i)=>row.map((c,k)=>k===j?b[i]:c));
      const Dj=exactDeterminant(replaced);
      values.push(Dj);
      lesson.work("A"+(j+1)+" = "+show(replaced)+"; D"+(j+1)+" = det(A"+(j+1)+") = "+f(Dj),
        t("Zastępujemy wyłącznie wskazaną kolumnę przez b, zachowując kolejność pozostałych kolumn.",
          "Replace only the specified column with b, preserving the order of the others."));
    }
    answer={kind:"list",values,labels:["D",...Array.from({length:n},(_,j)=>"D"+(j+1))]};
    if(D.numerator!==0n){
      const x=values.slice(1).map(dj=>div(dj,D));
      for(let i=0;i<n;i++){
        if(dot(A[i],x).numerator* b[i].denominator!==b[i].numerator*dot(A[i],x).denominator)
          throw Error("Cramer solution does not satisfy Ax=b");
      }
      lesson.work(x.map((v,j)=>"x"+(j+1)+" = D"+(j+1)+"/D = "+f(v)).join("; "),
        t("D jest niezerowe; liczby Dᵢ można podzielić przez D. Podstawienie potwierdza wynik.",
          "D is nonzero, so each Dᵢ can be divided by D; substitution verifies the values."));
    }
  }else{
    answer={kind:"choice",value:result.kind,options:choices(locale)};
  }
  lesson.work("rank(A) = "+result.rankA+"; rank([A|b]) = "+result.rankAugmented+"; n = "+n,
    result.kind==="system-one"
      ?t("D≠0 i pełny rząd gwarantują jedno rozwiązanie, więc metoda Cramera jest dozwolona.",
          "D≠0 and full rank guarantee one solution, so Cramer's rule applies.")
      :result.kind==="system-none"
      ?t("D=0 oznacza tylko, że Cramer nie rozstrzyga. Nierówne rzędy dowodzą sprzeczności.",
          "D=0 only makes Cramer's rule inapplicable. Unequal ranks prove inconsistency.")
      :t("D=0 oznacza tylko, że Cramer nie rozstrzyga. Równe rzędy mniejsze od n dają wiele rozwiązań.",
          "D=0 only makes Cramer's rule inapplicable. Equal ranks below n give infinitely many solutions."));
  if(result.kind==="system-none"){
    const row=result.reduction.matrix.find(row=>row.slice(0,n).every(c=>c.numerator===0n)&&row[n].numerator!==0n);
    if(!row)throw Error("Missing contradiction row");
    lesson.work("0 = "+f(row[n]),
      t("Konkretny sprzeczny wiersz macierzy rozszerzonej wyklucza rozwiązania.",
        "An explicit contradictory row of the augmented matrix rules out solutions."));
  }else if(result.kind==="system-many"){
    lesson.work(parameterization(result,["x","y","z","w"].slice(0,n)).join("; "),
      t("Zmienna swobodna pozwala opisać rodzinę rozwiązań; D=0 nie oznacza automatycznie sprzeczności.",
        "A free variable parametrizes the solutions; D=0 does not automatically mean inconsistency."));
  }
  return lesson.finish(
    p.target==="eligibility"
      ?t("Dla układu Ax=b z A="+show(A)+", b="+show(b.map(v=>[v]))+
          " zdecyduj, czy wolno użyć metody Cramera, i wskaż właściwą liczbę rozwiązań.",
         "For Ax=b with A="+show(A)+", b="+show(b.map(v=>[v]))+
          ", decide whether Cramer's rule applies and classify the solution count.")
      :t("Dla układu 4×4 oblicz D=det(A), D₁–D₄ po zamianie kolejnych kolumn na b. A="+show(A)+", b="+show(b.map(v=>[v]))+
          ". Wpisz pięć wyznaczników, również gdy D=0.",
         "For the 4×4 system calculate D=det(A), D₁–D₄ by replacing each column with b. A="+show(A)+", b="+show(b.map(v=>[v]))+
          ". Enter all five determinants, including when D=0."),
    answer,
    t("Oblicz D. Jeśli D=0, nie wyciągaj automatycznie wniosku o sprzeczności.",
      "Compute D. If D=0, do not automatically conclude that the system is inconsistent."),
    t("Przy D=0 porównaj rzędy A i [A|b]. Przy D≠0 możesz użyć Dᵢ/D.",
      "When D=0, compare the ranks of A and [A|b]. When D≠0, Dᵢ/D is valid."));
}
