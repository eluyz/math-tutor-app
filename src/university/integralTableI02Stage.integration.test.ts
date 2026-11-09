import {describe,expect,it} from "vitest";
import {makeUniversityTask,localizeUniversity,universityPool} from "./catalog";
import {competencyIndex} from "../competencyIndex";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {rational as r,subtractRational as sub,divideRational as div,multiplyRational as mul,equalRational as eq} from "../rational";

describe("I02 — 24 source-shaped synthetic table modes registered in app",()=>{
 it("maps 24 hard-only problems to the I02 competency and retains partial source status",()=>{
  expect(competencyIndex["I02"].coverage).toBe("partial");
  expect(competencyIndex["I02"].familyIds).toContain("integral-table-i02-stage");
  for(const level of ["easy","medium","advanced","expert"] as const){
   expect(()=>makeUniversityTask("integral-table-i02-stage",0,level)).toThrow();
  }
  const pool=universityPool("integrals","hard").filter(t=>t.templateId==="integral-table-i02-stage");
  expect(pool).toHaveLength(24);
  expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
 });
 it("checks all modes, exact coefficient answers, locales and response guards",()=>{
  const modes=new Set<string>();
  for(let variant=0;variant<24;variant++){
   const task=makeUniversityTask("integral-table-i02-stage",variant,"hard");
   const p=task.university;
   if(p.kind!=="integral-table-i02-stage")throw Error("Wrong registered task");
   modes.add(p.mode);
   const ratio=div(p.k,p.a);
   const coeff=p.mode==="tan-square"?[ratio,sub(r(0),p.k)]:
    p.mode==="cot-square"?[sub(r(0),ratio),sub(r(0),p.k)]:
    p.mode==="arcsin"?[ratio]:[div(sub(r(0),p.k),mul(p.a,p.a))];
   for(const locale of ["pl","en"] as const){
    const shown=localizeUniversity(task,locale);
    expect(shown.templateId).toBe(task.templateId);
    expect(shown.contentKey).toBe(task.contentKey);
    expect(shown.question.length).toBeGreaterThan(30);
    expect(shown.hint.length).toBeGreaterThan(20);
    expect(shown.nextHint.length).toBeGreaterThan(20);
    expect(shown.solution?.length).toBeGreaterThanOrEqual(4);
    if(locale==="en"){
     for(const text of [shown.question,shown.title,shown.hint,shown.nextHint,shown.explanation,...(shown.solution||[]).map(s=>s.action+" "+s.reason)])
      expect(text).not.toMatch(/[ąćęłńóśźż]/i);
    }
    const spec=shown.answer;
    if(spec.kind!=="primitive")throw Error("Primitive required");
    expect(spec.terms).toHaveLength(coeff.length);
    coeff.forEach((c,i)=>expect(eq(spec.terms[i].coefficient,c)).toBe(true));
    const correct={kind:"primitive" as const,coefficients:coeff.map(fmt),hasConstant:true};
    expect(assessAnswer(spec,correct).kind).toBe("correct");
    expect(assessAnswer(spec,{...correct,hasConstant:false})).toEqual({kind:"incorrect",reason:"missing-constant"});
    expect(assessAnswer(spec,{...correct,coefficients:correct.coefficients.map((x,i)=>i===0?"999999":x)}).kind).toBe("incorrect");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec,{...correct,coefficients:["1/0",...correct.coefficients.slice(1)]}).kind).toBe("invalid");
   }
  }
  expect([...modes].sort()).toEqual(["arcsin","cot-square","radical-x","tan-square"]);
 });
});
