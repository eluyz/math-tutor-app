import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, type Rational,
} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type DerivativeFollowupProblem =
  | Readonly<{
      kind:"derivative-quadratic-quotient";a:Rational;b:Rational;c:Rational;
      d:Rational;e:Rational;at:Rational;
    }>
  | Readonly<{
      kind:"derivative-log-quadratic";a:Rational;b:Rational;c:Rational;at:Rational;
    }>;

type Quotient=Extract<DerivativeFollowupProblem,{kind:"derivative-quadratic-quotient"}>;
type Logarithm=Extract<DerivativeFollowupProblem,{kind:"derivative-log-quadratic"}>;
const sq=(x:Rational)=>mul(x,x);
const value=(a:Rational,b:Rational,c:Rational,x:Rational)=>add(add(mul(a,sq(x)),mul(b,x)),c);
const derivative=(a:Rational,b:Rational,x:Rational)=>add(mul(r(2),mul(a,x)),b);
const formatPoly=(a:Rational,b:Rational,c:Rational)=>"("+f(a)+")x²+("+f(b)+")x+("+f(c)+")";
const formatLinear=(a:Rational,b:Rational)=>"("+f(a)+")x+("+f(b)+")";

function quotient(v:number,level:Difficulty):Quotient{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const h=r(v-11,den),a=r((v%2?-1:1)*(1+v%4),den),b=r(v%7-3,den),c=r(v%11-5,den);
 const d=r((v%2?-1:1)*(1+(v+2)%5),den);
 const q=r(1+v%5,level==="expert"?2:1);
 const e=sub(q,mul(d,h)); // D(h)=q>0, so every proposed point belongs to the domain
 return {kind:"derivative-quadratic-quotient",a,b,c,d,e,at:h};
}
function logarithm(v:number,level:Difficulty):Logarithm{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const h=r(v-11,den);
 const a=r((v%2?-1:1)*(1+v%4),den);
 const slope=r(v%9-4,den);
 const positiveValue=r(1+v%7,level==="expert"?2:1);
 // Choose coefficients from a prescribed positive value and slope at h.
 const b=sub(slope,mul(r(2),mul(a,h)));
 const c=add(sub(positiveValue,mul(slope,h)),mul(a,sq(h)));
 return {kind:"derivative-log-quadratic",a,b,c,at:h};
}
export function quotientDerivativeAt(p:Quotient):Rational{
 const n=value(p.a,p.b,p.c,p.at);
 const dn=derivative(p.a,p.b,p.at);
 const d=add(mul(p.d,p.at),p.e);
 if(d.numerator===0n)throw Error("Quotient denominator is zero at target");
 return div(sub(mul(dn,d),mul(n,p.d)),sq(d));
}
export function logDerivativeAt(p:Logarithm):Rational{
 const u=value(p.a,p.b,p.c,p.at);
 if(u.numerator<=0n)throw Error("Natural logarithm not defined at target");
 return div(derivative(p.a,p.b,p.at),u);
}
export const derivativeFollowupFamilies:readonly UniversityFamily[]=[
 {id:"derivative-quadratic-quotient",category:"derivatives",
  titles:{pl:"Pochodna ilorazu wielomianu kwadratowego i liniowego",en:"Derivative of a quadratic-over-linear quotient"},
  supportedDifficulties:["hard","advanced","expert"],create:quotient},
 {id:"derivative-log-quadratic",category:"derivatives",
  titles:{pl:"Pochodna logarytmu funkcji kwadratowej",en:"Derivative of a logarithm of a quadratic"},
  supportedDifficulties:["hard","advanced","expert"],create:logarithm},
];
export function presentDerivativeFollowup(p:DerivativeFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,h=f(p.at);
 if(p.kind==="derivative-quadratic-quotient"){
  const n=value(p.a,p.b,p.c,p.at),dn=derivative(p.a,p.b,p.at);
  const d=add(mul(p.d,p.at),p.e),result=quotientDerivativeAt(p);
  lesson.work("N(x)="+formatPoly(p.a,p.b,p.c)+"; D(x)="+formatLinear(p.d,p.e),
    t("Najpierw rozdzielamy licznik i mianownik. Mianownik musi być niezerowy w punkcie, gdzie liczymy pochodną.",
      "Identify numerator and denominator first. The denominator must be nonzero at the differentiation point."));
  lesson.work("N′(x)=2("+f(p.a)+")x+("+f(p.b)+"); D′(x)="+f(p.d),
    t("Różniczkujemy wielomian kwadratowy i liniowy, zachowując współczynniki i znaki.",
      "Differentiate the quadratic and linear polynomials, preserving all coefficients and signs."));
  lesson.work("N("+h+")="+f(n)+"; N′("+h+")="+f(dn)+"; D("+h+")="+f(d)+"≠0",
    t("Podstawiamy x=h do N, N′ i D. Sprawdzamy dziedzinę przed użyciem wzoru ilorazu.",
      "Evaluate N, N′ and D at x=h. Check the domain before applying the quotient rule."));
  lesson.work("f′(h)=(N′(h)D(h)−N(h)D′(h))/(D(h))²",
    t("Licznik to różnica dwóch iloczynów w tej kolejności, a cały mianownik podnosimy do kwadratu.",
      "Subtract the two products in the stated order, and square the entire denominator."));
  lesson.work("f′("+h+")=(("+f(dn)+")("+f(d)+")−("+f(n)+")("+f(p.d)+"))/("+f(d)+")²="+f(result),
    t("Wstawiamy dokładne ułamki i upraszczamy wynik bez zaokrągleń.",
      "Substitute exact rational numbers and simplify without rounding."));
  return lesson.finish(
    t("Oblicz pochodną ilorazu w punkcie x=","Find the quotient derivative at x=")+h+
     ".\nf(x)=("+formatPoly(p.a,p.b,p.c)+")/("+formatLinear(p.d,p.e)+")",
    {kind:"scalar",value:result},
    t("Sprawdź D(h)≠0. Policz N′ i D′ osobno.",
      "Check D(h)≠0. Calculate N′ and D′ separately."),
    t("Użyj (N/D)′=(N′D−ND′)/D². Nie pomyl kolejności odejmowania.",
      "Apply (N/D)′=(N′D−ND′)/D². Keep the subtraction order."));
 }
 const u=value(p.a,p.b,p.c,p.at),du=derivative(p.a,p.b,p.at),result=logDerivativeAt(p);
 lesson.work("u(x)="+formatPoly(p.a,p.b,p.c)+"; f(x)=ln(u(x))",
   t("Rozpoznajemy złożenie logarytmu naturalnego z wielomianem kwadratowym.",
     "Recognize the composition of a natural logarithm with a quadratic polynomial."));
 lesson.work("u("+h+")="+f(u)+">0",
   t("Przed różniczkowaniem logarytmu sprawdzamy, czy jego argument jest dodatni w zadanym punkcie.",
     "Before differentiating the logarithm, verify its argument is positive at the given point."));
 lesson.work("u′(x)=2("+f(p.a)+")x+("+f(p.b)+"); u′("+h+")="+f(du),
   t("Pochodna funkcji wewnętrznej wynika z reguły potęgowej.",
     "The derivative of the inner function follows from the power rule."));
 lesson.work("f′(x)=u′(x)/u(x), gdy u(x)>0",
   t("Stosujemy regułę łańcuchową: pochodna ln(u) to u′/u, a nie 1/u.",
     "Apply the chain rule: the derivative of ln(u) is u′/u, not simply 1/u."));
 lesson.work("f′("+h+")=("+f(du)+")/("+f(u)+")="+f(result),
   t("Podstawiamy do wzoru i skracamy dokładny ułamek.",
     "Substitute the exact values and reduce the rational fraction."));
 return lesson.finish(
  t("Oblicz pochodną logarytmu w punkcie x=","Find the logarithmic derivative at x=")+h+
  ".\nf(x)=ln("+formatPoly(p.a,p.b,p.c)+")",
  {kind:"scalar",value:result},
  t("Najpierw oblicz u(h) i sprawdź, czy jest dodatnie.",
    "Find u(h) first and check that it is positive."),
  t("Stosuj (ln u)′=u′/u. Policz u′(h), następnie podziel przez u(h).",
    "Use (ln u)′=u′/u. Evaluate u′(h), then divide by u(h)."));
}
