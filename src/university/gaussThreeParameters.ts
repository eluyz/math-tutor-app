import { addRational as add, multiplyRational as mul, subtractRational as sub, rational as r, type Rational } from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { classifySystem, gaussianElimination, parameterization } from "./linearAlgebraMath";
import { teaching, type Presentation } from "./teaching";

type Linear = Extract<LinearAlgebraProblem, { kind: "linear-system" }>;
const names = ["x", "y", "z", "w", "v"];
const pivotsByVariant: readonly (readonly number[])[] = [[0, 1], [0, 3], [1, 3], [2, 4]];
const zero = r(0), one = r(1);
const combine = (a: readonly Rational[], b: readonly Rational[], x: number, y: number): Rational[] =>
  a.map((v, i) => add(mul(r(x), v), mul(r(y), b[i])));
const compact = (matrix: readonly (readonly Rational[])[]) =>
  "[" + matrix.map(row => "[" + row.map(fmt).join(", ") + "]").join("; ") + "]";

/** U06/U08 candidate: 4 exact equations, 5 unknowns, rank(A)=rank([A|b])=2.
 * All 3 free parameters are required. Staged in isolation: do not register
 * in the shared student catalog without the separate integration review.
 * The augmented rows are exact invertible combinations of a rank-two basis. */
export function constructGaussThreeParameters(variant: number, level: Difficulty): Linear {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(level))
    throw Error("Unsupported three-parameter Gaussian variant");
  const pivots = pivotsByVariant[variant % pivotsByVariant.length];
  const free = Array.from({ length: 5 }, (_, i) => i).filter(i => !pivots.includes(i));
  const denominator = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const basis = pivots.map((pivot, i) => {
    const row = Array.from({ length: 5 }, () => zero);
    row[pivot] = one;
    for (const [k, col] of free.entries()) if (col > pivot) {
      const value = (variant + 2 * i + 3 * k) % 9 - 4;
      row[col] = r(value === 0 ? (i % 2 ? -2 : 1) : value, denominator);
    }
    return [...row, r(variant - 11 + 5 * i, denominator)];
  });
  // Two independent augmented rows and two redundant equations, preserving
  // the entire affine solution set (not merely a solution at t1=t2=t3=0).
  const rows = [
    [...basis[0]], [...basis[1]],
    combine(basis[0], basis[1], 1, 1),
    combine(basis[0], basis[1], 2, -1),
  ];
  rows[0] = combine(rows[0], rows[1], 1, 2);
  rows[1] = combine(rows[1], rows[0], 1, -1);
  if (variant % 2) [rows[0], rows[3]] = [rows[3], rows[0]];
  const augmented = rows.map((row, i) => row.map(value =>
    mul(value, r((variant + i) % 2 ? -2 : 3, level === "expert" ? 2 : 1))));
  return { kind: "linear-system", method: "parameters",
    matrix: augmented.map(row => row.slice(0, 5)),
    rhs: augmented.map(row => row[5]) };
}

export const gaussThreeParameterFamilies: readonly UniversityFamily[] = [{
  id: "gauss-five-three-parameters",
  category: "systems",
  titles: {
    pl: "Gauss 4×5: pełne rozwiązanie z trzema parametrami",
    en: "Gauss 4×5: full solution with three parameters",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  create: constructGaussThreeParameters,
}];

/** Complete affine answer for all five variables: c + a*t1 + b*t2 + d*t3.
 * Free variables are the left-to-right nonpivot columns of exact RREF.
 * Every original equation is checked against all four affine coefficients. */
export function presentGaussThreeParameters(problem: Linear, locale: Locale): Presentation {
  if (problem.method !== "parameters" || problem.matrix.length !== 4 ||
      problem.matrix.some(row => row.length !== 5) || problem.rhs.length !== 4)
    throw Error("Expected a parametric 4x5 system");
  const lesson = teaching(locale), { t } = lesson;
  const result = classifySystem(problem.matrix, problem.rhs);
  if (result.kind !== "system-many" || result.rankA !== 2 ||
      result.rankAugmented !== 2 || result.freeColumns.length !== 3)
    throw Error("Expected exactly three independent free parameters");
  const augmented = problem.matrix.map((row, i) => [...row, problem.rhs[i]]);
  lesson.work(`[A|b] = ${compact(augmented)}`,
    t("Zapisz cztery równania i pięć niewiadomych w macierzy rozszerzonej.",
      "Write the four equations and five unknowns in an augmented matrix."));
  const elimination = gaussianElimination(problem.matrix, problem.rhs);
  for (const step of elimination.steps) lesson.work(
    `${step.action}: ${compact(step.matrix)}`,
    t("Odwracalne operacje na wierszach zachowują cały zbiór rozwiązań.",
      "Invertible row operations preserve the full solution set."));
  lesson.work("rank(A)=rank([A|b])=2; n=5; n−rank(A)=3",
    t("Układ jest zgodny, ma nieskończenie wiele rozwiązań i dokładnie trzy parametry swobodne.",
      "The system is consistent, with infinitely many solutions and exactly three free parameters."));
  lesson.work(`RREF([A|b]) = ${compact(result.reduction.matrix)}`,
    t("Wyznacz kolumny bazowe i swobodne w zredukowanej postaci schodkowej.",
      "Identify pivot and free columns from reduced row echelon form."));
  const freeText = result.freeColumns.map((col, i) => `${names[col]}=t${i + 1}`).join(", ");
  lesson.work(parameterization(result, names).join("; "),
    t("Nadaj zmiennym swobodnym nazwy t1, t2, t3 od lewej i wyraź pozostałe niewiadome.",
      "Name the free variables t1, t2, t3 from left to right and solve for pivot variables."));
  const coefficients: Rational[][] = names.map((_, col) => {
    const freeIndex = result.freeColumns.indexOf(col);
    if (freeIndex >= 0) return [zero, ...result.freeColumns.map((_, i) => i === freeIndex ? one : zero)];
    const row = result.reduction.pivots.indexOf(col);
    if (row < 0) throw Error("Missing pivot for an assigned variable");
    return [result.reduction.matrix[row][5], ...result.freeColumns.map(j =>
      mul(r(-1), result.reduction.matrix[row][j]))];
  });
  for (let i = 0; i < 4; i++) {
    const calculated = Array.from({ length: 4 }, (_, k) =>
      problem.matrix[i].reduce((acc, c, j) => add(acc, mul(c, coefficients[j][k])), zero));
    if (sub(calculated[0], problem.rhs[i]).numerator !== 0n ||
        calculated.slice(1).some(value => value.numerator !== 0n))
      throw Error("Affine parameterization fails an original equation");
    lesson.work(`R${i + 1}: [${calculated.map(fmt).join(", ")}]=[${fmt(problem.rhs[i])}, 0, 0, 0]`,
      t("Osobno sprawdź stałą i współczynniki t1, t2, t3 w oryginalnym równaniu.",
        "Verify the constant and each t1, t2, t3 coefficient in the original equation."));
  }
  const answer: AnswerSpec = {
    kind: "list",
    labels: names.flatMap(name => [
      t(`${name}: stała`, `${name}: constant`),
      `${name}: t1`, `${name}: t2`, `${name}: t3`,
    ]),
    values: coefficients.flat(),
  };
  const question = t(
    `Rozwiąż metodą Gaussa: [A|b]=${compact(augmented)}. Zmienne swobodne: ${freeText}. Dla każdej z pięciu niewiadomych wpisz cztery pola: stałą oraz współczynniki t1, t2 i t3 (np. x=c+at1+bt2+dt3). Nie wpisuj całego wyrażenia w jedno pole.`,
    `Solve by Gaussian elimination: [A|b]=${compact(augmented)}. Free variables: ${freeText}. For each of five unknowns enter four fields: the constant and the coefficients of t1, t2 and t3 (e.g. x=c+at1+bt2+dt3). Do not enter the whole expression in one field.`);
  return lesson.finish(question, answer,
    t(`Sprawdź rank(A)=rank([A|b])=2, a następnie wyznacz ${freeText}.`,
      `Verify rank(A)=rank([A|b])=2, then identify ${freeText}.`),
    t("W RREF przesuń wyrazy zawierające t1, t2, t3 na prawą stronę i odczytaj cztery współczynniki dla każdej niewiadomej.",
      "In RREF, move the t1, t2, t3 terms to the right and read four coefficients for each unknown."));
}
