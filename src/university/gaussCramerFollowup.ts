import { rational as r, addRational as add, multiplyRational as mul, type Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { UniversityFamily, LinearAlgebraProblem } from "./schema";

/** An invertible 4×4 constructed from a nonzero triangular diagonal using only
 * determinant-preserving row additions and one required leading row swap.
 * Unlike a random dense matrix, no case can accidentally become singular. */
function pivotMatrix(variant:number, level:Difficulty, salt:number):Rational[][] {
  if(!Number.isInteger(variant)||variant<0||variant>=24)
    throw Error("Invalid P0G variant");
  if(!["hard","advanced","expert"].includes(level))
    throw Error("Unsupported P0G level");
  const tier=level==="hard"?1:level==="advanced"?2:3;
  const v=variant+salt;
  const diagonal=[r(2+v%5),r(v%2?-2:3),r((v+tier)%2?-3:2),r(v%3===0?-2:1)];
  const a:Rational[][]=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>
    j<i?r(0):j===i?diagonal[i]:r((v+3*i+2*j+tier)%7-3,tier===3&&j%2===0?2:1)));
  // The first column of the next three rows stays zero, so the displayed
  // A[0,0]=0 after swapping rows 1 and 2 is guaranteed.
  const k=r((v%3)+1,tier>=2?2:1);
  a[2]=a[2].map((x,j)=>add(x,mul(k,a[1][j])));
  a[3]=a[3].map((x,j)=>add(x,mul(r(v%2?-2:1),a[2][j])));
  if(tier>=2)a[0]=a[0].map((x,j)=>add(x,mul(r(tier===3?-2:1,2),a[2][j])));
  [a[0],a[1]]=[a[1],a[0]];
  if(a[0][0].numerator!==0n||a[1][0].numerator===0n)
    throw Error("Required row swap not constructed");
  return a;
}
const dot=(row:readonly Rational[],x:readonly Rational[])=>
  row.reduce((sum,c,j)=>add(sum,mul(c,x[j])),r(0));
const solution=(variant:number,level:Difficulty,salt:number):Rational[]=>{
  const tier=level==="hard"?1:level==="advanced"?2:3;
  return Array.from({length:4},(_,j)=>r((variant*3+salt+5*j+tier)%13-6,
    tier>=2&&j%2===1?2:1));
};
function cramer(variant:number,level:Difficulty):Extract<LinearAlgebraProblem,{kind:"linear-cramer-four"}> {
  const matrix=pivotMatrix(variant,level,3);
  return {kind:"linear-cramer-four",matrix,
    rhs:matrix.map(row=>dot(row,solution(variant,level,3)))};
}
function gaussian(variant:number,level:Difficulty,classification:boolean):Extract<LinearAlgebraProblem,{kind:"linear-system"}> {
  const matrix=pivotMatrix(variant,level,classification?11:7);
  const rhs=matrix.map(row=>dot(row,solution(variant,level,classification?11:7)));
  if(classification&&variant%3!==0){
    // Row 4 becomes a combination of Rows 1 and 2. The first three
    // independent rows remain; rank(A)=3 is deliberate and auditable.
    const k=r((variant%3)+1);
    matrix[3]=matrix[0].map((x,j)=>add(x,mul(k,matrix[1][j])));
    rhs[3]=add(rhs[0],mul(k,rhs[1]));
    // Mode 1: rank(A)=rank([A|b])=3; mode 2: a 0=c contradiction.
    if(variant%3===2)rhs[3]=add(rhs[3],r(1));
  }
  return {kind:"linear-system",matrix,rhs,method:classification?"classification":"gauss"};
}
const levels:readonly Difficulty[]=["hard","advanced","expert"];
export const gaussCramerFollowupFamilies:readonly UniversityFamily[]=[
  {id:"cramer-four-forced-pivot",category:"systems",
   titles:{pl:"Cramer 4×4: niezerowy wyznacznik mimo A₁₁=0",
           en:"Cramer 4×4: nonzero determinant despite A₁₁=0"},
   supportedDifficulties:levels,create:cramer},
  {id:"gauss-four-forced-pivot",category:"systems",
   titles:{pl:"Gauss 4×4: obowiązkowa zamiana wierszy",
           en:"Gauss 4×4: required row swap"},
   supportedDifficulties:levels,create:(v,d)=>gaussian(v,d,false)},
  {id:"gauss-four-dependent-diagnostic",category:"systems",
   titles:{pl:"Gauss 4×4: rozwiązanie jedno, brak lub nieskończenie wiele",
           en:"Gauss 4×4: one, none or infinitely many solutions"},
   supportedDifficulties:levels,create:(v,d)=>gaussian(v,d,true)},
];
