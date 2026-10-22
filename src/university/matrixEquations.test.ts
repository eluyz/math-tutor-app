import {describe,it,expect} from "vitest";
import {formatRational as f,assessAnswer} from "../answers";
import {rational as r, addRational as add,multiplyRational as mul,equalRational as eq} from "../rational";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {advancedMatrixEquationFamilies} from "./matrixEquations";
import {laplace} from "./audit";

const dot=(a:readonly (readonly ReturnType<typeof r>[])[],b:readonly (readonly ReturnType<typeof r>[])[])=>
  a.map(row=>b[0].map((_,j)=>row.reduce((sum,value,i)=>add(sum,mul(value,b[i][j])),r(0))));
const equal=(a:readonly (readonly ReturnType<typeof r>[])[],b:readonly (readonly ReturnType<typeof r>[])[])=>
  a.length===b.length&&a.every((row,i)=>row.length===b[i].length&&row.every((v,j)=>eq(v,b[i][j])));

describe("MT-EDU-013 P0 matrix equations",()=>{
  it("generates 168 distinct 2×2 exercises",()=>{
    const total=advancedMatrixEquationFamilies.reduce((sum,family)=>sum+family.supportedDifficulties.length*24,0);
    expect(total).toBe(168);
  });
  for(const family of advancedMatrixEquationFamilies)for(const level of family.supportedDifficulties){
    it(`${family.id}/${level}: all exact variants and both locales`,()=>{
      const pool=taskPool("matrices",level).filter(x=>x.templateId===family.id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(x=>x.contentKey)).size).toBe(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        if(p.kind!=="linear-matrix-equation")throw Error("Unexpected task kind");
        const answer=task.answer;
        if(answer.kind!=="matrix")throw Error("Expected matrix answer");
        expect(answer.values).toHaveLength(2);
        const x=answer.values;
        if(p.mode==="ax-shift"){
          const lhs=dot(p.left,x);
          const rhs=x.map((row,i)=>row.map((value,j)=>add(mul(p.shift,value),p.rhs[i][j])));
          expect(equal(lhs,rhs)).toBe(true);
          const shifted=p.left.map((row,i)=>row.map((value,j)=>i===j?add(value,mul(r(-1),p.shift)):value));
          expect(laplace(shifted).numerator).not.toBe(0n);
        }else{
          expect(laplace(p.left).numerator).not.toBe(0n);
          expect(laplace(p.right).numerator).not.toBe(0n);
          expect(equal(dot(dot(p.left,x),p.right),p.rhs)).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const t=localizeUniversity(task,locale);
          expect(t.question.length).toBeGreaterThan(50);
          expect(t.solution?.length).toBeGreaterThan(5);
          expect(assessAnswer(t.answer,{kind:"matrix",values:x.map(row=>row.map(f))}).kind).toBe("correct");
          expect(assessAnswer(t.answer,{kind:"matrix",values:x.map((row,i)=>row.map((e,j)=>i===0&&j===0?"1/0":f(e)))}).kind).toBe("invalid");
        }
      }
    });
  }
});
