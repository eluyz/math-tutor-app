import {
  rational as r, subtractRational as sub, multiplyRational as mul,
  divideRational as div, type Rational,
} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/**
 * Staged, public-synthetic I03 u-substitution examples, intentionally NOT
 * registered in the shared schema/catalog until a separate integration PR.
 * No original university exercises, coefficients, or answer keys are included.
 */
export type I03LogPowerStageProblem = Readonly<{
  kind:"integral-log-power-i03-stage";
  a:Rational;
  b:Rational;
  k:Rational;
  exponent:1|2;
}>;

export function makeI03LogPowerStage(variant:number):I03LogPowerStageProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24)
    throw Error("I03 log-power stage accepts integer variants 0..23");
  const j=Math.floor(variant/2);
  const den=j%3===0?1:j%3===1?2:3;
  return {
    kind:"integral-log-power-i03-stage",
    a:r((j%2===0?1:-1)*(1+j%4),den),
    b:r(j%7-3,den),
    k:r((j%3===2?-1:1)*(2+j%5),j%4===0?2:1),
    exponent:variant%2===0?1:2,
  };
}

export function i03LogPowerCoefficient(p:I03LogPowerStageProblem):Rational{
  if(p.a.numerator===0n||p.k.numerator===0n||
    (p.exponent!==1&&p.exponent!==2))
    throw Error("Expected nonzero slope and scale and exponent 1 or 2");
  return div(p.k,r(p.exponent+1));
}

export function presentI03LogPowerStage(p:I03LogPowerStageProblem,locale:Locale){
  const coefficient=i03LogPowerCoefficient(p);
  const lesson=teaching(locale),{t}=lesson;
  const a=fmt(p.a),b=fmt(p.b),k=fmt(p.k),m=p.exponent;
  const inside="("+a+")x+("+b+")";
  const log="ln("+inside+")";
  const basis="("+log+")^"+(m+1);
  const numerator="("+fmt(mul(p.k,p.a))+")("+log+")^"+m;
  const integrand=numerator+"/("+inside+")";
  const threshold=fmt(div(sub(r(0),p.b),p.a));
  const domain="x"+(p.a.numerator>0n?">":"<")+threshold;
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));

  work("u="+inside+"; u>0; du/dx="+a,
    "Argument logarytmu musi być dodatni. Pochodna u jest stała i nie może być zerem.",
    "The logarithm argument must be positive. The derivative of u is a nonzero constant.");
  work("t=ln(u); dt=du/u; dx=du/("+a+")",
    "Najpierw podstaw u, a następnie t=ln(u): czynnik 1/u pochodzi z pochodnej logarytmu.",
    "First substitute u, then t=ln(u): the factor 1/u is the logarithmic derivative.");
  work("∫ "+integrand+" dx=("+k+")∫t^"+m+" dt",
    "W liczniku występuje k razy pochodna funkcji wewnętrznej; czynnik a skraca się po zmianie zmiennej.",
    "The numerator contains k times the inner derivative; the factor a cancels on substitution.");
  work("("+k+")∫t^"+m+"dt=("+fmt(coefficient)+")t^"+(m+1)+"+C",
    "Stosujemy regułę potęgową, dzieląc przez m+1. Nie zgub stałej całkowania.",
    "Apply the power rule and divide by m+1. Include the integration constant.");
  work("F(x)=("+fmt(coefficient)+")"+basis+"+C; F′(x)="+integrand,
    "Sprawdzenie przez różniczkowanie odtwarza całkowaną funkcję także dla ujemnego a lub k.",
    "Differentiating restores the integrand, including negative a or k.");
  return lesson.finish(
    t("Oblicz przez podstawienie całkę ∫ ","Evaluate by substitution the integral ∫ ")+
      integrand+" dx. "+
      t("Dziedzina: ","Domain: ")+inside+">0 ("+domain+"). "+
      t("Podaj współczynnik przy ","Enter the coefficient of ")+basis+" "+
      t("oraz dodaj +C.","and include +C."),
    {kind:"primitive",terms:[{basis,coefficient}]},
    t("Rozpoznaj pochodną ln(u): u′/u.","Recognize the logarithmic derivative u′/u."),
    t("Podstaw t=ln(ax+b), a następnie całkuj t^m.",
      "Set t=ln(ax+b), then integrate t^m."),
  );
}
