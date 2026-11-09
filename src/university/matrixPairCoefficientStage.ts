import {
  rational as r, addRational as add, subtractRational as sub,
  equalRational as eq, type Rational,
} from "../rational";
import { formatRational as fmt } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import { product, inverse, identity, type ExactMatrix } from "./linearAlgebraMath";
import { teaching } from "./teaching";
import type { UniversityFamily } from "./schema";

/** Synthetic M05 matrix-coefficient exercise model, registered via the family below. */
export type CoupledCoefficientProblem = Readonly<{
  a: ExactMatrix; b: ExactMatrix; c: ExactMatrix; d: ExactMatrix;
}>;

const plus = (a: ExactMatrix, b: ExactMatrix): ExactMatrix =>
  a.map((row, i) => row.map((v, j) => add(v, b[i][j])));
const minus = (a: ExactMatrix, b: ExactMatrix): ExactMatrix =>
  a.map((row, i) => row.map((v, j) => sub(v, b[i][j])));
const same = (a: ExactMatrix, b: ExactMatrix): boolean =>
  a.length === b.length && a.every((row, i) =>
    row.length === b[i]?.length && row.every((v, j) => eq(v, b[i][j])));
const printed = (a: ExactMatrix): string =>
  "[" + a.map(row => "[" + row.map(fmt).join(", ") + "]").join("; ") + "]";

/** Source-method shape: X+AY=C, BX+Y=D with AB != BA and det(I-AB) != 0. */
export function makeCoupledCoefficientProblem(variant: number, level: Difficulty): CoupledCoefficientProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 || level === "easy")
    throw Error("Expected a variant 0..23 and difficulty medium..expert");
  const tier = level === "medium" ? 0 : level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const p = 2 + (variant + tier) % 3;
  const q = 2 + (2 * variant + tier) % 3;
  const a: ExactMatrix = [[r(1), r(p)], [r(0), r(1)]];
  const b: ExactMatrix = [[r(2), r(0)], [r(q), r(2)]];
  const x: ExactMatrix = [
    [r((variant + 2 * tier) % 9 - 4, tier === 3 ? 2 : 1), r((2 * variant + tier) % 11 - 5)],
    [r((3 * variant + tier) % 9 - 4), r((variant + tier) % 7 - 3, tier >= 2 ? 2 : 1)],
  ];
  const y: ExactMatrix = [
    [r((variant + tier) % 7 - 3), r((variant + 4 * tier) % 13 - 6, tier >= 1 ? 2 : 1)],
    [r((variant + 3 * tier) % 9 - 4), r((2 * variant + tier) % 9 - 4, tier === 3 ? 2 : 1)],
  ];
  return { a, b, c: plus(x, product(a, y)), d: plus(product(b, x), y) };
}

export function solveCoupledCoefficientProblem(problem: CoupledCoefficientProblem):
  { x: ExactMatrix; y: ExactMatrix; inverseFactor: ExactMatrix } {
  const { a, b, c, d } = problem;
  if ([a, b, c, d].some(m => m.length !== 2 || m.some(row => row.length !== 2)))
    throw Error("Expected four 2x2 matrices");
  // Y=D-BX, so (I-AB)X=C-AD. In particular, AB cannot be replaced by BA.
  const inv = inverse(minus(identity(2), product(a, b)));
  if (!inv.value) throw Error("I-AB must be invertible");
  const x = product(inv.value, minus(c, product(a, d)));
  const y = minus(d, product(b, x));
  if (!same(plus(x, product(a, y)), c) || !same(plus(product(b, x), y), d))
    throw Error("Coupled matrix equation substitution failed");
  return { x, y, inverseFactor: inv.value };
}

/** Bilingual hints/steps and 8 exact answers for later serialized UI integration. */
export function presentCoupledCoefficientStage(problem: CoupledCoefficientProblem, locale: Locale) {
  const { a, b, c, d } = problem;
  const { x, y, inverseFactor } = solveCoupledCoefficientProblem(problem);
  const pl = locale === "pl";
  return {
    question: (pl ? "Rozwiąż układ równań macierzowych" : "Solve the coupled matrix equations") +
      ": X + AY = C; BX + Y = D. A=" + printed(a) + ", B=" + printed(b) +
      ", C=" + printed(c) + ", D=" + printed(d) + ". " +
      (pl ? "Podaj osiem elementów X oraz Y." : "Enter all eight entries of X and Y."),
    hints: [
      pl ? "Z drugiego równania wyznacz Y=D−BX i podstaw do pierwszego." :
        "Rearrange the second equation as Y=D−BX and substitute into the first.",
      pl ? "(I−AB)X=C−AD, zatem X=(I−AB)⁻¹(C−AD). Kolejność czynników ma znaczenie." :
        "(I−AB)X=C−AD, hence X=(I−AB)⁻¹(C−AD). Matrix order matters.",
    ] as const,
    steps: [
      "BX+Y=D ⇒ Y=D−BX",
      "X+A(D−BX)=C ⇒ (I−AB)X=C−AD",
      "(I−AB)⁻¹=" + printed(inverseFactor),
      "X=(I−AB)⁻¹(C−AD)=" + printed(x),
      "Y=D−BX=" + printed(y),
      "X+AY=" + printed(plus(x, product(a, y))) +
        "=C; BX+Y=" + printed(plus(product(b, x), y)) + "=D",
    ] as const,
    answer: [...x.flat(), ...y.flat()] as readonly Rational[],
  };
}

/** Exact rational-value oracle only; app text parsing remains an integration gate. */
export function acceptsCoupledCoefficientAnswer(problem: CoupledCoefficientProblem,
  cells: readonly (Rational | null)[]): boolean {
  if (cells.length !== 8 || cells.some(cell => cell === null)) return false;
  const { x, y } = solveCoupledCoefficientProblem(problem);
  return [...x.flat(), ...y.flat()].every((expected, i) =>
    cells[i] !== null && eq(expected, cells[i]!));
}


/** Student-visible adapter; keeps the original synthetic stage oracle unchanged. */
export const matrixCoefficientPairFamilies: readonly UniversityFamily[] = [{
  id: "matrix-coefficient-coupled-equations",
  category: "matrices",
  titles: {
    pl: "Układ równań z macierzami przy X i Y",
    en: "Coupled equations with matrix coefficients",
  },
  supportedDifficulties: ["medium", "hard", "advanced", "expert"],
  create: (variant, level) => ({
    kind: "linear-matrix-coefficient-pair" as const,
    ...makeCoupledCoefficientProblem(variant, level),
  }),
}];

export function presentCoupledCoefficientTask(problem: CoupledCoefficientProblem, locale: Locale) {
  const stage = presentCoupledCoefficientStage(problem, locale);
  const lesson = teaching(locale), { t } = lesson;
  const explanations: readonly [string, string][] = [
    ["Przenosimy BX, zachowując kolejność mnożenia.", "Move BX and keep matrix multiplication order."],
    ["Podstawiamy Y; rozdzielność mnożenia daje ABX, nie BAX.", "Substitute Y; distributivity gives ABX, not BAX."],
    ["Macierz I−AB jest odwracalna, obliczamy jej dokładną odwrotność.", "I−AB is invertible; compute its exact inverse."],
    ["Mnożymy przez odwrotność z lewej strony, nie przestawiając czynników.", "Multiply on the left by the inverse without swapping factors."],
    ["Podstawiamy obliczone X do drugiego równania.", "Substitute the computed X in the second equation."],
    ["Sprawdzamy oba pierwotne równania element po elemencie.", "Check both original matrix equations entry by entry."],
  ];
  stage.steps.forEach((step, i) => lesson.work(step, t(...explanations[i])));
  const labels = ["X[1,1]", "X[1,2]", "X[2,1]", "X[2,2]",
    "Y[1,1]", "Y[1,2]", "Y[2,1]", "Y[2,2]"];
  return lesson.finish(stage.question, {kind: "list", values: stage.answer, labels},
    stage.hints[0], stage.hints[1]);
}
