import { rational as r, addRational as add, multiplyRational as mul, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { exactDeterminant, minor } from "./determinants";
import { calculate, teaching } from "./teaching";
import { classifySystem, parameterization, type ExactMatrix } from "./linearAlgebraMath";
const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const dot=(a:readonly Rational[],x:readonly Rational[])=>a.reduce((sum,c,j)=>add(sum,mul(c,x[j])),r(0));
function create(v:number, expert:boolean):Extract<LinearAlgebraProblem,{kind:"linear-cramer-four"}>{
  const a:Rational[][]=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>j<i?r(0):j===i?r(i%2?-2:1):r(i===0&&j===3?v-11:(v+i+j)%5-2)));
  if(expert){
    a[1]=a[1].map(c=>mul(c,r(1,2)));
    for(let j=0;j<4;j++)a[2][j]=add(a[2][j],mul(r(-2),a[0][j]));
  }
  if(v%2)[a[0],a[1]]=[a[1],a[0]];
  const x=Array.from({length:4},(_,j)=>r((v+2*j)%7-3,j===2&&expert?2:1));
  const b=a.map(row=>dot(row,x));
  if(v%4===0){
    a[3]=a[0].map((c,j)=>add(c,mul(r(2),a[1][j])));
    b[3]=add(b[0],mul(r(2),b[1]));
    if(v%8===0)b[3]=add(b[3],r(1));
  }
  return {kind:"linear-cramer-four",matrix:a,rhs:b};
}
export const cramerFourFamilies:readonly UniversityFamily[]=[{
  id:"cramer-four",category:"systems",titles:{pl:"Reguła Cramera: cztery niewiadome",en:"Cramer's rule: four unknowns"},supportedDifficulties:["advanced","expert"],
  create:(v,d)=>create(v,d==="expert"),
}];
const options=(locale:Locale)=>[
  {value:"system-one",label:locale==="pl"?"Jedno rozwiązanie":"Exactly one solution"},
  {value:"system-none",label:locale==="pl"?"Brak rozwiązań":"No solutions"},
  {value:"system-many",label:locale==="pl"?"Nieskończenie wiele rozwiązań":"Infinitely many solutions"},
];
export function presentCramerFour(p:Extract<LinearAlgebraProblem,{kind:"linear-cramer-four"}>,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,A=p.matrix,b=p.rhs,names=["x","y","z","w"];
  const determinant=(matrix:ExactMatrix,label:string):Rational=>{
    if(matrix.length!==4 || matrix.some(row=>row.length!==4))throw Error("Cramer needs 4×4");
    const terms=[];
    for(let j=0;j<4;j++){
      const cof=exactDeterminant(minor(matrix,0,j));
      const term=calculate("product",r(j%2?-1:1),matrix[0][j],cof);
      lesson.work(`${label}: M₁${j+1} = ${compact(minor(matrix,0,j))}; (−1)^(1+${j+1})·(${f(matrix[0][j])})·(${f(cof)}) = ${f(term.result)}`,t("Usuwamy pierwszy wiersz i wskazaną kolumnę; znak dopełnienia wynika z parzystości sumy indeksów.","Delete the first row and specified column; the cofactor sign follows the parity of the index sum."),term);
      terms.push(term.result);
    }
    const sum=calculate("sum",...terms);
    lesson.work(`${label} = ${terms.map(f).map(x=>`(${x})`).join(" + ")} = ${f(sum.result)}`,t("Dodajemy cztery dokładne wyrazy rozwinięcia Laplace'a; Sarrus nie dotyczy macierzy 4×4.","Add the four exact Laplace terms; Sarrus does not apply to a 4×4 matrix."),sum);
    return sum.result;
  };
  lesson.work(`A = ${compact(A)}; b = ${compact(b.map(x=>[x]))}`,t("Reguła Cramera wymaga kwadratowej macierzy A i niezerowego D=det(A).","Cramer's rule requires a square A and nonzero D=det(A)."));
  const D=determinant(A,"D");
  let answer:AnswerSpec;
  if(D.numerator===0n){
    const result=classifySystem(A,b);
    if(result.kind==="system-one")throw Error("Zero determinant cannot give a unique 4×4 solution");
    lesson.work(`D=0; rank(A)=${result.rankA}; rank([A|b])=${result.rankAugmented}`,result.kind==="system-none"?t("Nie dzielimy przez D=0. Nierówne rzędy wskazują sprzeczny wiersz 0=c≠0.","Never divide by D=0. Unequal ranks reveal a contradictory row 0=c≠0."):t("Nie dzielimy przez D=0. Równe rzędy mniejsze od 4 oznaczają parametry swobodne.","Never divide by D=0. Equal ranks below 4 imply free parameters."));
    if(result.kind==="system-none"){
      const row=result.reduction.matrix.find(row=>row.slice(0,4).every(x=>x.numerator===0n)&&row[4].numerator!==0n);
      if(!row)throw Error("Missing contradiction");
      lesson.work(`${compact([row])}: 0 = ${f(row[4])}`,t("Ten konkretny wiersz wyklucza rozwiązania.","This concrete row excludes all solutions."));
    }else lesson.work(parameterization(result,names).join("; "),t("Parametry są dowolnymi liczbami rzeczywistymi; formularz ocenia klasę, nie swobodny zapis wzorów.","Parameters may be any real numbers; the form grades the class, not free-form formulas."));
    answer={kind:"choice",value:result.kind,options:options(locale)};
  }else{
    const values=names.map((name,j)=>{
      const replaced=A.map((row,i)=>row.map((v,k)=>k===j?b[i]:v));
      const Dj=determinant(replaced,`D${j+1}`);
      const quotient=calculate("quotient",Dj,D);
      lesson.work(`${name} = D${j+1}/D = (${f(Dj)})/(${f(D)}) = ${f(quotient.result)}`,t("D jest niezerowe; w Dⱼ zastępujemy wyłącznie kolumnę j wektorem prawych stron.","D is nonzero; in Dⱼ replace only column j with the right-hand-side vector."),quotient);
      return quotient.result;
    });
    for(let i=0;i<4;i++)lesson.work(`${A[i].map((c,j)=>`(${f(c)})·(${f(values[j])})`).join(" + ")} = ${f(dot(A[i],values))} = ${f(b[i])}`,t("Podstawiamy wszystkie cztery wartości do oryginalnego równania.","Substitute all four values into the original equation."));
    answer={kind:"system",classification:"system-one",variables:names,values};
  }
  return lesson.finish(t(`Rozwiąż układ Ax=b regułą Cramera lub, gdy D=0, sklasyfikuj: A = ${compact(A)}, b = ${compact(b.map(x=>[x]))}.`,`Solve Ax=b by Cramer's rule or, when D=0, classify: A = ${compact(A)}, b = ${compact(b.map(x=>[x]))}.`),answer,t("Najpierw policz D rozwinięciem Laplace'a; nie stosuj Sarrusa do 4×4.","First compute D by Laplace expansion; do not use Sarrus on 4×4."),t("Przy D≠0 zastępuj kolejno jedną kolumnę A wektorem b i dziel Dⱼ przez D. Przy D=0 porównaj rzędy.","When D≠0 replace one A column at a time by b and divide Dⱼ by D. At D=0 compare ranks."));
}
