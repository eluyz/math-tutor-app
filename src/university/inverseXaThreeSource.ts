import {
  rational as r, addRational as add, multiplyRational as mul, type Rational,
} from "../rational";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { product, type ExactMatrix } from "./linearAlgebraMath";

/** P05/2b method AND dimensions: XA=B where A,B,X are all 3×3.
 * Source coefficients and key stay in the owner's private acceptance record.
 * The older rectangular XA=B family and its published variants are untouched.
 */
export function createXaSourceThree(variant: number, level: Difficulty):
    Extract<LinearAlgebraProblem, {kind:"linear-application"}> {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard","advanced","expert"].includes(level))
    throw new Error("M13 P05/2b requires variant 0..23 and hard/advanced/expert");
  const tier = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const A: Rational[][] = [
    [r(variant+tier+3,tier===3?2:1),r((variant+2*tier)%7-3),r((variant+3*tier)%9-4)],
    [r(0),r(variant%2?-2:3),r((variant+5*tier)%7-3,tier>=2?2:1)],
    [r(0),r(0),r(tier===3?-2:2)],
  ];
  // Retain some triangular source-shape witnesses; vary other tasks by invertible
  // elementary row operations to teach a genuinely general right-hand inverse.
  if (variant%4!==0) {
    A[1]=A[1].map((x,j)=>add(x,mul(r((variant+tier)%3+1),A[0][j])));
    A[2]=A[2].map((x,j)=>add(x,mul(r(variant%2?-1:2),A[1][j])));
  }
  if (variant%5===1) [A[0],A[1]]=[A[1],A[0]];
  const X: ExactMatrix = Array.from({length:3},(_,i)=>
    Array.from({length:3},(_,j)=>r((variant*3+5*i+7*j+tier)%17-8,
      tier>=2 && (i+j)%2===1 ? 2 : 1)));
  return {kind:"linear-application",method:"xa",matrix:A,rhs:product(X,A)};
}
export const xaSourceThreeFamilies: readonly UniversityFamily[] = [
  {id:"inverse-right-source-three",category:"matrices",
   titles:{pl:"Równanie XA = B: pełne macierze 3×3",
           en:"Matrix equation XA = B: full 3×3 matrices"},
   supportedDifficulties:["hard","advanced","expert"],
   create:createXaSourceThree},
];
