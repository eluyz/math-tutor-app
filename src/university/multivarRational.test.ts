import {it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {independentRational} from "../qa/w01Rational";
import {polishLearningText} from "../../e2e/helpers/localization";

it("W01: independent symbolic quotient oracle for 24 rational variants in PL/EN",()=>{
 const keys=new Set<string>(),modes=new Set<string>();
 for(let variant=0;variant<24;variant++){
  const task=makeUniversityTask("multivar-rational-partial",variant,"hard");
  const p=task.university;
  if(p.kind!=="multivar-rational-partial")throw Error("Incorrect family");
  keys.add(task.contentKey);modes.add(p.mode+":"+p.target);
  expect(p.a).toBeGreaterThanOrEqual(2);
  expect(p.b).toBeGreaterThanOrEqual(2);
  if(p.mode==="linear-quotient")expect(p.a*p.d+p.b*p.c).toBeGreaterThan(0);
  const oracle=independentRational(task);
  for(const locale of ["pl","en"] as const){
   const view=localizeUniversity(task,locale);
   expect(view.answer.kind).toBe("list");
   expect(assessAnswer(view.answer,oracle).kind).toBe("correct");
   expect(assessAnswer(view.answer,{...oracle,values:["999999",...oracle.values.slice(1)]}).kind).toBe("incorrect");
   expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
   const steps=view.solution?.filter(s=>s.kind==="working")??[];
   expect(steps).toHaveLength(7);
   expect(steps[1].action).toContain("D(f)={v≠0}");
   expect(steps[2].action).toContain("N_x=");
   expect(steps[3].action).toContain("A_i=");
   expect(steps[4].action).toContain("f_xy=f_yx");
   expect(steps[5].action).toContain("f_"+p.target);
   expect(steps[6].action).toContain("f_"+p.target);
   expect(view.hint).toContain(locale==="pl"?"mianownik":"denominator");
   expect(view.nextHint).toContain(p.target.length===1?"f_i":"A_i");
   const final=view.solution?.at(-1);
   if(final?.kind!=="answer")throw Error("Missing final");
   expect(assessAnswer(final.answer,oracle).kind).toBe("correct");
   if(locale==="en")expect(view.explanation+" "+view.hint+" "+view.nextHint).not.toMatch(polishLearningText);
  }
  if(p.target==="xy"||p.target==="yx"){
   const other=independentRational({...task,university:{...p,target:p.target==="xy"?"yx":"xy"}});
   expect(other).toEqual(oracle);
  }
 }
 expect(keys.size).toBe(24);
 expect(modes.size).toBe(24);
});
