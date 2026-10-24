import {describe,it,expect} from "vitest";
import {inverseFourFamilies} from "./inverseFour";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {inverse,product,type ExactMatrix} from "./linearAlgebraMath";
import {laplace,eq,m,d,q,auditCalculation} from "./audit";
import {assessAnswer,formatRational,emptyAnswer} from "../answers";
import type {Rational} from "../rational";

const minor=(A:ExactMatrix,i:number,j:number)=>A.filter((_,row)=>row!==i).map(row=>row.filter((_,col)=>col!==j));
const independentInverse=(A:ExactMatrix):ExactMatrix|null=>{
  const determinant=laplace(A);
  if(determinant.numerator===0n)return null;
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),laplace(minor(A,j,i))),determinant)));
};
const oracleProduct=(A:ExactMatrix,B:ExactMatrix):ExactMatrix=>
  A.map(row=>B[0].map((_,j)=>row.map((c,k)=>m(c,B[k][j])).reduce((x,y)=>({numerator:x.numerator*y.denominator+y.numerator*x.denominator,denominator:x.denominator*y.denominator}),q(0))));
const same=(A:ExactMatrix,B:ExactMatrix)=>A.length===B.length&&A.every((row,i)=>
  row.length===B[i].length&&row.every((v,j)=>eq(v,B[i][j])));
const identity=(n:number):Rational[][]=>Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>q(i===j?1:0)));

describe("MT-EDU-019 P0F1: inverses and 4×4 AX=B",()=>{
  for(const family of inverseFourFamilies)it(family.id+" has 72 unique correct bilingual cases",()=>{
    const keys=new Set<string>();
    let singular=0,swaps=0,fractions=0;
    for(const level of family.supportedDifficulties)for(let v=0;v<24;v++){
      const task=makeUniversityTask(family.id,v,level),problem=task.university;
      if(problem.kind!=="linear-inverse"&&problem.kind!=="linear-application")
        throw Error("Expected inverse or matrix equation");
      const A=problem.matrix;
      expect(A.length).toBe(4);
      expect(A.every(row=>row.length===4)).toBe(true);
      const oracle=independentInverse(A),computed=inverse(A);
      expect(computed.value===null).toBe(oracle===null);
      if(oracle){
        expect(same(computed.value!,oracle)).toBe(true);
        expect(same(oracleProduct(A,oracle),identity(4))).toBe(true);
        expect(same(oracleProduct(oracle,A),identity(4))).toBe(true);
      }else singular++;
      if(computed.reduction.steps.some(step=>step.action.includes("↔")))swaps++;
      if(A.some(row=>row.some(x=>x.denominator!==1n)))fractions++;
      keys.add(task.contentKey);
      for(const locale of ["pl","en"] as const){
        const lesson=localizeUniversity(task,locale);
        expect(lesson.question.length).toBeGreaterThan(20);
        expect(lesson.hint.length).toBeGreaterThan(0);
        expect(lesson.nextHint.length).toBeGreaterThan(0);
        expect(lesson.solution!.length).toBeGreaterThan(2);
        for(const step of lesson.solution!)if(step.kind==="working")
          for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
        expect(assessAnswer(lesson.answer,emptyAnswer(lesson.answer)).kind).toBe("invalid");
        if(problem.kind==="linear-inverse"&&!oracle){
          expect(lesson.answer.kind).toBe("choice");
          if(lesson.answer.kind==="choice"){
            expect(lesson.answer.value).toBe("inverse-no");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:"inverse-no"}).kind).toBe("correct");
            expect(assessAnswer(lesson.answer,{kind:"choice",value:"inverse-yes"}).kind).toBe("incorrect");
          }
        }else{
          expect(lesson.answer.kind).toBe("matrix");
          if(lesson.answer.kind!=="matrix")throw Error("Expected matrix answer");
          const X=lesson.answer.values;
          if(problem.kind==="linear-inverse"){
            expect(same(X,oracle!)).toBe(true);
          }else{
            expect(oracle).not.toBeNull();
            expect(problem.rhs.length).toBe(4);
            expect(problem.rhs.every(row=>row.length===2)).toBe(true);
            expect(same(oracleProduct(A,X),problem.rhs)).toBe(true);
            expect(same(X,oracleProduct(oracle!,problem.rhs))).toBe(true);
          }
          const correct={kind:"matrix" as const,values:X.map(row=>row.map(formatRational))};
          const bad={kind:"matrix" as const,values:correct.values.map((row,i)=>row.map((x,j)=>i===0&&j===0?"999999":x))};
          expect(assessAnswer(lesson.answer,correct).kind).toBe("correct");
          expect(assessAnswer(lesson.answer,bad).kind).toBe("incorrect");
          expect(assessAnswer(lesson.answer,{kind:"matrix",values:correct.values.map((row,i)=>row.map((x,j)=>i===0&&j===0?"1/0":x))}).kind).toBe("invalid");
        }
        if(locale==="en")expect(lesson.question).not.toMatch(/[ąćęłńóśźż]/i);
      }
    }
    expect(keys.size).toBe(72);
    if(family.id==="inverse-four-gauss-jordan")expect(singular).toBe(12);
    else expect(singular).toBe(0);
    expect(swaps).toBeGreaterThanOrEqual(36);
    expect(fractions).toBeGreaterThan(0);
  },30000);
  it("preserves dimension validation on inverse",()=>{
    expect(()=>inverse([])).toThrow();
    expect(()=>inverse([[q(1),q(2)]] )).toThrow();
  });
});
