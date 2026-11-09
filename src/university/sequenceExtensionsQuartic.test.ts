import {describe,it,expect} from "vitest";
import {addRational as add, rational as r, type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {
  createQuarticRootSequence, quarticRootSequenceLimit, presentQuarticRootSequence,
  type QuarticRootSequence,
} from "./sequenceExtensionsQuartic";
const levels=["medium","hard","advanced","expert"] as const;
const equal=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const num=(q:Rational)=>Number(q.numerator)/Number(q.denominator);
const evaluate=(p:QuarticRootSequence,n:number)=>{
 const top=num(p.numeratorQuadratic)*n**2+num(p.numeratorLinear)*n+num(p.numeratorConstant);
 const bottom=Math.sqrt(num(p.rootLeading)**2*n**4+num(p.rootLinear)*n+num(p.rootConstant));
 return top/bottom;
};
describe("C02 isolated quartic-radical method (not yet catalog-registered)",()=>{
 it("96 unique synthetic tasks, both locales, exact independent limits and grading",()=>{
  const seen=new Set<string>();
  for(const level of levels)for(let v=0;v<24;v++){
   const p=createQuarticRootSequence(v,level);
   const expected=r(p.numeratorQuadratic.numerator*p.rootLeading.denominator,
     p.numeratorQuadratic.denominator*p.rootLeading.numerator);
   const actual=quarticRootSequenceLimit(p);
   expect(actual.kind).toBe("finite");
   expect(equal(actual.value,expected)).toBe(true);
   for(const locale of ["pl","en"] as const){
    const task=presentQuarticRootSequence(p,locale);
    expect(task.question).toContain("n→+∞");
    expect(task.question).toContain("n⁴");
    expect(task.solution.length).toBeGreaterThanOrEqual(5);
    expect(task.solution.some(x=>x.kind==="working"&&x.action.includes("n³"))).toBe(true);
    expect(task.hint.length).toBeGreaterThan(15);
    expect(task.nextHint.length).toBeGreaterThan(15);
    expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(expected)}).kind).toBe("correct");
    expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(add(expected,r(1)))}).kind).toBe("incorrect");
    expect(assessAnswer(task.answer,emptyAnswer(task.answer)).kind).toBe("invalid");
    expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
    if(locale==="en")expect(task.question).not.toMatch(/[ąćęłńóśźż]/i);
   }
   seen.add(presentQuarticRootSequence(p,"pl").question);
  }
  expect(seen.size).toBe(96);
 });
 it("zero, negative and positive leading coefficients converge numerically",()=>{
  for(const [v,sign] of [[0,0],[1,-1],[2,1]] as const){
   const p=createQuarticRootSequence(v,"medium"),value=quarticRootSequenceLimit(p);
   expect(Math.sign(num(value.value))).toBe(sign);
   expect(Math.abs(evaluate(p,100000)-num(value.value))).toBeLessThan(0.0001);
  }
 });
 it("rejects unsupported variants and unsafe radical domains",()=>{
  expect(()=>createQuarticRootSequence(-1,"medium")).toThrow();
  expect(()=>createQuarticRootSequence(24,"medium")).toThrow();
  expect(()=>createQuarticRootSequence(1.5,"medium")).toThrow();
  expect(()=>createQuarticRootSequence(0,"easy")).toThrow();
  const p=createQuarticRootSequence(0,"medium");
  expect(()=>quarticRootSequenceLimit({...p,rootLeading:r(0)})).toThrow();
  expect(()=>quarticRootSequenceLimit({...p,rootLinear:r(-1)})).toThrow();
  expect(()=>quarticRootSequenceLimit({...p,rootConstant:r(-10)})).toThrow();
 });
});
