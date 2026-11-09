import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {
  createC03ConjugateGap,c03ConjugateGapLimit,presentC03ConjugateGap,type C03ConjugateGap,
} from "./sequenceConjugateSourceShapes";

const levels=["medium","hard","advanced","expert"] as const;
const num=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
function independent(p:C03ConjugateGap):{kind:"finite",value:Rational}|{kind:"positive-infinity"}{
  if(p.mode==="linear-root-pair")return {kind:"finite",value:r(0)};
  if(p.mode==="positive-quadratic-sum")return {kind:"positive-infinity"};
  if(p.mode==="reverse-quadratic")return {kind:"finite",value:r(-p.a.numerator,2n*p.a.denominator)};
  return {kind:"finite",value:r(p.a.numerator*p.k.denominator,2n*p.a.denominator*p.k.numerator)};
}
function approximate(p:C03ConjugateGap,n:number):number{
  if(p.mode==="linear-root-pair")return Math.sqrt(n+num(p.left))-Math.sqrt(n+num(p.right));
  if(p.mode==="reverse-quadratic")return n-Math.sqrt(n*n+num(p.a)*n+num(p.b));
  if(p.mode==="positive-quadratic-sum")return n+Math.sqrt(n*n+num(p.a)*n+num(p.b));
  return Math.sqrt(num(p.k)**2*n*n+num(p.a)*n-num(p.b))-num(p.k)*n;
}

describe("C03 isolated source-shape gaps: two linear roots, reverse, positive sum, negative constant",()=>{
 it("verifies 96 synthetic PL/EN tasks independently, complete grading and domain",()=>{
  const seen=new Set<string>(),counts=new Map<string,number>();
  for(const level of levels)for(let variant=0;variant<24;variant++){
   const p=createC03ConjugateGap(variant,level),expected=independent(p),actual=c03ConjugateGapLimit(p);
   counts.set(p.mode,(counts.get(p.mode)||0)+1);
   expect(actual.kind).toBe(expected.kind);
   if(actual.kind==="finite"&&expected.kind==="finite")
    expect(eq(actual.value,expected.value)).toBe(true);
   const n=100000000;
   const calculated=approximate(p,n);
   if(expected.kind==="finite")
    expect(Math.abs(calculated-num(expected.value))).toBeLessThan(0.001);
   else expect(calculated).toBeGreaterThan(n);
   if(p.mode==="negative-constant-quadratic"){
    const k=num(p.k),a=num(p.a),b=num(p.b);
    expect(k*k*p.nStart*p.nStart+a*p.nStart-b).toBeGreaterThan(0);
   }
   for(const locale of ["pl","en"] as const){
    const task=presentC03ConjugateGap(p,locale);
    expect(task.question).toContain("n→+∞");
    expect(task.question).toContain("√(");
    expect(task.solution.length).toBeGreaterThanOrEqual(4);
    expect(task.hint.length).toBeGreaterThan(18);
    expect(task.nextHint.length).toBeGreaterThan(18);
    if(locale==="en")expect(task.question).not.toMatch(/[ąćęłńóśźż]/i);
    if(expected.kind==="finite"){
      expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(expected.value)}).kind).toBe("correct");
      expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(add(expected.value,r(1)))}).kind).toBe("incorrect");
      expect(assessAnswer(task.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
    }else{
      expect(assessAnswer(task.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("correct");
      expect(assessAnswer(task.answer,{kind:"limit",classification:"negative-infinity",value:""}).kind).toBe("incorrect");
      expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
    }
    expect(assessAnswer(task.answer,emptyAnswer(task.answer)).kind).toBe("invalid");
   }
   seen.add(presentC03ConjugateGap(p,"pl").question);
  }
  expect(seen.size).toBe(96);
  for(const mode of ["linear-root-pair","reverse-quadratic","positive-quadratic-sum","negative-constant-quadratic"])
    expect(counts.get(mode)).toBe(24);
 });
 it("rejects unsupported variants, equal roots, unsafe radicands, and lying n bounds",()=>{
  expect(()=>createC03ConjugateGap(-1,"medium")).toThrow();
  expect(()=>createC03ConjugateGap(24,"medium")).toThrow();
  expect(()=>createC03ConjugateGap(1.3,"medium")).toThrow();
  expect(()=>createC03ConjugateGap(0,"easy")).toThrow();
  expect(()=>c03ConjugateGapLimit({mode:"linear-root-pair",left:r(3),right:r(3)})).toThrow();
  expect(()=>c03ConjugateGapLimit({mode:"linear-root-pair",left:r(-1),right:r(2)})).toThrow();
  expect(()=>c03ConjugateGapLimit({mode:"reverse-quadratic",a:r(0),b:r(1)})).toThrow();
  expect(()=>c03ConjugateGapLimit({mode:"positive-quadratic-sum",a:r(2),b:r(-1)})).toThrow();
  expect(()=>c03ConjugateGapLimit({mode:"negative-constant-quadratic",k:r(1),a:r(0),b:r(12),nStart:1})).toThrow();
 });
});
