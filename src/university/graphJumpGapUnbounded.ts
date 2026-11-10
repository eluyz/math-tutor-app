import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/** Public, original synthetic F05/c method shape. Never copies source-sheet geometry. */
export type JumpGapUnboundedProblem = Readonly<{
  kind: "function-jump-gap-unbounded";
  a: number; b: number; c: number; t: number;
  lower: number; upper: number; secondEnd: number;
  rightStart: number; rightMin: number;
  leftSlope: number; rightSlope: number;
}>;
export const jumpGapFields = [
  "domain", "range", "increasing", "decreasing", "injective", "parity",
] as const;
export type JumpGapField = typeof jumpGapFields[number];
export type JumpGapOracle = Readonly<Record<JumpGapField, string>>;

const fmt = (n: number) => String(n).replace(/-/g, "−");
const iv = (lo: string, hi: string, lc = false, rc = false) =>
  (lc ? "[" : "(") + lo + "; " + hi + (rc ? "]" : ")");
const together = (...parts: string[]) => parts.join(" ∪ ");

function rational(num: number, den: number) {
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den <= 0)
    throw Error("Invalid exact rational witness");
  let x = Math.abs(num), y = den;
  while (y) [x, y] = [y, x % y];
  const d = x || 1;
  return den / d === 1 ? fmt(num / d) : fmt(num / d) + "/" + fmt(den / d);
}

export function jumpGapGeometry(p: JumpGapUnboundedProblem) {
  if (p.kind !== "function-jump-gap-unbounded" ||
      ![p.a, p.b, p.c, p.t, p.lower, p.upper, p.secondEnd,
        p.rightStart, p.rightMin, p.leftSlope, p.rightSlope].every(Number.isSafeInteger) ||
      !(p.a < p.b && p.b < p.c && p.c < p.t) ||
      !(p.lower < p.upper && p.secondEnd > p.lower &&
        p.rightStart > p.rightMin && p.rightMin < p.upper) ||
      p.leftSlope <= 0 || p.rightSlope <= 0 || p.b === -p.c)
    throw Error("Invalid synthetic jump/gap graph");
  return p;
}

export function makeJumpGapUnbounded(variant: number, difficulty: Difficulty): JumpGapUnboundedProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(difficulty))
    throw Error("Unsupported F05/c variant or difficulty");
  const tier = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  const a = -8 + variant % 4 + tier;
  const b = a + 2 + variant % 2;
  const rawC = b + 2 + Math.floor(variant / 3) % 2;
  // An asymmetric removed interval gives a directly checkable parity witness.
  const c = rawC === -b ? rawC + 1 : rawC;
  const t = c + 2 + variant % 3;
  const lower = -4 + Math.floor(variant / 4) % 4 + 5 * tier;
  return {
    kind: "function-jump-gap-unbounded", a, b, c, t, lower,
    upper: lower + 2 + variant % 2,
    secondEnd: lower + 4 + variant % 3,
    rightStart: lower + 1 + variant % 2,
    rightMin: lower - 3,
    leftSlope: 1 + Math.floor(variant / 2) % 3,
    rightSlope: 1 + (variant + tier) % 3,
  };
}

/** Piecewise function: upper hollow at a; lower filled at a; open x-gap [b,c]. */
export function jumpGapValue(p: JumpGapUnboundedProblem, x: number): number {
  jumpGapGeometry(p);
  if (!Number.isFinite(x)) throw Error("Non-finite input");
  if (x < p.a) return p.upper + p.leftSlope * (x - p.a);
  if (x < p.b) return p.lower + (p.secondEnd - p.lower) * (x - p.a) / (p.b - p.a);
  if (x <= p.c) throw Error("Input in excluded x gap");
  if (x <= p.t) return p.rightStart + (p.rightMin - p.rightStart) * (x - p.c) / (p.t - p.c);
  return p.rightMin + p.rightSlope * (x - p.t);
}

/** Cross-branch x witnesses prove that the combined graph is not injective. */
export function jumpGapNonInjectiveWitness(p: JumpGapUnboundedProblem) {
  jumpGapGeometry(p);
  const yNum = p.rightMin + p.rightStart;
  const y = yNum / 2;
  const xDescending = (p.c + p.t) / 2;
  const xAscending = p.t + (p.rightStart - p.rightMin) / (2 * p.rightSlope);
  if (!(p.c < xDescending && xDescending < p.t && xAscending > p.t &&
      Math.abs(jumpGapValue(p, xDescending) - y) < 1e-9 &&
      Math.abs(jumpGapValue(p, xAscending) - y) < 1e-9))
    throw Error("Invalid distinct-x repeated-height witness");
  return {
    y: rational(yNum, 2),
    xDescending: rational(p.c + p.t, 2),
    xAscending: rational(2 * p.t * p.rightSlope + p.rightStart - p.rightMin, 2 * p.rightSlope),
  };
}

export function jumpGapOracle(p: JumpGapUnboundedProblem): JumpGapOracle {
  jumpGapGeometry(p);
  return {
    domain: together(iv("−∞", fmt(p.b)), iv(fmt(p.c), "+∞")),
    range: "ℝ",
    increasing: together(
      iv("−∞", fmt(p.a)),
      iv(fmt(p.a), fmt(p.b), true),
      iv(fmt(p.t), "+∞", true)),
    decreasing: iv(fmt(p.c), fmt(p.t), false, true),
    injective: "no",
    parity: "neither",
  };
}

const fieldNames: Record<JumpGapField, readonly [string, string]> = {
  domain: ["Dziedzina (D)", "Domain (D)"],
  range: ["Zbiór wartości (W)", "Range (W)"],
  increasing: ["Ściśle rośnie", "Strictly increasing"],
  decreasing: ["Ściśle maleje", "Strictly decreasing"],
  injective: ["Różnowartościowa?", "One-to-one?"],
  parity: ["Parzystość", "Parity"],
};

export function jumpGapAnswer(p: JumpGapUnboundedProblem, locale: Locale): AnswerSpec {
  const oracle = jumpGapOracle(p);
  const tr = {
    yes: locale === "pl" ? "Tak" : "Yes",
    no: locale === "pl" ? "Nie" : "No",
    even: locale === "pl" ? "Parzysta" : "Even",
    odd: locale === "pl" ? "Nieparzysta" : "Odd",
    neither: locale === "pl" ? "Ani parzysta, ani nieparzysta" : "Neither",
  };
  return {
    kind: "multi-choice",
    fields: jumpGapFields.map((id, index) => {
      const correct = id === "injective" ? tr.no :
        id === "parity" ? tr.neither : oracle[id];
      const others: string[] = id === "domain" ? [
        iv("−∞", fmt(p.c)), iv(fmt(p.b), "+∞"),
        iv("−∞", fmt(p.b), false, true) + " ∪ " + iv(fmt(p.c), "+∞"),
        "ℝ",
      ] : id === "range" ? [
        iv("−∞", fmt(p.upper)), iv(fmt(p.rightMin), "+∞", true),
        iv(fmt(p.lower), fmt(p.upper), true), "∅",
      ] : id === "increasing" ? [
        iv("−∞", fmt(p.b)) + " ∪ " + iv(fmt(p.t), "+∞", true),
        iv("−∞", fmt(p.a)) + " ∪ " + iv(fmt(p.a), fmt(p.b)),
        iv(fmt(p.c), fmt(p.t), false, true), "∅",
      ] : id === "decreasing" ? [
        iv(fmt(p.c), fmt(p.t)), iv(fmt(p.c), fmt(p.t), true, true),
        iv(fmt(p.t), "+∞", true), "∅",
      ] : id === "injective" ? [tr.yes] : [tr.even, tr.odd];
      const options = [...new Set([correct, ...others])].slice(0, 5)
        .map((label, i) => ({label, value: id + ":" + i}));
      const shift = (index + Math.abs(p.a) + Math.abs(p.c)) % options.length;
      return {
        id, label: fieldNames[id][locale === "pl" ? 0 : 1],
        value: id + ":0",
        options: [...options.slice(shift), ...options.slice(0, shift)],
      };
    }),
  };
}

export const jumpGapUnboundedFamilies: readonly UniversityFamily[] = [{
  id: "function-jump-gap-unbounded", category: "functions",
  titles: {
    pl: "Sześć własności: skok, przerwa i nieograniczone gałęzie",
    en: "Six properties: jump, missing interval and unbounded branches",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeJumpGapUnbounded,
}];

export function presentJumpGapUnbounded(p: JumpGapUnboundedProblem, locale: Locale) {
  const l = teaching(locale), {t} = l;
  const o = jumpGapOracle(p), w = jumpGapNonInjectiveWitness(p);
  l.work(t("Dziedzina", "Domain") + ": " + o.domain,
    t("W punkcie skoku jest pełny punkt, lecz osobny przedział [b,c] pozostaje wykluczony.",
      "The jump has an included point, but the separate input interval [b,c] is excluded."));
  l.work(t("Zbiór wartości", "Range") + ": " + o.range,
    t("Lewa gałąź osiąga wszystkie wysokości poniżej pustej granicy, prawa po minimum rośnie bez ograniczeń; zakresy nakładają się.",
      "The left tail reaches every height below its hollow limit; the right tail rises without bound after its minimum, and their ranges overlap."));
  l.work(t("Ścisły wzrost", "Strict increase") + ": " + o.increasing,
    t("Skok w dół przy pełnym punkcie rozdziela dwa rosnące odcinki; ostatnia gałąź rośnie od minimum.",
      "The downward jump separates two increasing pieces; the final branch rises from the included minimum."));
  l.work(t("Ścisły spadek", "Strict decrease") + ": " + o.decreasing,
    t("Prawa część opada od pustego końca przerwy do pełnego minimum.",
      "The right portion decreases from the open gap endpoint to the filled minimum."));
  l.work(t("Różnowartościowość", "Injectivity") + ": " + t("nie", "no"),
    t("Dwa różne argumenty dają tę samą wysokość: ", "Two distinct inputs share a height: ") +
    "f(" + w.xDescending + ") = f(" + w.xAscending + ") = " + w.y + ".");
  l.work(t("Parzystość", "Parity") + ": " + t("żadna", "neither"),
    t("Usunięty przedział argumentów nie jest symetryczny względem zera, więc funkcja nie jest parzysta ani nieparzysta.",
      "The missing input interval is asymmetric about zero, ruling out even and odd parity."));
  return l.finish(
    t("Z jednego wykresu odczytaj dziedzinę, zbiór wartości, przedziały wzrostu i spadku, różnowartościowość i parzystość.",
      "Read one graph to determine domain, range, increasing and decreasing intervals, injectivity and parity."),
    jumpGapAnswer(p, locale),
    t("Nie łącz rosnących fragmentów przez skok i nie pomijaj odrębnej przerwy w dziedzinie.",
      "Do not join increasing pieces across the jump or miss the separate domain gap."),
    t("Zauważ dwa różne symbole przy skoku i osobne puste końce przedziału bez wykresu; sprawdź obie nieskończone gałęzie.",
      "Check the hollow and filled jump marks, both hollow gap endpoints and the two unbounded tails."));
}
