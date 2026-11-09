import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f,type LimitValue} from "../answers";
import {universityFamilies,universityTemplates,makeUniversityTask,localizeUniversity} from "./catalog";

const levels=["medium","hard","advanced","expert"] as const;
const c01="sequence-polynomial-source-shapes",c03="sequence-conjugate-source-shapes";
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;

describe("C01/C03 bounded synthetic catalog integration",()=>{
 it("registers new families once and preserves older sequence methods",()=>{
  for(const id of [c01,c03]){
   expect(universityFamilies.filter(x=>x.id===id)).toHaveLength(1);
   expect(universityTemplates.find(x=>x.id===id)?.category).toBe("sequence-limits");
  }
  for(const id of ["sequence-rational","sequence-conjugate","sequence-root-quartic","sequence-negative-root-linear","sequence-euler-quadratic"])
   expect(universityFamilies.some(x=>x.id===id)).toBe(true);
 });
 it("checks 192 independent expected limits, 384 bilingual answer/teaching witnesses",()=>{
  const unique=new Set<string>(),counts=new Map<string,number>();
  for(const id of [c01,c03])for(const level of levels)for(let variant=0;variant<24;variant++){
   const task=makeUniversityTask(id,variant,level);
   if(task.university.kind!==id)throw Error("Unexpected catalog kind: "+task.university.kind);
   const p=task.university;
   let exp:LimitValue;
   if(p.kind===c01){
    if(p.mode==="plain-polynomial")exp={kind:p.leading.numerator>0n?"positive-infinity":"negative-infinity"};
    else if(p.mode==="factored-ratio")
     exp={kind:"finite",value:r(p.a.numerator*p.b.denominator,p.a.denominator*p.b.numerator)};
    else exp={kind:"finite",value:r(p.a.numerator*p.d.denominator,p.a.denominator*p.d.numerator)};
    counts.set(p.mode,(counts.get(p.mode)||0)+1);
   }else if(p.kind===c03){
    if(p.mode==="linear-root-pair")exp={kind:"finite",value:r(0)};
    else if(p.mode==="reverse-quadratic")exp={kind:"finite",value:r(-p.a.numerator,2n*p.a.denominator)};
    else if(p.mode==="positive-quadratic-sum")exp={kind:"positive-infinity"};
    else exp={kind:"finite",value:r(p.a.numerator*p.k.denominator,2n*p.a.denominator*p.k.numerator)};
    counts.set(p.mode,(counts.get(p.mode)||0)+1);
   }else throw Error("Unexpected source-shape family");
   unique.add(task.contentKey);
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale);
    expect(view.question).toContain("n→+∞");
    expect(view.hint.length).toBeGreaterThan(12);
    expect(view.nextHint.length).toBeGreaterThan(12);
    expect(view.solution!.length).toBeGreaterThanOrEqual(4);
    const a=view.answer;
    if(a.kind!=="limit")throw Error("Expected limit spec");
    expect(a.value.kind).toBe(exp.kind);
    if(exp.kind==="finite"){
     if(a.value.kind!=="finite")throw Error("Expected finite value");
     expect(eq(a.value.value,exp.value)).toBe(true);
     expect(assessAnswer(a,{kind:"limit",classification:"finite",value:f(exp.value)}).kind).toBe("correct");
     expect(assessAnswer(a,{kind:"limit",classification:"finite",value:f(add(exp.value,r(1)))}).kind).toBe("incorrect");
     expect(assessAnswer(a,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
    }else{
     expect(assessAnswer(a,{kind:"limit",classification:exp.kind,value:""}).kind).toBe("correct");
     const opposite=exp.kind==="positive-infinity"?"negative-infinity":"positive-infinity";
     expect(assessAnswer(a,{kind:"limit",classification:opposite,value:""}).kind).toBe("incorrect");
     expect(assessAnswer(a,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
    }
    expect(assessAnswer(a,emptyAnswer(a)).kind).toBe("invalid");
   }
  }
  expect(unique.size).toBe(192);
  for(const mode of ["plain-polynomial","factored-ratio","sextic-ratio"])expect(counts.get(mode)).toBe(32);
  for(const mode of ["linear-root-pair","reverse-quadratic","positive-quadratic-sum","negative-constant-quadratic"])
   expect(counts.get(mode)).toBe(24);
 });
 it("rejects invalid indices and unsupported easy level",()=>{
  for(const id of [c01,c03]){
   expect(()=>makeUniversityTask(id,-1,"medium")).toThrow();
   expect(()=>makeUniversityTask(id,24,"medium")).toThrow();
   expect(()=>makeUniversityTask(id,0,"easy")).toThrow();
  }
 });
});