import {describe,it,expect} from "vitest";
import {gaussCramerFollowupFamilies} from "./gaussCramerFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {gaussianElimination} from "./linearAlgebraMath";
import type {ExactMatrix} from "./linearAlgebraMath";
import {laplace,eq,a,m,d,q,auditCalculation} from "./audit";
import {assessAnswer,emptyAnswer,formatRational} from "../answers";

const combos=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>combos(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const independentRank=(A:ExactMatrix):number=>{
  for(let size=Math.min(A.length,A[0].length);size>=1;size--)
    for(const rows of combos(A.length,size))for(const cols of combos(A[0].length,size))
      if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return size;
  return 0;
};
const classes=["system-one","system-many","system-none"] as const;

describe("MT-EDU-019 P0G pivot-aware 4×4 systems",()=>{
  it("exports exactly three distinct families",()=>{
    expect(gaussCramerFollowupFamilies.map(f=>f.id)).toEqual([
      "cramer-four-forced-pivot",
      "gauss-four-forced-pivot",
      "gauss-four-dependent-diagnostic",
    ]);
  });
  for(const family of gaussCramerFollowupFamilies)
    it(family.id+": checks 72 cases independently and both locales",()=>{
      const keys=new Set<string>();
      const kinds=new Set<string>();
      let pivotSwaps=0,fractions=0;
      for(const level of family.supportedDifficulties)for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        if(p.kind!=="linear-system"&&p.kind!=="linear-cramer-four")
          throw Error("Unexpected P0G kind");
        const A=p.matrix as ExactMatrix,b=p.rhs;
        expect(A).toHaveLength(4);
        expect(A.every(row=>row.length===4)).toBe(true);
        expect(b).toHaveLength(4);
        expect(A[0][0].numerator).toBe(0n);
        expect(A[1][0].numerator).not.toBe(0n);
        if(A.some(row=>row.some(x=>x.denominator!==1n)))fractions++;
        const ra=independentRank(A), rab=independentRank(A.map((row,i)=>[...row,b[i]]));
        const kind=ra<rab?"system-none":ra===4?"system-one":"system-many";
        kinds.add(kind);
        if(p.kind==="linear-cramer-four"||p.method==="gauss")expect(kind).toBe("system-one");
        if(family.id==="gauss-four-dependent-diagnostic")
          expect(kind).toBe(classes[v%3]);
        const D=laplace(A);
        expect(D.numerator===0n).toBe(ra!==4);
        const forward=gaussianElimination(A,b);
        if(forward.steps.some(step=>step.action.includes("↔")))pivotSwaps++;
        keys.add(task.contentKey);
        let xs:ReturnType<typeof q>[]=[];
        if(kind==="system-one"){
          xs=Array.from({length:4},(_,j)=>d(laplace(A.map((row,i)=>row.map((z,k)=>j===k?b[i]:z))),D));
          for(let i=0;i<4;i++)
            expect(eq(A[i].map((z,j)=>m(z,xs[j])).reduce(a,q(0)),b[i])).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale);
          expect(lesson.question.length).toBeGreaterThan(60);
          expect(lesson.solution!.length).toBeGreaterThan(4);
          expect(lesson.hint.length).toBeGreaterThan(0);
          expect(lesson.nextHint.length).toBeGreaterThan(0);
          if(locale==="en")expect(lesson.question).not.toMatch(/[ąćęłńóśźż]/i);
          for(const step of lesson.solution!)if(step.kind==="working"){
            expect(step.action.length).toBeGreaterThan(0);
            expect(step.reason.length).toBeGreaterThan(0);
            for(const calculation of step.calculations)
              expect(auditCalculation(calculation)).toBe(true);
          }
          expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
          if(kind==="system-one"){
            expect(lesson.answer.kind).toBe("system");
            if(lesson.answer.kind!=="system")throw Error("Expected system input");
            expect(lesson.answer.values.every((x,j)=>eq(x,xs[j]))).toBe(true);
            const correct={kind:"system" as const,classification:"system-one",values:xs.map(formatRational)};
            expect(assessAnswer(lesson.answer,correct).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{...correct,values:["99999",...correct.values.slice(1)]}).kind).toBe("incorrect");
            expect(assessAnswer(lesson.answer,{...correct,values:["1/0",...correct.values.slice(1)]}).kind).toBe("invalid");
          }else{
            expect(lesson.answer.kind).toBe("choice");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:kind==="system-none"?"system-many":"system-none"}).kind).toBe("incorrect");
            if(kind==="system-none")
              expect(lesson.solution!.some(x=>x.action.includes("0 = "))).toBe(true);
          }
        }
      }
      expect(keys.size).toBe(72);
      expect(pivotSwaps).toBe(72);
      expect(fractions).toBeGreaterThan(0);
      expect(kinds).toEqual(family.id==="gauss-four-dependent-diagnostic"
        ?new Set(classes):new Set(["system-one"]));
    },30000);
  it("rejects unsupported levels and variant boundaries",()=>{
    for(const f of gaussCramerFollowupFamilies){
      expect(()=>makeUniversityTask(f.id,-1,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,24,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,1.5,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,0,"easy")).toThrow();
    }
  });
});
