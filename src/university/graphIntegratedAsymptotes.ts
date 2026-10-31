import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { middleValue } from "./graphAsymptoteRange";
import { teaching } from "./teaching";

/** Synthetic source-style F05 geometry. No original private source coordinates. */
type Point = Readonly<{ x: number; y: number }>;
export type IntegratedAsymptoteProblem = Readonly<{
  kind: "function-integrated-asymptotes";
  center: number;
  radius: number;
  shift: number;
  scale: number;
  sign: 1 | -1;
  left: readonly [Point, Point];
  right: readonly [Point, Point];
}>;
export type AsymptoteField = "domain" | "range" | "increasing" | "decreasing" | "injective" | "parity";
export type AsymptoteOracle = Readonly<Record<AsymptoteField, string>>;
const fmt = (n: number) => String(n).replace(/-/g, "−");
type Interval = Readonly<{ lo: number; hi: number; closedLeft: boolean; closedRight: boolean }>;
const interval = (lo: number, hi: number, closedLeft: boolean, closedRight: boolean): Interval =>
  ({ lo, hi, closedLeft, closedRight });
const show = (v: Interval) =>
  (v.closedLeft ? "[" : "(") + fmt(v.lo) + "; " + fmt(v.hi) + (v.closedRight ? "]" : ")");
const union = (v: readonly Interval[]) => v.length ? v.map(show).join(" ∪ ") : "∅";

export function makeIntegratedAsymptote(v: number, difficulty: Difficulty): IntegratedAsymptoteProblem {
  if (!Number.isInteger(v) || v < 0 || v >= 24 ||
    !["hard", "advanced", "expert"].includes(difficulty))
    throw Error("Unsupported integrated asymptote variant");
  const level = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  const profile = v % 6;
  const group = Math.floor(v / 6);
  const radius = 2 + level;
  // Retain the 72-variant catalog while adding the P21/d-inspired topology:
  // selected profiles meet the excluded pole x at an OPEN exterior end.
  const gap = profile === 0 ? 0 : 1 + group % 2;
  const span = 2 + Math.floor(group / 2);
  const center = [0, 0, 1, 0, -1, 2][profile];
  const shift = [0, 0, 1, 1, -1, -1][profile];
  const sign: 1 | -1 = profile % 2 === 0 ? 1 : -1;
  const slopeLeft = [1, -1, 1, -1, 1, -1][profile];
  const slopeRight = [1, -1, -1, 1, 1, -1][profile];
  const nearLeft = [1, -1, -1, 1, 0, 1][profile];
  const nearRight = [-1, 1, 2, 0, -1, -2][profile];
  const a = center - radius, b = center + radius;
  return {
    kind: "function-integrated-asymptotes", center, radius, shift,
    scale: 1 + ((v + level) % 2), sign,
    left: [{ x: a - gap - span, y: nearLeft - slopeLeft * span },
      { x: a - gap, y: nearLeft }],
    right: [{ x: b + gap, y: nearRight },
      { x: b + gap + span, y: nearRight + slopeRight * span }],
  };
}

export const integratedPoles = (p: IntegratedAsymptoteProblem) =>
  [p.center - p.radius, p.center + p.radius] as const;

function validate(p: IntegratedAsymptoteProblem) {
  const [a, b] = integratedPoles(p), [l0, l1] = p.left, [r0, r1] = p.right;
  if (p.kind !== "function-integrated-asymptotes" ||
    ![p.center, p.radius, p.shift, p.scale].every(Number.isSafeInteger) ||
    p.radius <= 0 || p.scale <= 0 || (p.sign !== 1 && p.sign !== -1) ||
    ![l0, l1, r0, r1].every(q => Number.isSafeInteger(q.x) && Number.isSafeInteger(q.y)) ||
    !(l0.x < l1.x && l1.x <= a && a < b && b <= r0.x && r0.x < r1.x) ||
    l0.y === l1.y || r0.y === r1.y)
    throw Error("Invalid integrated asymptote geometry");
}

export function integratedAsymptoteValue(p: IntegratedAsymptoteProblem, x: number): number {
  validate(p);
  return middleValue({ kind: "function-asymptote-range", center: p.center,
    radius: p.radius, shift: p.shift, scale: p.scale, sign: p.sign, mode: "cross" }, x);
}
const leftOuterInterval = (p: IntegratedAsymptoteProblem) =>
  interval(p.left[0].x, p.left[1].x, true, p.left[1].x < integratedPoles(p)[0]);
const rightOuterInterval = (p: IntegratedAsymptoteProblem) =>
  interval(p.right[0].x, p.right[1].x, p.right[0].x > integratedPoles(p)[1], true);
const middleInterval = (p: IntegratedAsymptoteProblem) => {
  const [a, b] = integratedPoles(p);
  return interval(a, b, false, false);
};

/** A middle branch between two vertical poles is continuous and strictly
 * monotone, with opposite infinite limits: its y-image is all real numbers.
 * Its y-values necessarily overlap those of each nonempty outer branch.
 */
export function integratedAsymptoteOracle(p: IntegratedAsymptoteProblem): AsymptoteOracle {
  validate(p);
  const pieces = [leftOuterInterval(p), middleInterval(p), rightOuterInterval(p)];
  const up: Interval[] = [], down: Interval[] = [];
  (p.left[1].y > p.left[0].y ? up : down).push(pieces[0]);
  (p.sign === -1 ? up : down).push(pieces[1]);
  (p.right[1].y > p.right[0].y ? up : down).push(pieces[2]);
  const [l0, l1] = p.left, [r0, r1] = p.right;
  const poles = integratedPoles(p);
  const symmetricDomain = p.center === 0 && l0.x === -r1.x && l1.x === -r0.x &&
    poles[0] === -poles[1];
  const odd = symmetricDomain && p.shift === 0 &&
    l0.y === -r1.y && l1.y === -r0.y && l0.y - l1.y === r0.y - r1.y;
  // An even continuous middle branch cannot have these opposite pole limits.
  return { domain: union(pieces), range: "ℝ",
    increasing: union(up), decreasing: union(down),
    injective: "no", parity: odd ? "odd" : "neither" };
}
const fields: readonly AsymptoteField[] =
  ["domain", "range", "increasing", "decreasing", "injective", "parity"];
const names: Record<AsymptoteField, readonly [string, string]> = {
  domain: ["Dziedzina (D)", "Domain (D)"], range: ["Zbiór wartości (W)", "Range (W)"],
  increasing: ["Ściśle rośnie", "Strictly increasing"],
  decreasing: ["Ściśle maleje", "Strictly decreasing"],
  injective: ["Różnowartościowa?", "One-to-one?"],
  parity: ["Parzystość", "Parity"],
};
const options = (correct: string, others: readonly string[]) =>
  [...new Set([correct, ...others])].slice(0, 5);

export function integratedAsymptoteAnswer(p: IntegratedAsymptoteProblem, locale: Locale): AnswerSpec {
  const o = integratedAsymptoteOracle(p), [a, b] = integratedPoles(p);
  const joined = show(interval(p.left[0].x, p.right[1].x, true, true));
  const holeless = show(interval(p.left[0].x, p.right[1].x, false, false));
  const mid = show(middleInterval(p));
  const left = show(leftOuterInterval(p)), right = show(rightOuterInterval(p));
  const tr = {
    yes: locale === "pl" ? "Tak" : "Yes", no: locale === "pl" ? "Nie" : "No",
    even: locale === "pl" ? "Parzysta" : "Even",
    odd: locale === "pl" ? "Nieparzysta" : "Odd",
    neither: locale === "pl" ? "Ani parzysta, ani nieparzysta" : "Neither",
  };
  return { kind: "multi-choice", fields: fields.map((id, i) => {
    let choices: { value: string; label: string }[];
    if (id === "injective")
      choices = (["yes", "no"] as const).map((value, k) => ({ value: id + ":" + k, label: tr[value] }));
    else if (id === "parity")
      choices = (["even", "odd", "neither"] as const).map((value, k) =>
        ({ value: id + ":" + k, label: tr[value] }));
    else {
      const alternatives = id === "domain" ?
        [joined, holeless, mid, "ℝ", show(interval(a, b, true, true))] :
        id === "range" ?
        ["(−∞; " + fmt(p.shift) + "]", "[" + fmt(p.shift) + "; +∞)", "ℝ ∖ {" + fmt(p.shift) + "}", "∅"] :
        ["∅", mid, left, right, joined, o.domain];
      choices = options(o[id], alternatives).map((label, k) => ({ value: id + ":" + k, label }));
    }
    const correct = id === "injective" ? id + ":1" :
      id === "parity" ? id + ":" + (o.parity === "odd" ? 1 : 2) : id + ":0";
    const rotate = (Math.abs(p.center) + i) % choices.length;
    return { id, label: names[id][locale === "pl" ? 0 : 1],
      value: correct, options: [...choices.slice(rotate), ...choices.slice(0, rotate)] };
  }) };
}

export const integratedAsymptoteFamilies: readonly UniversityFamily[] = [{
  id: "function-integrated-asymptotes", category: "functions",
  titles: { pl: "Sześć własności wykresu z dwiema asymptotami i ukośnymi odcinkami",
    en: "Six properties of a graph with two asymptotes and sloping outer segments" },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeIntegratedAsymptote,
}];

export function presentIntegratedAsymptote(p: IntegratedAsymptoteProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson, o = integratedAsymptoteOracle(p);
  const [a, b] = integratedPoles(p);
  const l1 = p.left[1];
  const poleAdjacent = p.left[1].x === a || p.right[0].x === b;
  lesson.work(t("Dziedzina", "Domain") + ": " + o.domain,
    t("Oba bieguny x=", "Both poles x=") + fmt(a) + ", x=" + fmt(b) + " " +
    (poleAdjacent
      ? t("są wykluczone. Końce odcinków przy asymptotach są puste; dalsze końce są pełne.",
          "are excluded. Segment endpoints at the poles are hollow; far endpoints are filled.")
      : t("są wykluczone. Zewnętrzne odcinki mają pełne końce.",
          "are excluded. Both finite outer segments have filled endpoints.")));
  lesson.work(t("Zbiór wartości", "Range") + ": " + o.range,
    t("Gałąź środkowa jest ciągła między asymptotami i biegnie od jednej nieskończoności do przeciwnej. Osiąga każde y; ukośne odcinki nie mogą już rozszerzyć W.",
      "The middle branch is continuous between the poles and runs from one infinity to the opposite. It attains every y, so the sloping outer segments cannot enlarge W."));
  lesson.work(t("Ścisły wzrost", "Strict increase") + ": " + o.increasing,
    t("Oceń znak nachylenia każdego odcinka. W środku znak pochodnej wynosi ",
      "Check each outer slope. In the middle the derivative sign is ") +
    (p.sign === -1 ? "+" : "−") + ". " +
    t("Nie łącz przedziałów przez asymptoty.",
      "Do not join intervals across the poles."));
  lesson.work(t("Ścisły spadek", "Strict decrease") + ": " + o.decreasing,
    (poleAdjacent
      ? t("Przedziały na końcach przy asymptotach są otwarte, a dalsze końce pełne. Środek jest otwarty; nie łącz części przez bieguny.",
          "Outer intervals are open at the poles and filled at far endpoints. The middle is open; do not join across poles.")
      : t("Oba zewnętrzne przedziały mają domknięte końce, a środek jest otwarty; rozdziel je mimo ewentualnej zgodności kierunków.",
          "Outer segments have closed endpoints and the middle is open; keep components separate even if their directions agree.")));

  lesson.work(t("Różnowartościowość", "Injectivity") + ": " + t("nie", "no"),
    t("Przykład: wartość y=", "For example, y=") + fmt(l1.y) + " " +
    t("występuje na lewym odcinku oraz dla pewnego innego x między biegunami, bo środek przyjmuje każde y.",
      "is attained on the left segment and also at another x between the poles, because the middle branch covers all y."));
  lesson.work(t("Parzystość", "Parity") + ": " +
    (o.parity === "odd" ? t("nieparzysta", "odd") : t("żadna", "neither")),
    t("Sprawdź symetrię dziedziny, położenie biegunów i odbicie obu odcinków. Środkowa gałąź o przeciwnych nieskończonościach wyklucza parzystość.",
      "Check domain symmetry, pole locations and both outer segments. Opposite pole limits exclude evenness for this middle branch."));
  return lesson.finish(
    t("Z jednego wykresu z dwiema pionowymi asymptotami i nachylonymi odcinkami podaj sześć własności: D, W, ścisły wzrost, ścisły spadek, różnowartościowość i parzystość.",
      "From one graph with two vertical asymptotes and sloping outer segments identify six properties: D, W, strict increase, strict decrease, injectivity and parity."),
    integratedAsymptoteAnswer(p, locale),
    t("Zacznij od asymptot i oddzielnych trzech części dziedziny.",
      "Start with the poles and the three separate domain components."),
    t("Porównaj granice, nachylenia wszystkich odcinków oraz przecięcia z jedną poziomą prostą.",
      "Compare pole limits, all segment slopes and intersections with a single horizontal line."));
}
