import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { fractionalPowerDerivativeFamilies } from "./fractionalPowerDerivatives";
import { rational as r, multiplyRational as mul, subtractRational as sub, equalRational as eq } from "../rational";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { auditCalculation } from "./audit";
import { polishLearningText } from "../../e2e/helpers/localization";

const exponents = [
  [r(1,2),r(-1),r(2)],
  [r(3,2),r(-1,2),r(1)],
  [r(-2),r(3,2),r(2)],
  [r(-3,2),r(-3),r(1,2)],
];

describe("#151 D01 source-method: fractional and negative power derivatives", () => {
  it("registers one medium family with exactly 24 synthetic variants", () => {
    expect(fractionalPowerDerivativeFamilies).toHaveLength(1);
    expect(fractionalPowerDerivativeFamilies[0].supportedDifficulties).toEqual(["medium"]);
    expect(() => makeUniversityTask("derivative-fractional-powers", 0, "easy")).toThrow();
    expect(() => makeUniversityTask("derivative-fractional-powers", 24, "medium")).toThrow();
  });
  it("independently checks all 4 radical/reciprocal forms, exact coefficients and PL/EN grading", () => {
    const unique = new Set<string>();
    const modes = new Set<number>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("derivative-fractional-powers",v,"medium");
      const p=task.university;
      if(p.kind!=="derivative-fractional-powers")throw Error("Unexpected kind");
      expect(task.category).toBe("derivatives");
      unique.add(task.contentKey);modes.add(p.mode);
      const powers=exponents[p.mode];
      const result=p.coefficients.map((coeff,i)=>mul(coeff,powers[i]));
      const powersAfter=powers.map(ex=>sub(ex,r(1)));
      // Independent pointwise numerical derivative on the declared domain x>0.
      for(const x of [0.75,2,3.25]){
        const fOf=(z:number)=>p.coefficients.reduce((acc,c,i)=>acc+Number(c.numerator)/Number(c.denominator)*z**(Number(powers[i].numerator)/Number(powers[i].denominator)),0);
        const h=1e-5;
        const numeric=(fOf(x+h)-fOf(x-h))/(2*h);
        const exact=result.reduce((acc,c,i)=>acc+Number(c.numerator)/Number(c.denominator)*x**(Number(powersAfter[i].numerator)/Number(powersAfter[i].denominator)),0);
        expect(Math.abs(numeric-exact)).toBeLessThan(0.0005);
      }
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale);
        const ans=view.answer;
        if(ans.kind!=="list")throw Error("Expected ordered coefficient list");
        expect(ans.values).toHaveLength(3);
        expect(ans.values.every((value,i)=>eq(value,result[i]))).toBe(true);
        expect(ans.labels).toEqual(powersAfter.map(ex=>"x^("+f(ex)+")"));
        expect(view.question).toContain("√");
        expect(view.question).toContain("x>0");
        expect(view.hint.length).toBeGreaterThan(20);
        expect(view.nextHint.length).toBeGreaterThan(20);
        const workings=view.solution?.filter(step=>step.kind==="working")??[];
        expect(workings.length).toBeGreaterThanOrEqual(6);
        for(const step of workings)if(step.kind==="working"){
          expect(step.reason.length).toBeGreaterThan(18);
          for(const c of step.calculations)expect(auditCalculation(c)).toBe(true);
        }
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        expect(assessAnswer(ans,{kind:"list",values:result.map(f)}).kind).toBe("correct");
        expect(assessAnswer(ans,{kind:"list",values:[f(r(result[0].numerator+result[0].denominator,result[0].denominator)),...result.slice(1).map(f)]}).kind).toBe("incorrect");
        expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
        if(locale==="en")expect(view.question+view.hint+view.nextHint+view.explanation).not.toMatch(polishLearningText);
      }
    }
    expect(unique.size).toBe(24);
    expect(modes).toEqual(new Set([0,1,2,3]));
  });
});
