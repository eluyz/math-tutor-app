
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";
import {compare,normalize,rightRay,setAnswer,setText,type RealSet} from "./realSets";

export type FunctionFollowupProblem =
 | Readonly<{kind:"function-log-rational-domain";p:Rational;q:Rational;pole:Rational}>
 | Readonly<{kind:"function-mobius-inverse-point";a:Rational;b:Rational;c:Rational;d:Rational;image:Rational}>;
type Domain=Extract<FunctionFollowupProblem,{kind:"function-log-rational-domain"}>;
type Inverse=Extract<FunctionFollowupProblem,{kind:"function-mobius-inverse-point"}>;

function makeDomain(v:number,level:Difficulty):Domain{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const p=r(v-12,den),gap=r(2+v%4,level==="expert"?2:1),q=add(p,gap);
 const pole=v%3===0?sub(p,r(1+v%3,2)):v%3===1?add(p,div(gap,r(2))):add(q,r(1+v%4,2));
 return {kind:"function-log-rational-domain",p,q,pole};
}
export function rationalLogDomain(z:Domain):RealSet{
 if(compare(z.p,z.q)>=0||compare(z.p,z.pole)===0||compare(z.q,z.pole)===0)
  throw Error("Three distinct critical points required");
 const [lo,mid,hi]=[z.p,z.q,z.pole].sort(compare);
 return normalize([{lower:lo,upper:mid,lowerClosed:false,upperClosed:false},...rightRay(hi,false)]);
}
export function evalMobius(z:Inverse,x:Rational):Rational{
 const den=add(mul(z.c,x),z.d);
 if(den.numerator===0n)throw Error("Pole excluded");
 return div(add(mul(z.a,x),z.b),den);
}
export function mobiusInverseAt(z:Inverse):Rational{
 const det=sub(mul(z.a,z.d),mul(z.b,z.c));
 if(det.numerator===0n||z.c.numerator===0n)throw Error("Non-invertible function");
 const den=sub(z.a,mul(z.c,z.image));
 if(den.numerator===0n)throw Error("Outside inverse domain");
 return div(sub(mul(z.d,z.image),z.b),den);
}
function makeInverse(v:number,level:Difficulty):Inverse{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const a=r((v%2?-1:1)*(2+v%5),den),c=r(1+v%4,level==="expert"?2:1);
 const d=r(v%7-3,level==="hard"?1:2);
 let b=r(v%11-5,den);
 if(sub(mul(a,d),mul(b,c)).numerator===0n)b=add(b,r(1));
 let x=r(v-11,level==="expert"?3:level==="advanced"?2:1);
 if(add(mul(c,x),d).numerator===0n)x=add(x,r(1));
 const base={kind:"function-mobius-inverse-point" as const,a,b,c,d,image:r(0)};
 return {...base,image:evalMobius(base,x)};
}
export const functionFollowupFamilies:readonly UniversityFamily[]=[
 {id:"function-log-rational-domain",category:"functions",titles:{pl:"Dziedzina logarytmu ilorazu trzech czynników",en:"Domain of a logarithm with three critical points"},supportedDifficulties:["hard","advanced","expert"],create:makeDomain},
 {id:"function-mobius-inverse-point",category:"functions",titles:{pl:"Funkcja odwrotna do ułamka liniowego",en:"Inverse of a linear-fractional function"},supportedDifficulties:["hard","advanced","expert"],create:makeInverse},
];
export function presentFunctionFollowup(z:FunctionFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 if(z.kind==="function-log-rational-domain"){
  const roots=[z.p,z.q,z.pole].sort(compare), D=rationalLogDomain(z);
  const expression="ln(((x−("+f(z.p)+"))(x−("+f(z.q)+")))/(x−("+f(z.pole)+")))";
  lesson.work("ln(u)∈ℝ ⇔ u>0",
    t("Argument logarytmu musi być ściśle dodatni; jego zera i bieguny są wykluczone.",
      "The logarithm argument must be strictly positive; its zeros and poles are excluded."));
  lesson.work("Punkty krytyczne / Critical points: "+roots.map(f).join(" < "),
    t("Sortujemy trzy różne punkty krytyczne. W każdym zmienia się znak ilorazu czynników liniowych.",
      "Sort the three distinct critical points; the rational sign flips at every simple root or pole."));
  lesson.work("Tabela znaków / Sign chart: − | + | − | +",
    t("Po prawej iloraz jest dodatni (zachowuje się jak x); przekraczając każdą granicę zmieniamy znak.",
      "At the right the ratio behaves like x and is positive; cross each boundary and reverse its sign."));
  lesson.work("D = "+setText(D),
    t("Wybieramy dodatnie przedziały bez końców. Nie wolno dopuścić zera logarytmu ani mianownika.",
      "Select positive intervals with open endpoints: neither log(0) nor a zero denominator is permitted."));
  return lesson.finish(t("Wyznacz dziedzinę rzeczywistą.","Find the real domain.")+"\nf(x)="+expression,
    setAnswer(D,roots[1]),
    t("Zapisz trzy miejsca zerowe i biegun, a następnie ułóż tabelę znaków.",
      "List the two numerator zeros and denominator pole, then construct the sign chart."),
    t("Iloraz ma być ściśle dodatni: użyj otwartych końców przedziałów.",
      "The quotient must be strictly positive; use open interval boundaries."));
 }
 const x=mobiusInverseAt(z),det=sub(mul(z.a,z.d),mul(z.b,z.c));
 const excluded=div(sub(r(0),z.d),z.c),missing=div(z.a,z.c);
 const expr="(("+f(z.a)+")·x+("+f(z.b)+"))/(("+f(z.c)+")·x+("+f(z.d)+"))";
 lesson.work("ad−bc = "+f(det)+" ≠ 0",
  t("Wyznacznik niezerowy gwarantuje różnowartościowość funkcji ułamkowej.",
    "A nonzero determinant guarantees injectivity of this linear-fractional function."));
 lesson.work("D(f)=ℝ∖{"+f(excluded)+"}; W(f)=ℝ∖{"+f(missing)+"}",
  t("Mianownik nie może być zerem. Wartość a/c jest wykluczona ze zbioru wartości.",
    "The denominator cannot vanish and the value a/c is missing from the range."));
 lesson.work("y(cx+d)=ax+b ⇒ x=(dy−b)/(a−cy)",
  t("Mnożymy obustronnie przez mianownik i wyznaczamy x, zachowując niezerowy dzielnik.",
    "Multiply by the denominator and isolate x, keeping the divisor nonzero."));
 lesson.work("y="+f(z.image)+" ⇒ f⁻¹(y)=("+f(z.d)+"·"+f(z.image)+"−"+f(z.b)+")/("+f(z.a)+"−"+f(z.c)+"·"+f(z.image)+") = "+f(x),
  t("Podstawiamy wartość y i wykonujemy dokładne działania na ułamkach.",
    "Substitute y and perform exact rational arithmetic."));
 return lesson.finish(
  t("Oblicz f⁻¹(y) dla podanego y. Uwzględnij ograniczenia dziedziny.",
    "Find f⁻¹(y) for the given y. Respect the domain restrictions.")+"\nf(x)="+expr+"\ny="+f(z.image),
  {kind:"scalar",value:x},
  t("Zapisz y=f(x), pomnóż przez mianownik i wyznacz x w zależności od y.",
    "Write y=f(x), multiply by the denominator and isolate x in terms of y."),
  t("Użyj wzoru x=(dy−b)/(a−cy), sprawdzając ad−bc≠0 oraz y≠a/c.",
    "Use x=(dy−b)/(a−cy), verifying ad−bc≠0 and y≠a/c."));
}
