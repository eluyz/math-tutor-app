import { rational as r, addRational as add, divideRational as div, type Rational } from "../rational";
import { formatRational as fmt, limitText, type LimitValue } from "../answers";
import type { Locale } from "../locales/types";
import { teaching, type Presentation } from "./teaching";

/** G04 synthetic FUNCTION limit at x→+∞; deliberately not added to the shared catalog. */
export type ExponentialFunctionTerm = Readonly<{ coefficient: Rational; base: Rational }>;
export type ExponentialFunctionRatioProblem = Readonly<{
  kind: "limit-exponential-function-ratio";
  numerator: readonly ExponentialFunctionTerm[];
  denominator: readonly ExponentialFunctionTerm[];
}>;

export const exponentialFunctionRatioStage = {
  id: "limit-exponential-function-ratio",
  variantCount: 24,
  supportedDifficulties: ["hard"] as const,
};

/** Six source-relevant method classes, repeated with four sets of original synthetic coefficients. */
export function createExponentialFunctionRatio(v: number): ExponentialFunctionRatioProblem {
  if (!Number.isInteger(v) || v < 0 || v >= exponentialFunctionRatioStage.variantCount)
    throw new Error("Unsupported G04 exponential variant");
  const group = Math.floor(v / 6), mode = v % 6, base = 3 + group;
  const magnitude = 2 + group;
  const a = r(mode === 2 ? magnitude : mode === 3 ? -magnitude : [2, -3, 4, -5][group]);
  const b = r(1 + v % 7), c = r(2 + v % 5), d = r(1 + v % 3);
  const term = (coefficient: Rational, powerBase: number): ExponentialFunctionTerm =>
    ({ coefficient, base: r(powerBase) });
  const numerator = mode === 0
    ? [term(a, base - 1), term(b, 1)]
    : mode === 1 || mode === 2 || mode === 3
      ? [term(a, base + (mode === 1 ? 0 : 1)), term(b, 2)]
      : [term(a, base + 2), term(r(-a.numerator, a.denominator), base + 2),
        term(b, mode === 4 ? 2 : base)];
  return {
    kind: "limit-exponential-function-ratio",
    numerator,
    denominator: [term(c, base), term(d, 2)],
  };
}

const greater = (a: Rational, b: Rational) =>
  a.numerator * b.denominator > b.numerator * a.denominator;
const same = (a: Rational, b: Rational) =>
  a.numerator === b.numerator && a.denominator === b.denominator;
const baseKey = (value: Rational) => `${value.numerator}/${value.denominator}`;
const textTerm = (term: ExponentialFunctionTerm) =>
  `(${fmt(term.coefficient)})·(${fmt(term.base)})^x`;
const textSum = (terms: readonly ExponentialFunctionTerm[]) => terms.map(textTerm).join(" + ") || "0";

export function groupExponentials(terms: readonly ExponentialFunctionTerm[]): ExponentialFunctionTerm[] {
  const groups = new Map<string, ExponentialFunctionTerm>();
  for (const term of terms) {
    if (term.base.numerator <= 0n || term.base.denominator <= 0n)
      throw new Error("Exponential bases must be positive");
    const key = baseKey(term.base), prior = groups.get(key);
    groups.set(key, {
      base: term.base,
      coefficient: add(prior?.coefficient ?? r(0), term.coefficient),
    });
  }
  return [...groups.values()]
    .filter(t => t.coefficient.numerator !== 0n)
    .sort((a, b) => greater(a.base, b.base) ? -1 : greater(b.base, a.base) ? 1 : 0);
}

/** Exact leading-base comparison after collecting equal-base terms. */
export function exponentialFunctionRatioLimit(p: ExponentialFunctionRatioProblem): LimitValue {
  if (!p.denominator.length || p.denominator.some(t => t.coefficient.numerator <= 0n))
    throw new Error("All denominator coefficients must be strictly positive");
  const bottom = groupExponentials(p.denominator)[0];
  const top = groupExponentials(p.numerator)[0];
  if (!bottom) throw new Error("Missing denominator");
  if (!top || greater(bottom.base, top.base))
    return { kind: "finite", value: r(0) };
  if (same(top.base, bottom.base))
    return { kind: "finite", value: div(top.coefficient, bottom.coefficient) };
  return { kind: top.coefficient.numerator > 0n ? "positive-infinity" : "negative-infinity" };
}

export function presentExponentialFunctionRatio(
  p: ExponentialFunctionRatioProblem,
  locale: Locale,
): Presentation {
  const lesson = teaching(locale), { t } = lesson;
  const top = groupExponentials(p.numerator), bottom = groupExponentials(p.denominator);
  const value = exponentialFunctionRatioLimit(p);
  const dominant = bottom[0];
  lesson.work(
    "x→+∞; A^x>0 (A>0)",
    t("Dodatnie podstawy pozwalają rozważać wszystkie x rzeczywiste; mianownik jest dodatni, ponieważ jego współczynniki są dodatnie.",
      "Positive bases define each power for real x. The denominator is strictly positive because its coefficients are positive."),
  );
  lesson.work(
    `N(x)=${textSum(p.numerator)}; D(x)=${textSum(p.denominator)}`,
    t("Przed porównaniem wzrostu zbierz współczynniki przy identycznych podstawach: dodatnie i ujemne składniki mogą się skrócić.",
      "Collect coefficients with identical bases before comparing growth: opposite terms can cancel exactly."),
  );
  lesson.work(
    `N(x)=${textSum(top)}; D(x)=${textSum(bottom)}`,
    t("Po zebraniu wyrazów w każdym wielomianie wykładniczym dominuje największa podstawa z niezerowym współczynnikiem.",
      "After collecting like bases, the largest base with nonzero coefficient determines each exponential sum's growth."),
  );
  lesson.work(
    `N(x)/D(x) = [${top.map(t => `(${fmt(t.coefficient)})·(${fmt(t.base)}/${fmt(dominant.base)})^x`).join(" + ")}] / [${bottom.map(t => `(${fmt(t.coefficient)})·(${fmt(t.base)}/${fmt(dominant.base)})^x`).join(" + ")}]`,
    t("Podziel licznik i mianownik przez największą potęgę mianownika. Podstawa ilorazu mniejsza od 1 zanika, równa 1 daje stałą, większa od 1 rośnie bez ograniczeń.",
      "Divide by the largest denominator power. A relative base below 1 vanishes, 1 remains constant, and above 1 diverges in magnitude."),
  );
  lesson.work(
    `lim_(x→+∞) f(x)=${limitText(value)}`,
    t("Granica wynika z porównania podstaw i znaku dominującego współczynnika; przy równych podstawach dzielimy współczynniki.",
      "The limit follows from dominant bases and the sign of the leading coefficient; equal bases leave the coefficient ratio."),
  );
  return lesson.finish(
    t("Wyznacz granicę przy x→+∞. ", "Find the limit as x→+∞. ") +
      `f(x)=(${textSum(p.numerator)})/(${textSum(p.denominator)})`,
    { kind: "limit", value },
    t("Zbierz składniki o tej samej podstawie potęgi przed porównaniem tempa wzrostu.",
      "Collect powers with the same base before comparing growth."),
    t("Podziel licznik i mianownik przez dominującą potęgę mianownika i sprawdź znak wyniku.",
      "Divide numerator and denominator by the dominant denominator power, then check the result's sign."),
  );
}
