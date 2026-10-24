import {describe,it,expect} from "vitest";
import {rankExtensionFamilies} from "./rankExtensions";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rank} from "./linearAlgebraMath";
import {laplace,eq,q} from "./audit";
import {assessAnswer} from "../answers";
import type {Rational} from "../rational";

type Matrix=readonly (readonly Rational[])[];
const choose=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>choose(n-i-1,k-1).map(other=>[i,...other.map(j=>i+j+1)])).flat();
function rankByMinors(matrix:Matrix):number {
  for(let k=Math.min(matrix.length,matrix[0].length);k>0;k--)
    for(const rows of choose(matrix.length,k))
      for(const columns of choose(matrix[0].length,k))
        if(laplace(rows.map(i=>columns.map(j=>matrix[i][j]))).numerator!==0n)
          return k;
  return 0;
}

describe("MT-EDU-019 P0E2 rank 4×4 and 4×5 independent minor oracle",()=>{
  for(const family of rankExtensionFamilies)
    it(family.id+" — 72 unique variants, exact answers and PL/EN",()=>{
      const keys=new Set<string>(),seenRanks=new Set<number>();
      let zeroCases=0,missingLeading=0,hasFractions=0;
      const columns=family.id.includes("rectangular")?5:4;
      for(const level of family.supportedDifficulties)
        for(let variant=0;variant<24;variant++){
          const task=makeUniversityTask(family.id,variant,level);
          const p=task.university;
          if(p.kind!=="linear-rank"||task.answer.kind!=="scalar")throw Error("Rank scalar required");
          expect(p.matrix.length).toBe(4);
          expect(p.matrix.every(row=>row.length===columns)).toBe(true);
          const expected=rankByMinors(p.matrix);
          expect(rank(p.matrix)).toBe(expected);
          expect(eq(task.answer.value,q(expected))).toBe(true);
          expect(assessAnswer(task.answer,String(expected)).kind).toBe("correct");
          expect(assessAnswer(task.answer,String((expected+1)%5)).kind).toBe("incorrect");
          expect(assessAnswer(task.answer,"1/0").kind).toBe("invalid");
          if(expected===0)zeroCases++;
          if(p.matrix.every(row=>row[0].numerator===0n)&&expected>0)missingLeading++;
          if(p.matrix.some(row=>row.some(v=>v.denominator!==1n)))hasFractions++;
          seenRanks.add(expected);
          keys.add(task.contentKey);
          for(const locale of ["pl","en"] as const){
            const view=localizeUniversity(task,locale);
            expect(view.answer).toEqual(task.answer);
            expect(view.contentKey).toBe(task.contentKey);
            expect(view.solution!.length).toBeGreaterThanOrEqual(3);
            expect(view.solution!.some(step=>step.action.includes("RREF(A)"))).toBe(true);
            if(locale==="en")expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      expect(keys.size).toBe(72);
      expect([...seenRanks].sort()).toEqual([0,1,2,3,4]);
      expect(zeroCases).toBe(1);
      expect(missingLeading).toBeGreaterThan(0);
      expect(hasFractions).toBeGreaterThan(0);
    },30_000);
  it("rejects invalid variant boundaries",()=>{
    for(const family of rankExtensionFamilies){
      expect(()=>family.create(-1,family.supportedDifficulties[0])).toThrow();
      expect(()=>family.create(24,family.supportedDifficulties[0])).toThrow();
      expect(()=>family.create(0.25,family.supportedDifficulties[0])).toThrow();
    }
  });
});