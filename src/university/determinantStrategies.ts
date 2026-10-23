import { rational as r, subtractRational as sub } from "../rational";
import type { Difficulty } from "../difficulty";
import type { DeterminantProblem, DeterminantRowOperation as RowOp, SquareDeterminantMatrix as Square, UniversityFamily } from "./schema";
import { applyDeterminantRowOperation } from "./determinants";

/** Generate a deliberately undoable row-reduction exercise, not another Laplace template.
 * Every 4×4/5×5 matrix starts from a nonsingular upper triangle;
 * difficulty determines how many transformations the learner must reverse. */
function makeStrategy(variant: number, difficulty: Difficulty, n: 4 | 5): DeterminantProblem {
  const diagonal = Array.from({length:n},(_,i)=>
    i===0 ? 1+variant%6 : i===1 ? 1+Math.floor(variant/6) : 1+(variant+i)%3);
  const triangular: Square = Array.from({length:n},(_,i)=>
    Array.from({length:n},(_,j)=>
      r(i===j ? diagonal[i] : j===i+1 ? (variant+i)%3-1 : 0)));
  const first: RowOp = {kind:"add",target:n-1,source:n-2,multiple:r(variant%2?1:-1)};
  const middle: RowOp = {kind:"add",target:n-2,source:n-3,multiple:r(variant%2?1:-1)};
  const moves: readonly RowOp[] = difficulty==="easy"
    ? [first]
    : difficulty==="medium"
    ? [middle,{kind:"add",target:n-1,source:n-2,multiple:r(1)}]
    : [
      {kind:"add",target:n-3,source:n-4,multiple:r(variant%2?1:-1)},
      {kind:"add",target:n-2,source:n-3,multiple:r(1)},
      {kind:"add",target:n-1,source:n-2,multiple:r(-1)},
      {kind:"swap",first:0,second:n-1},
    ];
  const matrix=moves.reduce<Square>((acc,op)=>applyDeterminantRowOperation(acc,op),triangular);
  const reductions=moves.slice().reverse().map((op):RowOp=>
    op.kind==="add" ? {...op,multiple:sub(r(0),op.multiple)} : op);
  return {kind:"determinant",method:n===4?"staged-four":"staged-five",matrix,reductions};
}

export const determinantStrategyFamilies:readonly UniversityFamily[]=[
  {id:"determinant-strategy-four",category:"determinants",
   titles:{pl:"Wyznacznik 4×4: planowana redukcja",en:"4×4 determinant: planned reduction"},
   supportedDifficulties:["easy","medium","hard"],
   create:(v,d)=>makeStrategy(v,d,4)},
  {id:"determinant-strategy-five",category:"determinants",
   titles:{pl:"Wyznacznik 5×5: planowana redukcja",en:"5×5 determinant: planned reduction"},
   supportedDifficulties:["easy","medium","hard"],
   create:(v,d)=>makeStrategy(v,d,5)},
];
