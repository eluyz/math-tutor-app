import {rational as r, addRational as add, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/** C02: independent, not-yet-registered quadratic / quartic-radical method. */
export type QuarticRootSequence = Readonly<{
  numeratorQuadratic:Rational;
  numeratorLinear:Rational;
  numeratorConstant:Rational;
  rootLeading:Rational;
  rootLinear:Rational;
  rootConstant:Rational;
}>;
const levels = ["medium","hard","advanced","expert"] as const;
const positive = (v:Rational) => v.numerator>0n;

export function createQuarticRootSequence(variant:number, level:Difficulty):QuarticRootSequence {
  if(!Number.isInteger(variant)||variant<0||variant>=24||
     !levels.includes(level as typeof levels[number]))
    throw Error("Unsupported quartic-root sequence variant or difficulty");
  const tier=levels.indexOf(level as typeof levels[number])+1;
  return {
    numeratorQuadratic:r(variant%6===0?0:(variant%2===0?1:-1)*(1+variant%7),tier),
    numeratorLinear:r(variant%7-3,tier),
    numeratorConstant:r(variant%9-4,tier),
    rootLeading:r(2+variant%4),
    rootLinear:r(1+variant%5,tier),
    rootConstant:variant%3===0?r(-1):r(1+variant%4,tier),
  };
}

/** n>=1, d>0, e>=0, d²+g>0 ensure a positive radical.
 * (A*n²+B*n+C)/sqrt(d²*n⁴+e*n+g) -> A/d.
 */
export function quarticRootSequenceLimit(
  p:QuarticRootSequence
):Extract<LimitValue,{kind:"finite"}> {
  if(!positive(p.rootLeading)||p.rootLinear.numerator<0n||
     !positive(add(mul(p.rootLeading,p.rootLeading),p.rootConstant)))
    throw Error("Quartic root radicand must be positive for n>=1");
  return {kind:"finite",value:div(p.numeratorQuadratic,p.rootLeading)};
}

export function presentQuarticRootSequence(p:QuarticRootSequence,locale:Locale) {
  const value=quarticRootSequenceLimit(p);
  const lesson=teaching(locale),{t}=lesson;
  const A=f(p.numeratorQuadratic), B=f(p.numeratorLinear), C=f(p.numeratorConstant);
  const d=f(p.rootLeading), e=f(p.rootLinear), g=f(p.rootConstant);
  const expression="(("+A+")·n² + ("+B+")·n + ("+C+"))/√(("+d+")²·n⁴ + ("+e+")·n + ("+g+"))";
  lesson.work(
    "n≥1; ("+d+")²·n⁴ + ("+e+")·n + ("+g+") ≥ ("+d+")² + ("+g+") > 0",
    t("Pierwiastek jest określony, a mianownik dodatni dla każdego n≥1.",
      "The square root is defined and the denominator positive for every n≥1.")
  );
  lesson.work(
    "√(("+d+")²·n⁴ + ("+e+")·n + ("+g+")) = n²·√(("+d+")² + ("+e+")/n³ + ("+g+")/n⁴)",
    t("Wyłączamy n⁴ spod pierwiastka: √(n⁴)=n², ponieważ n≥1.",
      "Factor n⁴ out of the radical: √(n⁴)=n² because n≥1.")
  );
  lesson.work(
    "aₙ = (("+A+") + ("+B+")/n + ("+C+")/n²)/√(("+d+")² + ("+e+")/n³ + ("+g+")/n⁴)",
    t("Dzielimy licznik i mianownik przez n², nie pomijając składników niższego stopnia.",
      "Divide the numerator and denominator by n², keeping every lower-order term.")
  );
  lesson.work(
    "lim aₙ = ("+A+")/√(("+d+")²) = ("+A+")/("+d+") = "+f(value.value),
    t("Ułamki z potęgami n znikają. Ponieważ d>0, √(d²)=d także dla A=0 lub A<0.",
      "Terms with inverse powers of n vanish. Since d>0, √(d²)=d even when A=0 or A<0.")
  );
  return lesson.finish(
    t("Oblicz granicę przy n→+∞, n≥1.\naₙ = "+expression,
      "Find the limit as n→+∞, n≥1.\naₙ = "+expression),
    {kind:"limit",value},
    t("Porównaj stopień licznika ze stopniem wielomianu pod pierwiastkiem.",
      "Compare the numerator degree with the degree inside the radical."),
    t("Wyłącz n⁴ spod pierwiastka jako n², a potem podziel cały ułamek przez n².",
      "Factor n⁴ out of the radical as n², then divide the fraction by n².")
  );
}
