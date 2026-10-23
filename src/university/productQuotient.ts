import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type ProductQuotientProblem =
  | Readonly<{
      kind: "derivative-product-point"; a:Rational; b:Rational; c:Rational; d:Rational; at:Rational;
    }>
  | Readonly<{
      kind: "derivative-quotient-point"; a:Rational; b:Rational; c:Rational; d:Rational; at:Rational;
    }>;

const sign=(v:number)=>v%2?-1:1;
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
const x0=(v:number,n:number)=>add(r(v-11),r(n,7));
const coefficients=(v:number,n:number)=>{
  const den=n===0?1:n===1?2:3;
  return {
    a:r(sign(v)*(1+(v%5)),den),
    b:add(r(v-11,den),r(n,7)),
    c:r(1+((v+n)%4),den),
    d:r((v%7)-3,den),
    at:x0(v,n),
  };
};
function product(v:number,d:Difficulty):ProductQuotientProblem {
  return {kind:"derivative-product-point",...coefficients(v,index(d))};
}
function quotient(v:number,d:Difficulty):ProductQuotientProblem {
  const n=index(d),part=coefficients(v,n);
  const targetDenominator=r(1+(v%4),n===0?1:n===1?2:3);
  const dd=sub(targetDenominator,mul(part.c,part.at));
  let bb=part.b;
  if(sub(mul(part.a,dd),mul(bb,part.c)).numerator===0n)
    bb=add(bb,r(1));
  return {kind:"derivative-quotient-point",...part,b:bb,d:dd};
}
export const productQuotientFamilies:readonly UniversityFamily[]=[
  {id:"derivative-product-point",category:"derivatives",
    titles:{pl:"Pochodna iloczynu w punkcie",en:"Derivative of a product at a point"},
    supportedDifficulties:["easy","medium","hard"],create:product},
  {id:"derivative-quotient-point",category:"derivatives",
    titles:{pl:"Pochodna ilorazu w punkcie",en:"Derivative of a quotient at a point"},
    supportedDifficulties:["easy","medium","hard"],create:quotient},
];
export function valueProduct(p:Extract<ProductQuotientProblem,{kind:"derivative-product-point"}>):Rational {
  // u=ax+b, v=cx²+d; (uv)'=u'v+uv'.
  const h=p.at;
  return add(mul(p.a,add(mul(p.c,mul(h,h)),p.d)),
    mul(add(mul(p.a,h),p.b),mul(r(2),mul(p.c,h))));
}
export function denominatorAt(p:Extract<ProductQuotientProblem,{kind:"derivative-quotient-point"}>):Rational {
  return add(mul(p.c,p.at),p.d);
}
export function valueQuotient(p:Extract<ProductQuotientProblem,{kind:"derivative-quotient-point"}>):Rational {
  const q=denominatorAt(p);
  if(q.numerator===0n)throw Error("Quotient is undefined at the selected point");
  return div(sub(mul(p.a,p.d),mul(p.b,p.c)),mul(q,q));
}
const linear=(a:Rational,b:Rational)=>"("+f(a)+")x+("+f(b)+")";
export function presentProductQuotient(p:ProductQuotientProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson,h=f(p.at);
  if(p.kind==="derivative-product-point"){
    const u=linear(p.a,p.b),v="("+f(p.c)+")x²+("+f(p.d)+")";
    const first=add(mul(p.a,p.at),p.b),second=add(mul(p.c,mul(p.at,p.at)),p.d);
    const firstDerivative=p.a,secondDerivative=mul(r(2),mul(p.c,p.at));
    const result=valueProduct(p);
    lesson.work("u(x)="+u+"; v(x)="+v,
      t("Rozdziel iloczyn na dwie funkcje. Pochodna iloczynu to u′v+uv′.",
        "Split the product into two functions. The product rule is u′v+uv′."));
    lesson.work("u′(x)="+f(p.a)+"; v′(x)=(2)("+f(p.c)+")x",
      t("Pochodna czynnika liniowego jest stała, a pochodna x² wynosi 2x.",
        "The derivative of the linear factor is constant, and the derivative of x² is 2x."));
    lesson.work("u("+h+")="+f(first)+"; v("+h+")="+f(second)+"; v′("+h+")="+f(secondDerivative),
      t("Podstawiamy ten sam punkt do obu czynników i ich pochodnych.",
        "Substitute the same point into the factors and their derivatives."));
    lesson.work("f′("+h+")=("+f(firstDerivative)+")("+f(second)+")+("+f(first)+")("+f(secondDerivative)+")="+f(result),
      t("Dodaj dwa iloczyny. Nie wolno zastępować (uv)′ przez u′v′.",
        "Add the two products. Never replace (uv)′ with u′v′."));
    return lesson.finish(
      t("Oblicz pochodną iloczynu w punkcie", "Find the derivative of the product at")+
        " x="+h+".\nf(x)=("+u+")("+v+")",
      {kind:"scalar",value:result},
      t("Użyj (uv)′=u′v+uv′. Najpierw oblicz pochodne czynników.",
        "Apply (uv)′=u′v+uv′. Differentiate the factors first."),
      t("Oblicz u(h), v(h), u′(h), v′(h), a następnie u′(h)v(h)+u(h)v′(h).",
        "Find u(h), v(h), u′(h), v′(h), then sum u′(h)v(h)+u(h)v′(h)."));
  }
  const numerator=linear(p.a,p.b),denominator=linear(p.c,p.d),q=denominatorAt(p);
  const result=valueQuotient(p),det=sub(mul(p.a,p.d),mul(p.b,p.c));
  lesson.work("N(x)="+numerator+"; D(x)="+denominator,
    t("Dla ilorazu f=N/D stosujemy (N′D−ND′)/D².",
      "For f=N/D apply the quotient rule (N′D−ND′)/D²."));
  lesson.work("N′(x)="+f(p.a)+"; D′(x)="+f(p.c),
    t("Obie pochodne są stałe. Zachowaj kolejność odejmowania N′D−ND′.",
      "Both derivatives are constant. Keep the order N′D−ND′."));
  lesson.work("D("+h+")="+f(q)+" ≠ 0; N′D−ND′=("+f(p.a)+")("+f(p.d)+")−("+f(p.b)+")("+f(p.c)+")="+f(det),
    t("Mianownik w punkcie jest niezerowy, a licznik po uproszczeniu to ad−bc.",
      "The denominator at the point is nonzero; the numerator simplifies to ad−bc."));
  lesson.work("f′("+h+")=("+f(det)+")/("+f(q)+")²="+f(result),
    t("Podziel dokładny licznik przez kwadrat wartości mianownika, bez zaokrąglania.",
      "Divide the exact numerator by the square of the denominator, without rounding."));
  return lesson.finish(
    t("Oblicz pochodną ilorazu w punkcie", "Find the derivative of the quotient at")+
      " x="+h+".\nf(x)=("+numerator+")/("+denominator+")",
    {kind:"scalar",value:result},
    t("Zastosuj (N/D)′=(N′D−ND′)/D² i sprawdź D(h)≠0.",
      "Apply (N/D)′=(N′D−ND′)/D² and verify D(h)≠0."),
    t("Dla dwóch funkcji liniowych licznik pochodnej upraszcza się do ad−bc.",
      "For two affine functions, the derivative numerator reduces to ad−bc."));
}
