import {
  rational as r, multiplyRational as mul, divideRational as div,
  subtractRational as sub, type Rational,
} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/**
 * Bounded, public-synthetic I04 integration-by-parts exercises.
 * Stage-only: not yet registered in schema, catalog or competency index.
 * No original university questions, answers or source-to-variant maps.
 */
export type I04LogPartsStageProblem=Readonly<{
  kind:"integral-parts-log-i04-stage";
  b:Rational;
  k:Rational;
}>;

export function makeI04LogPartsStage(variant:number):I04LogPartsStageProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24)
    throw Error("I04 log-parts stage needs integer variant 0..23");
  return {
    kind:"integral-parts-log-i04-stage",
    b:r(variant%7-3,variant%3===1?2:1),
    k:r((variant%2===0?1:-1)*(1+Math.floor(variant/3)%5),variant%4===2?2:1),
  };
}

/** Coefficients for u^2 ln(u), u^2, u ln(u), u, where u=x+b>0. */
export function i04LogPartsCoefficients(p:I04LogPartsStageProblem){
  if(p.k.numerator===0n)throw Error("Expected nonzero scale k");
  const kb=mul(p.k,p.b);
  return {
    squareLog:div(p.k,r(2)),
    square:sub(r(0),div(p.k,r(4))),
    linearLog:sub(r(0),kb),
    linear:kb,
  };
}

export function presentI04LogPartsStage(p:I04LogPartsStageProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const c=i04LogPartsCoefficients(p);
  const b=fmt(p.b),k=fmt(p.k);
  const u="(x+("+b+"))",ln="ln("+u+")";
  const names=[u+"²"+ln,u+"²",u+ln,u];
  const terms=[
    {basis:names[0],coefficient:c.squareLog},
    {basis:names[1],coefficient:c.square},
    {basis:names[2],coefficient:c.linearLog},
    {basis:names[3],coefficient:c.linear},
  ];
  const integrand="("+k+")x "+ln;
  const boundary=fmt(sub(r(0),p.b));
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));

  work("u="+u+">0, x=u−("+b+"), dx=du; x>"+boundary,
    "Argument logarytmu jest dodatni. Po podstawieniu czynnik x zapisujemy jako u−b.",
    "The logarithm requires a positive argument. Substitute x=u−b.");
  work("∫ "+integrand+" dx=("+k+")∫[u−("+b+")]ln(u)du",
    "Rozdzielamy iloczyn na u ln(u) oraz stałą razy ln(u).",
    "Split into u ln(u) and a constant times ln(u).");
  work("∫u ln(u)du=(u²/2)ln(u)−u²/4+C",
    "Przez części: A=ln(u), dB=u du, więc dA=du/u oraz B=u²/2.",
    "Integration by parts: A=ln(u), dB=u du, so dA=du/u and B=u²/2.");
  work("∫ln(u)du=u ln(u)−u+C",
    "Ponownie przez części: A=ln(u), dB=du, a pochodna ln(u) to 1/u.",
    "Again integrate by parts: A=ln(u), dB=du, and the derivative of ln(u) is 1/u.");
  work("F(x)="+terms.map(term=>"("+fmt(term.coefficient)+")"+term.basis).join(" + ")+" + C",
    "Łączymy oba wzory i zachowujemy dokładne współczynniki oraz +C.",
    "Combine both integrals, keeping exact coefficients and +C.");
  work("F′(x)="+integrand,
    "Różniczkowanie czterech składników skraca części bez logarytmu i odtwarza kx ln(x+b).",
    "Differentiate the four terms: nonlogarithmic contributions cancel, giving kx ln(x+b).");
  return lesson.finish(
    t("Oblicz przez części całkę ∫ ","Integrate by parts ∫ ")+
      integrand+" dx. "+t("Dziedzina: ","Domain: ")+u+">0 (x>"+boundary+"). "+
      t("Wpisz cztery współczynniki oraz +C.","Enter four coefficients and include +C."),
    {kind:"primitive",terms},
    t("Podstaw u=x+b i rozdziel u ln(u) oraz b ln(u).",
      "Substitute u=x+b and split u ln(u) and b ln(u)."),
    t("Użyj przez części dla obu składników: ∫u ln(u)du i ∫ln(u)du.",
      "Use integration by parts for both integrals: ∫u ln(u)du and ∫ln(u)du."),
  );
}
