import {describe,it,expect} from "vitest";
import {functionStudyFollowupFamilies,quarticValue,rationalStudyValue,criticalPoints,globalExtrema,type FunctionStudyFollowupProblem} from "./functionStudyFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {auditCalculation} from "./audit";
const sq=(x:Rational)=>mul(x,x);
const equal=(x:Rational,y:Rational)=>x.numerator*y.denominator===y.numerator*x.denominator;
const value=(p:FunctionStudyFollowupProblem,t:Rational):Rational=>p.kind==="analysis-study-quartic"
 ? add(mul(p.m,sq(sub(sq(t),sq(p.q)))),p.k)
 : add(mul(p.m,add(t,div(sq(p.q),t))),p.k);
const slope=(p:FunctionStudyFollowupProblem,t:Rational):Rational=>p.kind==="analysis-study-quartic"
 ? sub(mul(r(4),mul(p.m,mul(mul(t,t),t))),mul(r(4),mul(p.m,mul(sq(p.q),t))))
 : mul(p.m,sub(r(1),div(sq(p.q),sq(t))));
const sign=(x:Rational)=>x.numerator>0n?1:x.numerator<0n?-1:0;

describe("MT-EDU-022 P2D: full-study quartic and shifted-rational families",()=>{
 it("two families × 3 levels × 24 = 144 new variants",()=>{
  expect(functionStudyFollowupFamilies.map(x=>x.id)).toEqual(["analysis-study-quartic","analysis-study-rational-shift"]);
  expect(functionStudyFollowupFamilies.reduce((sum,x)=>sum+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of functionStudyFollowupFamilies)for(const level of fam.supportedDifficulties){
  it(fam.id+"/"+level+": exact independent value, derivative and lesson audit",()=>{
   const questions=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(fam.id,v,level),p=task.university;
    if(p.kind!=="analysis-study-quartic"&&p.kind!=="analysis-study-rational-shift")throw Error("Wrong family");
    expect(task.category).toBe("derivatives");
    questions.add(task.contentKey);
    expect(p.q.numerator).toBeGreaterThan(0n);
    expect(p.m.numerator).not.toBe(0n);
    for(const z of [mul(r(-1),p.q),p.q]){
     expect(equal(slope(p,z),r(0))).toBe(true);
     const actual=p.kind==="analysis-study-quartic"?quarticValue(p,z):rationalStudyValue(p,z);
     expect(equal(actual,value(p,z))).toBe(true);
    }
    const expectedCritical=p.kind==="analysis-study-quartic"?
     [sub(p.a,p.q),p.k,p.a,add(p.k,mul(p.m,sq(sq(p.q)))),add(p.a,p.q),p.k]:
     [sub(p.a,p.q),sub(p.k,mul(r(2),mul(p.m,p.q))),add(p.a,p.q),add(p.k,mul(r(2),mul(p.m,p.q)))];
    expect(criticalPoints(p).length).toBe(expectedCritical.length);
    expect(criticalPoints(p).every((x,i)=>equal(x,expectedCritical[i]))).toBe(true);
    const tValues=[mul(r(-2),p.q),mul(r(-1,2),p.q),mul(r(1,2),p.q),mul(r(2),p.q)];
    const expectedSigns=p.kind==="analysis-study-quartic"?[-1,1,-1,1]:[1,-1,-1,1];
    for(let i=0;i<4;i++)expect(sign(slope(p,tValues[i]))).toBe(expectedSigns[i]*sign(p.m));
    if(p.kind==="analysis-study-quartic")expect(equal(slope(p,r(0)),r(0))).toBe(true);
    else expect(()=>rationalStudyValue(p,r(0))).toThrow();
    const [max,min]=globalExtrema(p);
    const start=p.kind==="analysis-study-quartic"?mul(r(-2),p.q):mul(r(1,2),p.q);
    const end=mul(r(2),p.q);
    const samples=p.kind==="analysis-study-quartic"?
      [start,mul(r(-1),p.q),r(0),p.q,end]:
      [start,p.q,end];
    const evaluated=samples.map(z=>value(p,z));
    for(const y of evaluated){
     expect(sign(sub(max,y))).toBeGreaterThanOrEqual(0);
     expect(sign(sub(y,min))).toBeGreaterThanOrEqual(0);
    }
    expect(evaluated.some(y=>equal(y,max))).toBe(true);
    expect(evaluated.some(y=>equal(y,min))).toBe(true);
    for(const locale of ["pl","en"] as const){
     const taskLocalized=localizeUniversity(task,locale),spec=taskLocalized.answer;
     expect(taskLocalized.question.length).toBeGreaterThan(80);
     expect(taskLocalized.solution!.length).toBeGreaterThanOrEqual(9);
     expect(taskLocalized.nextHint.length).toBeGreaterThan(20);
     if(locale==="en")for(const text of [taskLocalized.title,taskLocalized.question,taskLocalized.hint,taskLocalized.nextHint,taskLocalized.explanation,...taskLocalized.solution!.map(z=>z.kind==="working"?z.action+" "+z.reason:"")])
       expect(text).not.toMatch(polishLearningText);
     for(const step of taskLocalized.solution!)if(step.kind==="working"){
      expect(step.reason.length).toBeGreaterThan(20);
      for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
     }
     expect(spec.kind).toBe("list");
     if(spec.kind!=="list")throw Error("Expected list answer");
     const answer=p.target==="global"?[max,min]:expectedCritical;
     expect(spec.values.length).toBe(answer.length);
     expect(spec.values.every((x,i)=>equal(x,answer[i]))).toBe(true);
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     expect(assessAnswer(spec,{kind:"list",values:answer.map(f)}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"list",values:answer.map((x,i)=>f(i===0?add(x,r(1)):x))}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"list",values:answer.map((x,i)=>i===0?"1/0":f(x))}).kind).toBe("invalid");
    }
   }
   expect(questions.size).toBe(24);
  },30000);
 }
 it("rejects invalid parameters and unavailable difficulty",()=>{
  for(const fam of functionStudyFollowupFamilies){
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"medium")).toThrow();
  }
  const a=makeUniversityTask("analysis-study-quartic",0,"hard").university;
  const b=makeUniversityTask("analysis-study-rational-shift",0,"hard").university;
  if(a.kind!=="analysis-study-quartic"||b.kind!=="analysis-study-rational-shift")throw Error("Unexpected problem types");
  expect(()=>quarticValue({...a,q:r(0)},r(1))).toThrow();
  expect(()=>globalExtrema({...b,m:r(0)})).toThrow();
 });
});
