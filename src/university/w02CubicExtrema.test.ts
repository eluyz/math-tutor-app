import {it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {independentW02Cubic} from "../qa/w02CubicExtremaOracle";
import {polishLearningText} from "../../e2e/helpers/localization";

it("W02: all 24 cubic local extrema; complete stationary-point witnesses in PL/EN",()=>{
 const keys=new Set<string>(),outcomes=new Set<string>(),aValues=new Set<number>(),kValues=new Set<number>();
 for(let v=0;v<24;v++){
  const task=makeUniversityTask("multivar-cubic-extrema-full",v,"hard");
  const p=task.university;
  if(p.kind!=="multivar-cubic-extrema-full")throw Error("Wrong W02 family");
  keys.add(task.contentKey);aValues.add(p.a);kValues.add(p.k);
  expect(Math.abs(p.a)).toBeGreaterThanOrEqual(2);
  expect(p.k).toBeGreaterThanOrEqual(2);
  const independent=independentW02Cubic(task);
  outcomes.add(independent.classification);
  expect(independent.critical).toHaveLength(2);
  const origin=independent.critical.find(z=>z.point[0]===0&&z.point[1]===0);
  if(!origin)throw Error("Missing stationary origin");
  expect(origin.kind).toBe("saddle");
  expect(origin.det).toBeLessThan(0);
  const local=independent.critical.find(z=>z.kind==="minimum"||z.kind==="maximum");
  if(!local)throw Error("Missing strict local extremum");
  expect(local.det).toBeGreaterThan(0);
  expect(local.kind).toBe(independent.classification);
  expect(local.value).toBe(p.a*local.point[0]**3+p.s*p.a*local.point[1]**3+3*p.a*p.k*local.point[0]*local.point[1]);
  for(const locale of ["pl","en"] as const){
   const view=localizeUniversity(task,locale),spec=view.answer;
   expect(spec.kind).toBe("list");
   expect(assessAnswer(spec,{kind:"list",values:independent.values}).kind).toBe("correct");
   expect(assessAnswer(spec,{kind:"list",values:["999999",...independent.values.slice(1)]}).kind).toBe("incorrect");
   expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
   if(spec.kind!=="list")throw Error("Expected coefficient list");
   expect(spec.labels).toEqual(independent.classification==="minimum"?
    ["x_min","y_min","f_min"]:["x_max","y_max","f_max"]);
   const steps=view.solution?.filter(s=>s.kind==="working")??[];
   expect(steps).toHaveLength(9);
   expect(steps[0].action).toContain("D(f)=ℝ²");
   expect(steps[1].action).toContain("f_x=");
   expect(steps[2].action).toContain("y=−x²/");
   expect(steps[3].action).toContain("x(s x³+k³)=0");
   expect(steps[4].action).toContain("(0,0)");
   expect(steps[5].action).toContain("f_xx=");
   expect(steps[6].action).toContain("det=");
   expect(steps[6].action).toContain("<0");
   expect(steps[7].action).toContain("det=");
   expect(steps[7].action).toContain(">0");
   expect(steps[8].action).toContain(locale==="pl"&&independent.classification==="maximum"?"maksimum":independent.classification);
   expect(view.hint.length).toBeGreaterThan(20);
   expect(view.nextHint.length).toBeGreaterThan(20);
   for(const step of steps){
    expect(step.action.length).toBeGreaterThan(8);
    expect(step.reason.length).toBeGreaterThan(20);
   }
   const final=view.solution?.at(-1);
   if(final?.kind!=="answer")throw Error("Missing final step");
   expect(assessAnswer(final.answer,{kind:"list",values:independent.values}).kind).toBe("correct");
   if(locale==="en")for(const value of [view.title,view.question,view.hint,view.nextHint,view.explanation,
     ...steps.map(s=>s.action+" "+s.reason)])
    expect(value).not.toMatch(polishLearningText);
  }
 }
 expect(keys.size).toBe(24);
 expect(outcomes).toEqual(new Set(["minimum","maximum"]));
 expect(aValues.size).toBe(4);
 expect(kValues.size).toBe(3);
});
