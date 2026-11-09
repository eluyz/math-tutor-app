import {describe,expect,it} from "vitest";
import {allTemplates,taskPool} from "../generators";
import {searchCatalog} from "../catalogSearch";
import {assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";

const id="analysis-asymptotes-combined-rational";
describe("G07 source-shaped complete asymptote catalog integration",()=>{
 it("registers exactly 24 hard problems, keeps G07 partial",()=>{
  const match=allTemplates.filter(f=>f.id===id);
  expect(match).toHaveLength(1);
  expect(match[0].category).toBe("function-limits");
  expect(match[0].supportedDifficulties).toEqual(["hard"]);
  expect(searchCatalog("G07").map(f=>f.id)).toContain(id);
  expect(searchCatalog("Wszystkie asymptoty").map(f=>f.id)).toContain(id);
  expect(taskPool("function-limits","hard").filter(t=>t.templateId===id)).toHaveLength(24);
  expect(taskPool("function-limits","medium").some(t=>t.templateId===id)).toBe(false);
  expect(()=>makeUniversityTask(id,24,"hard")).toThrow();
  expect(()=>makeUniversityTask(id,0,"medium")).toThrow();
 });
 it("has all 24 distinct PL/EN question pairs, two fields, correct/invalid/wrong grading",()=>{
  const ids=new Set<string>();
  for(let i=0;i<24;i++){
   const task=makeUniversityTask(id,i,"hard");
   expect(task.university.kind).toBe("analysis-asymptotes-combined");
   ids.add(task.contentKey);
   for(const locale of ["pl","en"] as const){
    const p=localizeUniversity(task,locale),spec=p.answer;
    expect(p.question).toContain("f(x)=");
    expect(p.solution?.length).toBeGreaterThanOrEqual(5);
    expect(p.hint.length).toBeGreaterThan(12);
    expect(spec.kind).toBe("multi-choice");
    if(spec.kind!=="multi-choice")throw Error("Expected multi-choice");
    expect(spec.fields.map(f=>f.id)).toEqual(["vertical","linear"]);
    const v=Object.fromEntries(spec.fields.map(f=>[f.id,f.value]));
    expect(assessAnswer(spec,{kind:"multi-choice",values:v}).kind).toBe("correct");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec,{kind:"multi-choice",values:{...v,linear:"line:none"}}).kind).toBe("incorrect");
    expect(assessAnswer(spec,{kind:"multi-choice",values:{...v,vertical:"unknown"}}).kind).toBe("invalid");
   }
  }
  expect(ids.size).toBe(24);
  // Catalog growth from independent sprint merges must not invalidate G07-specific checks.
 });
});
