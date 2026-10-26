import {
 rational as r,addRational as add,subtractRational as sub,
 multiplyRational as mul,divideRational as div,type Rational,
} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type DefiniteIntegralFollowupProblem =
 | Readonly<{kind:"integral-substitution-definite";k:Rational;b:Rational;c:Rational;n:number;lower:Rational;upper:Rational}>
 | Readonly<{kind:"integral-parts-definite";k:Rational;b:Rational;n:number;lower:Rational;upper:Rational}>;

const pow=(base:Rational,degree:number):Rational=>{
 if(!Number.isInteger(degree)||degree<0)throw Error("Nonnegative integer exponent required");
 let total=r(1);
 for(let i=0;i<degree;i++)total=mul(total,base);
 return total;
};
const generate=(v:number,d:Difficulty,kind:DefiniteIntegralFollowupProblem["kind"]):DefiniteIntegralFollowupProblem=>{
 const denom=d==="hard"?1:d==="advanced"?2:3;
 const common={
  k:r((v%2?-1:1)*(1+v%4),denom),
  b:r((v%7)-3,denom),
  n:d==="hard"?1+(v%2):d==="advanced"?2+(v%2):3+(v%2),
  lower:r((v%5)-3,denom),
  upper:r((v%5)+1,denom),
 };
 if(kind==="integral-substitution-definite")
  return {...common,kind,c:r((v%6)+1,denom)};
 return {...common,kind};
};
export const definiteIntegralFollowupFamilies:readonly UniversityFamily[]=[
 {id:"integral-substitution-definite",category:"integrals",
  titles:{pl:"Całka oznaczona — podstawienie kwadratowe",en:"Definite integral with quadratic substitution"},
  supportedDifficulties:["hard","advanced","expert"],create:(v,d)=>generate(v,d,"integral-substitution-definite")},
 {id:"integral-parts-definite",category:"integrals",
  titles:{pl:"Całka oznaczona — całkowanie przez części",en:"Definite integral by integration by parts"},
  supportedDifficulties:["hard","advanced","expert"],create:(v,d)=>generate(v,d,"integral-parts-definite")},
];
const quadratic=(p:Extract<DefiniteIntegralFollowupProblem,{kind:"integral-substitution-definite"}>,x:Rational)=>
 add(add(pow(x,2),mul(p.b,x)),p.c);
const shifted=(p:Extract<DefiniteIntegralFollowupProblem,{kind:"integral-parts-definite"}>,x:Rational)=>add(x,p.b);
export function definiteIntegralPrimitive(p:DefiniteIntegralFollowupProblem,x:Rational):Rational{
 if(p.k.numerator===0n||p.n<1)throw Error("Expected nonzero integrand and valid power");
 if(p.kind==="integral-substitution-definite")
  return div(mul(p.k,pow(quadratic(p,x),p.n+1)),r(p.n+1));
 // Integration by parts: u=x and dv=k(x+b)^n dx.
 const y=shifted(p,x);
 return sub(
  div(mul(mul(p.k,x),pow(y,p.n+1)),r(p.n+1)),
  div(mul(p.k,pow(y,p.n+2)),r((p.n+1)*(p.n+2))),
 );
}
export function definiteIntegralValue(p:DefiniteIntegralFollowupProblem):Rational{
 if(p.lower.numerator*p.upper.denominator>=p.upper.numerator*p.lower.denominator)
  throw Error("Expected upper limit greater than lower");
 return sub(definiteIntegralPrimitive(p,p.upper),definiteIntegralPrimitive(p,p.lower));
}
export function presentDefiniteIntegralFollowup(p:DefiniteIntegralFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const low=f(p.lower),up=f(p.upper),k=f(p.k),b=f(p.b),result=definiteIntegralValue(p);
 const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
 if(p.kind==="integral-substitution-definite"){
  const U="(x²+("+b+")x+("+f(p.c)+"))";
  const integrand="("+k+")(2x+("+b+"))"+U+"^"+p.n;
  const bottom=quadratic(p,p.lower),top=quadratic(p,p.upper);
  const constant=div(p.k,r(p.n+1));
  work("u="+U+"; du=(2x+("+b+"))dx",
   "Różniczkujemy wyrażenie kwadratowe pod potęgą; dokładnie taki czynnik znajduje się pod całką.",
   "Differentiate the quadratic inside the power; that derivative already appears in the integrand.");
  work("x="+low+" ⇒ u="+f(bottom)+"; x="+up+" ⇒ u="+f(top),
   "Przeliczamy oba końce przedziału po podstawieniu. Nie wymagamy, by u(x) było monotoniczne.",
   "Transform both integration bounds. The inner quadratic need not be monotonic.");
  work("∫_{"+low+"}^{"+up+"} "+integrand+" dx = ("+k+")∫_{"+f(bottom)+"}^{"+f(top)+"} u^"+p.n+" du",
   "Twierdzenie o podstawieniu dla całki oznaczonej uwzględnia nowe granice także wtedy, gdy kolejność się odwróci.",
   "The definite substitution formula uses the transformed bounds, even if their order is reversed.");
  work("F(x)=("+f(constant)+")"+U+"^"+(p.n+1)+"; F′(x)="+integrand,
   "Całkujemy u^n i sprawdzamy współczynnik przez regułę łańcuchową.",
   "Integrate u^n and verify the coefficient using the chain rule.");
  work("F("+up+")−F("+low+")=("+f(constant)+")("+f(pow(top,p.n+1))+"−"+f(pow(bottom,p.n+1))+")="+f(result),
   "Twierdzenie Newtona–Leibniza daje dokładną wartość wymierną; nie dopisujemy stałej C.",
   "The fundamental theorem gives the exact rational answer; no constant C is needed.");
  return lesson.finish(
   t("Oblicz dokładnie całkę oznaczoną przez podstawienie: ","Find the exact definite integral by substitution: ")+
   "∫_{"+low+"}^{"+up+"} "+integrand+" dx.",
   {kind:"scalar",value:result},
   t("Podstaw u=x²+bx+c i oblicz du.","Set u=x²+bx+c and compute du."),
   t("Przelicz dolną i górną granicę oraz oblicz u^(n+1)/(n+1).",
     "Transform both bounds and evaluate u^(n+1)/(n+1)."));
 }
 const y="(x+("+b+"))";
 const integrand="("+k+")x"+y+"^"+p.n;
 const V="("+k+")"+y+"^"+(p.n+1)+"/"+(p.n+1);
 const first=div(mul(mul(p.k,p.upper),pow(shifted(p,p.upper),p.n+1)),r(p.n+1));
 const second=div(mul(p.k,pow(shifted(p,p.upper),p.n+2)),r((p.n+1)*(p.n+2)));
 work("u=x, du=dx; dv=("+k+")"+y+"^"+p.n+" dx; v="+V,
  "Wybieramy u=x, bo pochodna x jest równa 1, a v otrzymujemy przez proste podstawienie.",
  "Choose u=x because its derivative is 1, and obtain v by a simple power substitution.");
 work("∫u dv = uv−∫v du; ∫ "+integrand+" dx = x·"+V+"−∫ "+V+" dx",
  "Używamy wzoru na całkowanie przez części. Odejmujemy pozostałą całkę, nie dodajemy jej.",
  "Apply integration by parts. Subtract the remaining integral rather than adding it.");
 work("F(x)=("+k+")x"+y+"^"+(p.n+1)+"/"+(p.n+1)+
  "−("+k+")"+y+"^"+(p.n+2)+"/("+((p.n+1)*(p.n+2))+")",
  "Całka pozostała jest potęgą wyrażenia liniowego, co umożliwia policzenie jej dokładnie.",
  "The remaining integral is a power of a linear expression and evaluates exactly.");
 work("F′(x)="+integrand,
  "Po zróżniczkowaniu wyrazy ze współczynnikiem (x+b)^(n+1) redukują się i zostaje pierwotna podcałkowa.",
  "When differentiated, the terms involving (x+b)^(n+1) cancel and the original integrand remains.");
 work("x="+up+": pierwsza część / first part="+f(first)+"; druga część / second part="+f(second),
  "Ocenę granicy górnej można rozłożyć na dwie dokładne wartości.",
  "Evaluate the upper endpoint as the difference of two exact values.");
 work("F("+up+")−F("+low+")="+f(definiteIntegralPrimitive(p,p.upper))+"−("+f(definiteIntegralPrimitive(p,p.lower))+")="+f(result),
  "Stosujemy Newtona–Leibniza i zachowujemy znaki również dla ujemnych współczynników.",
  "Apply the fundamental theorem, keeping the signs even for negative coefficients.");
 return lesson.finish(
  t("Oblicz dokładnie całkę oznaczoną przez części: ","Find the exact definite integral by parts: ")+
   "∫_{"+low+"}^{"+up+"} "+integrand+" dx.",
  {kind:"scalar",value:result},
  t("Przyjmij u=x oraz dv=k(x+b)^n dx.","Choose u=x and dv=k(x+b)^n dx."),
  t("Zapisz F=xv−∫v dx, a następnie oblicz F(górna)−F(dolna).",
    "Use F=xv−∫v dx, then evaluate F(upper)−F(lower)."));
}
