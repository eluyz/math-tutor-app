import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import { teaching } from "./teaching";
import type { UniversityFamily } from "./schema";

/** G06: new, synthetic x→+∞ forms. Deliberately does not change the archived x→0 Euler family. */
export type EulerInfinityProblem = Readonly<
  | { kind: "analysis-euler-infinity"; mode: "reciprocal"; a: Rational; exponent: Rational; pi: boolean }
  | { kind: "analysis-euler-infinity"; mode: "ratio"; leading: Rational; numeratorShift: Rational; denominatorShift: Rational; exponent: Rational; exponentOffset: Rational }
>;

export function makeEulerInfinity(variant: number): EulerInfinityProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24) throw Error("Expected variant 0..23");
  const group = Math.floor(variant / 4), sign = group % 2 ? -1 : 1;
  const exponent = r(sign * (1 + group % 3), 1 + variant % 3);
  switch (variant % 4) {
    case 0:
      return { kind: "analysis-euler-infinity", mode: "reciprocal", a: r((variant % 5) - 2 || 1, 1 + group % 2), exponent, pi: false };
    case 2:
      return { kind: "analysis-euler-infinity", mode: "reciprocal", a: r(1 + group % 3, 1 + group % 2), exponent, pi: true };
    default: {
      const numeratorShift = r(variant % 4 === 1 ? group - 3 : -group);
      return {
        kind: "analysis-euler-infinity", mode: "ratio", leading: r(variant % 4 === 1 ? 1 + group % 3 : 2 + group % 3),
        numeratorShift, denominatorShift: variant % 4 === 1 && group === 2 ? numeratorShift : r(variant % 4 === 1 ? 2 - group : 1 + group),
        exponent, exponentOffset: variant % 4 === 3 ? r(group % 5 - 2) : r(0),
      };
    }
  }
}

export const eulerInfinityFamilies: readonly UniversityFamily[] = [{
  id: "analysis-euler-function-infinity", category: "function-limits",
  titles: { pl: "Granica funkcji typu Eulera przy +∞", en: "Euler-type function limits at +∞" },
  supportedDifficulties: ["hard"],
  create: (variant: number) => makeEulerInfinity(variant),
}];

/** The limit is exp(coefficient·π) when pi=true, or exp(coefficient) otherwise. */
export function eulerInfinityExponent(problem: EulerInfinityProblem): { coefficient: Rational; pi: boolean } {
  if (problem.exponent.numerator === 0n) throw Error("Expected nonzero x coefficient in exponent");
  if (problem.mode === "reciprocal") return { coefficient: mul(problem.a, problem.exponent), pi: problem.pi };
  if (problem.leading.numerator <= 0n) throw Error("Expected positive leading coefficient");
  return { coefficient: div(mul(sub(problem.numeratorShift, problem.denominatorShift), problem.exponent), problem.leading), pi: false };
}

const key = (v: Rational, pi: boolean) => `exp:${v.numerator}/${v.denominator}${pi ? ":pi" : ""}`;
function answer(coefficient: Rational, pi: boolean): AnswerSpec {
  if (coefficient.numerator === 0n) return { kind: "scalar", value: r(1) };
  const options = [coefficient, add(coefficient, r(1)), sub(coefficient, r(1)), mul(coefficient, r(-1)), r(0)].map(v => ({
    value: key(v, pi), label: v.numerator === 0n ? "1" : `e^(${fmt(v)}${pi ? "π" : ""})`,
  }));
  const alternate = { value: key(coefficient, !pi), label: `e^(${fmt(coefficient)}${pi ? "" : "π"})` };
  return { kind: "choice", value: key(coefficient, pi), options: [...new Map([...options, alternate].map(option => [option.value, option])).values()] };
}

export function presentEulerInfinity(problem: EulerInfinityProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const { coefficient, pi } = eulerInfinityExponent(problem);
  const expr = problem.mode === "reciprocal"
    ? `(1+(${fmt(problem.a)}${problem.pi ? "π" : ""})/x)^((${fmt(problem.exponent)})x)`
    : `(((${fmt(problem.leading)})x+(${fmt(problem.numeratorShift)}))/((${fmt(problem.leading)})x+(${fmt(problem.denominatorShift)})))^((${fmt(problem.exponent)})x+(${fmt(problem.exponentOffset)}))`;
  lesson.work("x→+∞; B(x)>0; B(x)→1",
    t("Dla dostatecznie dużego dodatniego x podstawa B(x) jest dodatnia, więc można logarytmować.",
      "For sufficiently large positive x the base B(x) is positive, so taking logarithms is valid."));
  const difference = problem.mode === "ratio" ? sub(problem.numeratorShift, problem.denominatorShift) : null;
  if (problem.mode === "ratio") {
    lesson.work(`B(x)=1+(${fmt(difference!)})/((${fmt(problem.leading)})x+(${fmt(problem.denominatorShift)}))`,
      t("Tożsamość wynika z odjęcia licznika i mianownika; u(x)→0.",
        "Subtracting denominator from numerator gives an exact identity, with u(x)→0."));
  } else {
    lesson.work(`B(x)=1+u(x); u(x)=(${fmt(problem.a)}${problem.pi ? "π" : ""})/x→0`,
      t("Podstawa ma postać 1+u(x) ze znikającym u(x).", "The base is 1+u(x) with u(x)→0."));
  }
  if (coefficient.numerator === 0n) {
    lesson.work("B(x)=1 ⇒ B(x)^E(x)=1",
      t("Gdy przesunięcia licznika i mianownika są identyczne, podstawa jest dokładnie równa 1; nie dzielimy przez u=0.",
        "Equal numerator and denominator shifts make the base exactly 1; never divide by u=0."));
  } else {
    lesson.work(`E(x)·u(x)→${fmt(coefficient)}${pi ? "π" : ""}`,
      t("Wykładnik jest liniowy, a u(x) ma rząd 1/x. Stałe przesunięcie wykładnika zanika w iloczynie.",
        "The exponent is linear while u(x) is of order 1/x. Any constant exponent offset vanishes in the product."));
    lesson.work(`ln(B(x)^E(x))=E(x)·u(x)·ln(1+u(x))/u(x)→${fmt(coefficient)}${pi ? "π" : ""}`,
      t("Ponieważ ln(1+u)/u→1, granica logarytmu jest dokładnym wykładnikiem wyniku.",
        "Because ln(1+u)/u→1, the logarithm tends to the exact exponent in the answer."));
  }
  lesson.work(`lim_(x→+∞) B(x)^E(x)=${coefficient.numerator === 0n ? "1" : `e^(${fmt(coefficient)}${pi ? "π" : ""})`}`,
    t("Zachowujemy wynik w postaci dokładnej; nie zamieniamy liczby e ani π na przybliżenia.",
      "Keep the exact symbolic answer; do not replace e or π with decimal approximations."));
  return lesson.finish(
    t(`Oblicz granicę przy x→+∞: ${expr}.`, `Find the limit as x→+∞: ${expr}.`), answer(coefficient, pi),
    t("Sprowadź podstawę do 1+u(x) i sprawdź, że jest dodatnia.", "Write the positive base as 1+u(x)."),
    t("Użyj ln(1+u)/u→1; oblicz granicę E(x)u(x).", "Use ln(1+u)/u→1 and compute the limit of E(x)u(x)."),
  );
}