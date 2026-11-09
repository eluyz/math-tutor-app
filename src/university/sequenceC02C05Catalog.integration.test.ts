import {describe,it,expect} from "vitest";
import {rational as r,equalRational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {universityFamilies,universityTemplates,makeUniversityTask,localizeUniversity} from "./catalog";
const levels=["medium","hard","advanced","expert"] as const;
const negativeId="sequence-negative-root-linear", eulerId="sequence-euler-quadratic";
describe("C02/C05 student-catalog integration",()=>{
 it("keeps legacy methods and uniquely registers both new bounded families",()=>{
  for(const id of [negativeId,eulerId]){
   expect(universityFamilies.filter(x=>x.id===id)).toHaveLength(1);
   expect(universityTemplates.find(x=>x.id===id)?.category).toBe("sequence-limits");
  }
  for(const id of ["sequence-root-quartic","sequence-conjugate","sequence-radical-ratio","sequence-euler-product"])
   expect(universityFamilies.some(x=>x.id===id)).toBe(true);
 });
 it("audits C02: 96 independent exact negative finite limits in PL/EN",()=>{
  const unique=new Set<string>();
  for(const level of levels)for(let v=0;v<24;v++){
   const task=makeUniversityTask(negativeId,v,level);
   expect(task.university.kind).toBe(negativeId);
   if(task.university.kind!==negativeId)throw Error("Wrong C02 kind");
   const p=task.university;
   const expected=r(-p.rootLeading.numerator*p.denominatorLeading.denominator,
     p.rootLeading.denominator*p.denominatorLeading.numerator);
   unique.add(task.contentKey);
   for(const locale of ["pl","en"] as const){
    const item=localizeUniversity(task,locale);
    expect(item.question).toContain("-√(");
    expect(item.hint.length).toBeGreaterThan(10);
    expect(item.nextHint.length).toBeGreaterThan(10);
    expect(item.solution!.some(s=>s.kind==="working"&&s.action.includes("n·√"))).toBe(true);
    if(item.answer.kind!=="limit"||item.answer.value.kind!=="finite")throw Error("Expected finite limit");
    expect(equalRational(item.answer.value.value,expected)).toBe(true);
    expect(assessAnswer(item.answer,{kind:"limit",classification:"finite",value:f(expected)}).kind).toBe("correct");
    expect(assessAnswer(item.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
    expect(assessAnswer(item.answer,emptyAnswer(item.answer)).kind).toBe("invalid");
   }
  }
  expect(unique.size).toBe(96);
 });
 it("audits C05: 96 exact symbolic Euler answers in PL/EN",()=>{
  const unique=new Set<string>();
  for(const level of levels)for(let v=0;v<24;v++){
   const task=makeUniversityTask(eulerId,v,level);
   expect(task.university.kind).toBe(eulerId);
   if(task.university.kind!==eulerId)throw Error("Wrong C05 kind");
   const p=task.university;
   const expected=r(p.a.numerator*p.c.numerator,p.a.denominator*p.c.denominator);
   const key="exp:"+expected.numerator+"/"+expected.denominator;
   unique.add(task.contentKey);
   for(const locale of ["pl","en"] as const){
    const item=localizeUniversity(task,locale);
    expect(item.question).toContain("n²");
    expect(item.hint.length).toBeGreaterThan(10);
    expect(item.nextHint.length).toBeGreaterThan(10);
    expect(item.solution!.some(s=>s.kind==="working"&&s.action.includes("ln(1+tₙ)/tₙ"))).toBe(true);
    const answer=item.answer;
    if(answer.kind!=="choice")throw Error("Expected Euler choice");
    expect(answer.value).toBe(key);
    expect(answer.options.some(o=>o.value===key)).toBe(true);
    expect(assessAnswer(answer,{kind:"choice",value:key}).kind).toBe("correct");
    const wrong=answer.options.find(o=>o.value!==key);
    expect(wrong).toBeDefined();
    expect(assessAnswer(answer,{kind:"choice",value:wrong!.value}).kind).toBe("incorrect");
    expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
   }
  }
  expect(unique.size).toBe(96);
 });
 it("does not expose invalid variant indices or unsupported easy level",()=>{
  for(const id of [negativeId,eulerId]){
   expect(()=>makeUniversityTask(id,24,"medium")).toThrow();
   expect(()=>makeUniversityTask(id,-1,"medium")).toThrow();
   expect(()=>makeUniversityTask(id,0,"easy")).toThrow();
  }
 });
});