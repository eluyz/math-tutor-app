import { addRational as add, multiplyRational as mul, subtractRational as sub, divideRational as div, rational as r, type Rational } from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import { teaching } from "./teaching";

/** One complete G07 task: detect ALL vertical and horizontal/oblique asymptotes. */
export type CombinedAsymptoteProblem = Readonly<
  | { kind: "analysis-asymptotes-combined"; mode: "quadratic-over-linear" | "removable-hole"; pole: Rational; slope: Rational; intercept: Rational; remainder: Rational }
  | { kind: "analysis-asymptotes-combined"; mode: "equal-degree"; a: Rational; b: Rational; c: Rational; positiveShift: Rational }
  | { kind: "analysis-asymptotes-combined"; mode: "linear-over-linear"; quotient: Rational; denominatorSlope: Rational; denominatorOffset: Rational; remainder: Rational }
  | { kind: "analysis-asymptotes-combined"; mode: "cubic-over-positive-quadratic"; slope: Rational; remainderSlope: Rational; remainderOffset: Rational; positiveShift: Rational }
  | { kind: "analysis-asymptotes-combined"; mode: "linear-plus-reciprocal"; slope: Rational; remainder: Rational }
>;

const key = (value: Rational) => String(value.numerator) + "/" + String(value.denominator);
const text = (value: Rational) => fmt(value);
const zero = (value: Rational) => value.numerator === 0n;
const neg = (value: Rational) => mul(value, r(-1));

export function makeCombinedAsymptote(variant: number): CombinedAsymptoteProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24) throw Error("G07 expects variant 0..23");
  if (variant < 6) return {
    kind: "analysis-asymptotes-combined", mode: "quadratic-over-linear",
    pole: r(variant - 3), slope: r(variant % 3 + 1), intercept: r((variant % 5) - 2),
    remainder: r((variant % 2 ? -1 : 1) * (variant % 4 + 1))
  };
  if (variant < 10) return {
    kind: "analysis-asymptotes-combined", mode: "equal-degree",
    a: r(variant % 3 + 1), b: r(variant - 8), c: r(variant % 4 + 1),
    positiveShift: r(variant % 4 + 1)
  };
  if (variant < 14) return {
    kind: "analysis-asymptotes-combined", mode: "linear-over-linear",
    quotient: r((variant % 3) - 2), denominatorSlope: r(variant % 3 + 1),
    denominatorOffset: r(variant - 12), remainder: r(variant % 4 + 1)
  };
  if (variant < 18) return {
    kind: "analysis-asymptotes-combined", mode: "cubic-over-positive-quadratic",
    slope: r(-(variant % 3 + 1)), remainderSlope: r(variant % 5 + 1),
    remainderOffset: r((variant % 3) - 1), positiveShift: r(variant % 4 + 1)
  };
  if (variant < 22) return {
    kind: "analysis-asymptotes-combined", mode: "linear-plus-reciprocal",
    slope: r(variant % 4 + 1, 2), remainder: r(variant % 3 + 1)
  };
  return {
    kind: "analysis-asymptotes-combined", mode: "removable-hole",
    pole: r(variant - 23), slope: r(variant % 3 + 1),
    intercept: r(variant % 5 - 2), remainder: r(0)
  };
}

/** No registration in the shared catalog until a separate serialized PR. */
export const combinedAsymptoteFamilies = [{
  id: "analysis-asymptotes-combined-rational", category: "function-limits",
  titles: { pl: "Wszystkie asymptoty funkcji wymiernej", en: "All asymptotes of a rational function" },
  supportedDifficulties: ["hard"] as const,
  create: (variant: number) => makeCombinedAsymptote(variant)
}] as const;

export type CombinedAsymptoteResult = Readonly<{
  vertical: Rational | null;
  slope: Rational;
  intercept: Rational;
  excluded: Rational | null;
}>;

export function combinedAsymptoteResult(p: CombinedAsymptoteProblem): CombinedAsymptoteResult {
  switch (p.mode) {
    case "quadratic-over-linear":
    case "removable-hole":
      return { vertical: zero(p.remainder) ? null : p.pole, slope: p.slope, intercept: p.intercept, excluded: p.pole };
    case "equal-degree":
      return { vertical: null, slope: r(0), intercept: p.a, excluded: null };
    case "linear-over-linear":
      if (p.denominatorSlope.numerator <= 0n || zero(p.remainder)) throw Error("Expected a genuine simple pole");
      return { vertical: neg(div(p.denominatorOffset, p.denominatorSlope)), slope: r(0), intercept: p.quotient,
        excluded: neg(div(p.denominatorOffset, p.denominatorSlope)) };
    case "cubic-over-positive-quadratic":
      return { vertical: null, slope: p.slope, intercept: r(0), excluded: null };
    case "linear-plus-reciprocal":
      if (zero(p.remainder)) throw Error("Expected a genuine reciprocal pole");
      return { vertical: r(0), slope: p.slope, intercept: r(0), excluded: r(0) };
  }
}

function expression(p: CombinedAsymptoteProblem) {
  if (p.mode === "quadratic-over-linear" || p.mode === "removable-hole") {
    const b = sub(p.intercept, mul(p.slope, p.pole));
    const c = sub(p.remainder, mul(p.intercept, p.pole));
    return "((" + text(p.slope) + ")x²+(" + text(b) + ")x+(" + text(c) + "))/(x−(" + text(p.pole) + "))";
  }
  if (p.mode === "equal-degree")
    return "((" + text(p.a) + ")x²+(" + text(p.b) + ")x+(" + text(p.c) + "))/(x²+(" + text(p.positiveShift) + "))";
  if (p.mode === "linear-over-linear") {
    const a = mul(p.quotient, p.denominatorSlope);
    const b = add(mul(p.quotient, p.denominatorOffset), p.remainder);
    return "((" + text(a) + ")x+(" + text(b) + "))/((" + text(p.denominatorSlope) + ")x+(" + text(p.denominatorOffset) + "))";
  }
  if (p.mode === "cubic-over-positive-quadratic") {
    const b = add(mul(p.slope, p.positiveShift), p.remainderSlope);
    return "((" + text(p.slope) + ")x³+(" + text(b) + ")x+(" + text(p.remainderOffset) + "))/(x²+(" + text(p.positiveShift) + "))";
  }
  return "(" + text(p.slope) + ")x+(" + text(p.remainder) + ")/x";
}

function line(result: CombinedAsymptoteResult) {
  return zero(result.slope) ? "y=" + text(result.intercept)
    : "y=(" + text(result.slope) + ")x+(" + text(result.intercept) + ")";
}
function lineKey(slope: Rational, intercept: Rational) {
  return "y:" + key(slope) + ":" + key(intercept);
}
function answer(result: CombinedAsymptoteResult, locale: Locale): AnswerSpec {
  const t = (pl: string, en: string) => locale === "pl" ? pl : en;
  const expectedVertical = result.vertical === null ? "none" : "x:" + key(result.vertical);
  const candidates = [
    { value: "none", label: t("Brak asymptoty pionowej", "No vertical asymptote") },
    { value: "x:" + key(result.excluded ?? r(0)), label: "x=" + text(result.excluded ?? r(0)) },
    { value: "x:" + key(r(1)), label: "x=1" },
    { value: "x:" + key(r(-1)), label: "x=−1" }
  ];
  const correctLine = lineKey(result.slope, result.intercept);
  const alternatives = [
    { value: correctLine, label: line(result) },
    { value: lineKey(result.slope, add(result.intercept, r(1))), label: line({ ...result, intercept: add(result.intercept, r(1)) }) },
    { value: lineKey(add(result.slope, r(1)), result.intercept), label: line({ ...result, slope: add(result.slope, r(1)) }) },
    { value: "line:none", label: t("Brak asymptoty poziomej/ukośnej", "No horizontal/oblique asymptote") }
  ];
  return { kind: "multi-choice", fields: [
    { id: "vertical", label: t("Asymptota pionowa", "Vertical asymptote"), value: expectedVertical,
      options: [...new Map(candidates.map(o => [o.value, o])).values()] },
    { id: "linear", label: t("Asymptota pozioma lub ukośna (w obu kierunkach)", "Horizontal or oblique asymptote (both directions)"),
      value: correctLine, options: [...new Map(alternatives.map(o => [o.value, o])).values()] }
  ] };
}

export function presentCombinedAsymptote(p: CombinedAsymptoteProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const result = combinedAsymptoteResult(p);
  const expr = expression(p);
  lesson.work(
    result.excluded === null ? "D=ℝ" : "D=ℝ\\{" + text(result.excluded) + "}",
    t("Najpierw ustalamy miejsca zerowe mianownika w liczbach rzeczywistych.",
      "First find the real zeros of the denominator.")
  );
  if (p.mode === "quadratic-over-linear" || p.mode === "removable-hole") {
    lesson.work(
      "f(x)=(" + text(p.slope) + ")x+(" + text(p.intercept) + ")+(" + text(p.remainder) + ")/(x−(" + text(p.pole) + "))",
      t("Dzielenie wielomianów daje dokładną część liniową i resztę.",
        "Polynomial division yields an exact linear quotient and remainder.")
    );
  } else if (p.mode === "linear-over-linear") {
    lesson.work(
      "f(x)=" + text(p.quotient) + "+(" + text(p.remainder) + ")/((" + text(p.denominatorSlope) + ")x+(" + text(p.denominatorOffset) + "))",
      t("Wydzielamy stały iloraz i resztę nad mianownikiem liniowym.",
        "Separate the constant quotient from the remainder over the linear denominator.")
    );
  } else if (p.mode === "equal-degree") {
    lesson.work(
      "f(x)=" + text(p.a) + "+((" + text(p.b) + ")x+(" + text(sub(p.c, mul(p.a, p.positiveShift))) + "))/(x²+(" + text(p.positiveShift) + "))",
      t("Wielomiany tego samego stopnia mają poziomą asymptotę z ilorazu współczynników wiodących.",
        "Equal-degree polynomials have a horizontal asymptote from the ratio of leading coefficients.")
    );
  } else if (p.mode === "cubic-over-positive-quadratic") {
    lesson.work(
      "f(x)=(" + text(p.slope) + ")x+((" + text(p.remainderSlope) + ")x+(" + text(p.remainderOffset) + "))/(x²+(" + text(p.positiveShift) + "))",
      t("Reszta po dzieleniu przez wielomian kwadratowy jest co najwyżej liniowa.",
        "The remainder after division by a quadratic polynomial is at most linear.")
    );
  } else {
    lesson.work("f(x)=(" + text(p.slope) + ")x+(" + text(p.remainder) + ")/x",
      t("Rozdzielamy część liniową i wyraz odwrotnie proporcjonalny do x.",
        "Separate the linear part and the term inversely proportional to x."));
  }
  lesson.work(
    "lim_(x→±∞) [f(x)−(" + text(result.slope) + ")x−(" + text(result.intercept) + ")]=0 ⇒ " + line(result),
    t("Reszta zanika w obu kierunkach, więc wyznaczona prosta jest asymptotą.",
      "The remainder vanishes in both directions, so the line is an asymptote.")
  );
  if (result.vertical === null) {
    lesson.work(t("Brak asymptoty pionowej", "No vertical asymptote"),
      result.excluded === null
        ? t("Mianownik nie ma rzeczywistych zer.", "The denominator has no real zeros.")
        : t("Po skróceniu pozostaje skończona granica: to dziura, nie biegun.",
          "Cancellation leaves a finite limit: a removable hole, not a pole."));
  } else {
    const residue = p.mode === "linear-over-linear" ? p.remainder
      : p.mode === "linear-plus-reciprocal" ? p.remainder
      : p.mode === "quadratic-over-linear" ? p.remainder : r(1);
    const left = residue.numerator > 0n ? "−∞" : "+∞";
    const right = residue.numerator > 0n ? "+∞" : "−∞";
    lesson.work("x→(" + text(result.vertical) + ")⁻: " + left + "; x→(" + text(result.vertical) + ")⁺: " + right,
      t("Niezerowa reszta przy prostym zerze mianownika oznacza rozbieżność jednostronną.",
        "A nonzero remainder at a simple denominator zero gives infinite one-sided limits."));
  }
  return lesson.finish(
    t("Wyznacz WSZYSTKIE asymptoty funkcji f(x)=" + expr + ".",
      "Find ALL asymptotes of f(x)=" + expr + "."),
    answer(result, locale),
    t("Najpierw znajdź rzeczywiste zera mianownika. Dziura nie jest asymptotą.",
      "First find real denominator zeros. A hole is not an asymptote."),
    t("Wykonaj dzielenie wielomianów: sprawdź pionowe oraz granicę różnicy od prostej przy ±∞.",
      "Use polynomial division: check vertical asymptotes and the limit of the difference from a line at ±∞.")
  );
}
