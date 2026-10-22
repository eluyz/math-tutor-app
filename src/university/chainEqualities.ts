import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";

type Problem=Extract<LinearAlgebraProblem,{kind:"linear-chain-five"}>;
type Expression=Problem["expressions"][number];
const evaluate=(e:Expression,x:Rational,y:Rational)=>div(add(add(mul(e.a,x),mul(e.b,y)),e.c),e.denominator);
const display=(e:Expression)=>`((${f(e.a)})·x + (${f(e.b)})·y + (${f(e.c)}))/(${f(e.denominator)})`;
const difference=(left:Expression,right:Expression)=>({
  a:sub(div(left.a,left.denominator),div(right.a,right.denominator)),
  b:sub(div(left.b,left.denominator),div(right.b,right.denominator)),
  rhs:sub(div(right.c,right.denominator),div(left.c,left.denominator)),
});
export function solveChain(p:Problem):readonly [Rational,Rational]{
  if(p.expressions.length!==5)throw Error("Five expressions required");
  const u=difference(p.expressions[0],p.expressions[1]);
  const v=difference(p.expressions[0],p.expressions[2]);
  const determinant=sub(mul(u.a,v.b),mul(u.b,v.a));
  if(determinant.numerator===0n)throw Error("Non-unique chain system");
  const x=div(sub(mul(u.rhs,v.b),mul(u.b,v.rhs)),determinant);
  const y=div(sub(mul(u.a,v.rhs),mul(u.rhs,v.a)),determinant);
  const common=evaluate(p.expressions[0],x,y);
  if(!p.expressions.every(e=>equalRational(evaluate(e,x,y),common)))
    throw Error("Remaining chain equalities not verified");
  return [x,y];
}
const tuples:readonly (readonly [number,number,number])[]=[
  [1,0,1],[0,1,1],[2,1,2],[1,-2,3],[-2,1,4]
];
function create(v:number,level:Difficulty):Problem{
  const x=r(v-11,level==="medium"?1:level==="hard"?2:level==="advanced"?3:4);
  const y=r((v%9)-4,level==="medium"?1:level==="hard"?2:level==="advanced"?3:4);
  const shared=r((v%7)-3,level==="expert"?2:1);
  const expressions=tuples.map(([a,b,d])=>({
    a:r(a),b:r(b),denominator:r(d),
    c:sub(sub(mul(r(d),shared),mul(r(a),x)),mul(r(b),y)),
  }));
  return {kind:"linear-chain-five",expressions,target:v%2===0?"x":"y"};
}
export const chainFamilies:readonly UniversityFamily[]=[
  {id:"system-chain-five",category:"systems",
   titles:{pl:"Łańcuch pięciu równych wyrażeń — wyznacz x lub y",
           en:"Chain of five equal expressions — find x or y"},
   supportedDifficulties:["medium","hard","advanced","expert"],
   create},
];
export function presentChain(p:Problem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const [x,y]=solveChain(p),[u,v]=[difference(p.expressions[0],p.expressions[1]),difference(p.expressions[0],p.expressions[2])];
  const determinant=sub(mul(u.a,v.b),mul(u.b,v.a));
  lesson.work(p.expressions.map(display).join(" = "),
    t("Wszystkie pięć wyrażeń jest równe tej samej wartości. Dwie niezależne równości wystarczą do wyznaczenia x i y, pozostałe sprawdzamy.",
      "All five expressions have the same value. Two independent equalities determine x and y; we verify the other two."));
  lesson.work(`(${f(u.a)})x + (${f(u.b)})y = ${f(u.rhs)}; (${f(v.a)})x + (${f(v.b)})y = ${f(v.rhs)}`,
    t("Równamy pierwsze wyrażenie z drugim i trzecim; usuwamy mianowniki po obu stronach.",
      "Set the first expression equal to the second and third; clear denominators on both sides."));
  lesson.work(`det(A)=(${f(u.a)})(${f(v.b)})−(${f(u.b)})(${f(v.a)})=${f(determinant)} ≠ 0`,
    t("Wyznacznik macierzy współczynników jest niezerowy, więc rozwiązanie jest jednoznaczne.",
      "The coefficient determinant is nonzero, so the solution is unique."));
  lesson.work(`x=${f(x)}; y=${f(y)}`,
    t("Obliczamy oba wyniki dokładnie metodą Cramera; pytanie może dotyczyć tylko jednej niewiadomej.",
      "Use exact Cramer's rule for both values; the question may request only one unknown."));
  const values=p.expressions.map(e=>evaluate(e,x,y));
  lesson.work(values.map((value,i)=>`E${i+1}=${f(value)}`).join("; "),
    t("Sprawdzamy wszystkie pięć wyrażeń w oryginalnym łańcuchu, nie tylko użyte dwa równania.",
      "Substitute into all five original expressions, not only the two equations used to solve."));
  if(!values.every(v=>equalRational(v,values[0])))throw Error("Broken equality chain");
  const answer:AnswerSpec={kind:"scalar",value:p.target==="x"?x:y};
  return lesson.finish(
    t(`Oblicz ${p.target} z łańcucha pięciu równych wyrażeń: ${p.expressions.map(display).join(" = ")}.`,
      `Find ${p.target} from the chain of five equal expressions: ${p.expressions.map(display).join(" = ")}.`),
    answer,
    t("Pierwsze trzy wyrażenia tworzą dwie niezależne równości. Zacznij od E1=E2 oraz E1=E3.",
      "The first three expressions yield two independent equations. Start with E1=E2 and E1=E3."),
    t("Oblicz x i y z otrzymanego układu 2×2; sprawdź E4 i E5, następnie wpisz tylko żądaną niewiadomą.",
      "Solve the 2×2 system for x and y; verify E4 and E5, then enter only the requested unknown."));
}
