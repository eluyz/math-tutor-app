import {describe,it,expect} from "vitest";
import {derivativeFollowupFamilies,quotientDerivativeAt,logDerivativeAt,type DerivativeFollowupProblem} from "./derivativeFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq,type Rational} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {auditCalculation} from "./audit";
const sq=(x:Rational)=>mul(x,x);
const quadratic=(a:Rational,b:Rational,c:Rational,x:Rational)=>add(add(mul(a,sq(x)),mul(b,x)),c);
const slope=(a:Rational,b:Rational,x:Rational)=>add(mul(r(2),mul(a,x)),b);
const referenceQuotient=(p:Extract<DerivativeFollowupProblem,{kind:"derivative-quadratic-quotient"}>):Rational=>{
 // Exact polynomial expansion of N'D − ND' evaluated at h:
 // (2ax+b)(dx+e) − (ax²+bx+c)d = (ad)x² + (2ae)x + (be−cd)
 const h=p.at;
 const det=add(add(mul(mul(p.a,p.d),sq(h)),mul(mul(r(2),mul(p.a,p.e)),h)),sub(mul(p.b,p.e),mul(p.c,p.d)));
 const D=add(mul(p.d,h),p.e);
 return div(det,sq(D));
};
const referenceLog=(p:Extract<DerivativeFollowupProblem,{kind:"derivative-log-quadratic"}>):Rational=>{
 const h=p.at;
 return div(slope(p.a,p.b,h),quadratic(p.a,p.b,p.c,h));
};
describe("MT-EDU-021 P2A: exact derivative oracles and bilingual curriculum",()=>{
 it("introduces 144 tasks in two derivative families",()=>{
  expect(derivativeFollowupFamilies.map(x=>x.id)).toEqual(["derivative-quadratic-quotient","derivative-log-quadratic"]);
  expect(derivativeFollowupFamilies.reduce((x,t)=>x+t.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of derivativeFollowupFamilies)for(const level of family.supportedDifficulties){
  it(family.id+"/"+level+": exact proof for every variant and locale",()=>{
   const seen=new Set<string>();let zeros=0;
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(family.id,v,level),p=task.university;
    expect(task.category).toBe("derivatives");
    seen.add(task.contentKey);
    let answer:Rational;
    if(p.kind==="derivative-quadratic-quotient"){
     const D=add(mul(p.d,p.at),p.e);
     expect(D.numerator).not.toBe(0n);
     answer=referenceQuotient(p);
     expect(eq(answer,quotientDerivativeAt(p))).toBe(true);
     // The two symbolically independent forms must coincide exactly.
     const unexpanded=div(sub(mul(slope(p.a,p.b,p.at),D),mul(quadratic(p.a,p.b,p.c,p.at),p.d)),sq(D));
     expect(eq(answer,unexpanded)).toBe(true);
    }else if(p.kind==="derivative-log-quadratic"){
     const u=quadratic(p.a,p.b,p.c,p.at);
     expect(u.numerator).toBeGreaterThan(0n);
     answer=referenceLog(p);
     if(answer.numerator===0n)zeros++;
     expect(eq(answer,logDerivativeAt(p))).toBe(true);
     const hx=p.at, symbolic=add(add(mul(p.a,sq(hx)),mul(p.b,hx)),p.c);
     expect(eq(symbolic,u)).toBe(true);
    }else throw Error("Unexpected family");
    for(const locale of ["pl","en"] as const){
     const localized=localizeUniversity(task,locale),spec=localized.answer;
     expect(localized.question.length).toBeGreaterThan(35);
     expect(localized.hint.length).toBeGreaterThan(10);
     expect(localized.nextHint.length).toBeGreaterThan(12);
     expect(localized.solution!.length).toBeGreaterThanOrEqual(5);
     if(locale==="en")for(const z of [localized.question,localized.hint,localized.nextHint,localized.explanation,...localized.solution!.map(x=>x.kind==="working"?x.action+" "+x.reason:"")])
       expect(z).not.toMatch(polishLearningText);
     for(const step of localized.solution!)if(step.kind==="working"){
      expect(step.action.length).toBeGreaterThan(8);
      expect(step.reason.length).toBeGreaterThan(20);
      for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
     }
     expect(spec.kind).toBe("scalar");
     if(spec.kind!=="scalar")throw Error("Expected scalar");
     expect(eq(spec.value,answer)).toBe(true);
     expect(assessAnswer(spec,f(answer)).kind).toBe("correct");
     expect(assessAnswer(spec,f(add(answer,r(1)))).kind).toBe("incorrect");
     expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    }
   }
   expect(seen.size).toBe(24);
   if(family.id==="derivative-log-quadratic")expect(zeros).toBeGreaterThan(0);
  },30000);
 }
 it("rejects absent variants, unsupported levels and invalid differentiation points",()=>{
  for(const family of derivativeFollowupFamilies){
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const a=makeUniversityTask("derivative-log-quadratic",0,"hard").university;
  if(a.kind!=="derivative-log-quadratic")throw Error("Invalid kind");
  expect(()=>logDerivativeAt({...a,c:sub(a.c,add(quadratic(a.a,a.b,a.c,a.at),r(1)))})).toThrow();
  const b=makeUniversityTask("derivative-quadratic-quotient",0,"hard").university;
  if(b.kind!=="derivative-quadratic-quotient")throw Error("Invalid kind");
  expect(()=>quotientDerivativeAt({...b,e:sub(r(0),mul(b.d,b.at))})).toThrow();
 });
});
