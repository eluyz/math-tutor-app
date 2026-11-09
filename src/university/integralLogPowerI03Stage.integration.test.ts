import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity,universityPool} from "./catalog";
import {competencyIndex} from "../competencyIndex";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {rational as r,addRational as add,divideRational as div,equalRational as equal} from "../rational";

describe("I03 logarithmic power substitution — catalog integration",()=>{
  const id="integral-log-power-i03-stage";
  it("registers 24 hard-only cases under partially covered I03",()=>{
    expect(competencyIndex.I03.coverage).toBe("partial");
    expect(competencyIndex.I03.familyIds).toContain(id);
    for(const level of ["easy","medium","advanced","expert"] as const)
      expect(()=>makeUniversityTask(id,0,level)).toThrow();
    const tasks=universityPool("integrals","hard").filter(t=>t.templateId===id);
    expect(tasks).toHaveLength(24);
    expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
  });
  it("keeps PL and EN answers, +C, feedback and domains consistent",()=>{
    for(let v=0;v<24;v++){
      const task=makeUniversityTask(id,v,"hard"),p=task.university;
      if(p.kind!=="integral-log-power-i03-stage")throw Error("Wrong kind");
      const coeff=div(p.k,r(p.exponent+1));
      const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
      expect(pl.contentKey).toBe(en.contentKey);
      expect(pl.answer).toEqual(en.answer);
      for(const shown of [pl,en]){
        expect(shown.question).toContain("ln(");
        expect(shown.question).toContain(p.a.numerator>0n?"x>":"x<");
        expect(shown.solution?.length).toBeGreaterThanOrEqual(5);
        expect(shown.hint.length).toBeGreaterThan(20);
        expect(shown.nextHint.length).toBeGreaterThan(20);
        if(shown.answer.kind!=="primitive")throw Error("Expected primitive");
        expect(shown.answer.terms).toHaveLength(1);
        expect(equal(shown.answer.terms[0].coefficient,coeff)).toBe(true);
        const input={kind:"primitive" as const,coefficients:[fmt(coeff)],hasConstant:true};
        expect(assessAnswer(shown.answer,input)).toEqual({kind:"correct"});
        expect(assessAnswer(shown.answer,{...input,hasConstant:false}))
          .toEqual({kind:"incorrect",reason:"missing-constant"});
        expect(assessAnswer(shown.answer,{...input,coefficients:[fmt(add(coeff,r(1)))]}).kind)
          .toBe("incorrect");
        expect(assessAnswer(shown.answer,emptyAnswer(shown.answer)).kind).toBe("invalid");
      }
      for(const s of [en.question,en.title,en.hint,en.nextHint,en.explanation,
        ...(en.solution||[]).map(z=>z.action+" "+z.reason)])
        expect(s).not.toMatch(/[ąćęłńóśźż]/i);
    }
  });
});
