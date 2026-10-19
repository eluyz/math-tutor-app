import { describe,it,expect } from "vitest";
import { difficulties } from "../difficulty";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { gaussFamilies } from "./gauss";
import { auditShownParameters } from "./parameterization-audit";
import { a,m,d,eq,laplace,auditCalculation,q } from "./audit";
import type { ExactMatrix } from "./linearAlgebraMath";
const subsets=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>subsets(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const oracleRank=(A:ExactMatrix)=>{for(let k=Math.min(A.length,A[0].length);k>=1;k--)for(const rows of subsets(A.length,k))for(const cols of subsets(A[0].length,k))if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;return 0;};
describe("P2 exact Gaussian elimination",()=>{
  it("audits each unique, inconsistent and infinite 3×3/4×4 variant in PL and EN",()=>{
    const seenKinds=new Set<string>();
    for(const family of gaussFamilies)for(const level of difficulties){
      if(!family.supportedDifficulties.includes(level))continue;
      const questions=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        if(p.kind!=="linear-system")throw Error("Wrong kind");
        questions.add(task.contentKey);
        const n=p.matrix[0].length,ra=oracleRank(p.matrix),rab=oracleRank(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
        const kind=ra<rab?"system-none":ra===n?"system-one":"system-many";
        seenKinds.add(kind);
        let xs:ReturnType<typeof d>[]=[];
        if(kind==="system-one"){
          const D=laplace(p.matrix);
          expect(D.numerator).not.toBe(0n);
          xs=Array.from({length:n},(_,j)=>d(laplace(p.matrix.map((row,i)=>row.map((c,k)=>k===j?p.rhs[i]:c))),D));
          for(let i=0;i<n;i++)expect(eq(p.matrix[i].map((c,j)=>m(c,xs[j])).reduce(a,q(0)),p.rhs[i])).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale);
          expect(lesson.solution!.length).toBeGreaterThan(2);
          expect(lesson.hint).not.toBe("");expect(lesson.nextHint).not.toBe("");
          for(const step of lesson.solution!)if(step.kind==="working"){
            expect(step.action).not.toBe("");expect(step.reason).not.toBe("");
            for(const c of step.calculations)expect(auditCalculation(c)).toBe(true);
          }
          expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
          if(p.method==="gauss"){
            expect(kind).toBe("system-one");
            expect(lesson.answer.kind).toBe("system");
            if(lesson.answer.kind==="system"){
              expect(lesson.answer.variables).toHaveLength(n);
              expect(lesson.answer.values.every((x,j)=>eq(x,xs[j]))).toBe(true);
              const correct={kind:"system" as const,classification:"system-one",values:xs.map(formatRational)};
              expect(assessAnswer(lesson.answer,correct).kind).toBe("correct");
              expect(assessAnswer(lesson.answer,{...correct,values:correct.values.map((x,j)=>j===0?"999":x)}).kind).toBe("incorrect");
              expect(assessAnswer(lesson.answer,{...correct,values:[...correct.values.slice(0,-1),""]}).kind).toBe("invalid");
            }
          }else{
            expect(lesson.answer.kind).toBe("choice");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
            if(kind==="system-none")expect(lesson.explanation).toContain("rank([A|b])");
            if(kind==="system-many")auditShownParameters(p.matrix,p.rhs,lesson.solution!);
          }
        }
      }
      expect(questions.size,`${family.id}/${level}`).toBe(24);
    }
    expect(seenKinds).toEqual(new Set(["system-one","system-none","system-many"]));
  },30_000);
});
