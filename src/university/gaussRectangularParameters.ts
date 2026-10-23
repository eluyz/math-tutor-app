import { addRational as add, multiplyRational as mul, rational as r, type Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";

type ParametricSystem = Extract<LinearAlgebraProblem, { kind: "linear-system" }>;
type Shape = "3x2" | "4x3" | "2x3";

/** Start with an independent echelon basis, append dependent equations, then
 * apply invertible whole-row operations. This proves consistency and rank
 * without guessing a solution from sampled parameter values. */
function construct(variant: number, level: Difficulty, shape: Shape): ParametricSystem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24)
    throw new Error("Invalid rectangular Gauss variant");
  const n = shape === "3x2" ? 2 : 3;
  const m = shape === "3x2" ? 3 : shape === "4x3" ? 4 : 2;
  const rank = n === 2 || level === "expert" ? 1 : 2;
  const pivots = rank === 1 ? [n === 3 ? variant % 2 : 0]
    : variant % 2 ? [0, 2] : [0, 1];
  const free = Array.from({ length: n }, (_, j) => j).filter(j => !pivots.includes(j));
  const denominator = level === "hard" ? 1 : level === "expert" ? 3 : 2;
  const basis: Rational[][] = pivots.map((pivot, i) => {
    const row = Array.from({ length: n }, () => r(0));
    row[pivot] = r(1);
    for (const [k, col] of free.entries()) if (col > pivot)
      row[col] = r((variant + 2 * i + 3 * k) % 7 - 3, denominator);
    // Distinct affine solution sets, rather than 24 rescalings of one system.
    return [...row, r(variant - 12 + 3 * i, denominator)];
  });
  const rows = basis.map(row => [...row]);
  while (rows.length < m) {
    const i = rows.length;
    rows.push(basis[0].map((value, j) => add(mul(r(i % 2 ? -2 : 3), value),
      rank === 2 ? mul(r(i % 2 ? 1 : -1), basis[1][j]) : r(0))));
  }
  // Mix independent equations as well as adding redundant equations.
  rows[0] = rows[0].map((value, j) => add(value, mul(r(2), rows[1][j])));
  const scaled = rows.map((row, i) => row.map(value =>
    mul(value, r((variant + i) % 2 ? -2 : 3, level === "expert" ? 2 : 1))));
  if (variant % 2) [scaled[0], scaled[m - 1]] = [scaled[m - 1], scaled[0]];
  return { kind: "linear-system", method: "parameters",
    matrix: scaled.map(row => row.slice(0, n)), rhs: scaled.map(row => row[n]) };
}

export const gaussRectangularParameterFamilies: readonly UniversityFamily[] = [
  { id: "gauss-rectangular-3x2-parameters", category: "systems",
    titles: { pl: "Gauss 3×2: pełne rozwiązanie parametryczne", en: "Gauss 3×2: full parametric solution" },
    supportedDifficulties: ["hard", "advanced"], create: (v, d) => construct(v, d, "3x2") },
  { id: "gauss-rectangular-4x3-parameters", category: "systems",
    titles: { pl: "Gauss 4×3: pełne rozwiązanie parametryczne", en: "Gauss 4×3: full parametric solution" },
    supportedDifficulties: ["advanced", "expert"], create: (v, d) => construct(v, d, "4x3") },
  { id: "gauss-rectangular-2x3-parameters", category: "systems",
    titles: { pl: "Gauss 2×3: pełne rozwiązanie parametryczne", en: "Gauss 2×3: full parametric solution" },
    supportedDifficulties: ["advanced", "expert"], create: (v, d) => construct(v, d, "2x3") },
];
