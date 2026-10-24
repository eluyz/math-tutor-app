import {describe,it,expect} from "vitest";
import {gaussianPivotFamilies,gaussianPivotTrace} from "./gaussianPivotDeterminants";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {laplace,eq,q,m} from "./audit";
import {formatRational as f,assessAnswer} from "../answers";
import {rational as r,addRational as add} from "../rational";
import type {DeterminantProblem} from "./schema";
import {taskPool} from "../generators";

describe("MT-EDU-019 P0E1: Gaussian pivots 4×4/5×5",()=>{
  for(const family of gaussianPivotFamilies)it(family.id+" audits all 72 variants and both locales",()=>{
    const keys=new Set<string>();
    let singular=0,swapped=0,fractional=0;
    for(const level of family.supportedDifficulties){
      const tasks=taskPool("determinants",level).filter(task=>task.templateId===family.id);
      expect(tasks).toHaveLength(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level);
        const p=task.university as DeterminantProblem;
        if(task.answer.kind!=="scalar")throw Error("Expected determinant scalar");
        const n=family.id.endsWith("four")?4:5;
        expect(p.method).toBe(n===4?"gaussian-four":"gaussian-five");
        expect(p.matrix).toHaveLength(n);
        expect(p.matrix.every(row=>row.length===n)).toBe(true);
        expect(p.matrix[0][0].numerator).toBe(0n);
        const trace=gaussianPivotTrace(p.matrix);
        const oracle=laplace(p.matrix);
        expect(eq(trace.value,oracle)).toBe(true);
        expect(eq(task.answer.value,oracle)).toBe(true);
        expect(assessAnswer(task.answer,f(task.answer.value)).kind).toBe("correct");
        expect(assessAnswer(task.answer,f(add(task.answer.value,r(1)))).kind).toBe("incorrect");
        expect(assessAnswer(task.answer,"1/0").kind).toBe("invalid");
        expect(trace.steps.some(step=>step.operation.kind==="swap")).toBe(true);
        if(trace.singularColumn!==null){
          singular++;
          expect(oracle.numerator).toBe(0n);
          expect(trace.matrix.slice(trace.singularColumn).every(row=>row[trace.singularColumn!].numerator===0n)).toBe(true);
        }else{
          expect(trace.matrix.every((row,i)=>row.slice(0,i).every(cell=>cell.numerator===0n))).toBe(true);
          const diagonal=trace.matrix.map((row,i)=>row[i]);
          expect(eq(diagonal.reduce(m,q(trace.swaps%2?-1:1)),oracle)).toBe(true);
        }
        if(trace.swaps)swapped++;
        if(p.matrix.some(row=>row.some(cell=>cell.denominator!==1n)))fractional++;
        let previous=p.matrix;
        for(const step of trace.steps){
          const before=laplace(previous),after=laplace(step.matrix);
          expect(eq(after,step.operation.kind==="swap"?m(q(-1),before):before)).toBe(true);
          previous=step.matrix;
        }
        for(const locale of ["pl","en"] as const){
          const localized=localizeUniversity(task,locale);
          expect(localized.answer).toEqual(task.answer);
          expect(localized.contentKey).toBe(task.contentKey);
          expect(localized.solution?.length).toBeGreaterThanOrEqual(3);
          const text=localized.solution!.map(s=>s.action+" "+s.reason).join(" ");
          expect(text).toContain("det(A)");
          if(trace.singularColumn!==null)expect(text).toContain("det(A)=0");
          else expect(text).toContain("↔");
          if(locale==="en")expect(localized.question).not.toMatch(/[ąćęłńóśźż]/i);
        }
        keys.add(task.contentKey);
      }
    }
    expect(keys.size).toBe(72);
    expect(singular).toBe(12);
    expect(swapped).toBe(72);
    expect(fractional).toBeGreaterThan(0);
  });
  it("rejects unsupported dimensions and variants",()=>{
    const family=gaussianPivotFamilies[0];
    expect(()=>family.create(-1,"medium")).toThrow();
    expect(()=>family.create(24,"medium")).toThrow();
    expect(()=>gaussianPivotTrace([[r(1),r(2)],[r(3),r(4)]])).toThrow();
  });
});
