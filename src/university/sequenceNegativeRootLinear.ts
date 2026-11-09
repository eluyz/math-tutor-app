import {rational as r, addRational as add, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";
import type {UniversityFamily} from "./schema";

/** C02 bounded synthetic negative-root-over-linear method. */
export type NegativeRootLinearSequence = Readonly<{
  rootLeading: Rational;
  rootLinear: Rational;
  rootConstant: Rational;
  denominatorLeading: Rational;
  denominatorConstant: Rational;
}>;
const levels = ["medium", "hard", "advanced", "expert"] as const;

export function createNegativeRootLinearSequence(variant: number, level: Difficulty): NegativeRootLinearSequence {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !levels.includes(level as typeof levels[number]))
    throw Error("Unsupported negative-root sequence variant or difficulty");
  const tier = levels.indexOf(level as typeof levels[number]) + 1;
  return {
    rootLeading: r(2 + variant % 5, tier),
    rootLinear: r(1 + variant % 7, tier),
    rootConstant: r(1 + variant + 24 * (tier - 1), tier),
    denominatorLeading: r(1 + (3 * variant) % 7, tier),
    denominatorConstant: r(variant % 4, tier),
  };
}

/** n>=1, a>0, b>=0, a²+c>0, d>0, e>=0.
 * Radicand and denominator remain positive and limit is exactly -a/d.
 */
export function negativeRootLinearSequenceLimit(
  p: NegativeRootLinearSequence
): Extract<LimitValue, {kind: "finite"}> {
  if (p.rootLeading.numerator <= 0n || p.rootLinear.numerator < 0n ||
      add(mul(p.rootLeading, p.rootLeading), p.rootConstant).numerator <= 0n ||
      p.denominatorLeading.numerator <= 0n || p.denominatorConstant.numerator < 0n)
    throw Error("Unsafe negative-root linear sequence domain");
  return {kind: "finite", value: div(mul(r(-1), p.rootLeading), p.denominatorLeading)};
}

export function presentNegativeRootLinearSequence(p: NegativeRootLinearSequence, locale: Locale) {
  const value = negativeRootLinearSequenceLimit(p);
  const lesson = teaching(locale), {t} = lesson;
  const a = f(p.rootLeading), b = f(p.rootLinear), c = f(p.rootConstant);
  const d = f(p.denominatorLeading), e = f(p.denominatorConstant);
  const expr = "-√((" + a + ")²·n² + (" + b + ")·n + (" + c + "))/((" + d + ")·n + (" + e + "))";
  lesson.work(
    "n≥1; (" + a + ")²·n² + (" + b + ")·n + (" + c + ") ≥ (" + a + ")² + (" + c + ") > 0; (" + d + ")·n + (" + e + ") > 0",
    t("W wyrażeniu pod pierwiastkiem i w mianowniku zachowujemy dodatniość dla n≥1.",
      "The radicand and the denominator remain strictly positive for n≥1.")
  );
  lesson.work(
    "√((" + a + ")²·n² + (" + b + ")·n + (" + c + ")) = n·√((" + a + ")² + (" + b + ")/n + (" + c + ")/n²)",
    t("Wyłącz n² spod pierwiastka, używając √(n²)=n dla n≥1.",
      "Factor n² out of the radical, using √(n²)=n for n≥1.")
  );
  lesson.work(
    "aₙ = -√((" + a + ")² + (" + b + ")/n + (" + c + ")/n²)/((" + d + ") + (" + e + ")/n)",
    t("Dzielimy licznik i mianownik przez n, zachowując minus przed całym pierwiastkiem.",
      "Divide numerator and denominator by n, preserving the minus sign in front of the entire square root.")
  );
  lesson.work(
    "lim aₙ = -√((" + a + ")²)/(" + d + ") = -(" + a + ")/(" + d + ") = " + f(value.value),
    t("Wyrazy z 1/n i 1/n² dążą do zera. Ponieważ a>0, √(a²)=a, a znak minus pozostaje.",
      "Inverse-power terms vanish. Since a>0, √(a²)=a, and the negative sign remains.")
  );
  return lesson.finish(
    t("Oblicz granicę przy n→+∞, n≥1.\naₙ = " + expr,
      "Find the limit as n→+∞, n≥1.\naₙ = " + expr),
    {kind: "limit", value},
    t("Porównaj pierwiastek z wielomianu kwadratowego z mianownikiem liniowym.",
      "Compare the square root of the quadratic expression with the linear denominator."),
    t("Wyłącz n² spod pierwiastka i podziel przez n. Uważaj na minus przed pierwiastkiem.",
      "Factor n² from the radicand and divide by n. Keep the minus sign before the radical.")
  );
}

export const negativeRootLinearSequenceFamilies:readonly UniversityFamily[]=[{
  id:"sequence-negative-root-linear",category:"sequence-limits",
  titles:{pl:"Granice: ujemny pierwiastek przez wyrażenie liniowe",en:"Limits: negative radical over a linear term"},
  supportedDifficulties:levels,
  create:(variant,level)=>({kind:"sequence-negative-root-linear",...createNegativeRootLinearSequence(variant,level)}),
}];
