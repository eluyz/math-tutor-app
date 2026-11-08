import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/**
 * F05/e-like PUBLIC SYNTHETIC MODEL. No original worksheet coordinates.
 * One excluded x=c has TWO different hollow limiting heights:
 * left A=B+sep and right B; both heights occur at other valid inputs.
 * The left branch is unbounded below, while the right branch has a
 * reached maximum and a filled far endpoint.
 */
export type SingleHoleRecoveryProblem = Readonly<{
  kind: "function-single-hole-recovery";
  hole: number;
  base: number;
  separation: number;
  rise: number;
  leftSlope: number;
  upSpan: number;
  downSpan: number;
  drop: number;
}>;

export const singleHoleRecoveryFields = [
  "domain", "range", "increasing", "decreasing", "injective", "parity",
] as const;
export type SingleHoleRecoveryField = typeof singleHoleRecoveryFields[number];
export type SingleHoleRecoveryOracle = Readonly<Record<SingleHoleRecoveryField, string>>;

const fmt = (n: number) => String(n).replace(/-/g, "−");
const interval = (lo: string, hi: string, lc = false, rc = false) =>
  (lc ? "[" : "(") + lo + "; " + hi + (rc ? "]" : ")");
const union = (...pieces: string[]) => pieces.join(" ∪ ");

/** Show witnesses as exact simplified rational numbers, never rounded decimals. */
function exactRatio(n: number, d: number): string {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d <= 0)
    throw Error("Invalid exact witness fraction");
  let a = Math.abs(n), b = d;
  while (b !== 0) [a, b] = [b, a % b];
  const gcd = a || 1, numerator = n / gcd, denominator = d / gcd;
  return denominator === 1 ? fmt(numerator) : fmt(numerator) + "/" + denominator;
}

export function singleHoleGeometry(p: SingleHoleRecoveryProblem) {
  if (p.kind !== "function-single-hole-recovery" ||
    ![p.hole, p.base, p.separation, p.rise, p.leftSlope,
      p.upSpan, p.downSpan, p.drop].every(Number.isSafeInteger) ||
    p.separation < 2 || p.rise < 2 || p.leftSlope <= 0 ||
    p.upSpan <= 0 || p.downSpan <= 0 || p.drop < 1 ||
    p.drop >= p.separation + p.rise)
    throw Error("Invalid one-hole recovery graph");
  const c = p.hole, B = p.base, A = B + p.separation;
  const H = A + p.rise, t = c + p.upSpan, R = t + p.downSpan;
  const E = H - p.drop;
  return { c, A, B, H, t, R, E };
}

export function makeSingleHoleRecovery(variant: number, difficulty: Difficulty): SingleHoleRecoveryProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
    !["hard", "advanced", "expert"].includes(difficulty))
    throw Error("Unsupported F05/e-like variant/level");
  const level = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  return {
    kind: "function-single-hole-recovery",
    hole: -5 + variant % 4 + level,
    base: -7 + Math.floor(variant / 4) + 8 * level,
    separation: 2 + variant % 2,
    rise: 3 + (Math.floor(variant / 4) + level) % 3,
    leftSlope: 1 + (variant + level) % 3,
    upSpan: 2 + variant % 3,
    downSpan: 2 + Math.floor(variant / 8) % 2,
    drop: 1 + (Math.floor(variant / 3) + level) % 3,
  };
}

/** Single-valued and exact at branch junction t; undefined at c and beyond R. */
export function singleHoleRecoveryValue(p: SingleHoleRecoveryProblem, x: number) {
  const {c, A, B, H, t, R} = singleHoleGeometry(p);
  if (!Number.isFinite(x) || x === c || x > R)
    throw Error("Input outside the domain");
  if (x < c) return A + p.leftSlope * (x - c);
  if (x <= t) return B + (H - B) * (x - c) / p.upSpan;
  return H - p.drop * (x - t) / p.downSpan;
}

/** Two distinct missing limits A and B are both recovered for x != c. */
export function singleHoleRecoveryWitnesses(p: SingleHoleRecoveryProblem) {
  const {c, A, B, H, t} = singleHoleGeometry(p);
  const xForB = c + (B - A) / p.leftSlope; // left branch, x<c
  const xForA = c + p.upSpan * (A - B) / (H - B); // right branch, c<x<t
  const yShared = (A + B) / 2;
  const leftX = c + (yShared - A) / p.leftSlope;
  const rightX = c + p.upSpan * (yShared - B) / (H - B);
  if (!(xForB < c && c < xForA && xForA < t && leftX < c && c < rightX && rightX < t))
    throw Error("Failed independent limit-height recovery witness");
  return {xForB, xForA, leftX, rightX, yShared};
}

export function singleHoleRecoveryOracle(p: SingleHoleRecoveryProblem): SingleHoleRecoveryOracle {
  const {c, H, t, R} = singleHoleGeometry(p);
  const xC = fmt(c), xT = fmt(t), xR = fmt(R), yH = fmt(H);
  return {
    domain: union(interval("−∞", xC), interval(xC, xR, false, true)),
    range: interval("−∞", yH, false, true),
    increasing: union(interval("−∞", xC), interval(xC, xT, false, true)),
    decreasing: interval(xT, xR, true, true),
    injective: "no",
    parity: "neither",
  };
}

const labels: Record<SingleHoleRecoveryField, readonly [string, string]> = {
  domain: ["Dziedzina (D)", "Domain (D)"],
  range: ["Zbiór wartości (W)", "Range (W)"],
  increasing: ["Ściśle rośnie", "Strictly increasing"],
  decreasing: ["Ściśle maleje", "Strictly decreasing"],
  injective: ["Różnowartościowa?", "One-to-one?"],
  parity: ["Parzystość", "Parity"],
};

export function singleHoleRecoveryAnswer(p: SingleHoleRecoveryProblem, locale: Locale): AnswerSpec {
  const o = singleHoleRecoveryOracle(p), { c, A, B, H, t, R } = singleHoleGeometry(p);
  const cS = fmt(c), tS = fmt(t), rS = fmt(R), aS = fmt(A), bS = fmt(B), hS = fmt(H);
  const translations = {
    yes: locale === "pl" ? "Tak" : "Yes", no: locale === "pl" ? "Nie" : "No",
    even: locale === "pl" ? "Parzysta" : "Even", odd: locale === "pl" ? "Nieparzysta" : "Odd",
    neither: locale === "pl" ? "Ani parzysta, ani nieparzysta" : "Neither",
  };
  return {
    kind: "multi-choice", fields: singleHoleRecoveryFields.map((id, index) => {
      const correct = id === "injective" ? translations.no :
        id === "parity" ? translations.neither : o[id];
      let alternative: string[];
      if (id === "domain") alternative = [
        interval("−∞", rS, false, true),
        union(interval("−∞", cS, false, true), interval(cS, rS, false, true)),
        union(interval("−∞", cS), interval(cS, rS)),
        interval(cS, rS, false, true),
      ];
      else if (id === "range") alternative = [
        interval("−∞", hS), interval("−∞", aS, false, true),
        interval("−∞", bS, false, true), "ℝ",
      ];
      else if (id === "increasing") alternative = [
        interval("−∞", tS, false, true),
        union(interval("−∞", cS), interval(cS, tS)),
        interval(cS, tS, false, true), interval("−∞", cS),
      ];
      else if (id === "decreasing") alternative = [
        interval(tS, rS), interval(tS, rS, true, false),
        interval(cS, rS, false, true), "∅",
      ];
      else if (id === "injective") alternative = [translations.yes];
      else alternative = [translations.even, translations.odd];
      const choices = [...new Set([correct, ...alternative])].slice(0, 5);
      if (choices.length < 2) throw Error("Insufficient distinct F05/e choices");
      const options = choices.map((label, k) => ({label, value: id + ":" + k}));
      const shift = (index + Math.abs(c) + R) % options.length;
      return {
        id, label: labels[id][locale === "pl" ? 0 : 1], value: id + ":0",
        options: [...options.slice(shift), ...options.slice(0, shift)],
      };
    }),
  };
}

/** Bounded synthetic source-method proxy; not an original P21 source witness. */
export const singleHoleRecoveryFamilies: readonly UniversityFamily[] = [{
  id: "function-single-hole-recovery",
  category: "functions",
  titles: {
    pl: "Sześć własności wykresu z dwiema pustymi kropkami przy jednym x",
    en: "Six properties of a graph with two hollow points at one x",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeSingleHoleRecovery,
}];

export function presentSingleHoleRecovery(p: SingleHoleRecoveryProblem, locale: Locale) {
  const lesson = teaching(locale), {t} = lesson;
  const g = singleHoleGeometry(p), o = singleHoleRecoveryOracle(p);
  const {c, B} = g, span = p.separation + p.rise;
  const xAtB = exactRatio(c * p.leftSlope - p.separation, p.leftSlope);
  const xAtA = exactRatio(c * span + p.upSpan * p.separation, span);
  const nonInjectiveLeft = exactRatio(2 * c * p.leftSlope - p.separation, 2 * p.leftSlope);
  const nonInjectiveRight = exactRatio(2 * c * span + p.upSpan * p.separation, 2 * span);
  const sharedHeight = exactRatio(2 * B + p.separation, 2);
  lesson.work(t("Dziedzina", "Domain") + ": " + o.domain,
    t("Argument x=", "Input x=") + fmt(g.c) +
    t(" jest całkowicie wykluczony: dwie różne puste wysokości nie definiują wartości funkcji.",
      " is entirely excluded: two distinct hollow heights do not define a function value."));
  lesson.work(t("Zbiór wartości", "Range") + ": " + o.range,
    t("Lewa gałąź biegnie do −∞, a prawa osiąga pełny szczyt y=", 
      "The left tail tends to −∞ and the right branch attains its filled maximum y=") + fmt(g.H) +
    ". " + t("Obie puste wysokości występują ponownie: ", "Both hollow heights are recovered: ") +
    "y=" + fmt(g.B) + " (x=" + xAtB + "), y=" + fmt(g.A) + " (x=" + xAtA + ").");
  lesson.work(t("Ścisły wzrost", "Strict increase") + ": " + o.increasing,
    t("Obie pierwsze gałęzie rosną, ale nie wolno połączyć przedziałów przez wyłączone x.",
      "Both first branches increase, but cannot be joined across the excluded x."));
  lesson.work(t("Ścisły spadek", "Strict decrease") + ": " + o.decreasing,
    t("Po osiągniętym maksimum prawa gałąź opada do pełnego końca.",
      "After the attained maximum, the right branch falls to a filled far endpoint."));
  lesson.work(t("Różnowartościowość", "Injectivity") + ": " + t("nie", "no"),
    t("Ta sama wysokość występuje na dwóch gałęziach: ", 
      "The same height is reached on both branches: ") +
    "f(" + nonInjectiveLeft + ")=f(" + nonInjectiveRight + ")=" + sharedHeight + ".");
  lesson.work(t("Parzystość", "Parity") + ": " + t("żadna", "neither"),
    t("Dziedzina ma nieograniczoną lewą i ograniczoną prawą stronę, więc nie jest symetryczna względem zera.",
      "The domain is unbounded left but bounded right, so it is not symmetric around zero."));
  return lesson.finish(
    t("Odczytaj sześć własności jednego wykresu. Przy tym samym x są dwie różne puste kropki, ale żadna pełna; lewa gałąź jest nieograniczona, a prawa ma pełne maksimum i koniec.",
      "Read six properties from one graph. Two distinct hollow circles occur at the same x but no filled circle; the left tail is unbounded and the right branch has a filled maximum and endpoint."),
    singleHoleRecoveryAnswer(p, locale),
    t("Puste punkty usuwają argument x, niekoniecznie wysokości ze zbioru wartości.",
      "Hollow endpoints exclude an input x, not necessarily the heights from the range."),
    t("Znajdź inne argumenty osiągające obie puste wysokości; rozdziel przedziały przy brakującym x.",
      "Find other inputs that attain both hollow heights; split intervals at the missing x."));
}
