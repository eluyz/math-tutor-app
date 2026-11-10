import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity,universityPool} from "./catalog";
import {competencyIndex} from "../competencyIndex";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,
 divideRational as div,equalRational as equal,type Rational} from "../rational";

describe("I04 log integration by parts — student catalog",()=>{
 const id="integral-parts-log-i04-stage";
 it("registers exactly 24 hard-only public synthetic cases without upgrading source coverage",()=>{
  expect(competencyIndex.I04.coverage).toBe("partial");
  expect(competencyIndex.I04.familyIds).toContain(id);
  for(const level of ["easy","medium","advanced","expert"] as const)
    expect(()=>makeUniversityTask(id,0,level)).toThrow();
  const tasks=universityPool("integrals","hard").filter(t=>t.templateId===id);
  expect(tasks).toHaveLength(24);
  expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
 });
 it("checks exact four-coefficient oracle, locale invariance, feedback and +C",()=>{
  for(let v=0;v<24;v++){
    const task=makeUniversityTask(id,v,"hard"),p=task.university;
    if(p.kind!=="integral-parts-log-i04-stage")throw Error("Wrong I04 kind");
    const kb=mul(p.k,p.b);
    const oracle:readonly Rational[]=[div(p.k,r(2)),sub(r(0),div(p.k,r(4))),sub(r(0),kb),kb];
    const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
    expect(pl.contentKey).toBe(en.contentKey);
    expect(pl.answer).toEqual(en.answer);
    for(const [shown,language] of [[pl,"pl"],[en,"en"]] as const){
      expect(shown.question).toContain("ln(");
      expect(shown.question).toContain("x>");
      expect(shown.question).toContain(language==="pl"?"Dziedzina":"Domain");
      expect(shown.question).toContain("+C");
      expect(shown.hint.length).toBeGreaterThan(20);
      expect(shown.nextHint.length).toBeGreaterThan(20);
      expect(shown.solution?.length).toBeGreaterThanOrEqual(6);
      expect(shown.solution?.some(s=>s.action.includes("F′(x)="))).toBe(true);
      if(shown.answer.kind!=="primitive")throw Error("Expected primitive");
      expect(shown.answer.terms).toHaveLength(4);
      for(let i=0;i<4;i++)expect(equal(shown.answer.terms[i].coefficient,oracle[i])).toBe(true);
      const correct={kind:"primitive" as const,coefficients:oracle.map(fmt),hasConstant:true};
      expect(assessAnswer(shown.answer,correct)).toEqual({kind:"correct"});
      expect(assessAnswer(shown.answer,{...correct,hasConstant:false}))
        .toEqual({kind:"incorrect",reason:"missing-constant"});
      expect(assessAnswer(shown.answer,{
        ...correct,coefficients:[fmt(add(oracle[0],r(1))),...oracle.slice(1).map(fmt)],
      }).kind).toBe("incorrect");
      expect(assessAnswer(shown.answer,emptyAnswer(shown.answer)).kind).toBe("invalid");
    }
    for(const text of [en.title,en.question,en.hint,en.nextHint,en.explanation,
      ...(en.solution??[]).map(s=>s.action+" "+s.reason)])
      expect(text).not.toMatch(/[ąćęłńóśźż]/i);
  }
 });
});