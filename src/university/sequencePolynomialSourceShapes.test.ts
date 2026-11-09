import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {createC01Shape,c01ShapeLimit,presentC01Shape,type C01Shape} from "./sequencePolynomialSourceShapes";
const levels=["medium","hard","advanced","expert"] as const;
const number=(q:Rational)=>Number(q.numerator)/Number(q.denominator);
const equals=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const direct=(p:C01Shape,n:number):number=>{
 if(p.mode==="plain-polynomial")return number(p.leading)*n**p.degree+number(p.linear)*n+number(p.constant);
 if(p.mode==="factored-ratio")return number(p.a)*n*(n-number(p.p))**2/
   (number(p.b)*(n+number(p.q))*(n+number(p.shift))**2);
 return (number(p.a)*n**6+number(p.b)*n**4+number(p.c))/
  (number(p.d)*n**6+number(p.e)*n**2+number(p.f));
};
describe("C01 isolated source shapes: standalone polynomials, factored ratios, sextic ratios",()=>{
 it("checks all 96 variants in both languages with independent degree and sign oracle",()=>{
  const questions=new Set<string>(),modes=new Map<string,number>();
  for(const level of levels)for(let v=0;v<24;v++){
   const p=createC01Shape(v,level),actual=c01ShapeLimit(p);
   modes.set(p.mode,(modes.get(p.mode)||0)+1);
   if(p.mode==="plain-polynomial"){
    expect(actual.kind).toBe(p.leading.numerator>0n?"positive-infinity":"negative-infinity");
    const observed=direct(p,1e3);
    expect(Math.sign(observed)).toBe(p.leading.numerator>0n?1:-1);
    expect(Math.abs(observed)).toBeGreaterThan(1000);
   }else{
    const expected=p.mode==="factored-ratio"?
     r(p.a.numerator*p.b.denominator,p.a.denominator*p.b.numerator):
     r(p.a.numerator*p.d.denominator,p.a.denominator*p.d.numerator);
    expect(actual.kind).toBe("finite");
    if(actual.kind!=="finite")throw Error("Expected rational limit");
    expect(equals(actual.value,expected)).toBe(true);
    expect(Math.abs(direct(p,1e8)-number(expected))).toBeLessThan(0.001);
   }
   for(const locale of ["pl","en"] as const){
    const task=presentC01Shape(p,locale);
    expect(task.question).toContain("n→+∞");
    expect(task.solution.length).toBeGreaterThanOrEqual(5);
    expect(task.hint.length).toBeGreaterThan(20);
    expect(task.nextHint.length).toBeGreaterThan(20);
    if(locale==="en")expect(task.question).not.toMatch(/[ąćęłńóśźż]/i);
    if(actual.kind==="finite"){
     expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(actual.value)}).kind).toBe("correct");
     expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:f(add(actual.value,r(1)))}).kind).toBe("incorrect");
     expect(assessAnswer(task.answer,{kind:"limit",classification:"negative-infinity",value:""}).kind).toBe("incorrect");
    }else{
     expect(assessAnswer(task.answer,{kind:"limit",classification:actual.kind,value:""}).kind).toBe("correct");
     const opposite=actual.kind==="positive-infinity"?"negative-infinity":"positive-infinity";
     expect(assessAnswer(task.answer,{kind:"limit",classification:opposite,value:""}).kind).toBe("incorrect");
     expect(assessAnswer(task.answer,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
    }
    expect(assessAnswer(task.answer,emptyAnswer(task.answer)).kind).toBe("invalid");
   }
   questions.add(presentC01Shape(p,"pl").question);
  }
  expect(questions.size).toBe(96);
  for(const mode of ["plain-polynomial","factored-ratio","sextic-ratio"])
   expect(modes.get(mode)).toBe(32);
 });
 it("rejects unsupported variants, zero leading coefficients and unsafe denominators",()=>{
  expect(()=>createC01Shape(-1,"medium")).toThrow();
  expect(()=>createC01Shape(24,"medium")).toThrow();
  expect(()=>createC01Shape(1.2,"medium")).toThrow();
  expect(()=>createC01Shape(0,"easy")).toThrow();
  const poly=createC01Shape(0,"medium");
  if(poly.mode!=="plain-polynomial")throw Error();
  expect(()=>c01ShapeLimit({...poly,leading:r(0)})).toThrow();
  const fact=createC01Shape(1,"medium");
  if(fact.mode!=="factored-ratio")throw Error();
  expect(()=>c01ShapeLimit({...fact,b:r(0)})).toThrow();
  expect(()=>c01ShapeLimit({...fact,q:r(-3)})).toThrow();
  const sextic=createC01Shape(2,"medium");
  if(sextic.mode!=="sextic-ratio")throw Error();
  expect(()=>c01ShapeLimit({...sextic,d:r(0)})).toThrow();
  expect(()=>c01ShapeLimit({...sextic,f:r(-1)})).toThrow();
 });
});
