import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { GapNode } from "./graphGaps";
import { teaching } from "./teaching";

/** Bounded F05 graph-range exercise, inspired by six visually verified source examples.
 * This is NOT a transcription of a private worksheet diagram. */
export type GraphGapRangeProblem = Readonly<{
  kind: "function-disconnected-range";
  left: readonly [GapNode, GapNode, GapNode];
  right: readonly [GapNode, GapNode];
  /** First left, second left, first right, last right endpoint inclusion. The middle left point is always removed. */
  included: readonly [boolean, boolean, boolean, boolean];
}>;

export type YInterval = Readonly<{
  lo: number; hi: number; closedLo: boolean; closedHi: boolean;
}>;

const patterns: readonly (readonly [readonly [number, number, number], readonly [number, number]])[] = [
  [[-2, 0, 2], [3, 4]],   // genuine missing y-height and distant second range
  [[-2, 0, 2], [0, 3]],   // missing x but y-height restored by right branch
  [[-2, 1, -2], [2, 3]],  // missing peak and disjoint range
  [[0, 2, 4], [1, 3]],    // overlapping y-images restore missing height
  [[-1, -1, -1], [1, 2]], // removed x in flat line retains its y-value
  [[-3, -1, -2], [0, 2]], // genuine separated y-images
];
const node = (x: number, y: number): GapNode => ({ x, y });

export function makeGraphGapRange(variant: number, difficulty: Difficulty): GraphGapRangeProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(difficulty))
    throw Error("Unsupported disconnected range variant");
  const level = difficulty === "hard" ? 0 : difficulty === "advanced" ? 1 : 2;
  const start = variant - 11 + 3 * level;
  const delta = level === 1 ? -1 : 0;
  const [l, q] = patterns[(variant + level) % patterns.length];
  return {
    kind: "function-disconnected-range",
    left: [node(start, l[0] + delta), node(start + 2, l[1] + delta), node(start + 4, l[2] + delta)],
    right: [node(start + 7, q[0] + delta), node(start + 11, q[1] + delta)],
    included: [
      variant % 2 === 0 || level === 0,
      variant % 3 !== 0 || level === 2,
      (variant + level) % 2 === 0,
      (variant + level) % 3 !== 0,
    ],
  };
}

function segmentImage(a: GapNode, b: GapNode, includedA: boolean, includedB: boolean): YInterval {
  if (!(a.x < b.x) || ![a.y,b.y].every(Number.isSafeInteger))
    throw Error("Invalid graph segment");
  if (a.y === b.y) return { lo: a.y, hi: a.y, closedLo: true, closedHi: true };
  if (a.y < b.y)
    return { lo: a.y, hi: b.y, closedLo: includedA, closedHi: includedB };
  return { lo: b.y, hi: a.y, closedLo: includedB, closedHi: includedA };
}

/** Exact union of three continuous segment images, respecting excluded x endpoints.
 * A hollow x does not remove y if another valid x (even on a different branch) still attains it. */
export function disconnectedRange(p: GraphGapRangeProblem): readonly YInterval[] {
  const [a, h, b] = p.left, [c, d] = p.right;
  if (!(a.x < h.x && h.x < b.x && b.x < c.x && c.x < d.x) ||
      ![a,h,b,c,d].every(n=>Number.isSafeInteger(n.x)&&Number.isSafeInteger(n.y)))
    throw Error("Invalid disconnected/holey graph geometry");
  const [ac, bc, cc, dc] = p.included;
  const images = [
    segmentImage(a, h, ac, false),
    segmentImage(h, b, false, bc),
    segmentImage(c, d, cc, dc),
  ].sort((u, v) => u.lo - v.lo || Number(v.closedLo) - Number(u.closedLo));
  const merged: YInterval[] = [];
  for (const next of images) {
    const last = merged[merged.length - 1];
    if (!last || next.lo > last.hi || (next.lo === last.hi && !last.closedHi && !next.closedLo)) {
      merged.push(next); continue;
    }
    if (next.hi > last.hi) {
      merged[merged.length - 1] = { ...last, hi: next.hi, closedHi: next.closedHi };
    } else if (next.hi === last.hi) {
      merged[merged.length - 1] = { ...last, closedHi: last.closedHi || next.closedHi };
    }
  }
  return merged;
}

const fmt = (x: number) => String(x).replace(/-/g, "−");
export function formatRange(intervals: readonly YInterval[]): string {
  return intervals.map(({ lo, hi, closedLo, closedHi }) =>
    lo === hi ? "{" + fmt(lo) + "}" :
    (closedLo ? "[" : "(") + fmt(lo) + "; " + fmt(hi) + (closedHi ? "]" : ")")
  ).join(" ∪ ");
}

function choices(correct: string, others: readonly string[], variant: number) {
  const labels = [...new Set([correct, ...others, "ℝ", "∅", "(−∞; ∞)", "{0}"])].slice(0, 4);
  if (labels.length !== 4) throw Error("Four different answer choices required");
  const options = labels.map((label, i) => ({ label, value: "range-gap:" + i }));
  const shift = variant % 4;
  return { kind: "choice" as const, value: options[0].value,
    options: [...options.slice(shift), ...options.slice(0, shift)] };
}

export const graphGapRangeFamilies: readonly UniversityFamily[] = [{
  id: "function-disconnected-range", category: "functions",
  titles: {
    pl: "Zbiór wartości wykresu z dziurą i rozdzielonymi gałęziami",
    en: "Range of a disconnected graph with a hole",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeGraphGapRange,
}];

export function presentGraphGapRange(p: GraphGapRangeProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const images = disconnectedRange(p);
  const correct = formatRange(images);
  const [a,h,b] = p.left, [c,d] = p.right, [ac,bc,cc,dc] = p.included;
  const img1 = segmentImage(a,h,ac,false);
  const img2 = segmentImage(h,b,false,bc);
  const img3 = segmentImage(c,d,cc,dc);
  lesson.work(t("Pierwszy odcinek lewej gałęzi", "First segment of the left branch") + ": " + formatRange([img1]),
    t("Odczytujemy wysokości y, a nie argumenty x. Pusty punkt wewnętrzny nie należy do pierwszego odcinka.",
      "Read y-heights, not x-values. The open internal point is excluded from the first segment."));
  lesson.work(t("Drugi odcinek lewej gałęzi", "Second segment of the left branch") + ": " + formatRange([img2]),
    t("Uwzględniamy ciągły fragment od pustego punktu do prawego końca lewej gałęzi.",
      "Include the continuous segment from the hollow point to the right endpoint of the left branch."));
  lesson.work(t("Oddzielna prawa gałąź", "Separate right branch") + ": " + formatRange([img3]),
    t("Jej zbiór wartości łączymy z wartościami lewej gałęzi bez łączenia odległych argumentów x.",
      "Union its y-values with the left branch even though their x-domains are disconnected."));
  lesson.work(t("Połącz i uprość zbiory wartości", "Merge and simplify the y-images") + ": " + correct,
    t("Wysokość pustego punktu może nadal występować przy innym dozwolonym x. Dwa przedziały wysokości łączymy tylko gdy nie ma brakującej wysokości między nimi.",
      "A hollow point's height may still occur at another allowed x. Merge y-intervals only when no height is missing between them."));
  return lesson.finish(
    t("Wyznacz cały zbiór wartości W funkcji z wykresu, uwzględniając obie gałęzie i dziurę.",
      "Find the entire range W of the graphed function, including both branches and the hole."),
    choices(correct, [
      formatRange([{ lo: images[0].lo, hi: images.at(-1)!.hi,
        closedLo: images[0].closedLo, closedHi: images.at(-1)!.closedHi }]),
      formatRange([img1, img2]),
      formatRange([img3]),
    ],a.x+35),
    t("Patrz na wysokości y. Czy y z pustego punktu może pojawić się gdzie indziej?",
      "Read heights y. Can the hollow point's y-height occur elsewhere?"),
    t("Zapisz osobno obrazy y trzech odcinków, a następnie złącz przedziały i sprawdź nawiasy.",
      "Write the three segments' y-images separately, then union the intervals and check endpoint brackets."),
  );
}
