import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {universityFamilies,universityTemplates,makeUniversityTask,localizeUniversity} from "./catalog";

const id="sequence-mixed-exponential-source-shape";
const levels=["medium","hard","advanced","expert"] as const;
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const cmp=(a:Rational,b:Rational)=>a.numerator*b.denominator-b.numerator*a.denominator;

describe("C04 source-shape public catalog integration",()=>{
 it("registers the family exactly once without removing existing C04 methods",()=>{
  expect(universityFamilies.filter(family=>family.id===id)).toHaveLength(1);
  expect(universityTemplates.find(family=>family.id===id)?.category).toBe("sequence-limits");
  for(const legacy of ["sequence-geometric","sequence-exponential-ratio","sequence-power-exponential"])
    expect(universityFamilies.some(family=>family.id===legacy)).toBe(true);
 });
 it("checks 96 catalog variants, 192 bilingual grading and feedback witnesses",()=>{
  const seen=new Set<string>(),counts={lower:0,equal:0,higher:0};
  for(const level of levels)for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(id,variant,level);
    if(task.university.kind!==id)throw Error("Unexpected catalog kind "+task.university.kind);
    const p=task.university,comparison=cmp(p.numeratorBase,p.denominatorBase);
    const mode=comparison<0n?"lower":comparison===0n?"equal":"higher";
    counts[mode]++;
    seen.add(task.contentKey);
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(task,locale);
      expect(view.question).toContain("n→+∞");
      expect(view.question).toContain("ⁿ");
      expect(view.hint.length).toBeGreaterThan(12);
      expect(view.nextHint.length).toBeGreaterThan(12);
      expect(view.solution!.length).toBeGreaterThanOrEqual(4);
      if(locale==="en")expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
      if(view.answer.kind!=="limit")throw Error("Expected limit answer");
      if(mode==="higher"){
        expect(view.answer.value.kind).toBe("positive-infinity");
        expect(assessAnswer(view.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("correct");
        expect(assessAnswer(view.answer,{kind:"limit",classification:"negative-infinity",value:""}).kind).toBe("incorrect");
        expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
      }else{
        const expected=mode==="lower"?r(0):p.numeratorLinear;
        expect(view.answer.value.kind).toBe("finite");
        if(view.answer.value.kind!=="finite")throw Error("Expected exact rational value");
        expect(eq(view.answer.value.value,expected)).toBe(true);
        expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:f(expected)}).kind).toBe("correct");
        expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:f(add(expected,r(1)))}).kind).toBe("incorrect");
        expect(assessAnswer(view.answer,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
      }
      expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
    }
  }
  expect(seen.size).toBe(96);
  expect(counts).toEqual({lower:32,equal:32,higher:32});
 });
 it("rejects variants outside the supported levels and range",()=>{
  expect(()=>makeUniversityTask(id,-1,"medium")).toThrow();
  expect(()=>makeUniversityTask(id,24,"medium")).toThrow();
  expect(()=>makeUniversityTask(id,0,"easy")).toThrow();
 });
});
