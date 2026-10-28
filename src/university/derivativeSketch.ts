import { rational as r } from "../rational";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/** A bounded, mathematically generated chart; paper drawing is self-assessed. */
export type DerivativeSketchProblem = Readonly<{
  kind: "derivative-sign-sketch";
  pole: number;
  radius: number;
  verticalShift: number;
  orientation: 1 | -1;
}>;

export function makeDerivativeSketch(variant: number, difficulty: Difficulty): DerivativeSketchProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
    !["hard", "advanced", "expert"].includes(difficulty))
    throw Error("Unsupported derivative sign-chart sketch");
  return {
    kind: "derivative-sign-sketch",
    pole: variant % 8 - 4,
    radius: 1 + Math.floor(variant / 8),
    verticalShift: difficulty === "hard" ? 0 : difficulty === "advanced" ? 2 : -2,
    orientation: difficulty === "expert" ? -1 : 1,
  };
}

export function sketchGeometry(p: DerivativeSketchProblem) {
  const { pole: a, radius: s, verticalShift: v, orientation: e } = p;
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(s) || s < 1 ||
    !Number.isSafeInteger(v) || (e !== 1 && e !== -1))
    throw Error("Invalid derivative sketch geometry");
  return {
    excluded: a,
    leftX: a - s,
    leftY: v - 2 * e * s,
    rightX: a + s,
    rightY: v + 2 * e * s,
    leftKind: e === 1 ? "maximum" as const : "minimum" as const,
    rightKind: e === 1 ? "minimum" as const : "maximum" as const,
    obliqueIntercept: v - e * a,
  };
}

export const derivativeSketchFamilies: readonly UniversityFamily[] = [{
  id: "derivative-sign-sketch", category: "derivatives",
  titles: {
    pl: "Szkic funkcji z tabeli znaków pochodnych — na kartce",
    en: "Sketch from derivative sign charts — on paper",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: makeDerivativeSketch,
}];

export function presentDerivativeSketch(p: DerivativeSketchProblem, locale: Locale) {
  const g = sketchGeometry(p), lesson = teaching(locale), { t } = lesson;
  const { pole: a, radius: s, verticalShift: v, orientation: e } = p;
  const sign = e === 1 ? "+" : "−", reverse = e === 1 ? "−" : "+";
  const expression = (e === 1 ? "" : "−") +
    "[(x−(" + a + ")) + " + (s * s) + "/(x−(" + a + "))] + (" + v + ")";
  lesson.work("D = ℝ \\ {" + a + "}; x = " + a,
    t("Mianownik wyklucza x=a. Prosta x=a jest asymptotą pionową, nie punktem przegięcia.",
      "The denominator excludes x=a. The line x=a is a vertical asymptote, not an inflection point."));
  lesson.work("y = " + e + "·(x−(" + a + ")) + (" + v + ")",
    t("Człon wymierny znika dla |x|→∞, dlatego otrzymujemy asymptotę ukośną.",
      "The rational term tends to zero as |x|→∞, giving an oblique asymptote."));
  lesson.work("f′(x) = " + e + "·[1−" + (s * s) + "/(x−(" + a + "))²]; f′=0 ⇔ x=" + g.leftX + t(" lub ", " or ") + g.rightX,
    t("Pochodna znika w dwóch punktach, ale w x=a nie istnieje funkcja.",
      "The derivative vanishes at two points, but the function is undefined at x=a."));
  lesson.work("f′: " + sign + ", " + reverse + " | x=" + a + t(" wyłączone ", " excluded ") + " | " + reverse + ", " + sign,
    t("Znaki na kolejnych przedziałach określają monotoniczność i naprzemienność ekstremów.",
      "The signs on successive intervals determine monotonicity and classify the extrema."));
  lesson.work("f(" + g.leftX + ")=" + g.leftY + "; f(" + g.rightX + ")=" + g.rightY,
    t("Współrzędne punktów obliczamy z funkcji, a ich rodzaj z przejścia znaków f′.",
      "Evaluate the function at both stationary points; the f′ transitions determine their type."));
  lesson.work("f″(x) = " + (2 * e * s * s) + "/(x−(" + a + "))³; f″: " + reverse + " (x<" + a + "), " + sign + " (x>" + a + ")",
    t("Zmiana wklęsłości po obu stronach asymptoty nie tworzy punktu przegięcia, bo x=a jest poza dziedziną.",
      "Concavity changes across the vertical asymptote but does not create an inflection: x=a lies outside the domain."));
  lesson.work(t("Samodzielna kontrola szkicu na kartce", "Self-check the drawing on paper") +
    ": x=" + a + ", " + (g.leftKind === "maximum" ? t("maksimum", "maximum") : t("minimum", "minimum")) + " (" + g.leftX + ", " + g.leftY + "), " +
    (g.rightKind === "maximum" ? t("maksimum", "maximum") : t("minimum", "minimum")) + " (" + g.rightX + ", " + g.rightY + ")",
    t("Rysunek nie jest oceniany automatycznie. Porównaj dwie rozłączne gałęzie, asymptoty, ekstrema, wklęsłość i stronę asymptoty ukośnej ze szkicem referencyjnym.",
      "The drawing is not automatically graded. Compare both disconnected branches, asymptotes, extrema, concavity and position relative to the oblique asymptote with the reference sketch."));
  return lesson.finish(
    t("Na kartce naszkicuj funkcję na podstawie tabeli znaków f′ i f″ poniżej. Zaznacz obie asymptoty i ekstrema. Rysunek oceniasz samodzielnie; aplikacja sprawdza tylko współrzędne obu ekstremów. Wpisz kolejno x₁,y₁,x₂,y₂ od lewej do prawej.",
      "Sketch the function on paper from the f′ and f″ sign chart below. Mark both asymptotes and extrema. You assess the drawing yourself; the app checks only the coordinates of both extrema. Enter x₁,y₁,x₂,y₂ from left to right.") +
    "\nf(x) = " + expression,
    { kind: "list", labels: ["x₁", "y₁", "x₂", "y₂"],
      values: [r(g.leftX), r(g.leftY), r(g.rightX), r(g.rightY)] },
    t("Tabela f′ określa wzrost i spadek, a tabela f″ wklęsłość. Pamiętaj o pionowej asymptocie.",
      "The f′ row determines increasing/decreasing intervals and f″ gives concavity. Remember the vertical asymptote."),
    t("Punkty stacjonarne: x=a−s i x=a+s. Ich rzędne oblicz z funkcji; osobno sprawdź asymptoty.",
      "Stationary points: x=a−s and x=a+s. Evaluate the function there and check the asymptotes separately."),
  );
}
