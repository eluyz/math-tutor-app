import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer,formatRational as format} from "../answers";
import {taskPool} from "../generators";
import type {Rational} from "../rational";
import {a,m,d,eq,laplace,q} from "./audit";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {createXaSourceThree,xaSourceThreeFamilies} from "./inverseXaThreeSource";

type Matrix=readonly (readonly Rational[])[];
const mul=(A:Matrix,B:Matrix):Rational[][]=>
  A.map(row=>B[0].map((_,j)=>row.map((v,k)=>m(v,B[k][j])).reduce(a,q(0))));
const same=(A:Matrix,B:Matrix):boolean=>
  A.length===B.length && A.every((row,i)=>row.length===B[i]?.length &&
    row.every((v,j)=>eq(v,B[i][j])));
function invByCofactors(A:Matrix):Rational[][]{
  const det=laplace(A);expect(det.numerator).not.toBe(0n);
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),
    laplace(A.filter((_,row)=>row!==j)
      .map(row=>row.filter((_,col)=>col!==i)))),det)));
}
const I=(n:number)=>Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>q(i===j?1:0)));

describe("M13 P05/2b source-shape 3x3 XA=B acceptance candidate",()=>{
  const id="inverse-right-source-three";
  it("adds only a single opt-in family, leaves historical rectangular tasks unchanged",()=>{
    expect(xaSourceThreeFamilies.map(x=>x.id)).toEqual([id]);
    expect(xaSourceThreeFamilies[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
    for(const bad of [-1,24,0.5,NaN,Infinity])
      expect(()=>createXaSourceThree(bad,"hard")).toThrow();
    expect(()=>createXaSourceThree(0,"medium")).toThrow();
    const original=makeUniversityTask("inverse-right-applications",0,"expert").university;
    if(original.kind!=="linear-application")throw Error("Legacy source task kind");
    expect(original.matrix).toHaveLength(3);
    expect(original.rhs).toHaveLength(2); // Historical XA=B remains rectangular
  });
  const keys=new Set<string>();
  for(const difficulty of ["hard","advanced","expert"] as const)
    it(difficulty+": 24 exact 3x3 right-inverse variants; PL/EN, steps, hints and grading",()=>{
      const pool=taskPool("matrices",difficulty).filter(t=>t.templateId===id);
      expect(pool).toHaveLength(24);
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask(id,variant,difficulty);
        expect(task.id).toBe(pool[variant].id);
        keys.add(task.contentKey);
        const p=task.university;
        if(p.kind!=="linear-application")throw Error("Expected inverse equation");
        expect(p.method).toBe("xa");
        const A=p.matrix,B=p.rhs;
        expect(A).toHaveLength(3);expect(B).toHaveLength(3);
        expect(A.every(row=>row.length===3)&&B.every(row=>row.length===3)).toBe(true);
        const inverse=invByCofactors(A);
        expect(same(mul(A,inverse),I(3))).toBe(true);
        expect(same(mul(inverse,A),I(3))).toBe(true);
        const X=mul(B,inverse);
        expect(X).toHaveLength(3);expect(X.every(row=>row.length===3)).toBe(true);
        expect(same(mul(X,A),B)).toBe(true);
        // Deliberately wrong multiplication order must not be taught or accepted.
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale);
          expect(view.title).toBe(xaSourceThreeFamilies[0].titles[locale]);
          expect(view.question).toContain("XA = B");
          expect(view.question).toContain("A = [[");
          expect(view.question).toContain("B = [[");
          expect(view.hint.length).toBeGreaterThan(20);
          expect(view.nextHint.length).toBeGreaterThan(25);
          expect(view.solution?.length).toBeGreaterThanOrEqual(4);
          expect(view.solution?.at(-1)?.kind).toBe("answer");
          expect(view.solution?.some(step=>step.action.includes("BA⁻¹"))).toBe(true);
          expect(view.answer.kind).toBe("matrix");
          if(view.answer.kind!=="matrix")throw Error("Expected matrix");
          expect(same(view.answer.values,X)).toBe(true);
          const correct=X.map(row=>row.map(format));
          expect(assessAnswer(view.answer,{kind:"matrix",values:correct}).kind).toBe("correct");
          const wrong=correct.map(row=>[...row]);
          wrong[0][0]=format(a(X[0][0],q(1)));
          expect(assessAnswer(view.answer,{kind:"matrix",values:wrong}).kind).toBe("incorrect");
          wrong[0][0]="1/0";
          expect(assessAnswer(view.answer,{kind:"matrix",values:wrong}).kind).toBe("invalid");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
        }
      }
    },45000);
  it("records exactly 72 unique student-facing keys",()=>expect(keys.size).toBe(72));
});