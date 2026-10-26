import {describe,it,expect} from "vitest";
import {improperIntegralFamilies,improperIntegralValue,type ImproperIntegralProblem} from "./improperIntegrals";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,multiplyRational as mul,divideRational as div,equalRational as eq,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {auditCalculation} from "./audit";
import {polishLearningText} from "../../e2e/helpers/localization";
const power=(x:Rational,p:number):Rational=>Array.from({length:p},()=>x).reduce(mul,r(1));
const expected=(p:ImproperIntegralProblem)=>{
 if(p.kind==="integral-improper-infinity"){
  if(p.power===1)return {kind:p.k.numerator>0n?"positive-infinity" as const:"negative-infinity" as const};
  return {kind:"finite" as const,value:div(p.k,mul(r(p.power-1),power(p.a,p.power-1)))};
 }
 if(p.power==="half")return {kind:"finite" as const,value:mul(mul(r(2),p.k),p.root)};
 return {kind:p.k.numerator>0n?"positive-infinity" as const:"negative-infinity" as const};
};
describe("MT-EDU-021 P2B: rigorous improper integrals and bilingual exercise integrity",()=>{
 it("creates two families and exactly 144 variants",()=>{
  expect(improperIntegralFamilies.map(x=>x.id)).toEqual(["integral-improper-infinity","integral-improper-endpoint"]);
  expect(improperIntegralFamilies.reduce((s,x)=>s+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of improperIntegralFamilies)for(const level of fam.supportedDifficulties){
  it(fam.id+"/"+level+": complete independent audit of 24 variants",()=>{
   const questions=new Set<string>(),classes=new Set<string>();
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(fam.id,variant,level),p=task.university;
    expect(task.category).toBe("integrals");
    questions.add(task.contentKey);
    if(p.kind!=="integral-improper-infinity"&&p.kind!=="integral-improper-endpoint")throw Error("Unsupported exercise");
    const reference=expected(p),actual=improperIntegralValue(p);
    classes.add(reference.kind);
    expect(actual.kind).toBe(reference.kind);
    if(actual.kind==="finite"&&reference.kind==="finite")expect(eq(actual.value,reference.value)).toBe(true);
    if(p.kind==="integral-improper-infinity"){
     expect(p.a.numerator).toBeGreaterThan(0n);
     // Independent integral test from F(T)-F(0), F'(x)=k/(x+a)^power.
     if(p.power>1){
      const primitive=(x:Rational)=>div(mul(p.k,power(r(1),0)),mul(r(1-p.power),power(x,p.power-1)));
      const upper=primitive(r(10000000));
      const low=primitive(p.a);
      const limit=div(mul(r(-1),p.k),mul(r(1-p.power),power(p.a,p.power-1)));
      expect(eq(limit,reference.kind==="finite"?reference.value:r(0))).toBe(true);
      expect(Math.abs(Number(upper.numerator)/Number(upper.denominator))).toBeLessThan(0.0005);
      expect(eq(mul(r(-1),low),limit)).toBe(true);
     }
    }else{
     expect(p.root.numerator).toBeGreaterThan(0n);
     if(p.power==="half"){
      const b=power(p.root,2);
      expect(b.numerator*p.root.denominator*p.root.denominator)
        .toBe(p.root.numerator*p.root.numerator*b.denominator);
      expect(reference.kind).toBe("finite");
     }
    }
    for(const locale of ["pl","en"] as const){
     const localized=localizeUniversity(task,locale),spec=localized.answer;
     expect(localized.question.length).toBeGreaterThan(35);
     expect(localized.hint.length).toBeGreaterThan(15);
     expect(localized.nextHint.length).toBeGreaterThan(15);
     expect(localized.solution!.length).toBeGreaterThanOrEqual(5);
     if(locale==="en")for(const t of [localized.question,localized.hint,localized.nextHint,localized.explanation,...localized.solution!.map(x=>x.kind==="working"?x.action+" "+x.reason:"")])
       expect(t).not.toMatch(polishLearningText);
     for(const step of localized.solution!)if(step.kind==="working"){
      expect(step.action.length).toBeGreaterThan(8);
      expect(step.reason.length).toBeGreaterThan(20);
      for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
     }
     expect(spec.kind).toBe("limit");
     if(spec.kind!=="limit")throw Error("Expected limit answer");
     expect(spec.value.kind).toBe(reference.kind);
     if(spec.value.kind==="finite"&&reference.kind==="finite")expect(eq(spec.value.value,reference.value)).toBe(true);
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     expect(assessAnswer(spec,{kind:"limit",classification:reference.kind,value:reference.kind==="finite"?f(reference.value):""}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"limit",classification:reference.kind==="finite"?"positive-infinity":"finite",value:"0"}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
    }
   }
   expect(questions.size).toBe(24);
   expect(classes).toEqual(new Set(["finite","positive-infinity","negative-infinity"]));
  },30000);
 }
 it("rejects invalid parameters and unsupported variants",()=>{
  for(const fam of improperIntegralFamilies){
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const i=makeUniversityTask("integral-improper-infinity",0,"hard").university;
  const e=makeUniversityTask("integral-improper-endpoint",0,"hard").university;
  if(i.kind!=="integral-improper-infinity"||e.kind!=="integral-improper-endpoint")throw Error("Problem kind mismatch");
  expect(()=>improperIntegralValue({...i,a:r(0)})).toThrow();
  expect(()=>improperIntegralValue({...i,k:r(0)})).toThrow();
  expect(()=>improperIntegralValue({...e,root:r(0)})).toThrow();
  expect(()=>improperIntegralValue({...e,k:r(0)})).toThrow();
 });
});
