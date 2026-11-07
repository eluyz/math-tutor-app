import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { higherRootDerivativeFamilies,higherRootCoefficients,higherRootPowers } from "./higherRootDerivatives";
import { rational as r, multiplyRational as mul, subtractRational as sub, equalRational as eq,type Rational } from "../rational";
import { assessAnswer,emptyAnswer,formatRational as fmt } from "../answers";
import { auditCalculation } from "./audit";
import { polishLearningText } from "../../e2e/helpers/localization";
const num=(z:Rational)=>Number(z.numerator)/Number(z.denominator);
describe("#151 D01 direct-source method completion: higher root powers",()=>{
  it("has one synthetic hard family with 24 variants and no unsupported levels",()=>{
    expect(higherRootDerivativeFamilies.map(f=>f.id)).toEqual(["derivative-higher-root-powers"]);
    expect(higherRootDerivativeFamilies[0].supportedDifficulties).toEqual(["hard"]);
    expect(()=>makeUniversityTask("derivative-higher-root-powers",0,"easy")).toThrow();
    expect(()=>makeUniversityTask("derivative-higher-root-powers",24,"hard")).toThrow();
  });
  it("audits sums, sixth-root quotients, exact coefficients, domain and bilingual feedback",()=>{
    const keys=new Set<string>(),modes=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("derivative-higher-root-powers",v,"hard"),p=task.university;
      if(p.kind!=="derivative-higher-root-powers")throw Error("Wrong derivative");
      keys.add(task.contentKey);modes.add(p.mode);
      const exponents=higherRootPowers[p.mode];
      const coefficients=p.mode==="sum"?p.coefficients:[p.coefficients[0],mul(r(-1),p.coefficients[1])];
      const values=coefficients.map((coeff,i)=>mul(coeff,exponents[i]));
      expect(values.length).toBe(p.mode==="sum"?4:2);
      expect(higherRootCoefficients(p).every((z,i)=>eq(z,values[i]))).toBe(true);
      const original=(x:number)=>{
        const [a,b,c,d]=p.coefficients.map(num);
        return p.mode==="sum"?a*x*x+b*Math.cbrt(x)+c*x*Math.pow(x*x*x,1/5)+d/Math.pow(x,1/4):
          (a*x-b*Math.pow(x,5/6))/(x*Math.sqrt(x));
      };
      for(const x of [0.8,2,3.2]){
        const transformed=(coefficients as readonly Rational[]).reduce<number>((acc,coeff,i)=>acc+num(coeff)*Math.pow(x,num(exponents[i])),0);
        expect(Math.abs(original(x)-transformed)).toBeLessThan(1e-8);
        const derivative=values.reduce<number>((acc,coeff,i)=>acc+num(coeff)*Math.pow(x,num(sub(exponents[i],r(1)))),0);
        const h=1e-5;
        expect(Math.abs((original(x+h)-original(x-h))/(2*h)-derivative)).toBeLessThan(0.001);
      }
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),ans=view.answer;
        if(ans.kind!=="list")throw Error("Expected ordered coefficient answer");
        expect(view.question).toContain("x>0");
        expect(view.question).toContain(p.mode==="sum"?"∛x":"⁶√");
        expect(ans.values).toHaveLength(values.length);
        expect(ans.values.every((z,i)=>eq(z,values[i]))).toBe(true);
        expect(ans.labels).toEqual(exponents.map(exp=>"x^("+fmt(sub(exp,r(1)))+")"));
        const work=view.solution?.filter(x=>x.kind==="working")??[];
        expect(work.length).toBeGreaterThanOrEqual(4);
        for(const step of work)if(step.kind==="working"){
          expect(step.reason.length).toBeGreaterThan(15);
          for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
        }
        expect(assessAnswer(ans,{kind:"list",values:values.map(fmt)}).kind).toBe("correct");
        const wrong=values.map(fmt);wrong[0]=fmt(sub(values[0],r(1)));
        expect(assessAnswer(ans,{kind:"list",values:wrong}).kind).toBe("incorrect");
        expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
        if(locale==="en")expect(view.question+view.hint+view.nextHint+view.explanation).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
    expect(modes).toEqual(new Set(["sum","quotient"]));
  });
});
