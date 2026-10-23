import { rational as r, type Rational } from "../rational";
import { formatRational as fmt } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type GraphNode = Readonly<{ x: number; y: number }>;
/** A bounded, continuous piecewise-linear graph. All coordinates are exact integers. */
export type FunctionGraphProblem = Readonly<{
  nodes: readonly [GraphNode, GraphNode, GraphNode];
  leftClosed: boolean;
  rightClosed: boolean;
}> & (
  | Readonly<{ kind: "function-graph-domain-range"; target: "domain" | "range" }>
  | Readonly<{ kind: "function-graph-zeros"; target: "zeros" }>
);

function domainRange(v: number, difficulty: Difficulty): FunctionGraphProblem {
  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
  const left = v - 11, step = 2 + ((v + level) % 3);
  return {
    kind: "function-graph-domain-range",
    nodes: [
      { x: left, y: v % 3 === 0 ? -4 : v % 5 - 2 },
      { x: left + step, y: v % 2 === 0 ? 3 : -3 },
      { x: left + 2 * step, y: v % 3 === 1 ? 4 : (3 * v) % 5 - 2 },
    ],
    leftClosed: level === 0 || v % 2 === 0,
    rightClosed: level === 0 || (level === 1 ? v % 3 !== 0 : v % 3 === 0),
    target: v % 2 === 0 ? "domain" : "range",
  };
}
function zeros(v: number, difficulty: Difficulty): FunctionGraphProblem {
  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
  const left = v - 11, step = 2 * (1 + ((v + level) % 3));
  const height = (1 + v % 3) * (v % 2 === 0 ? 1 : -1);
  return {
    kind: "function-graph-zeros",
    nodes: [
      { x: left, y: -height },
      { x: left + step, y: height },
      { x: left + 2 * step, y: -height },
    ],
    leftClosed: level === 0 || v % 2 === 0,
    rightClosed: level === 0 || v % 3 === 0,
    target: "zeros",
  };
}
export const functionGraphFamilies: readonly UniversityFamily[] = [
  { id: "function-graph-domain-range", category: "functions",
    titles: { pl: "Dziedzina i zbiór wartości z wykresu", en: "Domain and range from a graph" },
    supportedDifficulties: ["easy", "medium", "hard"], create: domainRange },
  { id: "function-graph-zeros", category: "functions",
    titles: { pl: "Miejsca zerowe z wykresu", en: "Zeros from a graph" },
    supportedDifficulties: ["easy", "medium", "hard"], create: zeros },
];
function included(p: FunctionGraphProblem, index: number): boolean {
  return index === 1 || (index === 0 ? p.leftClosed : p.rightClosed);
}
type Endpoint = Readonly<{ value: number; closed: boolean }>;
function interval(a: Endpoint, b: Endpoint): string {
  return (a.closed ? "[" : "(") + fmt(r(a.value)) + "; " + fmt(r(b.value)) + (b.closed ? "]" : ")");
}
export function graphDomainRange(p: FunctionGraphProblem, target: "domain" | "range"): Readonly<{lo: Endpoint; hi: Endpoint}> {
  const nodes = p.nodes;
  if (target === "domain")
    return { lo: { value: nodes[0].x, closed: p.leftClosed }, hi: { value: nodes[2].x, closed: p.rightClosed } };
  const ys = nodes.map(node => node.y), lo = Math.min(...ys), hi = Math.max(...ys);
  return {
    lo: { value: lo, closed: ys.some((y,i) => y === lo && included(p,i)) },
    hi: { value: hi, closed: ys.some((y,i) => y === hi && included(p,i)) },
  };
}
export function graphZeros(p: FunctionGraphProblem): readonly Rational[] {
  const zeros: Rational[] = [];
  for (let i = 0; i < 2; i++) {
    const a = p.nodes[i], b = p.nodes[i+1];
    if (a.y === 0 && included(p, i) && !zeros.some(x => x.numerator === BigInt(a.x) && x.denominator === 1n))
      zeros.push(r(a.x));
    if (a.y * b.y < 0)
      zeros.push(r(a.x * (b.y - a.y) - a.y * (b.x - a.x), b.y - a.y));
    if (i === 1 && b.y === 0 && included(p,2)) zeros.push(r(b.x));
  }
  return zeros;
}
export function graphPlainText(p: Pick<FunctionGraphProblem,"nodes"|"leftClosed"|"rightClosed">, locale: Locale): string {
  const t = (pl:string,en:string) => locale === "pl" ? pl : en;
  const points = p.nodes.map(node => "(" + fmt(r(node.x)) + ", " + fmt(r(node.y)) + ")").join(" → ");
  return t("Wykres funkcji jest łamaną przez punkty", "The function graph is a polyline through points") + ": " + points + ". " +
    t("Lewy koniec", "Left endpoint") + ": " + (p.leftClosed ? t("zamknięty","closed") : t("otwarty","open")) + ". " +
    t("Prawy koniec", "Right endpoint") + ": " + (p.rightClosed ? t("zamknięty","closed") : t("otwarty","open")) + ". " +
    t("Punkt środkowy należy do wykresu.", "The middle point belongs to the graph.");
}
function choice(correct: string, wrongs: readonly string[], seed: number) {
  const labels = [...new Set([correct,...wrongs,"ℝ","∅"])].slice(0,4);
  if (labels.length !== 4) throw new Error("Missing distinct graph choices");
  const values = labels.map((label,i) => ({value:"graph-option:"+i,label}));
  const shift = (seed + 24) % values.length;
  return { kind: "choice" as const, value: values[0].value,
    options: [...values.slice(shift), ...values.slice(0,shift)] };
}
export function presentFunctionGraph(p: FunctionGraphProblem, locale: Locale) {
  const lesson = teaching(locale), {t} = lesson;
  const prompt = t("Odczytaj odpowiedź z wykresu poniżej.", "Read the answer from the graph below.");
  if (p.target === "zeros") {
    const roots = graphZeros(p);
    if (roots.length !== 2) throw new Error("Two roots required in graph task");
    const correct = "x = " + roots.map(fmt).join("; x = ");
    const [left, mid, right] = p.nodes;
    lesson.work("y = 0: (" + fmt(roots[0]) + "; 0), (" + fmt(roots[1]) + "; 0)",
      t("Miejsca zerowe to współrzędne x punktów przecięcia wykresu z osią poziomą.",
        "Zeros are the x-coordinates where the graph crosses the horizontal axis."));
    lesson.work(t("Analiza odcinków", "Examine both segments") + ": (" + left.x + "; " + mid.x + "), (" + mid.x + "; " + right.x + ")",
      t("Każdy z dwóch liniowych odcinków przecina poziom zero dokładnie raz.",
        "Each of the two straight segments intersects the zero level exactly once."));
    lesson.work(t("Miejsca zerowe", "Function zeros") + ": " + correct,
      t("Zapisujemy wartości x, a nie współrzędne wierzchołków wykresu.",
        "Record the x-values, not the vertices of the graph."));
    return lesson.finish(t("Podaj wszystkie miejsca zerowe funkcji.", "Give all zeros of the function.") + "\n" + prompt,
      choice(correct, [
        "x = " + fmt(r(left.x)) + "; x = " + fmt(r(right.x)),
        "x = " + fmt(r(mid.x)),
        "x = " + fmt(roots[0]),
      ],left.x+24),
      t("Szukaj przecięć linii z osią x, czyli punktów o wysokości y=0.",
        "Look for the intersections with the x-axis, at height y=0."),
      t("Każdy z dwóch odcinków przecina oś x. Ustal poziome współrzędne tych punktów.",
        "Both segments cross the x-axis. Read the horizontal coordinates of these intersections."));
  }
  const {lo,hi} = graphDomainRange(p,p.target), correct = interval(lo,hi);
  const axis = p.target === "domain" ? "x" : "y";
  lesson.work(t("Skrajne odczyty z osi", "Read the extreme values along the axis") + " " + axis + ": " + fmt(r(lo.value)) + ", " + fmt(r(hi.value)),
    t("Na właściwej osi wskazujemy najmniejszą i największą wartość widoczną na wykresie.",
      "Read the smallest and largest values along the requested coordinate axis."));
  lesson.work(t("Zawartość końców", "Endpoint inclusion") + ": " +
    (lo.closed ? t("lewy domknięty", "left included") : t("lewy otwarty", "left excluded")) + ", " +
    (hi.closed ? t("prawy domknięty", "right included") : t("prawy otwarty", "right excluded")),
    t("Puste kółko oznacza wyłączony koniec; punkt wewnętrzny zawsze należy do wykresu.",
      "Hollow circles exclude endpoints; an internal vertex always belongs to the graph."));
  lesson.work(t("Odpowiedni przedział", "Resulting interval") + ": " + correct,
    t("Kwadratowe nawiasy obejmują wartości skrajne, a okrągłe je wyłączają.",
      "Square brackets include extreme values, whereas parentheses exclude them."));
  return lesson.finish((p.target === "domain" ?
    t("Wyznacz dziedzinę funkcji z wykresu.", "Find the function's domain from the graph.") :
    t("Wyznacz zbiór wartości funkcji z wykresu.", "Find the function's range from the graph.")) + "\n" + prompt,
    choice(correct, [
      interval({...lo,closed:!lo.closed},{...hi,closed:!hi.closed}),
      interval({value:lo.value-1,closed:true},hi),
      interval(lo,{value:hi.value+1,closed:true}),
    ],p.nodes[0].x+24),
    p.target === "domain" ? t("Dziedzina dotyczy współrzędnych x.", "The domain uses x-coordinates.") :
      t("Zbiór wartości dotyczy współrzędnych y.", "The range uses y-coordinates."),
    t("Sprawdź najmniejszą i największą wartość oraz czy są osiągane. Puste kółka oznaczają wyłączenie.",
      "Check both extremes and whether each is attained. Hollow endpoints mean exclusion."));
}
