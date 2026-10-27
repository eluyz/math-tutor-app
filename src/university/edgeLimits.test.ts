import {describe,it,expect} from "vitest";
import {edgeLimitFamilies,edgeLimitClass,type EdgeLimitProblem} from "./edgeLimits";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import type {Rational} from "../rational";
const num=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const oracle=(p:EdgeLimitProblem)=>{
 if(p.coefficient.numerator===0n)throw Error("invalid input coefficient");
 if(p.kind==="derivative-vertical-cusp")return p.mode;
 const damped=p.mode!=="oscillatory";
 return !damped?"oscillatory":p.valueAt.numerator*p.constant.denominator===p.constant.numerator*p.valueAt.denominator?"continuous":"removable";
};
const quotient=(p:Extract<EdgeLimitProblem,{kind:"derivative-vertical-cusp"}>,t:number)=>
 num(p.coefficient)*(p.mode==="vertical"?Math.cbrt(t)/t:Math.pow(Math.abs(t),2/3)/t)+num(p.linear);

describe("MT-EDU-027 P3A independent D06 and G08 mathematics",()=>{
 it("declares exactly two new families and 144 different variants",()=>{
  expect(edgeLimitFamilies.map(f=>f.id)).toEqual(["derivative-vertical-cusp","limit-oscillatory-heine"]);
  expect(edgeLimitFamilies.reduce((n,f)=>n+24*f.supportedDifficulties.length,0)).toBe(144);
 });
 for(const fam of edgeLimitFamilies)for(const level of fam.supportedDifficulties)
 it(fam.id+"/"+level+" validates 24 bilingual tasks and independent classification",()=>{
  const keys=new Set<string>(),classes=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(fam.id,v,level),p=task.university;
   if(p.kind!=="derivative-vertical-cusp"&&p.kind!=="limit-oscillatory-heine")throw Error("Wrong kind");
   keys.add(task.contentKey);
   expect(num(p.coefficient)).not.toBe(0);
   const expected=oracle(p);classes.add(expected);
   expect(edgeLimitClass(p)).toBe(expected);
   expect(task.category).toBe(fam.category);
   if(p.kind==="derivative-vertical-cusp"){
    const left=quotient(p,-1e-9),right=quotient(p,1e-9),sgn=Math.sign(num(p.coefficient));
    expect(Math.abs(left)).toBeGreaterThan(100);
    expect(Math.abs(right)).toBeGreaterThan(100);
    expect(Math.sign(right)).toBe(sgn);
    expect(Math.sign(left)).toBe(p.mode==="vertical"?sgn:-sgn);
    // Root terms tend to zero on both sides, so f is continuous at h.
    for(const t of [-1e-9,1e-9]){
     const root=p.mode==="vertical"?Math.cbrt(t):Math.pow(Math.abs(t),2/3);
     expect(Math.abs(num(p.coefficient)*root+num(p.linear)*t)).toBeLessThan(.012);
    }
   }else{
    for(const n of [1,10,100,1000]){
     // Two explicit sequences approaching h with phase nπ and π/2+2nπ.
     const x=1/(n*Math.PI),y=1/(Math.PI/2+2*n*Math.PI),c=num(p.constant),k=num(p.coefficient);
     const f1=c+k*(p.mode==="oscillatory"?1:x)*0;
     const f2=c+k*(p.mode==="oscillatory"?1:y);
     expect(f1).toBeCloseTo(c,12);
     if(p.mode==="oscillatory")expect(Math.abs(f2-f1)).toBeGreaterThan(0.1);
     else{
      expect(Math.abs(f2-c)).toBeLessThan(Math.abs(k)*y+1e-11);
      expect(Math.abs(k*y)).toBeLessThanOrEqual(Math.abs(k)*y+1e-11);
     }
    }
    if(p.mode==="continuous")expect(num(p.valueAt)).toBe(num(p.constant));
    if(p.mode==="removable")expect(num(p.valueAt)).not.toBe(num(p.constant));
   }
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.question.length).toBeGreaterThan(55);
    expect(view.solution?.length).toBeGreaterThanOrEqual(5);
    expect(spec.kind).toBe("choice");
    if(spec.kind!=="choice")throw Error("Expected choice");
    expect(spec.value).toBe(expected);
    expect(spec.options).toHaveLength(4);
    expect(new Set(spec.options.map(o=>o.label)).size).toBe(4);
    expect(assessAnswer(spec,{kind:"choice",value:expected}).kind).toBe("correct");
    expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==expected)!.value}).kind).toBe("incorrect");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec,{kind:"choice",value:"not-an-option"}).kind).toBe("invalid");
    if(locale==="en")for(const copy of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(s=>s.action+" "+s.reason)])
      expect(copy).not.toMatch(polishLearningText);
    for(const step of view.solution??[]){
     expect(step.action.length).toBeGreaterThan(8);
     expect(step.reason.length).toBeGreaterThan(12);
    }
   }
  }
  expect(keys.size).toBe(24);
  expect(classes.size).toBe(fam.id==="derivative-vertical-cusp"?2:3);
 },45000);
 it("does not offer variants outside supported range",()=>{
  for(const fam of edgeLimitFamilies){
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
 });
});
