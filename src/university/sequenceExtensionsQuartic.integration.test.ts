import {describe,it,expect} from "vitest";
import {rational as r, equalRational} from "../rational";
import {assessAnswer, emptyAnswer, formatRational} from "../answers";
import {universityFamilies, universityTemplates, makeUniversityTask,localizeUniversity} from "./catalog";

describe("C02 quartic radical: catalog integration",()=>{
 const id="sequence-root-quartic";
 const levels=["medium","hard","advanced","expert"] as const;
 it("registers one family without changing the existing C02 family IDs",()=>{
  expect(universityFamilies.filter(f=>f.id===id)).toHaveLength(1);
  expect(universityTemplates.find(f=>f.id===id)?.category).toBe("sequence-limits");
  expect(universityFamilies.some(f=>f.id==="sequence-radical-ratio")).toBe(true);
  expect(universityFamilies.some(f=>f.id==="sequence-conjugate")).toBe(true);
 });
 it("96 unique selectable tasks, exact keys, PL/EN explanations and grading",()=>{
  const keys=new Set<string>();
  for(const level of levels)for(let v=0;v<24;v++){
   const task=makeUniversityTask(id,v,level);
   expect(task.templateId).toBe(id);
   expect(task.category).toBe("sequence-limits");
   expect(task.university.kind).toBe(id);
   if(task.university.kind!==id)throw Error("Wrong problem kind");
   const p=task.university;
   const independent=r(p.numeratorQuadratic.numerator*p.rootLeading.denominator,
     p.numeratorQuadratic.denominator*p.rootLeading.numerator);
   keys.add(task.contentKey);
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale);
    expect(view.question).toContain("n⁴");
    expect(view.question).toContain("n→+∞");
    expect(view.hint.length).toBeGreaterThan(10);
    expect(view.nextHint.length).toBeGreaterThan(10);
    expect(view.solution!.length).toBeGreaterThan(4);
    expect(view.solution!.some(s=>s.kind==="working"&&s.action.includes("n³"))).toBe(true);
    expect(view.answer.kind).toBe("limit");
    if(view.answer.kind!=="limit"||view.answer.value.kind!=="finite")throw Error("Expected finite limit");
    expect(equalRational(view.answer.value.value,independent)).toBe(true);
    expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:formatRational(independent)}).kind).toBe("correct");
    expect(assessAnswer(view.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
    expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
   }
  }
  expect(keys.size).toBe(96);
 });
 it("rejects out-of-range and unsupported levels without changing old task behavior",()=>{
  expect(()=>makeUniversityTask(id,24,"medium")).toThrow();
  expect(()=>makeUniversityTask(id,-1,"medium")).toThrow();
  expect(()=>makeUniversityTask(id,0,"easy")).toThrow();
  expect(makeUniversityTask("sequence-radical-ratio",0,"medium").templateId).toBe("sequence-radical-ratio");
 });
});
