import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";

const cases=[
 {family:"multivar-partial-point",level:"easy",variant:2,
  required:["D(f)=ℝ²","Γ(f)","f_x(a,b)","f_y(a,b)"]},
 {family:"multivar-hessian-classify",level:"easy",variant:0,
  required:["∇f(P)=(f_x(P),f_y(P))=(0,0)"]},
 {family:"multivar-path-limit",level:"medium",variant:0,
  required:["Sδ(P)","Oδ(P)","lim[n→∞](xₙ,yₙ)","lim[Q→P]g(Q)"]},
 {family:"multivar-continuity-point",level:"medium",variant:1,
  required:["Sδ(P)","Oδ(P)","lim[Q→P]g(Q)","C(P)"]},
] as const;

describe("W lecture theory in existing student-visible worked solutions",()=>{
 for(const {family,level,variant,required} of cases)
 it(family+": bilingual definitions preserve scoring",()=>{
  const task=makeUniversityTask(family,variant,level);
  for(const locale of ["pl","en"] as const){
   const view=localizeUniversity(task,locale);
   const working=(view.solution??[])
    .filter(step=>step.kind==="working")
    .map(step=>step.action+" "+step.reason).join("\n");
   for(const marker of required)expect(working,marker).toContain(marker);
   expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
   const final=view.solution?.at(-1);
   expect(final?.kind).toBe("answer");
   if(locale==="en")expect(working).not.toMatch(polishLearningText);
  }
 });
});