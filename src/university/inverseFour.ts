import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { UniversityFamily, LinearAlgebraProblem } from "./schema";
import { product, type ExactMatrix } from "./linearAlgebraMath";

/** A nontrivial 4×4 matrix built by rank-preserving row operations.
 * An initial zero pivot requires choosing a nonzero pivot from a later row.
 * For inverse exercises, some deliberately singular matrices require classification.
 */
function fourByFour(variant: number, level: Difficulty, singular: boolean): ExactMatrix {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24) throw Error("Invalid P0F1 variant");
  const tier = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const diagonal = [r(variant + tier * 13 + 3, tier === 3 ? 2 : 1),
    r(1 + (variant % 3)), r(variant % 2 ? -2 : 2), r(tier === 3 ? -1 : 1)];
  const a: Rational[][] = Array.from({length: 4}, (_, i) =>
    Array.from({length: 4}, (_, j) => j < i ? r(0) : j === i ? diagonal[i] :
      r((variant + 2 * i + 3 * j + tier) % 5 - 2, tier >= 2 && (i + j) % 2 === 0 ? 2 : 1)));
  for (let i = 1; i < 4; i++) {
    const k = r((variant + i + tier) % 3 - 1 || 2);
    a[i] = a[i].map((value, j) => add(value, mul(k, a[i - 1][j])));
  }
  if (tier >= 2) a[1] = a[1].map((v, j) => add(v, mul(r(-1, 2), a[3][j])));
  if (tier === 3) a[2] = a[2].map((v, j) => add(v, mul(r(2, 3), a[0][j])));
  [a[0], a[3]] = [a[3], a[0]];
  // Eliminate the displayed first pivot without changing rank:
  // a[3] contains the original first row and has a guaranteed nonzero entry.
  const factor = div(a[0][0], a[3][0]);
  a[0] = a[0].map((value, j) => sub(value, mul(factor, a[3][j])));
  if (a[0][0].numerator !== 0n) throw Error("Invalid zero-pivot construction");
  if (singular) a[3] = a[0].map(x => mul(x, r(2)));
  return a;
}

function equation(variant: number, level: Difficulty): Extract<LinearAlgebraProblem, {kind: "linear-application"}> {
  const matrix = fourByFour(variant, level, false);
  const tier = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const x: ExactMatrix = Array.from({length: 4}, (_, i) =>
    Array.from({length: 2}, (_, j) => r((variant * 2 + i * 3 + j * 5 + tier) % 9 - 4,
      tier >= 2 && (i + j) % 2 ? 2 : 1)));
  return {kind: "linear-application", matrix, rhs: product(matrix, x), method: "ax"};
}

export const inverseFourFamilies: readonly UniversityFamily[] = [
  {id: "inverse-four-gauss-jordan", category: "matrices",
   titles: {pl: "Macierz odwrotna 4×4 metodą Gaussa–Jordana",
            en: "4×4 inverse by Gauss–Jordan"},
   supportedDifficulties: ["hard", "advanced", "expert"],
   create: (variant, level) => ({kind: "linear-inverse", method: "inverse",
     matrix: fourByFour(variant, level, variant % 6 === 0)})},
  {id: "inverse-four-ax-equation", category: "matrices",
   titles: {pl: "Równanie AX = B z macierzą 4×4",
            en: "Matrix equation AX = B with 4×4 A"},
   supportedDifficulties: ["hard", "advanced", "expert"],
   create: equation},
];