import { rational as r, addRational as add } from "../rational";
import type { Difficulty } from "../difficulty";
import type { UniversityFamily, LinearAlgebraProblem } from "./schema";
import { product, type ExactMatrix } from "./linearAlgebraMath";
import { fourByFour } from "./inverseFour";

const levels: readonly Difficulty[] = ["hard", "advanced", "expert"];
const tierOf = (level: Difficulty) => level === "hard" ? 1 : level === "advanced" ? 2 : 3;

/** X is deliberately 2×4: XA=B is not interchangeable with AX=B. */
function rightEquation(variant: number, level: Difficulty): Extract<LinearAlgebraProblem, {kind:"linear-application"}> {
  const a = fourByFour(variant, level, false);
  const tier = tierOf(level);
  const x: ExactMatrix = Array.from({length: 2}, (_, i) =>
    Array.from({length: 4}, (_, j) =>
      r((variant * 3 + 5 * i + 2 * j + 7 * tier) % 13 - 6,
        tier >= 2 && (i + j) % 2 === 1 ? 2 : 1)));
  return {kind: "linear-application", method: "xa", matrix: a, rhs: product(x, a)};
}

/** (A−4I) is invertible by construction. X is always 4×4. */
function shiftedEquation(variant: number, level: Difficulty): Extract<LinearAlgebraProblem, {kind:"linear-matrix-equation"; mode:"ax-shift"}> {
  const p = fourByFour(variant, level, false);
  const tier = tierOf(level);
  const x: ExactMatrix = Array.from({length: 4}, (_, i) =>
    Array.from({length: 4}, (_, j) =>
      r((variant * 2 + 3 * i + 5 * j + 11 * tier) % 11 - 5,
        tier === 3 && (i + j) % 2 === 0 ? 2 : 1)));
  const a = p.map((row, i) => row.map((entry, j) => i === j ? add(entry, r(4)) : entry));
  return {kind: "linear-matrix-equation", mode: "ax-shift", left: a,
    rhs: product(p, x), shift: r(4)};
}

export const inverseFourFollowupFamilies: readonly UniversityFamily[] = [
  {id:"inverse-four-xa-equation", category:"matrices",
    titles:{pl:"Równanie XA = B z macierzą 4×4",
            en:"Matrix equation XA = B with 4×4 A"},
    supportedDifficulties:levels, create:rightEquation},
  {id:"matrix-ax-shift-four", category:"matrices",
    titles:{pl:"Równanie AX = 4X + B (4×4)",
            en:"Matrix equation AX = 4X + B (4×4)"},
    supportedDifficulties:levels, create:shiftedEquation},
];
