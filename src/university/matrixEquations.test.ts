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
  it("preserves 336 original 2×2 and adds 144 P0D 3×3 exercises",()=>{
    const total=advancedMatrixEquationFamilies.reduce((sum,family)=>sum+family.supportedDifficulties.length*24,0);
    expect(total).toBe(480);
    expect(advancedMatrixEquationFamilies.filter(x=>x.id.endsWith("-three"))).toHaveLength(2);
  });

  it("P0D variants are distinct across every difficulty, including expert",()=>{
    for(const family of advancedMatrixEquationFamilies.filter(f=>f.id.endsWith("-three"))){
      const keys=family.supportedDifficulties.flatMap(level=>
        taskPool("matrices",level).filter(task=>task.templateId===family.id).map(task=>task.contentKey));
      expect(keys).toHaveLength(72);
      expect(new Set(keys).size).toBe(72);
    }
  });
  it("P0D genuinely extends size and preserves the existing 2×2 families",()=>{
    for(const family of advancedMatrixEquationFamilies){
      for(const level of family.supportedDifficulties){
        const first=makeUniversityTask(family.id,0,level).university;
        if(first.kind!=="linear-matrix-equation")throw Error("Wrong kind");
        expect(first.left.length).toBe(family.id.endsWith("-three")?3:2);
        expect(first.left.every(row=>row.length===first.left.length)).toBe(true);
      }
    }
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
        expect(answer.values).toHaveLength(p.left.length);
        const x=answer.values;
        if(p.mode==="ax-shift"){
          const lhs=dot(p.left,x);
          const rhs=x.map((row,i)=>row.map((value,j)=>add(mul(p.shift,value),p.rhs[i][j])));
          expect(equal(lhs,rhs)).toBe(true);
          const shifted=p.left.map((row,i)=>row.map((value,j)=>i===j?add(value,mul(r(-1),p.shift)):value));
          expect(laplace(shifted).numerator).not.toBe(0n);
        }else if(p.mode==="axb"){
          expect(laplace(p.left).numerator).not.toBe(0n);
          expect(laplace(p.right).numerator).not.toBe(0n);
          expect(equal(dot(dot(p.left,x),p.right),p.rhs)).toBe(true);
        }else if(p.mode==="inverse-plus"){
          expect(laplace(p.rhs).numerator).not.toBe(0n);
          // Verify the actual inverse relation, not merely a rearranged expression.
          const original=p.left.map((row,i)=>row.map((v,j)=>add(v,mul(p.shift,x[i][j]))));
          const identity=[[r(1),r(0)],[r(0),r(1)]];
          expect(equal(dot(original,p.rhs),identity)).toBe(true);
          expect(equal(dot(p.rhs,original),identity)).toBe(true);
        }else{
          const shifted=p.rhs.map((row,i)=>row.map((v,j)=>i===j?add(v,mul(r(-1),p.shift)):v));
          expect(laplace(shifted).numerator).not.toBe(0n);
          const lhs=x.map((row,i)=>row.map((v,j)=>add(mul(p.shift,v),p.left[i][j])));
          expect(equal(lhs,dot(p.rhs,x))).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const t=localizeUniversity(task,locale);
          expect(t.question.length).toBeGreaterThan(50);
          expect(t.solution?.length).toBeGreaterThan(5);
          expect(assessAnswer(t.answer,{kind:"matrix",values:x.map(row=>row.map(f))}).kind).toBe("correct");
          expect(assessAnswer(t.answer,{kind:"matrix",values:x.map((row,i)=>row.map((e,j)=>i===0&&j===0?f(add(e,r(1))):f(e)))}).kind).toBe("incorrect");
          expect(assessAnswer(t.answer,{kind:"matrix",values:x.map((row,i)=>row.map((e,j)=>i===0&&j===0?"1/0":f(e)))}).kind).toBe("invalid");
        }
      }
    });
  }
});
