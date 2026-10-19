import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer,formatRational} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {cramerFourFamilies} from "./cramerFour";
import {auditShownParameters} from "./parameterization-audit";
import {a,m,d,eq,q,laplace,auditCalculation} from "./audit";
import type {ExactMatrix} from "./linearAlgebraMath";
const permutations=(xs:number[]):number[][]=>xs.length===0?[[]]:xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest]));
const leibniz=(A:ExactMatrix)=>permutations([0,1,2,3]).map(p=>{
  const inversions=p.reduce((count,x,i)=>count+p.slice(i+1).filter(y=>x>y).length,0);
  return p.map((j,i)=>A[i][j]).reduce(m,q(inversions%2?-1:1));
}).reduce(a,q(0));
const subsets=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>subsets(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const rank=(A:ExactMatrix)=>{for(let k=Math.min(A.length,A[0].length);k>=1;k--)for(const rows of subsets(A.length,k))for(const cols of subsets(A[0].length,k))if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;return 0;};
describe("P3 four-variable Cramer",()=>{
  it("independently audits all 4×4 determinants, singular cases and full bilingual lessons",()=>{
    const global=new Set<string>(), classes=new Set<string>();
    for(const level of cramerFourFamilies[0].supportedDifficulties){
      const keys=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("cramer-four",v,level),p=task.university;
        if(p.kind!=="linear-cramer-four")throw Error("Wrong kind");
        keys.add(task.contentKey);global.add(task.contentKey);
        const D=leibniz(p.matrix), ra=rank(p.matrix), rab=rank(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
        expect(rab).toBeLessThanOrEqual(ra+1);
        const kind=ra<rab?"system-none":ra===4?"system-one":"system-many";
        classes.add(kind);
        const Dj=Array.from({length:4},(_,j)=>leibniz(p.matrix.map((row,i)=>row.map((c,k)=>k===j?p.rhs[i]:c))));
        const values=D.numerator===0n?[]:Dj.map(value=>d(value,D));
        if(values.length)for(let i=0;i<4;i++)expect(eq(p.matrix[i].map((c,j)=>m(c,values[j])).reduce(a,q(0)),p.rhs[i])).toBe(true);
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale);
          expect(lesson.question).not.toBe("");expect(lesson.hint).not.toBe("");
          expect(lesson.solution!.length).toBeGreaterThan(5);
          const steps=lesson.solution!.filter(step=>step.kind==="working");
          for(const step of steps){expect(step.action).not.toBe("");expect(step.reason).not.toBe("");for(const c of step.calculations)expect(auditCalculation(c)).toBe(true);}
          expect(steps.some(step=>step.action.startsWith("D = ")&&step.calculations.some(c=>eq(c.result,D)))).toBe(true);
          expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
          if(kind==="system-one"){
            expect(lesson.answer.kind).toBe("system");
            for(let j=0;j<4;j++)expect(steps.some(step=>step.action.startsWith(`D${j+1} = `)&&step.calculations.some(c=>eq(c.result,Dj[j])))).toBe(true);
            if(lesson.answer.kind==="system"){
              expect(lesson.answer.values.every((value,j)=>eq(value,values[j]))).toBe(true);
              const correct={kind:"system" as const,classification:"system-one",values:values.map(formatRational)};
              expect(assessAnswer(lesson.answer,correct).kind).toBe("correct");
              expect(assessAnswer(lesson.answer,{...correct,values:["999",...correct.values.slice(1)]}).kind).toBe("incorrect");
            }
          }else{
            expect(steps.flatMap(step=>step.calculations).some(c=>c.operation==="quotient")).toBe(false);
            expect(lesson.answer.kind).toBe("choice");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind==="system-none"?"system-many":"system-none"}).kind).toBe("incorrect");
            if(kind==="system-many")auditShownParameters(p.matrix,p.rhs,lesson.solution!);
          }
        }
      }
      expect(keys.size).toBe(24);
    }
    expect(global.size).toBe(48);
    expect(classes).toEqual(new Set(["system-one","system-none","system-many"]));
  },30_000);
});
