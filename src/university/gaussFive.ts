import { addRational as add, multiplyRational as mul, subtractRational as sub, rational as r, type Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";

type Linear = Extract<LinearAlgebraProblem, { kind: "linear-system" }>;
type Equations = 3 | 4;

/** Five-unknown worksheet forms with exactly constructed ranks.
 * Consistent cases: rank(A)=rank([A|b])=3, two free variables.
 * Contradictory cases: rank(A)=2, rank([A|b])=3.
 * Every row operation is invertible; no floating-point arithmetic or solver
 * is used to choose the correct answer. */
export function constructGaussFive(variant: number, level: Difficulty, equations: Equations): Linear {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(level) || (equations !== 3 && equations !== 4))
    throw new Error("Invalid five-unknown Gaussian exercise");
  const inconsistent = variant % 6 === 0;
  const rank = inconsistent ? 2 : 3;
  const choice = rank === 3
    ? [[0, 1, 2], [0, 2, 3], [1, 2, 4]]
    : [[0, 1], [0, 3], [1, 3]];
  const pivots = choice[variant % choice.length];
  const denominator = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const basis: Rational[][] = pivots.map((pivot, i) => {
    const row = Array.from({ length: 5 }, (_, j) => {
      if (j === pivot) return r(1);
      if (pivots.includes(j) || j < pivot) return r(0);
      const raw = (variant + 3 * i + 2 * j) % 7 - 3;
      return r(raw || (i % 2 ? -1 : 2), denominator);
    });
    return [...row, r(variant - 11 + 4 * i, denominator)];
  });
  const augmented = basis.map(row => [...row]);
  while (augmented.length < equations) {
    const i = augmented.length;
    augmented.push(basis[0].map((value, j) => add(
      mul(r(i % 2 ? 2 : -1), value),
      mul(r((variant + i) % 2 ? -1 : 2), basis[1][j]),
    )));
  }
  // Invertible operations disguise the independent basis, including zero
  // leading pivots and sign changes that require swapping rows.
  augmented[0] = augmented[0].map((value, j) => add(value, mul(r(2), augmented[1][j])));
  augmented[1] = augmented[1].map((value, j) => sub(value, augmented[0][j]));
  if (variant % 2 === 1)
    [augmented[0], augmented[equations - 1]] = [augmented[equations - 1], augmented[0]];
  const scaled = augmented.map((row, i) => row.map(value =>
    mul(value, r((variant + i) % 2 ? -2 : 3, level === "expert" ? 2 : 1))));
  if (inconsistent)
    scaled[equations - 1][5] = add(scaled[equations - 1][5], r(variant % 2 ? 1 : -2));
  return {
    kind: "linear-system",
    method: inconsistent ? "classification" : "parameters",
    matrix: scaled.map(row => row.slice(0, 5)),
    rhs: scaled.map(row => row[5]),
  };
}

export const gaussFiveFamilies: readonly UniversityFamily[] = [
  {
    id: "gauss-five-3x5",
    category: "systems",
    titles: { pl: "Gauss 3×5: pięć niewiadomych", en: "Gaussian systems 3×5: five unknowns" },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: (variant, level) => constructGaussFive(variant, level, 3),
  },
  {
    id: "gauss-five-4x5",
    category: "systems",
    titles: { pl: "Gauss 4×5: pięć niewiadomych", en: "Gaussian systems 4×5: five unknowns" },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: (variant, level) => constructGaussFive(variant, level, 4),
  },
];