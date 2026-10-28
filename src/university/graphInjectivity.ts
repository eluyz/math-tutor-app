import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { GraphNode } from "./functionGraphs";
import { rational as r } from "../rational";
import { formatRational as fmt } from "../answers";
import { teaching } from "./teaching";

/**
 * Source-informed F05 method, not a transcription of any one original worksheet graph.
 * Two connected, nonzero-width linear segments. All coordinates are exact integers.
 */
export type GraphInjectivityProblem = Readonly<{
  kind: "function-graph-injectivity";
  nodes: readonly [GraphNode, GraphNode, GraphNode];
  leftClosed: boolean;
  rightClosed: boolean;
}>;

const patterns: readonly (readonly [number, number, number])[] = [
  [-3, -1, 2], // strictly increasing
  [3, 1, -2],  // strictly decreasing
  [-3, 3, -2], // turn: two x at a shared y
  [3, -3, 2],  // valley: two x at a shared y
  [-2, -2, 3], // horizontal first segment
  [3, -1, -1], // horizontal second segment
];

export function makeGraphInjectivity(variant: number, difficulty: Difficulty): GraphInjectivityProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["easy", "medium", "hard"].includes(difficulty))
    throw Error("Unsupported graph-injectivity variant");
  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
  const step = 2 + (variant + level) % 3;
  const start = variant - 11 + level * 2;
  const [first, middle, last] = patterns[(variant + level) % patterns.length];
  const offset = level === 2 ? 1 : 0;
  return {
    kind: "function-graph-injectivity",
    nodes: [
      { x: start, y: first + offset },
      { x: start + step, y: middle + offset },
      { x: start + 2 * step, y: last + offset },
    ],
    leftClosed: level === 0 || variant % 2 === 0,
    rightClosed: level === 0 || variant % 3 !== 0,
  };
}

/** For a continuous piecewise-linear graph of two positive-width segments,
 * strict and equally oriented slopes are necessary and sufficient for injectivity. */
export function isInjectiveGraph(p: GraphInjectivityProblem): boolean {
  const [a, b, c] = p.nodes;
  if (!(a.x < b.x && b.x < c.x) || ![a, b, c].every(n => Number.isSafeInteger(n.x) && Number.isSafeInteger(n.y)))
    throw Error("Invalid injectivity graph geometry");
  const d1 = b.y - a.y, d2 = c.y - b.y;
  return (d1 > 0 && d2 > 0) || (d1 < 0 && d2 < 0);
}

/** A horizontal level meeting the graph at at least two distinct included abscissae.
 * Interior levels avoid any ambiguity about open outer endpoints. */
export function duplicateHorizontalLevel(p: GraphInjectivityProblem): ReturnType<typeof r> | null {
  if (isInjectiveGraph(p)) return null;
  const [a, b, c] = p.nodes;
  if (a.y === b.y) return r(a.y);
  if (b.y === c.y) return r(b.y);
  // When the segments reverse directions, both interior y-ranges overlap.
  if (b.y > a.y && b.y > c.y) return r(Math.max(a.y, c.y) + b.y, 2);
  if (b.y < a.y && b.y < c.y) return r(Math.min(a.y, c.y) + b.y, 2);
  throw Error("Invalid duplicate level");
}

export const graphInjectivityFamilies: readonly UniversityFamily[] = [{
  id: "function-graph-injectivity", category: "functions",
  titles: {
    pl: "Różnowartościowość z wykresu — test poziomej prostej",
    en: "One-to-one graph test — horizontal lines",
  },
  supportedDifficulties: ["easy", "medium", "hard"],
  create: makeGraphInjectivity,
}];

export function presentGraphInjectivity(p: GraphInjectivityProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const [a, b, c] = p.nodes;
  const left = Math.sign(b.y - a.y), right = Math.sign(c.y - b.y);
  const word = (sign: number) => sign > 0 ? t("rośnie", "increases") :
    sign < 0 ? t("maleje", "decreases") : t("jest stała", "is constant");
  const injective = isInjectiveGraph(p), duplicated = duplicateHorizontalLevel(p);
  const yes = t("Tak — każda prosta pozioma przecina wykres najwyżej raz.",
    "Yes — every horizontal line meets the graph at most once.");
  const no = t("Nie — istnieje prosta pozioma przecinająca wykres co najmniej dwa razy.",
    "No — some horizontal line meets the graph at least twice.");
  lesson.work(t("Kierunek lewego odcinka", "Left segment trend") + ": " + word(left),
    t("Czytamy wartości y od lewej do prawej, pomijając wartości spoza dziedziny.",
      "Read y-values from left to right, excluding points outside the domain."));
  lesson.work(t("Kierunek prawego odcinka", "Right segment trend") + ": " + word(right),
    t("Sprawdź, czy kierunek się zmienia lub pojawia się poziomy fragment.",
      "Check for a turn or a horizontal section."));
  if (duplicated !== null) {
    lesson.work("y = " + fmt(duplicated),
      t("Ta prosta pozioma przecina wykres w co najmniej dwóch różnych punktach o różnych x, więc funkcja nie jest różnowartościowa.",
        "This horizontal line intersects at two or more different x-values, so the function is not one-to-one."));
  } else {
    lesson.work(t("Ściśle jednakowy kierunek na obu odcinkach", "Same strictly monotone direction on both segments"),
      t("Wspólny wierzchołek nie powtarza wartości y przy innym x. Dowolny poziom może wystąpić najwyżej raz.",
        "The shared vertex does not repeat its y-value at another x. Every horizontal level occurs at most once."));
  }
  lesson.work(t("Wynik testu poziomej prostej", "Horizontal-line test result") + ": " + (injective ? yes : no),
    t("To liczba przecięć z prostą poziomą, a nie liczba odcinków wykresu, rozstrzyga różnowartościowość.",
      "The number of intersections with a horizontal line, not the number of segments, determines injectivity."));
  return lesson.finish(
    t("Czy funkcja przedstawiona na wykresie jest różnowartościowa? Uzasadnij testem prostej poziomej.",
      "Is the graphed function one-to-one? Use the horizontal-line test."),
    {
      kind: "choice",
      value: injective ? "injective" : "not-injective",
      options: [{ value: "injective", label: yes }, { value: "not-injective", label: no }],
    },
    t("Wyobraź sobie poziomą prostą y=c. Czy może przecinać wykres w dwóch różnych punktach?",
      "Imagine a horizontal line y=c. Can it cross the graph at two different x-values?"),
    t("Sprawdź oba odcinki osobno. Zmiana kierunku lub odcinek poziomy tworzy powtórzoną wartość y.",
      "Check both segments. A turn or a horizontal section creates a repeated y-value."),
  );
}
