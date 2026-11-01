import { describe,it,expect } from "vitest";
import { difficulties } from "../difficulty";
import { assessAnswer, emptyAnswer } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { rankFamilies } from "./ranks";
import { auditShownParameters } from "./parameterization-audit";
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
  it("U05 covers all four distinct private source rank patterns without new variants",()=>{
    const cases=[
      {v:4,n:3,ra:2,rab:3,kind:"system-none",params:"not-applicable"},
      {v:8,n:4,ra:3,rab:3,kind:"system-many",params:"1"},
      {v:6,n:4,ra:4,rab:4,kind:"system-one",params:"0"},
      {v:20,n:4,ra:2,rab:2,kind:"system-many",params:"2"}
    ];
    for(const c of cases){
      const task=makeUniversityTask("capelli-given-ranks",c.v,"easy");
      if(task.university.kind!=="linear-rank-given")throw Error("Wrong generator");
      expect([task.university.variables,task.university.rankA,task.university.rankAugmented])
        .toEqual([c.n,c.ra,c.rab]);
      for(const locale of ["pl","en"] as const){
        const shown=localizeUniversity(task,locale);
        expect(shown.answer.kind).toBe("multi-choice");
        if(shown.answer.kind!=="multi-choice")throw Error("Wrong answer");
        expect(Object.fromEntries(shown.answer.fields.map(f=>[f.id,f.value])))
          .toEqual({classification:c.kind,parameters:c.params});
        expect(shown.solution?.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
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
          }else if(p.kind==="linear-capelli"){
            expect(lesson.answer.kind).toBe("choice");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:expected}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:expected==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
          }else{
            expect(lesson.answer.kind).toBe("multi-choice");
            if(lesson.answer.kind!=="multi-choice")throw Error("Expected both source fields");
            expect(lesson.answer.fields.map(f=>f.id)).toEqual(["classification","parameters"]);
            const count=expected==="system-none"?"not-applicable":expected==="system-one"?"0":String(p.variables-p.rankA);
            const values={classification:expected,parameters:count};
            expect(assessAnswer(lesson.answer,{kind:"multi-choice",values}).kind).toBe("correct");
            const badClass={...values,classification:expected==="system-one"?"system-none":"system-one"};
            expect(assessAnswer(lesson.answer,{kind:"multi-choice",values:badClass}).kind).toBe("incorrect");
            const badCount={...values,parameters:count==="1"?"2":"1"};
            expect(assessAnswer(lesson.answer,{kind:"multi-choice",values:badCount}).kind).toBe("incorrect");
          }
          if(p.kind==="linear-capelli" && expected==="system-many")auditShownParameters(p.matrix,p.rhs,lesson.solution!);
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
