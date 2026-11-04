import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { infinityRootConjugationFamilies, infinityRootConjugationLimit } from "./infinityRootConjugation";
import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq, type Rational } from "../rational";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { auditCalculation } from "./audit";
import { polishLearningText } from "../../e2e/helpers/localization";

const number=(z:Rational)=>Number(z.numerator)/Number(z.denominator);
const negative=(z:Rational)=>mul(r(-1),z);
const expected=(p:Extract<ReturnType<typeof makeUniversityTask>["university"],{kind:"limit-root-infinity-conjugates"}>)=>{
  if(p.mode==="linear-pair")return r(0);
  const term=p.mode==="quadratic-pair"?sub(p.b,p.d):p.b;
  return div(p.direction==="negative"?negative(term):term,mul(r(2),p.s));
};
function evaluate(p:Extract<ReturnType<typeof makeUniversityTask>["university"],{kind:"limit-root-infinity-conjugates"}>,x:number){
  const s=number(p.s),b=number(p.b),c=number(p.c),d=number(p.d),e=number(p.e);
  if(p.mode==="linear-pair")return Math.sqrt(s*s*x+e)-s*Math.sqrt(x+d);
  const first=Math.sqrt(s*s*x*x+b*x+c);
  return p.mode==="quadratic-pair"?first-Math.sqrt(s*s*x*x+d*x+e):
    first+(p.direction==="positive"?-s:s)*x;
}
describe("#151 G05 direct-source method completion: infinity radical conjugates",()=>{
  it("one advanced family, 3 forms × 8 variants, no copies of source worksheets",()=>{
    expect(infinityRootConjugationFamilies.map(x=>x.id)).toEqual(["limit-root-infinity-conjugates"]);
    expect(infinityRootConjugationFamilies[0].supportedDifficulties).toEqual(["advanced"]);
    expect(()=>makeUniversityTask("limit-root-infinity-conjugates",0,"hard")).toThrow();
    expect(()=>makeUniversityTask("limit-root-infinity-conjugates",24,"advanced")).toThrow();
  });
  it("independently proves all 24 exact limits, finite-difference convergence and PL/EN feedback",()=>{
    const keys=new Set<string>(),forms=new Set<string>(),directions=new Set<string>(),signs=new Set<number>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("limit-root-infinity-conjugates",v,"advanced"),p=task.university;
      if(p.kind!=="limit-root-infinity-conjugates")throw Error("Wrong G05 problem");
      keys.add(task.contentKey);forms.add(p.mode);directions.add(p.direction);
      expect(p.s.numerator>0n).toBe(true);
      const ref=expected(p);
      expect(eq(ref,infinityRootConjugationLimit(p))).toBe(true);
      signs.add(Math.sign(number(ref)));
      // Separate oracle evaluates the original radical expression far along its valid ray.
      const x=p.direction==="negative"?-1e8:1e8;
      expect(Math.abs(evaluate(p,x)-number(ref))).toBeLessThan(0.005);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),ans=view.answer;
        if(ans.kind!=="limit"||ans.value.kind!=="finite")throw Error("Expected finite limit");
        expect(eq(ans.value.value,ref)).toBe(true);
        expect(view.question).toContain(p.direction==="negative"?"−∞":"+∞");
        expect(view.hint.length).toBeGreaterThan(25);
        expect(view.nextHint.length).toBeGreaterThan(25);
        const work=view.solution?.filter(step=>step.kind==="working")??[];
        expect(work.length).toBeGreaterThanOrEqual(4);
        for(const step of work)if(step.kind==="working"){
          expect(step.reason.length).toBeGreaterThan(20);
          for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
        }
        expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
        expect(assessAnswer(ans,{kind:"limit",classification:"finite",value:f(ref)}).kind).toBe("correct");
        expect(assessAnswer(ans,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
        if(locale==="en")expect(view.question+view.hint+view.nextHint+view.explanation).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
    expect(forms).toEqual(new Set(["quadratic-pair","quadratic-linear","linear-pair"]));
    expect(directions).toEqual(new Set(["positive","negative"]));
    expect(signs).toEqual(new Set([-1,0,1]));
  });
  it("guards against undefined leading terms and unsupported direction",()=>{
    const task=makeUniversityTask("limit-root-infinity-conjugates",2,"advanced").university;
    if(task.kind!=="limit-root-infinity-conjugates")throw Error("Wrong kind");
    expect(()=>infinityRootConjugationLimit({...task,s:r(0)})).toThrow();
    expect(()=>infinityRootConjugationLimit({...task,direction:"negative"})).toThrow();
  });
});
