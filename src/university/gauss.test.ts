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
  it("U07 keeps legacy 3x3/4x4 exercises and explicitly requires a pivot swap in 4x3",()=>{
    const baseline3=makeUniversityTask("gauss-unique",0,"hard").university;
    const baseline4=makeUniversityTask("gauss-unique",0,"expert").university;
    expect(baseline3.kind).toBe("linear-system");
    expect(baseline4.kind).toBe("linear-system");
    if(baseline3.kind!=="linear-system"||baseline4.kind!=="linear-system")throw Error("Legacy method changed");
    expect(baseline3.matrix).toHaveLength(3);
    expect(baseline3.matrix[0]).toHaveLength(3);
    expect(baseline4.matrix).toHaveLength(4);
    expect(baseline4.matrix[0]).toHaveLength(4);
    for(const level of ["hard","advanced","expert"] as const) {
      const keys=new Set<string>();
      for(let variant=0;variant<24;variant++){
        const exercise=makeUniversityTask("gauss-overdetermined-4x3-unique",variant,level);
        const p=exercise.university;
        if(p.kind!=="linear-system")throw Error("Wrong U07 kind");
        expect(p.method).toBe("gauss");
        expect(p.matrix).toHaveLength(4);
        expect(p.matrix.every(row=>row.length===3)).toBe(true);
        expect(p.matrix[0][0].numerator).toBe(0n); // forced pivot swap
        keys.add(exercise.contentKey);
      }
      expect(keys.size).toBe(24);
    }
  });
  it("audits 3×3/4×4 and overdetermined 4×3 Gauss solutions in PL and EN",()=>{
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
          // Pick independent source rows: Cramer's determinant is defined on n×n
          // minors even when the original system has m>n equations.
          const rows=subsets(p.matrix.length,n).find(picks=>
            laplace(picks.map(i=>p.matrix[i])).numerator!==0n);
          expect(rows,"A unique system must contain an invertible square minor").toBeDefined();
          const chosen=rows!.map(i=>p.matrix[i]), rhs=rows!.map(i=>p.rhs[i]);
          const D=laplace(chosen);
          expect(D.numerator).not.toBe(0n);
          xs=Array.from({length:n},(_,j)=>d(laplace(chosen.map((row,i)=>row.map((c,k)=>k===j?rhs[i]:c))),D));
          for(let i=0;i<p.matrix.length;i++)
            expect(eq(p.matrix[i].map((c,j)=>m(c,xs[j])).reduce(a,q(0)),p.rhs[i]),
              `Must satisfy every original equation, including overdetermined row ${i+1}`).toBe(true);
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
