import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {multivarLimitFamilies,multivarLimitValue,secondPathLimit,continuityAtPoint,type MultivarLimitProblem} from "./multivarLimits";
import {rational as r,addRational as add,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {auditCalculation} from "./audit";
const sq=(x:Rational)=>mul(x,x);
const equal=(x:Rational,y:Rational)=>x.numerator*y.denominator===y.numerator*x.denominator;
const abs=(x:Rational)=>r(x.numerator<0n?-x.numerator:x.numerator,x.denominator);
const lessEqual=(x:Rational,y:Rational)=>x.numerator*y.denominator<=y.numerator*x.denominator;
const pathOracle=(p:MultivarLimitProblem,u:Rational):Rational=>{
 const v=mul(p.curve,sq(u));
 const numerator=mul(mul(p.factor,sq(u)),v);
 const denominator=add(sq(sq(u)),sq(v));
 return add(p.base,div(numerator,denominator));
};
describe("MT-EDU-021 P2C W03: path limits and continuity with exact independently evaluated functions",()=>{
 it("two families, three supported levels, 144 exercise variants",()=>{
  expect(multivarLimitFamilies.map(z=>z.id)).toEqual(["multivar-path-limit","multivar-continuity-point"]);
  expect(multivarLimitFamilies.reduce((sum,z)=>sum+z.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of multivarLimitFamilies)for(const level of family.supportedDifficulties){
  it(family.id+"/"+level+" audits every variant in PL and EN",()=>{
   const distinct=new Set<string>(),classes=new Set<string>();
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(family.id,variant,level);
    const p=task.university;
    if(p.kind!=="multivar-path-limit"&&p.kind!=="multivar-continuity-point")throw Error("Wrong exercise type");
    expect(task.category).toBe("function-limits");
    distinct.add(task.contentKey);
    expect(p.factor.numerator).not.toBe(0n);
    expect(p.curve.numerator).toBeGreaterThan(0n);
    const limit=multivarLimitValue(p),different=p.mode==="different-paths";
    expect(limit.kind).toBe(different?"does-not-exist":"finite");
    if(limit.kind==="finite")expect(equal(limit.value,p.base)).toBe(true);
    if(different){
     const second=secondPathLimit(p);
     expect(equal(p.base,second)).toBe(false);
     for(const u of [r(1),r(1,2),r(1,23),r(-1,9)]){
      expect(equal(pathOracle(p,u),second)).toBe(true);
     }
    }else{
     for(const [u,v] of [[r(1),r(2)],[r(2,3),r(-4,5)],[r(1,50),r(-2,37)]]){
      const radius=add(sq(u),sq(v));
      const deviation=abs(div(mul(p.factor,mul(sq(u),sq(v))),radius));
      const bound=div(mul(abs(p.factor),radius),r(4));
      expect(lessEqual(deviation,bound)).toBe(true);
     }
    }
    if(p.kind==="multivar-continuity-point"){
     const classification=continuityAtPoint(p);
     classes.add(classification);
     expect(classification).toBe(p.mode==="different-paths"?"nonremovable":p.mode);
     if(p.mode==="continuous")expect(equal(p.base,p.valueAt)).toBe(true);
     if(p.mode==="removable")expect(equal(p.base,p.valueAt)).toBe(false);
    }else classes.add(limit.kind);
    for(const locale of ["pl","en"] as const){
     const taskLocalized=localizeUniversity(task,locale),spec=taskLocalized.answer;
     expect(taskLocalized.question.length).toBeGreaterThan(50);
     expect(taskLocalized.solution?.length).toBeGreaterThanOrEqual(5);
     expect(taskLocalized.nextHint.length).toBeGreaterThan(20);
     if(locale==="en")for(const text of [taskLocalized.question,taskLocalized.hint,taskLocalized.nextHint,taskLocalized.explanation,...taskLocalized.solution!.map(z=>z.kind==="working"?z.action+" "+z.reason:"")])
       expect(text).not.toMatch(polishLearningText);
     for(const step of taskLocalized.solution!)if(step.kind==="working"){
      expect(step.action.length).toBeGreaterThan(8);
      expect(step.reason.length).toBeGreaterThan(20);
      for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
     }
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     if(p.kind==="multivar-continuity-point"){
      expect(spec.kind).toBe("choice");
      if(spec.kind!=="choice")throw Error("Answer should be choice");
      const correct=continuityAtPoint(p);
      expect(spec.value).toBe(correct);
      expect(spec.options.length).toBe(3);
      expect(assessAnswer(spec,{kind:"choice",value:correct}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==correct)!.value}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"choice",value:"bogus"}).kind).toBe("invalid");
     }else{
      expect(spec.kind).toBe("limit");
      if(spec.kind!=="limit")throw Error("Answer should be limit");
      const correct=spec.value.kind;
      expect(correct).toBe(different?"does-not-exist":"finite");
      expect(assessAnswer(spec,{kind:"limit",classification:correct,value:correct==="finite"?f(p.base):""}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"limit",classification:different?"finite":"does-not-exist",value:"99999"}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
     }
    }
   }
   expect(distinct.size).toBe(24);
   expect(classes.size).toBe(family.id==="multivar-continuity-point"?3:2);
  },30000);
 }
 it("rejects unsupported parameters, indices and difficulty",()=>{
  for(const family of multivarLimitFamilies){
   expect(()=>makeUniversityTask(family.id,24,"medium")).toThrow();
   expect(()=>makeUniversityTask(family.id,-1,"medium")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const p=makeUniversityTask("multivar-path-limit",0,"medium").university;
  if(p.kind!=="multivar-path-limit")throw Error("Unexpected kind");
  expect(()=>multivarLimitValue({...p,factor:r(0)})).toThrow();
  expect(()=>secondPathLimit({...p,curve:r(0)})).toThrow();
  const q=makeUniversityTask("multivar-continuity-point",0,"medium").university;
  if(q.kind!=="multivar-continuity-point")throw Error("Unexpected kind");
  expect(()=>continuityAtPoint({...q,factor:r(0)})).toThrow();
 });
});
