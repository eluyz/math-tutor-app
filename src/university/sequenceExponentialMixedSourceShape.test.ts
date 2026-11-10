import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {createMixedExponentialSequence,mixedExponentialLimit,presentMixedExponentialSequence,type MixedExponentialSequence} from "./sequenceExponentialMixedSourceShape";

const levels=["medium","hard","advanced","expert"] as const;
const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const independent=(p:MixedExponentialSequence)=>{
  const A=num(p.numeratorBase),B=num(p.denominatorBase);
  return A<B?{kind:"finite",value:r(0)} as const:
    A===B?{kind:"finite",value:p.numeratorLinear} as const:
    {kind:"positive-infinity"} as const;
};
const normalized=(p:MixedExponentialSequence,n:number)=>{
  const a=num(p.numeratorLinear),b=num(p.numeratorConstant),
    A=num(p.numeratorBase),B=num(p.denominatorBase),
    c=num(p.denominatorConstant);
  return (a+b/n)*(A/B)**n/(1+c/B**n);
};

describe("C04 isolated mixed polynomial-exponential quotient, synthetic-only",()=>{
  it("checks 96 variants, three growth cases and both PL/EN answer flows",()=>{
    const unique=new Set<string>(),counts=new Map<string,number>();
    for(const level of levels)for(let variant=0;variant<24;variant++){
      const p=createMixedExponentialSequence(variant,level),
        wanted=independent(p),
        actual=mixedExponentialLimit(p);
      counts.set(wanted.kind==="finite"&&eq(wanted.value,r(0))?"zero":
        wanted.kind==="finite"?"equal":"infinite",
        1+(counts.get(wanted.kind==="finite"&&eq(wanted.value,r(0))?"zero":
          wanted.kind==="finite"?"equal":"infinite")??0));
      expect(actual.kind).toBe(wanted.kind);
      if(actual.kind==="finite"&&wanted.kind==="finite")
        expect(eq(actual.value,wanted.value)).toBe(true);
      const sample=normalized(p,200);
      if(wanted.kind==="positive-infinity")expect(sample).toBeGreaterThan(1e6);
      else if(eq(wanted.value,r(0)))expect(Math.abs(sample)).toBeLessThan(0.001);
      else expect(Math.abs(sample-num(wanted.value))).toBeLessThan(0.04);
      for(const locale of ["pl","en"] as const){
        const view=presentMixedExponentialSequence(p,locale);
        expect(view.question).toContain("n→+∞");
        expect(view.solution.length).toBeGreaterThanOrEqual(5);
        expect(view.hint.length).toBeGreaterThan(12);
        expect(view.nextHint.length).toBeGreaterThan(12);
        if(locale==="en")expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
        if(wanted.kind==="finite"){
          expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:f(wanted.value)}).kind).toBe("correct");
          expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:f(add(wanted.value,r(1)))}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
        }else{
          expect(assessAnswer(view.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("correct");
          expect(assessAnswer(view.answer,{kind:"limit",classification:"negative-infinity",value:""}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
        }
        expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
      }
      unique.add(presentMixedExponentialSequence(p,"pl").question);
    }
    expect(unique.size).toBe(96);
    for(const key of ["zero","equal","infinite"])expect(counts.get(key)).toBe(32);
  });
  it("rejects malformed inputs and false denominator positivity",()=>{
    expect(()=>createMixedExponentialSequence(-1,"medium")).toThrow();
    expect(()=>createMixedExponentialSequence(24,"medium")).toThrow();
    expect(()=>createMixedExponentialSequence(0.5,"medium")).toThrow();
    expect(()=>createMixedExponentialSequence(0,"easy")).toThrow();
    const p=createMixedExponentialSequence(0,"medium");
    expect(()=>mixedExponentialLimit({...p,numeratorLinear:r(0)})).toThrow();
    expect(()=>mixedExponentialLimit({...p,numeratorConstant:r(-1)})).toThrow();
    expect(()=>mixedExponentialLimit({...p,numeratorBase:r(0)})).toThrow();
    expect(()=>mixedExponentialLimit({...p,denominatorBase:r(1)})).toThrow();
    expect(()=>mixedExponentialLimit({...p,denominatorBase:r(1,2)})).toThrow();
    expect(()=>mixedExponentialLimit({...p,denominatorConstant:r(-1)})).toThrow();
  });
});
