import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/**
 * F05/b-like PUBLIC SYNTHETIC geometry. NOT a transcription or exact-source witness.
 *
 * Domain: R minus {-h, h}; the exterior branches are unbounded in y.
 * Outside |x|>h: f(x)=b+s(|x|-h).
 * Inside  |x|<h: f(x)=b+l+2(x/h)^2.
 * No value is defined at x=+/-h, where each adjacent branch has a hollow end.
 */
export type EvenOpenRangeProblem = Readonly<{
  kind: "function-even-open-range";
  hole: number;
  floor: number;
  lift: number;
  slope: number;
}>;

export const evenOpenRangeFields = [
  "domain", "range", "increasing", "decreasing", "injective", "parity",
] as const;
export type EvenOpenRangeField = typeof evenOpenRangeFields[number];
export type EvenOpenRangeOracle = Readonly<Record<EvenOpenRangeField, string>>;

const fmt = (n: number) => String(n).replace(/-/g, "−");
const interval = (lo: string, hi: string, lc = false, rc = false) =>
  (lc ? "[" : "(") + lo + "; " + hi + (rc ? "]" : ")");

function validate(p: EvenOpenRangeProblem): void {
  if (p.kind !== "function-even-open-range" ||
      ![p.hole, p.floor, p.lift, p.slope].every(Number.isSafeInteger) ||
      p.hole < 2 || p.lift < 1 || p.slope < 1) {
    throw Error("Invalid even open-range geometry");
  }
}

/** One bounded-scope method, with parameter variety for later catalog integration. */
export function makeEvenOpenRange(variant: number, difficulty: Difficulty): EvenOpenRangeProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(difficulty)) {
    throw Error("Unsupported F05/b-like variant or level");
  }
  const level = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  return {
    kind: "function-even-open-range",
    hole: 3 + level + variant % 2,
    floor: -5 + variant % 5 + 5 * level,
    lift: 2 + Math.floor(variant / 2) % 3,
    slope: 1 + (variant + level) % 3,
  };
}

/** A mathematically defined function, not a pixel-derived approximation. */
export function evenOpenRangeValue(p: EvenOpenRangeProblem, x: number): number {
  validate(p);
  if (!Number.isFinite(x) || Math.abs(x) === p.hole) {
    throw Error("Input is outside the domain");
  }
  if (Math.abs(x) > p.hole) return p.floor + p.slope * (Math.abs(x) - p.hole);
  return p.floor + p.lift + 2 * (x / p.hole) ** 2;
}

/** Closed at x=0 on the inner monotone pieces; both holes remain OPEN. */
export function evenOpenRangeOracle(p: EvenOpenRangeProblem): EvenOpenRangeOracle {
  validate(p);
  const h = fmt(p.hole), minusH = fmt(-p.hole), b = fmt(p.floor);
  return {
    domain: [
      interval("−∞", minusH),
      interval(minusH, h),
      interval(h, "+∞"),
    ].join(" ∪ "),
    range: interval(b, "+∞"),
    increasing: [
      interval("0", h, true),
      interval(h, "+∞"),
    ].join(" ∪ "),
    decreasing: [
      interval("−∞", minusH),
      interval(minusH, "0", false, true),
    ].join(" ∪ "),
    injective: "no",
    parity: "even",
  };
}

const fieldTitles: Record<EvenOpenRangeField, readonly [string, string]> = {
  domain: ["Dziedzina (D)", "Domain (D)"],
  range: ["Zbiór wartości (W)", "Range (W)"],
  increasing: ["Ściśle rośnie", "Strictly increasing"],
  decreasing: ["Ściśle maleje", "Strictly decreasing"],
  injective: ["Różnowartościowa?", "One-to-one?"],
  parity: ["Parzystość", "Parity"],
};

export function evenOpenRangeAnswer(p: EvenOpenRangeProblem, locale: Locale): AnswerSpec {
  const result = evenOpenRangeOracle(p);
  const h = fmt(p.hole), minusH = fmt(-p.hole), b = fmt(p.floor);
  const correct = {
    yes: locale === "pl" ? "Tak" : "Yes",
    no: locale === "pl" ? "Nie" : "No",
    even: locale === "pl" ? "Parzysta" : "Even",
    odd: locale === "pl" ? "Nieparzysta" : "Odd",
    neither: locale === "pl" ? "Ani parzysta, ani nieparzysta" : "Neither",
  };
  return {
    kind: "multi-choice",
    fields: evenOpenRangeFields.map((id, index) => {
      let alternatives: readonly string[];
      if (id === "domain") alternatives = [
        "ℝ",
        [interval("−∞", minusH), interval(minusH, "+∞")].join(" ∪ "),
        [interval("−∞", h), interval(h, "+∞")].join(" ∪ "),
        interval(minusH, h),
      ];
      else if (id === "range") alternatives = [
        interval(b, "+∞", true), "ℝ",
        interval(fmt(p.floor + p.lift), "+∞"),
        interval("−∞", b),
      ];
      else if (id === "increasing") alternatives = [
        interval("0", "+∞"), interval("0", "+∞", true),
        interval(minusH, h), "∅",
      ];
      else if (id === "decreasing") alternatives = [
        interval("−∞", "0", false, true),
        interval("−∞", minusH),
        interval(minusH, "0", false, true), "∅",
      ];
      else if (id === "injective") alternatives = [correct.yes];
      else alternatives = [correct.odd, correct.neither];
      const answerLabel = id === "injective" ? correct.no :
        id === "parity" ? correct.even : result[id];
      const labels = [...new Set([answerLabel, ...alternatives])].slice(0, 5);
      if (labels.length < 2) throw Error("Insufficient distinct answer choices");
      const choices = labels.map((label, i) => ({ label, value: id + ":" + i }));
      const rotate = (index + p.hole + Math.abs(p.floor)) % choices.length;
      return {
        id,
        label: fieldTitles[id][locale === "pl" ? 0 : 1],
        value: id + ":0",
        options: [...choices.slice(rotate), ...choices.slice(0, rotate)],
      };
    }),
  };
}

export const graphEvenOpenRangeFamilies: readonly UniversityFamily[] = [{
  id: "function-even-open-range",
  category: "functions",
  titles: {
    pl: "Sześć własności parzystego wykresu z dziurami i otwartym zbiorem wartości",
    en: "Six properties of an even graph with holes and an open range",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeEvenOpenRange,
}];

export function presentEvenOpenRange(p: EvenOpenRangeProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const answer = evenOpenRangeOracle(p);
  const witness = p.hole / 2;
  lesson.work(t("Dziedzina", "Domain") + ": " + answer.domain,
    t("Oba argumenty x=±", "Both arguments x=±") + fmt(p.hole) +
    t(" są wykluczone, mimo że obok widać cztery puste końce gałęzi.",
      " are excluded even though four hollow branch endpoints are visible nearby."));
  lesson.work(t("Zbiór wartości", "Range") + ": " + answer.range,
    t("Dla |x|>h wysokości są ściśle większe od ", "For |x|>h the heights are strictly above ") +
    fmt(p.floor) + t(" i rosną bez ograniczenia; środkowa gałąź leży wyżej. Dolny kres nie należy do W.",
      " and are unbounded above; the inner branch lies higher. The lower bound is excluded."));
  lesson.work(t("Ścisły wzrost", "Strict increase") + ": " + answer.increasing,
    t("Dla x>0 pochodna środkowej gałęzi jest dodatnia, prawa zewnętrzna rośnie. Nie łącz ich przez dziurę.",
      "For x>0 the inner derivative is positive, and the right exterior rises. Do not join across the hole."));
  lesson.work(t("Ścisły spadek", "Strict decrease") + ": " + answer.decreasing,
    t("Po lewej stronie pochodna jest ujemna; punkt x=0 istnieje, za to x=−h jest wykluczony.",
      "On the left the derivative is negative; x=0 exists, but x=−h is excluded."));
  lesson.work(t("Różnowartościowość", "Injectivity") + ": " + t("nie", "no"),
    t("Dwa różne argumenty ", "Two distinct inputs ") +
    "x=" + fmt(-witness) + " " + t("oraz", "and") + " x=" + fmt(witness) +
    t(" dają tę samą wartość, ponieważ wykres jest symetryczny.",
      " give the same output because the graph is symmetric."));
  lesson.work(t("Parzystość", "Parity") + ": " + t("parzysta", "even"),
    t("Dziedzina jest symetryczna, a wzory na zewnętrznych i wewnętrznych gałęziach zależą od |x| lub x²: f(−x)=f(x).",
      "The domain is symmetric, and both branch formulas use |x| or x²: f(−x)=f(x)."));
  return lesson.finish(
    t("Odczytaj z jednego wykresu sześć własności: D, W, ścisły wzrost, ścisły spadek, różnowartościowość i parzystość. Cztery puste końce leżą przy dwóch wyłączonych argumentach.",
      "Read six properties from one graph: D, W, strict increase, strict decrease, injectivity and parity. Four hollow branch endpoints lie at two excluded inputs."),
    evenOpenRangeAnswer(p, locale),
    t("Najpierw odczytaj dwa brakujące x i sprawdź, czy dolna wysokość pustych końców pojawia się gdziekolwiek indziej.",
      "First identify two missing x-values, then check if the lowest hollow height occurs elsewhere."),
    t("Zewnętrzne ramiona biegną w górę bez końca. Sprawdź symetrię oraz rozdziel monotoniczność przy dziurach.",
      "The outer branches rise without bound. Check symmetry and split monotonic intervals at the holes."));
}
