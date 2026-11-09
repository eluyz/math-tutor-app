import {rational as r,divideRational as div,type Rational} from "../rational";
import {formatRational as f,type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/** C01 bounded source-form proxies. Staged only, not yet integrated into student catalog. */
export type C01Shape =
 | Readonly<{mode:"plain-polynomial";degree:2|3|4;leading:Rational;linear:Rational;constant:Rational}>
 | Readonly<{mode:"factored-ratio";a:Rational;b:Rational;p:Rational;q:Rational;shift:Rational}>
 | Readonly<{mode:"sextic-ratio";a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;f:Rational}>;

const levels=["medium","hard","advanced","expert"] as const;

/** 96 synthetic exercises across three types and four difficulty tiers, distinct from private source tasks. */
export function createC01Shape(variant:number,level:Difficulty):C01Shape {
 if(!Number.isInteger(variant)||variant<0||variant>=24||!levels.includes(level as typeof levels[number]))
  throw Error("C01 variant must be integer 0..23 on a supported difficulty");
 const tier=levels.indexOf(level as typeof levels[number])+1;
 const i=Math.floor(variant/3),sgn=i%2===0?1:-1;
 if(variant%3===0)
   return {mode:"plain-polynomial",degree:(2+i%3) as 2|3|4,
     leading:r(sgn*(1+i+3*(tier-1)),tier),linear:r(1+i+3*tier),constant:r(i-tier)};
 if(variant%3===1)
   return {mode:"factored-ratio",a:r(sgn*(1+i+4*(tier-1)),tier),b:r(1+i%5),
      p:r(1+i),q:r(2+i),shift:r(3+i+5*(tier-1))};
 return {mode:"sextic-ratio",a:r(sgn*(1+i+4*(tier-1)),tier),
    b:r(1+i+3*(tier-1)),c:r(1+i%5),d:r(1+i%4),
    e:r(2+i+5*(tier-1)),f:r(3+i)};
}

/** Exact degree comparison, with n positive. The denominator must remain positive for n>=1. */
export function c01ShapeLimit(p:C01Shape):LimitValue {
 if(p.mode==="plain-polynomial"){
  if(![2,3,4].includes(p.degree)||p.leading.numerator===0n)
   throw Error("Invalid degree or zero leading coefficient");
  return {kind:p.leading.numerator>0n?"positive-infinity":"negative-infinity"};
 }
 if(p.mode==="factored-ratio"){
  if(p.a.numerator===0n||p.b.numerator<=0n||p.p.numerator<=0n||
     p.q.numerator<0n||p.shift.numerator<0n)
   throw Error("Unsafe factored-ratio coefficients or denominator");
  return {kind:"finite",value:div(p.a,p.b)};
 }
 if(p.a.numerator===0n||p.d.numerator<=0n||p.e.numerator<0n||p.f.numerator<=0n)
  throw Error("Unsafe sextic-ratio coefficients or denominator");
 return {kind:"finite",value:div(p.a,p.d)};
}

export function presentC01Shape(p:C01Shape,locale:Locale) {
 const lim=c01ShapeLimit(p);
 const lesson=teaching(locale),{t}=lesson;
 let expr="";
 if(p.mode==="plain-polynomial"){
  const A=f(p.leading),B=f(p.linear),C=f(p.constant);
  expr="("+A+")·n^"+p.degree+"+("+B+")·n+("+C+")";
  lesson.work("n≥1; n^"+p.degree+" → +∞",
    t("Najpierw ustalamy stopień wielomianu i znak współczynnika wiodącego.",
      "First identify the degree and sign of the leading coefficient."));
  lesson.work("aₙ = n^"+p.degree+"·(("+A+")+("+B+")/n^"+(p.degree-1)+"+("+C+")/n^"+p.degree+")",
    t("Wyłączamy najwyższą potęgę n przed przejściem do granicy.",
      "Factor out the highest power of n before taking the limit."));
  lesson.work("("+A+")+("+B+")/n^"+(p.degree-1)+"+("+C+")/n^"+p.degree+" → "+A,
    t("Niższe potęgi po podzieleniu przez n do najwyższego stopnia znikają.",
      "The lower-degree terms vanish after division by the highest power."));
  lesson.work("lim aₙ = "+(lim.kind==="positive-infinity"?"+∞":"−∞"),
    t("Dla n≥1 o znaku nieskończoności decyduje znak współczynnika wiodącego.",
      "For n≥1 the leading coefficient determines the sign of infinity."));
 }else if(p.mode==="factored-ratio"){
  const A=f(p.a),B=f(p.b),P=f(p.p),Q=f(p.q),R=f(p.shift);
  expr="("+A+")·n·(n−("+P+"))²/[("+B+")·(n+("+Q+"))·(n+("+R+"))²]";
  lesson.work("n≥1; ("+B+")·(n+("+Q+"))·(n+("+R+"))²>0",
    t("Wszystkie czynniki mianownika są dodatnie w dziedzinie ciągu.",
      "All denominator factors are positive on the sequence domain."));
  lesson.work("aₙ = [("+A+")·n³·(1−("+P+")/n)²]/[("+B+")·n³·(1+("+Q+")/n)·(1+("+R+")/n)²]",
    t("Zostawiamy iloczyny w czytelnej postaci i wyłączamy n z każdego czynnika.",
      "Keep factors visible and factor n from each linear term."));
  lesson.work("aₙ = [("+A+")·(1−("+P+")/n)²]/[("+B+")·(1+("+Q+")/n)·(1+("+R+")/n)²]",
    t("Skracamy n³. Wszystkie nawiasy z 1/n dążą do 1.",
      "Cancel n³. Every factor with 1/n tends to 1."));
  lesson.work("lim aₙ = ("+A+")/("+B+") = "+(lim.kind==="finite"?f(lim.value):"?"),
    t("Granicą jest dokładny iloraz współczynników wiodących.",
      "The exact limit is the ratio of leading coefficients."));
 }else{
  const A=f(p.a),B=f(p.b),C=f(p.c),D=f(p.d),E=f(p.e),F=f(p.f);
  expr="[("+A+")·n⁶+("+B+")·n⁴+("+C+")]/[("+D+")·n⁶+("+E+")·n²+("+F+")]";
  lesson.work("n≥1; ("+D+")·n⁶+("+E+")·n²+("+F+")>0",
    t("Mianownik jest dodatni: wszystkie jego współczynniki są nieujemne, a najwyższy dodatni.",
      "The denominator is positive, as all its coefficients are nonnegative and the leading one is positive."));
  lesson.work("aₙ = [("+A+")+("+B+")/n²+("+C+")/n⁶]/[("+D+")+("+E+")/n⁴+("+F+")/n⁶]",
    t("Dzielimy licznik i mianownik przez n⁶ — nie przez n⁴.",
      "Divide numerator and denominator by n⁶, not n⁴."));
  lesson.work("n⁻²→0; n⁻⁴→0; n⁻⁶→0",
    t("Wszystkie niższe potęgi znikają w granicy.",
      "All lower powers vanish in the limit."));
  lesson.work("lim aₙ = ("+A+")/("+D+") = "+(lim.kind==="finite"?f(lim.value):"?"),
    t("Pozostają niezerowe współczynniki stojące przy n⁶.",
      "Only the nonzero coefficients of n⁶ remain."));
 }
 return lesson.finish(
  t("Wyznacz granicę przy n→+∞, n≥1.\naₙ = "+expr,
    "Find the limit as n→+∞, n≥1.\naₙ = "+expr),
  {kind:"limit",value:lim},
  t("Porównaj najwyższe potęgi i uważaj na znak w granicach niewłaściwych.",
    "Compare highest powers and watch the sign for infinite limits."),
  t("Gdy występują iloczyny, wyłącz n z każdego czynnika; przy stopniu szóstym dziel przez n⁶.",
    "For factored terms, extract n from each factor; for sextics, divide by n⁶.")
 );
}
