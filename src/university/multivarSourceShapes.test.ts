import {it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {independentW01SourceShape} from "../qa/w01SourceShapes";
import {polishLearningText} from "../../e2e/helpers/localization";

it("W01 P43-shaped: independent first/second/mixed symbolic partials in all 24 PL/EN tasks",()=>{
 const keys=new Set<string>(),modes=new Set<string>();
 for(let v=0;v<24;v++){
  const task=makeUniversityTask("multivar-source-shape-partial",v,"hard"),p=task.university;
  if(p.kind!=="multivar-source-shape-partial")throw Error("Wrong W01 task");
  keys.add(task.contentKey);modes.add(p.mode+":"+p.target);
  expect(p.a).toBeGreaterThan(0);expect(p.b).toBeGreaterThan(0);
  expect(p.c).toBeGreaterThan(0);expect(p.d).toBeGreaterThan(0);
  const expected=independentW01SourceShape(task);
  for(const locale of ["pl","en"] as const){
   const view=localizeUniversity(task,locale);
   expect(view.answer.kind).toBe("list");
   expect(assessAnswer(view.answer,expected).kind).toBe("correct");
   expect(assessAnswer(view.answer,{...expected,values:["999999",...expected.values.slice(1)]}).kind).toBe("incorrect");
   expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
   const steps=view.solution?.filter(x=>x.kind==="working")??[];
   expect(steps).toHaveLength(7);
   expect(steps[0].action).toContain("f(x,y)=");
   expect(steps[1].action).toContain("D(f)=");
   if(p.mode==="poly-cubic"||p.mode==="poly-mixed"){
    expect(steps[1].action).toContain("ℝ²");
    expect(steps[2].action).toContain("f_x=");
    expect(steps[3].action).toContain("f_xy=f_yx=");
    expect(steps[5].action).toContain("B=(");
   }else{
    expect(steps[2].action).toContain("u_x=");
    expect(steps[3].action).toContain("F″(u)");
    expect(steps[4].action).toContain("f_xy=f_yx");
    if(p.mode==="log-positive"){
     expect(steps[1].action).toContain("D(C²)=ℝ²");
     expect(steps[1].action).toContain("u>0");
    }else{
     expect(steps[1].action).toBe("D(f)={u≥0}; D(C²)={u>0}");
    }
   }
   expect(steps[6].action).toContain("f_"+p.target+"=");
   expect(view.hint).toContain(locale==="pl"?"dziedzinę":"domain");
   const final=view.solution?.at(-1);
   if(final?.kind!=="answer")throw Error("Missing final answer");
   expect(assessAnswer(final.answer,expected).kind).toBe("correct");
   if(locale==="en")expect(view.explanation+" "+view.hint+" "+view.nextHint).not.toMatch(polishLearningText);
   for(const step of steps)expect(step.reason.length).toBeGreaterThan(20);
  }
  if(p.target==="xy"||p.target==="yx"){
   const reverse=independentW01SourceShape({...task,university:{...p,target:p.target==="xy"?"yx":"xy"}});
   expect(reverse).toEqual(expected);
  }
 }
 expect(keys.size).toBe(24);
 expect(modes.size).toBe(24);
});
