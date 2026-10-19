import { describe,it,expect } from "vitest";
import { difficulties } from "../difficulty";
import { assessAnswer, emptyAnswer } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { rankFamilies } from "./ranks";
import { a,m,eq,laplace,auditCalculation,q } from "./audit";
import type { ExactMatrix } from "./linearAlgebraMath";
const subsets=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>subsets(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const oracleRank=(A:ExactMatrix)=>{
  for(let k=Math.min(A.length,A[0].length);k>=1;k--)for(const rows of subsets(A.length,k))for(const cols of subsets(A[0].length,k)){
    const minor=rows.map(i=>cols.map(j=>A[i][j]));
    if(laplace(minor).numerator!==0n)return k;
  }
  return 0;
};
describe("P1 ranks and Kronecker–Capelli",()=>{
  it("independently audits every matrix minor, variant, classification and bilingual solution",()=>{
    for(const family of rankFamilies)for(const level of difficulties){
      if(!family.supportedDifficulties.includes(level))continue;
      const keys=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        keys.add(task.contentKey);
        let expected:string;
        if(p.kind==="linear-rank") expected=String(oracleRank(p.matrix));
        else if(p.kind==="linear-capelli"){
          const ra=oracleRank(p.matrix),rab=oracleRank(p.matrix.map((row,i)=>[...row,p.rhs[i]])),n=p.matrix[0].length;
          expect(rab).toBeLessThanOrEqual(ra+1);
          expected=ra<rab?"system-none":ra===n?"system-one":"system-many";
        }else if(p.kind==="linear-rank-given"){
          expect(p.rankAugmented).toBeLessThanOrEqual(p.rankA+1);
          expect(p.rankAugmented).toBeLessThanOrEqual(p.equations);
          expected=p.rankA<p.rankAugmented?"system-none":p.rankA===p.variables?"system-one":"system-many";
        }else throw Error("Unexpected kind");
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale);
          expect(lesson.question).not.toBe("");expect(lesson.hint).not.toBe("");expect(lesson.nextHint).not.toBe("");
          expect(lesson.solution!.length).toBeGreaterThan(2);
          for(const step of lesson.solution!)if(step.kind==="working"){
            expect(step.action).not.toBe("");expect(step.reason).not.toBe("");
            for(const c of step.calculations)expect(auditCalculation(c)).toBe(true);
          }
          if(p.kind==="linear-rank"){
            expect(lesson.answer.kind).toBe("scalar");
            expect(assessAnswer(lesson.answer,expected).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,"99").kind).toBe("incorrect");
          }else{
            expect(lesson.answer.kind).toBe("choice");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:expected}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:expected==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
          }
          expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
          if(p.kind==="linear-capelli" && expected==="system-one"){
            // Independent Cramer/Laplace solution agrees with every original equation.
            const n=p.matrix[0].length;
            if(n===3){
              const D=laplace(p.matrix);
              const xs=Array.from({length:n},(_,j)=>{
                const Dj=laplace(p.matrix.map((row,i)=>row.map((x,k)=>k===j?p.rhs[i]:x)));
                return {numerator:Dj.numerator*D.denominator,denominator:Dj.denominator*D.numerator};
              });
              for(let i=0;i<n;i++)expect(eq(p.matrix[i].map((c,j)=>m(c,xs[j])).reduce(a,q(0)),p.rhs[i])).toBe(true);
              expect(lesson.explanation).toContain(`rank(A) = ${n}`);
            }
          }
        }
      }
      expect(keys.size,`${family.id}/${level}`).toBe(24);
    }
  },30_000);
});
