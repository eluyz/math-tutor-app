import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { auditCalculation } from "./audit";

/** Exact source-*shape* checks. Do not copy private worksheet coefficients. */
const evaluate = (cs:readonly Rational[],x:Rational):Rational =>
  cs.reduceRight((acc,c)=>add(mul(acc,x),c),r(0));
const derivative=(cs:readonly Rational[]):Rational[] =>
  cs.slice(1).map((c,i)=>mul(c,r(i+1)));
const nonzero=(z:Rational)=>z.numerator!==0n;

describe("Issue #151 G01/G02 source-shaped rational point limits",()=>{
  for(const spec of [
    {family:"limit-quadratic-ratio-point",level:"easy",skill:"G01"},
    {family:"limit-cancelled-quadratic-ratio",level:"medium",skill:"G02"},
  ] as const){
    it(`${spec.skill} ${spec.family}: 24 exact source-shape limits × PL/EN`,()=>{
      const seen=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(spec.family,v,spec.level),p=task.university;
        expect(task.id).toBe(`${spec.family}:${spec.level}:${v}`);
        if(p.kind!=="limit-point"||p.numerator.kind!=="polynomial")throw Error("Unexpected limit type");
        const n=p.numerator.coefficients,d=p.denominator,a=p.at;
        expect(n).toHaveLength(3);expect(d).toHaveLength(3);
        const topAt=evaluate(n,a),bottomAt=evaluate(d,a);
        let result:Rational;
        if(spec.skill==="G01"){
          // D(x)=(x-a)^2+q: its discriminant is negative, D(a)>0.
          expect(bottomAt.numerator).toBeGreaterThan(0n);
          const discriminant=sub(mul(d[1],d[1]),mul(r(4),mul(d[0],d[2])));
          expect(discriminant.numerator).toBeLessThan(0n);
          result=div(topAt,bottomAt);
        }else{
          // 0/0 must leave a nonzero residual denominator after cancelling
          // exactly one shared factor. This is not a polynomial-only example.
          expect(topAt.numerator).toBe(0n);expect(bottomAt.numerator).toBe(0n);
          const dn=evaluate(derivative(n),a),dd=evaluate(derivative(d),a);
          expect(nonzero(dn)).toBe(true);expect(nonzero(dd)).toBe(true);
          result=div(dn,dd);
        }
        seen.add(task.contentKey);
        const expected={kind:"limit" as const,classification:"finite" as const,value:f(result)};
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale);
          expect(assessAnswer(view.answer,expected)).toEqual({kind:"correct"});
          expect(assessAnswer(view.answer,{...expected,value:f(add(result,r(1)))}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(view.hint.length).toBeGreaterThan(15);
          expect(view.nextHint.length).toBeGreaterThan(15);
          expect(view.hint).not.toBe(view.nextHint);
          expect(view.explanation.length).toBeGreaterThan(20);
          const steps=view.solution?.filter(step=>step.kind==="working")??[];
          expect(steps.length).toBeGreaterThanOrEqual(3);
          for(const step of steps)if(step.kind==="working"){
            expect(step.action.trim()).not.toBe("");
            expect(step.reason.length).toBeGreaterThan(15);
            for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
          }
          expect(view.solution?.at(-1)?.kind).toBe("answer");
        }
      }
      expect(seen.size).toBe(24);
    });
  }
});
