import {rational as r, divideRational as div, type Rational} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/**
 * C04 synthetic source-shape method for a linear factor multiplied by an
 * exponential quotient with a second, smaller denominator term.
 * Staged independently: NOT registered in the public student catalogue.
 * No private worksheet formulas, constants or answer keys are copied.
 */
export type MixedExponentialSequence = Readonly<{
  numeratorLinear: Rational;
  numeratorConstant: Rational;
  numeratorBase: Rational;
  denominatorBase: Rational;
  denominatorConstant: Rational;
}>;

const levels = ["medium", "hard", "advanced", "expert"] as const;
const cmp = (a:Rational,b:Rational) =>
  a.numerator*b.denominator-b.numerator*a.denominator;

export function createMixedExponentialSequence(variant:number,level:Difficulty):MixedExponentialSequence {
  if(!Number.isInteger(variant)||variant<0||variant>=24||
     !levels.includes(level as typeof levels[number]))
    throw Error("Unsupported C04 mixed exponential variant or difficulty");
  const tier=levels.indexOf(level as typeof levels[number]);
  const denominatorBase=r(3+variant%4);
  const numeratorBase=variant%3===0?r(4+variant%4):
    variant%3===1?r(2+variant%4):denominatorBase;
  return {
    numeratorLinear:r(3+variant+24*tier),
    numeratorConstant:r(2+variant%4),
    numeratorBase,
    denominatorBase,
    denominatorConstant:r(2+variant%5),
  };
}

export function mixedExponentialLimit(p:MixedExponentialSequence):LimitValue {
  if(p.numeratorLinear.numerator<=0n||p.numeratorConstant.numerator<0n||
     p.numeratorBase.numerator<=0n||p.denominatorBase.numerator<=0n||
     p.denominatorConstant.numerator<0n)
    throw Error("Mixed exponential coefficients must preserve positive domain");
  const comparison=cmp(p.numeratorBase,p.denominatorBase);
  if(comparison<0n)return {kind:"finite",value:r(0)};
  if(comparison===0n)return {kind:"finite",value:p.numeratorLinear};
  return {kind:"positive-infinity"};
}

export function presentMixedExponentialSequence(p:MixedExponentialSequence,locale:Locale){
  const value=mixedExponentialLimit(p),lesson=teaching(locale),{t}=lesson;
  const a=f(p.numeratorLinear),b=f(p.numeratorConstant),
    A=f(p.numeratorBase),B=f(p.denominatorBase),c=f(p.denominatorConstant);
  const q=div(p.numeratorBase,p.denominatorBase);
  const expr="((("+a+")·n+("+b+"))·("+A+")ⁿ)/(n·(("+B+")ⁿ+("+c+")))";
  lesson.work("n≥1; n>0; ("+B+")ⁿ+("+c+")>0",
    t("Mianownik jest dodatni, bo podstawa potęgi jest dodatnia, a stała nieujemna.",
      "The denominator is positive because its exponential base is positive and the constant is nonnegative."));
  lesson.work("aₙ = (("+a+")+("+b+")/n)·("+f(q)+")ⁿ/(1+("+c+")/("+B+")ⁿ)",
    t("Podziel licznik i mianownik przez n·Bⁿ. Oddziel część liniową od ilorazu podstaw.",
      "Divide numerator and denominator by n·Bⁿ. Separate the linear factor from the base ratio."));
  lesson.work("("+a+")+("+b+")/n → "+a+"; 1+("+c+")/("+B+")ⁿ → 1",
    t("Dodatnie B>1 sprawia, że stała podzielona przez Bⁿ zanika.",
      "Since B>1, the constant divided by Bⁿ tends to zero."));
  lesson.work(cmp(p.numeratorBase,p.denominatorBase)<0n
      ? "0<"+f(q)+"<1 ⇒ ("+f(q)+")ⁿ → 0"
      :cmp(p.numeratorBase,p.denominatorBase)===0n
      ? f(q)+"=1 ⇒ ("+f(q)+")ⁿ=1"
      :f(q)+">1 ⇒ ("+f(q)+")ⁿ → +∞",
    t("W granicy decyduje porównanie dodatnich podstaw potęg po wydzieleniu części wielomianowej.",
      "The comparison of positive exponential bases determines the limit once the polynomial factor is separated."));
  lesson.work("lim aₙ = "+(value.kind==="finite"?f(value.value):"+∞"),
    t("Jeżeli podstawy są równe, pozostaje dodatni współczynnik przy n; w pozostałych przypadkach rozstrzyga iloraz podstaw.",
      "Equal bases leave the positive coefficient of n; otherwise the base ratio determines the limit."));
  return lesson.finish(
    t("Oblicz granicę ciągu dla n→+∞, n≥1.\naₙ = "+expr,
      "Find the sequence limit as n→+∞, n≥1.\naₙ = "+expr),
    {kind:"limit",value},
    t("Oddziel czynnik liniowy i iloraz potęg. Porównaj ich podstawy.",
      "Separate the linear factor and the exponential quotient. Compare their bases."),
    t("Podziel cały ułamek przez n·Bⁿ; rozważ przypadki A<B, A=B i A>B.",
      "Divide the whole ratio by n·Bⁿ and handle A<B, A=B and A>B separately.")
  );
}
