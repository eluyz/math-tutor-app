import {
  rational as r, subtractRational as sub,
  multiplyRational as mul, divideRational as div, type Rational,
} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/**
 * I04: two integrations by parts for k*x^2*sin(ax+b) and k*x^2*cos(ax+b).
 *
 * Staged on purpose: this self-contained module is NOT in the university
 * catalog yet. Registration requires a separate, serialized integration PR
 * touching schema.ts, catalog.ts, competencyIndex.ts and count baselines.
 * Existing I04 families and their tuple IDs remain unchanged.
 */
export type IntegralPartsTrigQuadraticProblem=Readonly<{
  kind:"integral-parts-trig-quadratic";
  mode:"sin"|"cos";
  a:Rational;
  b:Rational;
  k:Rational;
}>;

const difficulties=["hard","advanced","expert"] as const;

export function makeQuadraticTrigParts(variant:number,difficulty:Difficulty):IntegralPartsTrigQuadraticProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24||
      !difficulties.some(level=>level===difficulty))
    throw Error("Unsupported quadratic trigonometric integral variant");
  const denominator=difficulty==="hard"?1:difficulty==="advanced"?2:3;
  return {
    kind:"integral-parts-trig-quadratic",
    mode:variant%2===0?"sin":"cos",
    a:r((variant%2===0?1:-1)*(1+variant%4),denominator),
    b:r(variant%7-3,denominator),
    k:r((Math.floor(variant/4)%2===0?1:-1)*(1+Math.floor(variant/4)%4),denominator),
  };
}

// Descriptor ready for later catalog registration; intentionally not spread
// into universityFamilies until the shared-file owner integrates it.
export const integralPartsTrigQuadraticFamily={
  id:"integral-parts-trig-quadratic",
  category:"integrals",
  titles:{
    pl:"Dwukrotne całkowanie przez części — x² razy sinus lub cosinus",
    en:"Two integrations by parts — x² times sine or cosine",
  },
  supportedDifficulties:difficulties,
  create:makeQuadraticTrigParts,
} as const;

export function quadraticTrigPartsCoefficients(p:IntegralPartsTrigQuadraticProblem):
  {first:Rational;second:Rational;third:Rational}{
  if(p.a.numerator===0n||p.k.numerator===0n)
    throw Error("Nonzero frequency and coefficient required");
  const ratio=div(p.k,p.a);
  const correction=div(mul(r(2),ratio),p.a);
  const tail=div(correction,p.a);
  return p.mode==="sin"
    ? {first:sub(r(0),ratio),second:correction,third:tail}
    : {first:ratio,second:correction,third:sub(r(0),tail)};
}

export function presentQuadraticTrigParts(p:IntegralPartsTrigQuadraticProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const {first,second,third}=quadraticTrigPartsCoefficients(p);
  const a=fmt(p.a),b=fmt(p.b),k=fmt(p.k),theta="("+a+")x+("+b+")";
  const trig=p.mode==="sin"?"sin":"cos";
  const other=p.mode==="sin"?"cos":"sin";
  const integrand="("+k+")x² "+trig+"("+theta+")";
  const firstBasis="x^2 "+other+"("+theta+")";
  const secondBasis="x "+trig+"("+theta+")";
  const thirdBasis=other+"("+theta+")";
  const v=p.mode==="sin"
    ? "("+fmt(sub(r(0),div(p.k,p.a)))+")cos("+theta+")"
    : "("+fmt(div(p.k,p.a))+")sin("+theta+")";
  const j=p.mode==="sin"
    ? "J=∫x cos("+theta+") dx = ("+fmt(div(r(1),p.a))+")x sin("+theta+") + ("+fmt(div(r(1),mul(p.a,p.a)))+")cos("+theta+")"
    : "J=∫x sin("+theta+") dx = ("+fmt(sub(r(0),div(r(1),p.a)))+")x cos("+theta+") + ("+fmt(div(r(1),mul(p.a,p.a)))+")sin("+theta+")";
  lesson.work("I=∫ "+integrand+" dx; a="+a+"≠0",
    t("Czynnik x² po zróżniczkowaniu zmniejsza stopień; częstotliwość a musi być niezerowa.",
      "Differentiating x² lowers its degree; the frequency a must be nonzero."));
  lesson.work("u=x²; du=2x dx; dv=("+k+")"+trig+"("+theta+") dx; v="+v,
    t("Pierwszy raz stosujemy wzór przez części, całkując sinus lub cosinus z właściwym znakiem i dzieląc przez a.",
      "First apply integration by parts; integrate sine or cosine with the correct sign and divide by a."));
  lesson.work("I=x²v−∫2xv dx",
    t("Po pierwszym kroku pozostaje całka z x razy funkcja trygonometryczna; nadal potrzebne jest całkowanie przez części.",
      "The remaining integral contains x times a trigonometric function, so a second integration by parts is required."));
  lesson.work(j,
    t("Drugi raz wybieramy u=x; pochodna u jest równa 1, co zamyka rachunek.",
      "For the second pass choose u=x; its derivative is 1, completing the method."));
  const terms=[
    {basis:firstBasis,coefficient:first},
    {basis:secondBasis,coefficient:second},
    {basis:thirdBasis,coefficient:third},
  ];
  lesson.work("F(x)=("+fmt(first)+")"+firstBasis+" + ("+fmt(second)+")"+
    secondBasis+" + ("+fmt(third)+")"+thirdBasis+" + C",
    t("Zachowujemy trzy współczynniki dokładne, również znaki dla ujemnego a lub k.",
      "Keep all three exact coefficients, including signs when a or k is negative."));
  lesson.work("F′(x)="+integrand,
    t("Różniczkowanie i redukcja wyrazów liniowych i stałych odtwarza funkcję podcałkową.",
      "Differentiate and cancel the linear and constant terms to recover the integrand."));
  return lesson.finish(
    t("Oblicz dwukrotnie przez części ∫ ","Evaluate by integrating by parts twice: ∫ ")+
    integrand+" dx. "+
    t("Wpisz trzy współczynniki funkcji pierwotnej i dodaj +C.",
      "Enter all three antiderivative coefficients and include +C."),
    {kind:"primitive",terms},
    t("Najpierw u=x², potem u=x; nie kończ po pierwszym całkowaniu przez części.",
      "Start with u=x², then u=x; do not stop after the first integration by parts."),
    t("Pamiętaj o 1/a przy całkowaniu sin(ax+b) lub cos(ax+b) oraz o znakach.",
      "Remember the factor 1/a when integrating sin(ax+b) or cos(ax+b), including signs.")
  );
}
