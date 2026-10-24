import {rational as r,addRational as add,multiplyRational as mul} from "../rational";
import type {Difficulty} from "../difficulty";
import type {LinearAlgebraProblem,UniversityFamily} from "./schema";
import type {ExactMatrix} from "./linearAlgebraMath";

/** Construct a controlled-echelon matrix and apply invertible row operations.
 * Unlike earlier 2×3, 3×3, 3×4 exercises, these use 4 rows and 4/5 columns.
 * Target ranks 0,1,2,3,4 are all represented, with missing leading pivots.
 */
function makeRank4(variant:number,level:Difficulty,columns:4|5):
  Extract<LinearAlgebraProblem,{kind:"linear-rank"}>{
  if(!Number.isInteger(variant)||variant<0||variant>=24)
    throw Error("Invalid P0E2 variant");
  const tier=level==="medium"?1:level==="hard"?2:level==="advanced"?3:4;
  const zeroCase=variant===0&&(columns===4?level==="medium":level==="hard");
  const targetRank=zeroCase?0:1+(variant+tier)%4;
  const pivotOffset=variant%3===0&&targetRank<columns?1:0;
  const pivotColumns=Array.from({length:targetRank},(_,i)=>i+pivotOffset);
  const basis=Array.from({length:targetRank},(_,i)=>
    Array.from({length:columns},(_,j)=>{
      if(j<pivotColumns[i])return r(0);
      if(j===pivotColumns[i])
        return r(i===0?variant+24*tier+7:i+2,tier>=3&&i===0?2:1);
      const numerator=(variant*2+i*7+j*11+tier)%9-4;
      return r(numerator,tier>=2&&(i+j)%2===0?2:1);
    }));
  let matrix=Array.from({length:4},(_,i)=>{
    if(i<targetRank)return [...basis[i]];
    return Array.from({length:columns},(_,j)=>
      basis.reduce((sum,row,k)=>{
        const multiplier=r((variant+5*i+3*k+tier)%5-2,tier>=3&&k%2===1?2:1);
        return add(sum,mul(multiplier,row[j]));
      },r(0)));
  });
  for(let i=1;i<4;i++){
    const factor=r((variant+i+tier)%2===0?-1:2,tier>=2&&i%2===0?2:1);
    matrix[i]=matrix[i].map((x,j)=>add(x,mul(factor,matrix[i-1][j])));
  }
  if(tier>=3)
    for(let i=2;i>=1;i--)
      matrix[i]=matrix[i].map((x,j)=>add(x,mul(r(i===1?-1:1),matrix[i+1][j])));
  if(tier===4)
    matrix[0]=matrix[0].map((x,j)=>add(x,mul(r(-3,2),matrix[2][j])));
  if(variant%2===1||tier>=2)
    [matrix[0],matrix[3]]=[matrix[3],matrix[0]];
  return {kind:"linear-rank",matrix:matrix as ExactMatrix};
}

export const rankExtensionFamilies:readonly UniversityFamily[]=[
  {id:"matrix-rank-four-square",category:"matrices",
   titles:{pl:"Rząd macierzy 4×4: pivoty i zależne wiersze",
           en:"4×4 matrix rank: pivots and dependent rows"},
   supportedDifficulties:["medium","hard","advanced"],
   create:(v,level)=>makeRank4(v,level,4)},
  {id:"matrix-rank-four-rectangular",category:"matrices",
   titles:{pl:"Rząd macierzy 4×5: pivoty i kolumny swobodne",
           en:"4×5 matrix rank: pivots and free columns"},
   supportedDifficulties:["hard","advanced","expert"],
   create:(v,level)=>makeRank4(v,level,5)},
];
