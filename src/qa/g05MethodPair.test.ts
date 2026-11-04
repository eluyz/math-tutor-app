import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import { rational as r, addRational as add, divideRational as div, multiplyRational as mul, equalRational as eq } from "../rational";
import { polishLearningText } from "../../e2e/helpers/localization";

/** G05: two different released methods, not proof of exact P26 source acceptance. */
describe("#151 G05 method audit: finite-point conjugation AND ±infinity",()=>{
  it("checks 24 synthetic finite-point and 24 signed-infinity witnesses",()=>{
    let plus=0,minus=0,finite=0;
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("limit-conjugate",v,"medium");
      const p=task.university;
      if(p.kind!=="limit-conjugate")throw Error("Wrong finite conjugate family");
      const expected=div(p.k,mul(r(2),p.s));
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale);
        if(view.answer.kind!=="limit"||view.answer.value.kind!=="finite")throw Error("Expected finite limit");
        expect(eq(view.answer.value.value,expected)).toBe(true);
        expect(assessAnswer(view.answer,{kind:"limit",classification:"finite",value:fmt(expected)}).kind).toBe("correct");
        expect(assessAnswer(view.answer,emptyAnswer(view.answer))).toBeDefined();
        if(locale==="en")expect(view.explanation).not.toMatch(polishLearningText);
      }
      const inf=makeUniversityTask("limit-radical-infinity",v,"hard");
      const ip=inf.university;
      if(ip.kind!=="limit-radical-infinity")throw Error("Wrong infinity conjugate family");
      const k=add(ip.c,ip.direction==="positive"?ip.a:r(-ip.a.numerator,ip.a.denominator));
      const expectedKind=k.numerator===0n?"finite":(k.numerator>0n)===(ip.direction==="positive")?"positive-infinity":"negative-infinity";
      if(ip.direction==="positive")plus++;else minus++;
      if(expectedKind==="finite")finite++;
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(inf,locale);
        if(view.answer.kind!=="limit")throw Error("Expected limit");
        expect(view.answer.value.kind).toBe(expectedKind);
        if(expectedKind==="finite"&&view.answer.value.kind==="finite")expect(eq(view.answer.value.value,ip.d)).toBe(true);
        expect(assessAnswer(view.answer,emptyAnswer(view.answer))).toBeDefined();
        if(locale==="en")expect(view.explanation).not.toMatch(polishLearningText);
      }
    }
    expect(plus).toBe(12);expect(minus).toBe(12);expect(finite).toBeGreaterThan(0);
  });
});
