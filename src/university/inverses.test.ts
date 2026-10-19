import { describe,it,expect } from "vitest";
import { difficulties } from "../difficulty";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { inverseFamilies } from "./inverses";
import { a,m,d,eq,laplace,auditCalculation,q } from "./audit";
import type { Rational } from "../rational";
import type { ExactMatrix } from "./linearAlgebraMath";
const minor=(A:ExactMatrix,i:number,j:number)=>A.filter((_,r)=>r!==i).map(row=>row.filter((_,c)=>c!==j));
const independentProduct=(A:ExactMatrix,B:ExactMatrix)=>A.map(row=>B[0].map((_,j)=>row.map((x,k)=>m(x,B[k][j])).reduce(a,q(0))));
const same=(A:ExactMatrix,B:ExactMatrix)=>A.length===B.length && A.every((row,i)=>row.length===B[i].length && row.every((x,j)=>eq(x,B[i][j])));
const independentInverse=(A:ExactMatrix):ExactMatrix|null=>{
  const determinant=laplace(A);
  if(determinant.numerator===0n)return null;
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),laplace(minor(A,j,i))),determinant)));
};
const I=(n:number):Rational[][]=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>q(i===j?1:0)));
describe("P0 exact inverses and AX=B",()=>{
  it("keeps elementary 2×2 work on honest levels and adds singular and fractional hard cases",()=>{
    const family=inverseFamilies.find(item=>item.id==="inverse-two")!;
    expect(family.supportedDifficulties).toEqual(["easy","medium","hard"]);
    expect(()=>makeUniversityTask("inverse-two",0,"advanced")).toThrow();
    const hard=Array.from({length:24},(_,v)=>makeUniversityTask("inverse-two",v,"hard"));
    expect(hard.filter(task=>task.answer.kind==="choice").length).toBeGreaterThanOrEqual(6);
    expect(hard.some(task=>task.university.kind==="linear-inverse"&&task.university.matrix.flat().some(value=>value.denominator>1n))).toBe(true);
  });
  it("audits every variant and both full lessons against independent cofactors and multiplication",()=>{
    for(const family of inverseFamilies) for(const level of difficulties) {
      if(!family.supportedDifficulties.includes(level))continue;
      const questions=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        if(p.kind!=="linear-inverse"&&p.kind!=="linear-application")throw Error("Wrong kind");
        const oracle=independentInverse(p.matrix);
        questions.add(task.contentKey);
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale);
          expect(lesson.question).not.toBe("");
          expect(lesson.hint).not.toBe("");
          expect(lesson.nextHint).not.toBe("");
          expect(lesson.solution!.length).toBeGreaterThan(2);
          expect(lesson.solution!.at(-1)!.kind).toBe("answer");
          for(const step of lesson.solution!)if(step.kind==="working"){
            expect(step.action).not.toBe("");expect(step.reason).not.toBe("");
            for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
          }
          if(p.kind==="linear-inverse"){
            if(p.method==="classification" || !oracle){
              expect(lesson.answer.kind).toBe("choice");
              if(lesson.answer.kind==="choice") expect(lesson.answer.value).toBe(oracle?"inverse-yes":"inverse-no");
            }else{
              expect(lesson.answer.kind).toBe("matrix");
              if(lesson.answer.kind==="matrix"){
                expect(same(lesson.answer.values,oracle)).toBe(true);
                expect(same(independentProduct(p.matrix,lesson.answer.values),I(p.matrix.length))).toBe(true);
                expect(same(independentProduct(lesson.answer.values,p.matrix),I(p.matrix.length))).toBe(true);
              }
            }
          }else{
            expect(oracle).not.toBeNull();
            expect(lesson.answer.kind).toBe("matrix");
            if(lesson.answer.kind==="matrix") expect(same(p.method==="xa"?independentProduct(lesson.answer.values,p.matrix):independentProduct(p.matrix,lesson.answer.values),p.rhs)).toBe(true);
          }
          expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
          if(lesson.answer.kind==="matrix"){
            const correct={kind:"matrix" as const,values:lesson.answer.values.map(row=>row.map(formatRational))};
            expect(assessAnswer(lesson.answer,correct).kind).toBe("correct");
            const wrong={kind:"matrix" as const,values:correct.values.map((row,i)=>row.map((value,j)=>i===0&&j===0?"999":value))};
            expect(assessAnswer(lesson.answer,wrong).kind).toBe("incorrect");
          }else if(lesson.answer.kind==="choice"){
            expect(assessAnswer(lesson.answer,{kind:"choice",value:lesson.answer.value}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:lesson.answer.value==="inverse-yes"?"inverse-no":"inverse-yes"}).kind).toBe("incorrect");
          }
        }
      }
      expect(questions.size,`${family.id}/${level}`).toBe(24);
    }
  },30_000);
});
