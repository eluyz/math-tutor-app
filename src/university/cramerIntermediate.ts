import { rational as r, addRational as add, multiplyRational as mul,
  divideRational as div, equalRational as equal, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { exactDeterminant, minor } from "./determinants";
import { calculate, teaching } from "./teaching";
import type { ExactMatrix } from "./linearAlgebraMath";

type CramerMinors = Extract<LinearAlgebraProblem, {kind:"linear-cramer-minors"}>;
const show=(m:ExactMatrix)=>`[${m.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const dot=(a:readonly Rational[],x:readonly Rational[])=>a.reduce((s,c,j)=>add(s,mul(c,x[j])),r(0));

/** Invertible by construction: row additions/swaps preserve nonzero triangular determinant. */
export function createCramerMinors(v:number,level:Difficulty,n:3|4):CramerMinors {
  if(!Number.isInteger(v)||v<0||v>=24)throw Error("Variant out of range");
  const offset=level==="hard"?0:level==="advanced"?1:2;
  const A:Rational[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>{
    if(j<i)return r(0);
    if(j===i)return r((i%2?-1:1)*(i+offset+2),offset===2&&i===1?2:1);
    return r(i===0&&j===n-1?v-11+offset:
      ((v*(i+j+1)+2*i+3*j+offset)%9)-4,
      offset===2&&(i+j)%2===1?2:1);
  }));
  for(let i=1;i<n;i++){
    const factor=r((v+i+offset)%3-1);
    A[i]=A[i].map((entry,j)=>add(entry,mul(factor,A[i-1][j])));
  }
  if(v%2)[A[0],A[1]]=[A[1],A[0]];
  const x=Array.from({length:n},(_,i)=>
    r(i===0?v-11+offset:(v+3*i)%9-4,offset===2&&i===n-1?2:1));
  const b=A.map(row=>dot(row,x));
  return {kind:"linear-cramer-minors",matrix:A,rhs:b};
}

export const cramerIntermediateFamilies:readonly UniversityFamily[]=[
  {id:"cramer-determinants-three",category:"systems",
    titles:{pl:"Cramer 3×3: oblicz D i D₁–D₃",en:"Cramer 3×3: calculate D and D₁–D₃"},
    supportedDifficulties:["hard","advanced","expert"],
    create:(v,level)=>createCramerMinors(v,level,3)},
  {id:"cramer-determinants-four",category:"systems",
    titles:{pl:"Cramer 4×4: oblicz D i D₁–D₄",en:"Cramer 4×4: calculate D and D₁–D₄"},
    supportedDifficulties:["advanced","expert"],
    create:(v,level)=>createCramerMinors(v,level,4)},
];

export function presentCramerMinors(p:CramerMinors,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const A=p.matrix,b=p.rhs,n=A.length;
  if((n!==3&&n!==4)||b.length!==n||A.some(row=>row.length!==n))
    throw Error("Invalid Cramer problem");
  const determinant=(m:ExactMatrix,label:string):Rational=>{
    const terms:Rational[]=[];
    for(let j=0;j<n;j++){
      const submatrix=minor(m,0,j),cofactor=exactDeterminant(submatrix);
      const term=calculate("product",r(j%2?-1:1),m[0][j],cofactor);
      lesson.work(`${label}: minor M₁${j+1} = ${show(submatrix)}; ${t("znak", "sign")} ${j%2?"−":"+"}; ${t("składnik", "term")} = ${f(term.result)}`,
        t(n===3?"Rozwijamy wzdłuż pierwszego wiersza; każdy minor jest wyznacznikiem 2×2.":
          "Rozwijamy wzdłuż pierwszego wiersza; każdy minor jest wyznacznikiem 3×3.",
          n===3?"Expand along the first row; each minor is a 2×2 determinant.":
          "Expand along the first row; each minor is a 3×3 determinant."),term);
      terms.push(term.result);
    }
    const sum=calculate("sum",...terms);
    lesson.work(`${label} = ${terms.map(x=>`(${f(x)})`).join(" + ")} = ${f(sum.result)}`,
      t("Sumujemy składniki z uwzględnieniem naprzemiennych znaków dopełnień algebraicznych.",
        "Sum the signed cofactor terms, preserving the alternating signs."),sum);
    return sum.result;
  };
  lesson.work(`A = ${show(A)}; b = ${show(b.map(v=>[v]))}`,
    t("Zachowaj kolejność kolumn macierzy i zapisz współczynniki w postaci Ax=b.",
      "Preserve matrix column order and write the system as Ax=b."));
  const D=determinant(A,"D");
  if(D.numerator===0n)throw Error("Expected nonsingular Cramer exercise");
  const values=[D];
  for(let j=0;j<n;j++){
    const Aj=A.map((row,i)=>row.map((v,k)=>k===j?b[i]:v));
    lesson.work(`A${j+1} = ${show(Aj)}`,
      t("Wymień dokładnie jedną kolumnę A na b; pozostałe kolumny pozostają bez zmian.",
        "Replace exactly one column of A with b; keep the other columns unchanged."));
    const dj=determinant(Aj,`D${j+1}`);
    values.push(dj);
  }
  const x=values.slice(1).map(dj=>div(dj,D));
  for(let i=0;i<n;i++){
    const actual=dot(A[i],x);
    if(!equal(actual,b[i]))throw Error("Cramer determinants fail substitution");
  }
  lesson.work(`D ≠ 0; ${x.map((value,i)=>`x${i+1} = D${i+1}/D = ${f(value)}`).join("; ")}`,
    t("Sprawdzamy wynik przez podstawienie do Ax=b. W tym ćwiczeniu wpisujesz D oraz wszystkie Dᵢ — nie xᵢ.",
      "Check by substituting into Ax=b. This exercise asks for D and every Dᵢ, not xᵢ."));
  return lesson.finish(
    t(`Metoda Cramera ${n}×${n}: dla A=${show(A)}, b=${show(b.map(v=>[v]))} oblicz D=det(A) oraz D₁–D${n}. Zastępuj kolejne kolumny A wektorem b. Wpisz wyznaczniki, nie wartości x.`,
      `Cramer's rule ${n}×${n}: for A=${show(A)}, b=${show(b.map(v=>[v]))}, calculate D=det(A) and D₁–D${n}. Replace each column of A with b in turn. Enter determinants, not x values.`),
    {kind:"list",values,labels:["D",...Array.from({length:n},(_,i)=>`D${i+1}`)]},
    t("Zacznij od D=det(A); następnie w D₁ zamień pierwszą kolumnę A na b.",
      "Start with D=det(A); for D₁ replace the first column of A with b."),
    t("Dla Dᵢ zmieniasz tylko kolumnę i. Rozwiń Laplace’em i pilnuj znaków +, −, +, −.",
      "For Dᵢ change only column i. Use Laplace expansion with signs +, −, +, −.")
  );
}
