import {
  rational as r, addRational as add, multiplyRational as mul,
  type Rational,
} from "../rational";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import type { ExactMatrix } from "./linearAlgebraMath";

export type NarrowRankProblem = Extract<LinearAlgebraProblem, {kind:"linear-rank"}>;
export type NarrowColumns = 2 | 3;

/** Bounded P07/1g,h exercise-shape proxy; no private worksheet coefficients.
 * Integrated as source-method proxy after independent stage checks.
 * Controlled echelon basis followed by invertible row operations.
 */
export function makeFourNarrowRank(variant: number, level: Difficulty, columns: NarrowColumns): NarrowRankProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["medium","hard","advanced"].includes(level) || ![2,3].includes(columns))
    throw new Error("Expected rank 4x2/4x3, variant 0..23, medium/hard/advanced");
  const tier = level === "medium" ? 1 : level === "hard" ? 2 : 3;
  const targetRank = variant === 0 && tier === 1 ? 0 : 1 + (variant + tier) % columns;
  const offset = targetRank < columns && variant % 4 === 0 ? 1 : 0;
  const pivots = Array.from({length:targetRank},(_,i)=>i+offset);
  const basis = pivots.map((pivot,i)=>
    Array.from({length:columns},(_,j)=> {
      if(j<pivot)return r(0);
      if(j===pivot)return r(variant+tier+i+2,tier===3?2:1);
      return r((variant+2*i+3*j+tier)%7-3,tier>=2?2:1);
    }));
  const matrix: Rational[][] = Array.from({length:4},(_,i)=>
    Array.from({length:columns},(_,j)=>i<targetRank ? basis[i][j] :
      basis.reduce((sum,row,k)=>add(sum,mul(r((variant+2*i+3*k+tier)%5-2),row[j])),r(0))));
  // Invertible row operations preserve the prescribed rank.
  for(let i=1;i<4;i++)
    matrix[i]=matrix[i].map((v,j)=>add(v,mul(r(i%2?-1:2),matrix[i-1][j])));
  if(tier>=2)
    matrix[0]=matrix[0].map((v,j)=>add(v,mul(r(tier===3?-1:2),matrix[3][j])));
  if(tier===3)matrix[2]=matrix[2].map(v=>mul(v,r(-1,2)));
  if(variant%2)[matrix[0],matrix[3]]=[matrix[3],matrix[0]];
  return {kind:"linear-rank",matrix:matrix as ExactMatrix};
}

/** Source-method shape, with original PDF coefficients kept private. */
export const fourNarrowRankStageFamilies: readonly UniversityFamily[] = [
  {id:"matrix-rank-four-two",category:"matrices",
   titles:{pl:"Rząd macierzy 4×2",en:"Rank of a 4×2 matrix"},
   supportedDifficulties:["medium","hard","advanced"],
   create:(v,d)=>makeFourNarrowRank(v,d,2)},
  {id:"matrix-rank-four-three",category:"matrices",
   titles:{pl:"Rząd macierzy 4×3",en:"Rank of a 4×3 matrix"},
   supportedDifficulties:["medium","hard","advanced"],
   create:(v,d)=>makeFourNarrowRank(v,d,3)},
];