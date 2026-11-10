import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {equalRational as eq,rational as r,type Rational} from "../rational";
import {laplace} from "./audit";
import {rank,reduceRows} from "./linearAlgebraMath";
import {makeFourNarrowRank,fourNarrowRankStageFamilies} from "./rankFourNarrowStage";
import {presentRank} from "./ranks";

type Matrix=readonly (readonly Rational[])[];
const choose=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>choose(n-i-1,k-1)
    .map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
function independentRank(A:Matrix):number{
  for(let k=Math.min(A.length,A[0].length);k>=1;k--)
    for(const rows of choose(A.length,k))
      for(const cols of choose(A[0].length,k))
        if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;
  return 0;
}

describe("M14 P07/1g,h: isolated 4x2 and 4x3 rank source-form stages",()=>{
  it("has exactly two stage families and rejects invalid parameters",()=>{
    expect(fourNarrowRankStageFamilies.map(f=>f.id)).toEqual(
      ["matrix-rank-four-two","matrix-rank-four-three"]);
    for(const family of fourNarrowRankStageFamilies)
      expect(family.supportedDifficulties).toEqual(["medium","hard","advanced"]);
    for(const index of [-1,24,1.1,NaN,Infinity])
      expect(()=>makeFourNarrowRank(index,"hard",2)).toThrow();
    expect(()=>makeFourNarrowRank(0,"easy",2)).toThrow();
    expect(()=>makeFourNarrowRank(0,"expert",3)).toThrow();
    expect(()=>makeFourNarrowRank(0,"hard",4 as 2)).toThrow();
  });
  for(const columns of [2,3] as const)
    it("4x"+columns+": 72 unique exact tasks, independent minors and PL/EN",()=>{
      const all=new Set<string>(),ranks=new Set<number>();
      let swaps=0,fractions=0,missingLeading=0,stepsChecked=0;
      for(const level of ["medium","hard","advanced"] as const)
        for(let variant=0;variant<24;variant++){
          const p=makeFourNarrowRank(variant,level,columns);
          const A=p.matrix;
          expect(A).toHaveLength(4);
          expect(A.every(row=>row.length===columns)).toBe(true);
          const oracle=independentRank(A), reduced=reduceRows(A);
          expect(rank(A)).toBe(oracle);
          expect(reduced.pivots.length).toBe(oracle);
          expect(independentRank(reduced.matrix)).toBe(oracle);
          ranks.add(oracle);
          all.add(A.map(row=>row.map(v=>v.numerator+"/"+v.denominator).join(",")).join(";"));
          for(const step of reduced.steps.slice(0,variant%8===1?100:0)){
            expect(independentRank(step.matrix)).toBe(oracle);stepsChecked++;
          }
          swaps+=reduced.steps.some(s=>s.action.includes("↔"))?1:0;
          fractions+=A.flat().some(v=>v.denominator!==1n)?1:0;
          missingLeading+=oracle>0&&A.every(row=>row[0].numerator===0n)?1:0;
          for(const locale of ["pl","en"] as const){
            const view=presentRank(p,locale);
            expect(view.answer.kind).toBe("scalar");
            if(view.answer.kind!=="scalar")throw Error("Expected scalar");
            expect(eq(view.answer.value,r(oracle))).toBe(true);
            expect(assessAnswer(view.answer,String(oracle)).kind).toBe("correct");
            expect(assessAnswer(view.answer,String((oracle+1)%(columns+1))).kind).toBe("incorrect");
            expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
            expect(assessAnswer(view.answer,"1/0").kind).toBe("invalid");
            expect(view.solution.at(-1)?.kind).toBe("answer");
            expect(view.solution.some(s=>s.action.includes("RREF(A)"))).toBe(true);
            expect(view.hint.length).toBeGreaterThan(10);
            expect(view.nextHint.length).toBeGreaterThan(10);
            if(locale==="en")expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      expect(all.size).toBe(72);
      expect([...ranks].sort()).toEqual(Array.from({length:columns+1},(_,i)=>i));
      expect(swaps).toBeGreaterThan(0);
      expect(fractions).toBeGreaterThan(0);
      expect(missingLeading).toBeGreaterThan(0);
      expect(stepsChecked).toBeGreaterThan(0);
    },45000);
});