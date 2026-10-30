import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { AnswerSpec } from "../answers";
import { teaching } from "./teaching";

/** Synthetic five-knot continuous polyline with genuine excluded inputs.
 * A removed (x,y) does not necessarily remove y from the image.
 * Original private P20/P21 diagrams and answer keys are NOT embedded here.
 */
type Point = Readonly<{ x: number; y: number }>;
export type IntegratedPuncturesProblem = Readonly<{
  kind: "function-integrated-punctures";
  nodes: readonly [Point, Point, Point, Point, Point];
  included: readonly [boolean, boolean, boolean, boolean, boolean];
}>;
export type PunctureField = "domain" | "range" | "increasing" | "decreasing" | "injective" | "parity";
export type PunctureOracle = Readonly<Record<PunctureField, string>>;
type Interval = Readonly<{ lo: number; hi: number; left: boolean; right: boolean }>;
const fmt = (v: number) => String(v).replace(/-/g, "−");
const write = (i: Interval) =>
  (i.left ? "[" : "(") + fmt(i.lo) + "; " + fmt(i.hi) + (i.right ? "]" : ")");
const union = (intervals: readonly Interval[]) => intervals.length ? intervals.map(write).join(" ∪ ") : "∅";
const iv = (lo: number, hi: number, left: boolean, right: boolean): Interval => ({ lo, hi, left, right });
const point = (x: number, y: number): Point => ({ x, y });

/** Six distinct method patterns, repeated with different x positions per level.
 * Mode 0: one asymmetric side hole, height recovered at opposite filled knot.
 * Mode 1: two symmetric holes, both y heights recovered, odd graph.
 * Mode 2: missing origin, its y height attained on outer segments, even graph.
 * Mode 3: two asymmetric-height holes, both y heights recovered elsewhere.
 * Mode 4: monotone graph with one missing y-height (injective).
 * Mode 5: monotone odd graph with missing origin/y-height (injective).
 */
const heights: readonly (readonly [number, number, number, number, number])[] = [
  [2, 0, -2, 0, 2],
  [-2, 1, 0, -1, 2],
  [3, -2, 1, -2, 3],
  [2, 0, -2, 2, -1],
  [-2, -1, 0, 1, 2],
  [2, 1, 0, -1, -2],
];
const membership: readonly (readonly [boolean, boolean, boolean, boolean, boolean])[] = [
  [true, false, true, true, true],
  [true, false, true, false, true],
  [true, true, false, true, true],
  [true, false, true, false, true],
  [true, false, true, true, true],
  [true, true, false, true, true],
];

export function makeIntegratedPunctures(variant: number, difficulty: Difficulty): IntegratedPuncturesProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
    !["hard", "advanced", "expert"].includes(difficulty)) throw Error("Unsupported punctured graph variant");
  const level = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  const L = 6 + level * 4 + Math.floor(variant / 6);
  const h = 1 + ((variant + level) % 2);
  const ys = heights[variant % 6];
  return {
    kind: "function-integrated-punctures",
    nodes: [point(-L, ys[0]), point(-h, ys[1]), point(0, ys[2]), point(h, ys[3]), point(L, ys[4])],
    included: membership[variant % 6],
  };
}
function validate(p: IntegratedPuncturesProblem) {
  const n = p.nodes, s = p.included;
  if (p.kind !== "function-integrated-punctures" || n.length !== 5 || s.length !== 5 ||
    !n.every(q => Number.isSafeInteger(q.x) && Number.isSafeInteger(q.y)) ||
    n[0].x !== -n[4].x || n[1].x !== -n[3].x || n[2].x !== 0 ||
    !(n[0].x < n[1].x && n[1].x < 0 && 0 < n[3].x && n[3].x < n[4].x) ||
    n.some((q, i) => i > 0 && q.y === n[i - 1].y) ||
    !s[0] || !s[4] || s.every(Boolean))
    throw Error("Invalid punctured graph geometry");
}
function imageInterval(a: Point, b: Point, left: boolean, right: boolean): Interval {
  return a.y < b.y ? iv(a.y, b.y, left, right) : iv(b.y, a.y, right, left);
}
/** Exact union of line-segment images with open/closed endpoints, including
 * repeated y heights attained at x values other than a missing node.
 */
export function punctureRangeIntervals(p: IntegratedPuncturesProblem): readonly Interval[] {
  validate(p);
  const parts: Interval[] = [];
  for (let i = 0; i < 4; i++)
    parts.push(imageInterval(p.nodes[i], p.nodes[i + 1], p.included[i], p.included[i + 1]));
  parts.sort((a, b) => a.lo - b.lo || a.hi - b.hi);
  const merged: Interval[] = [];
  for (const part of parts) {
    const prev = merged.at(-1);
    if (prev && (part.lo < prev.hi || (part.lo === prev.hi && (prev.right || part.left)))) {
      merged[merged.length - 1] = {
        lo: prev.lo, hi: Math.max(prev.hi, part.hi),
        left: prev.left || (prev.lo === part.lo && part.left),
        right: part.hi > prev.hi ? part.right :
          part.hi === prev.hi ? prev.right || part.right : prev.right,
      };
    } else merged.push(part);
  }
  return merged;
}
export function punctureHasHeight(p: IntegratedPuncturesProblem, y: number): boolean {
  return punctureRangeIntervals(p).some(t =>
    (y > t.lo || (y === t.lo && t.left)) && (y < t.hi || (y === t.hi && t.right)));
}
function domainIntervals(p: IntegratedPuncturesProblem): Interval[] {
  const result: Interval[] = [];
  let start = 0;
  for (let i = 1; i < 4; i++) if (!p.included[i]) {
    result.push(iv(p.nodes[start].x, p.nodes[i].x, p.included[start], false));
    start = i;
  }
  result.push(iv(p.nodes[start].x, p.nodes[4].x, p.included[start], p.included[4]));
  return result;
}
function trendIntervals(p: IntegratedPuncturesProblem, trend: "up" | "down"): Interval[] {
  const result: Interval[] = [];
  let prevDirection: "up" | "down" | null = null;
  for (let i = 0; i < 4; i++) {
    const direction = p.nodes[i + 1].y > p.nodes[i].y ? "up" : "down";
    const current = iv(p.nodes[i].x, p.nodes[i + 1].x, p.included[i], p.included[i + 1]);
    if (direction === trend) {
      const prev = result.at(-1);
      if (prev && prevDirection === trend && p.included[i] && prev.hi === current.lo) {
        result[result.length - 1] = iv(prev.lo, current.hi, prev.left, current.right);
      } else result.push(current);
    }
    prevDirection = direction;
  }
  return result;
}
/** Horizontal-line test at all knot heights and one interior level between
 * every two consecutive knot heights. Between breakpoints, the number of
 * intersections of a piecewise-linear graph cannot change.
 */
function isInjective(p: IntegratedPuncturesProblem): boolean {
  const knots = [...new Set(p.nodes.map(q => q.y))].sort((a, b) => a - b);
  const levels = [...knots, ...knots.slice(1).map((y, i) => (y + knots[i + 1]) / 2)];
  return levels.every(y => {
    const inputs: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = p.nodes[i], b = p.nodes[i + 1];
      if (y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue;
      if ((y === a.y && !p.included[i]) || (y === b.y && !p.included[i + 1])) continue;
      const x = a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y);
      if (!inputs.some(other => Math.abs(other - x) < 1e-9)) inputs.push(x);
      if (inputs.length > 1) return false;
    }
    return true;
  });
}
function parity(p: IntegratedPuncturesProblem): "even" | "odd" | "neither" {
  const n = p.nodes, inc = p.included;
  if (inc[0] !== inc[4] || inc[1] !== inc[3]) return "neither";
  if (n[0].y === n[4].y && n[1].y === n[3].y) return "even";
  if (n[0].y === -n[4].y && n[1].y === -n[3].y && n[2].y === 0) return "odd";
  return "neither";
}
export function integratedPunctureOracle(p: IntegratedPuncturesProblem): PunctureOracle {
  validate(p);
  return {
    domain: union(domainIntervals(p)),
    range: union(punctureRangeIntervals(p)),
    increasing: union(trendIntervals(p, "up")),
    decreasing: union(trendIntervals(p, "down")),
    injective: isInjective(p) ? "yes" : "no",
    parity: parity(p),
  };
}
const fields: readonly PunctureField[] =
  ["domain", "range", "increasing", "decreasing", "injective", "parity"];
const labels: Record<PunctureField, readonly [string, string]> = {
  domain: ["Dziedzina (D)", "Domain (D)"],
  range: ["Zbiór wartości (W)", "Range (W)"],
  increasing: ["Ściśle rośnie", "Strictly increasing"],
  decreasing: ["Ściśle maleje", "Strictly decreasing"],
  injective: ["Różnowartościowa?", "One-to-one?"],
  parity: ["Parzystość", "Parity"],
};
const choices = (answer: string, alternatives: readonly string[]) =>
  [...new Set([answer, ...alternatives])].slice(0, 4);
export function integratedPunctureAnswer(p: IntegratedPuncturesProblem, locale: Locale): AnswerSpec {
  const o = integratedPunctureOracle(p), n = p.nodes;
  const fullX = write(iv(n[0].x, n[4].x, true, true));
  const openX = write(iv(n[0].x, n[4].x, false, false));
  const ys = n.map(q => q.y), minY = Math.min(...ys), maxY = Math.max(...ys);
  const fullY = write(iv(minY, maxY, true, true)), openY = write(iv(minY, maxY, false, false));
  const tr = {
    yes: locale === "pl" ? "Tak" : "Yes", no: locale === "pl" ? "Nie" : "No",
    even: locale === "pl" ? "Parzysta" : "Even", odd: locale === "pl" ? "Nieparzysta" : "Odd",
    neither: locale === "pl" ? "Ani parzysta, ani nieparzysta" : "Neither",
  };
  return { kind: "multi-choice", fields: fields.map((id, i) => {
    let options: { value: string; label: string }[];
    if (id === "injective")
      options = (["yes", "no"] as const).map((v, k) => ({ value: id + ":" + k, label: tr[v] }));
    else if (id === "parity")
      options = (["even", "odd", "neither"] as const).map((v, k) => ({ value: id + ":" + k, label: tr[v] }));
    else {
      const alternatives = id === "domain" ? [fullX, openX, "ℝ", "∅"] :
        id === "range" ? [fullY, openY, "ℝ", "∅"] :
        ["∅", fullX, openX, o.domain, write(iv(n[0].x, 0, true, false)), write(iv(0, n[4].x, false, true))];
      options = choices(o[id], alternatives).map((label, k) => ({ value: id + ":" + k, label }));
    }
    const correct = id === "injective" ? id + ":" + (o.injective === "yes" ? 0 : 1) :
      id === "parity" ? id + ":" + (o.parity === "even" ? 0 : o.parity === "odd" ? 1 : 2) : id + ":0";
    const shift = (i + n[4].x) % options.length;
    return {
      id, label: labels[id][locale === "pl" ? 0 : 1], value: correct,
      options: [...options.slice(shift), ...options.slice(0, shift)],
    };
  }) };
}
export const graphIntegratedPunctureFamilies: readonly UniversityFamily[] = [{
  id: "function-integrated-punctures",
  category: "functions",
  titles: {
    pl: "Sześć własności wykresu z dziurami",
    en: "Six properties of a graph with holes",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeIntegratedPunctures,
}];
export function presentIntegratedPunctures(p: IntegratedPuncturesProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson, o = integratedPunctureOracle(p);
  const removed = p.nodes.flatMap((n, i) => p.included[i] ? [] : [n]);
  const heightEvidence = removed.map(n =>
    t("x=" + fmt(n.x) + ": y=" + fmt(n.y) + (punctureHasHeight(p, n.y) ?
      " nadal występuje dla innego x" : " nie występuje dla innego x"),
      "x=" + fmt(n.x) + ": y=" + fmt(n.y) + (punctureHasHeight(p, n.y) ?
      " is attained at a different x" : " is not attained at another x"))).join("; ");
  lesson.work(t("Dziedzina", "Domain") + ": " + o.domain,
    t("Puste punkty wykluczają argumenty x; pełne końce należą do dziedziny.",
      "Hollow points exclude x inputs; filled outer endpoints remain in the domain."));
  lesson.work(t("Zbiór wartości", "Range") + ": " + o.range,
    heightEvidence + ". " + t("Sprawdź obrazy wszystkich czterech odcinków przed usunięciem jakiejkolwiek wysokości.",
      "Check the y-images of all four segments before removing any height."));
  lesson.work(t("Ścisły wzrost", "Strict increase") + ": " + o.increasing,
    t("Porównaj kolejne nachylenia; łącz odcinki tylko przez istniejący punkt, bez przechodzenia przez dziurę.",
      "Compare adjacent slopes; join intervals only through included vertices, never across a hole."));
  lesson.work(t("Ścisły spadek", "Strict decrease") + ": " + o.decreasing,
    t("Przy zmianie kierunku rozdziel przedziały, uwzględniając pełne i puste końce.",
      "At each change of direction, split intervals and respect included or missing endpoints."));
  lesson.work(t("Różnowartościowość", "Injectivity") + ": " +
    (o.injective === "yes" ? t("tak", "yes") : t("nie", "no")),
    t("Pozioma prosta nie może przecinać wykresu dla dwóch różnych argumentów. Pusty punkt nie liczy się jako przecięcie.",
      "A horizontal line must not hit the graph at two distinct x inputs. Hollow points do not count as intersections."));
  lesson.work(t("Parzystość", "Parity") + ": " +
    (o.parity === "even" ? t("parzysta", "even") :
      o.parity === "odd" ? t("nieparzysta", "odd") : t("żadna", "neither")),
    t("Najpierw porównaj lustrzane dziury w dziedzinie, potem wartości f(−x) i f(x), a dla nieparzystości ich znaki.",
      "First compare mirrored holes in the domain, then f(−x) and f(x), including opposite signs for oddness."));
  return lesson.finish(
    t("Dla jednego wykresu z pustymi punktami podaj sześć własności: D, W, przedziały ścisłego wzrostu i spadku, różnowartościowość i parzystość.",
      "For one graph with hollow points identify six properties: D, W, strict increasing/decreasing intervals, injectivity and parity."),
    integratedPunctureAnswer(p, locale),
    t("Zacznij od pustych argumentów. Pusta wysokość może być nadal osiągana na innej gałęzi.",
      "Start with excluded inputs. A hollow node's height can still be reached elsewhere."),
    t("Osobno zbadaj cztery odcinki, przetnij je poziomymi prostymi i sprawdź symetrię dziedziny.",
      "Inspect four segments separately, use horizontal lines, and check whether the domain is symmetric."));
}
