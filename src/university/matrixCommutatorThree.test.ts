import { describe, expect, it } from "vitest";
import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, equalRational as eq, type Rational
} from "../rational";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import { taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { competencyIndex } from "../competencyIndex";
import { createMatrixCommutatorThree, matrixCommutatorThreeFamilies } from "./matrixCommutatorThree";
type Matrix = readonly (readonly Rational[])[];
const prod = (a: Matrix, b: Matrix): Rational[][] =>
  a.map(row=>b[0].map((_,j)=>row.reduce((sum,v,k)=>add(sum,mul(v,b[k][j])),r(0))));
const diff = (a: Matrix,b: Matrix):Rational[][] =>
  a.map((row,i)=>row.map((v,j)=>sub(v,b[i][j])));
const same = (a: Matrix,b: Matrix):boolean =>
  a.length===b.length && a.every((row,i)=>row.length===b[i]?.length &&
    row.every((v,j)=>eq(v,b[i][j])));

describe("M04 P03/3 AB−BA: isolated exact math and student integration",()=>{
  const id="matrix-commutator-three";
  it("preserves source acceptance status and registers only one new family",()=>{
    expect(matrixCommutatorThreeFamilies).toHaveLength(1);
    expect(matrixCommutatorThreeFamilies[0].id).toBe(id);
    expect(matrixCommutatorThreeFamilies[0].supportedDifficulties).toEqual(
      ["hard","advanced","expert"]);
    expect(competencyIndex.M04.familyIds).toContain(id);
    expect(competencyIndex.M04.coverage).toBe("partial");
    for(const variant of [-1,24,1.3,NaN,Infinity])
      expect(()=>createMatrixCommutatorThree(variant,"hard")).toThrow();
    expect(()=>createMatrixCommutatorThree(0,"medium")).toThrow();
    expect(()=>createMatrixCommutatorThree(0,"easy")).toThrow();
  });
  const allKeys = new Set<string>();
  for(const level of ["hard","advanced","expert"] as const)
    it(level+": 24 independent 3x3 commutators, both locales and grading",()=>{
      const pool=taskPool("matrices",level).filter(task=>task.templateId===id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(x=>x.id)).size).toBe(24);
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask(id,variant,level);
        expect(task.id).toBe(id+":"+level+":"+variant);
        allKeys.add(task.contentKey);
        const p=task.university;
        if(p.kind!=="linear-matrix-practice") throw Error("Unexpected task kind");
        expect(p.expression).toBe("AB−BA");
        expect(p.matrices.map(m=>m.label)).toEqual(["A","B"]);
        const A=p.matrices[0].values, B=p.matrices[1].values;
        expect(A).toHaveLength(3);expect(B).toHaveLength(3);
        expect(A.every(row=>row.length===3)&&B.every(row=>row.length===3)).toBe(true);
        // Independent explicit dot-product oracle: never call production multiplyMatrices.
        const AB=prod(A,B),BA=prod(B,A), expected=diff(AB,BA);
        expect(same(AB,BA)).toBe(false);
        expect(eq(expected[0][2],sub(A[0][0],A[2][2]))).toBe(true);
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale);
          expect(view.question).toContain("AB−BA");
          expect(view.question).toContain("A=[[");
          expect(view.question).toContain("B=[[");
          expect(view.hint.length).toBeGreaterThan(20);
          expect(view.nextHint).toContain("AB−BA");
          expect(view.solution?.length).toBe(6);
          expect(view.solution?.at(-1)?.kind).toBe("answer");
          expect(view.explanation).toContain("AB=");
          expect(view.explanation).toContain("BA=");
          expect(view.answer.kind).toBe("matrix");
          if(view.answer.kind!=="matrix")throw Error("Expected matrix answer");
          expect(same(view.answer.values,expected)).toBe(true);
          const correct=expected.map(row=>row.map(fmt));
          expect(assessAnswer(view.answer,{kind:"matrix",values:correct}).kind).toBe("correct");
          const wrong=correct.map(row=>[...row]);wrong[1][1]=fmt(add(expected[1][1],r(1)));
          expect(assessAnswer(view.answer,{kind:"matrix",values:wrong}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          wrong[1][1]="1/0";
          expect(assessAnswer(view.answer,{kind:"matrix",values:wrong}).kind).toBe("invalid");
        }
      }
    });
  it("produces 72 distinct source-method content keys without changing older IDs",()=>{
    expect(allKeys.size).toBe(72);
  });
});