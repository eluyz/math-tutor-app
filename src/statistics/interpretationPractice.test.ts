import { expect, it } from "vitest";
import { createInterpretationPracticeTask, assessInterpretationResponse } from "./interpretationPractice";
import type { InterpretationAnswer } from "./interpretationTasks";

const witnesses: readonly InterpretationAnswer[] = ["mean-equals-median", "mean-above-median", "mean-below-median", "median-changes-less", "mean-changes-less", "equal-change"];
for (const difficulty of ["easy", "medium", "hard"] as const) {
  it.each(witnesses)(`adapts the literal ${difficulty} answer %s without changing engine identity`, answer => {
    const seed=witnesses.indexOf(answer);
    const task=createInterpretationPracticeTask(difficulty,seed);
    expect(task.id).toBe(`st104-${difficulty}-${seed}`);
    expect(task.lesson).toBe("interpretation");
    expect(task.values).toBe(task.engine.original.values);
    expect(task.engine.options).toHaveLength(3);
    expect(assessInterpretationResponse(task,answer)).toBe("correct");
    for(const option of task.engine.options) expect(assessInterpretationResponse(task,option)).toBe(option===answer?"correct":"incorrect");
    expect(createInterpretationPracticeTask(difficulty,seed)).toEqual(task);
    expect(Object.isFrozen(task)).toBe(true);
  });
}
it("distinguishes empty, invalid, wrong and correct selections",()=>{
  const task=createInterpretationPracticeTask("easy",0);
  for(const raw of ["", " \n\t"]) expect(assessInterpretationResponse(task,raw)).toBe("empty");
  for(const raw of [null,undefined,0,[],{},"Średnia = mediana","equal-change","tampered"]) expect(assessInterpretationResponse(task,raw)).toBe("invalid");
  expect(assessInterpretationResponse(task,"mean-below-median")).toBe("incorrect");
  expect(assessInterpretationResponse(task," mean-equals-median ")).toBe("correct");
});
it("rejects incomplete, duplicate and cross-kind choices instead of accepting a hidden answer",()=>{
  const task=createInterpretationPracticeTask("easy",0);
  for(const options of [["mean-below-median","mean-above-median"], ["mean-equals-median","mean-equals-median","mean-above-median"], ["mean-equals-median","mean-above-median","equal-change"]]) {
    const malformed={...task,engine:{...task.engine,options}} as typeof task;
    expect(assessInterpretationResponse(malformed,"mean-equals-median")).toBe("invalid");
  }
});
it("does not trust a stale cached answer",()=>{
  const task=createInterpretationPracticeTask("easy",1);
  const stale={...task,engine:{...task.engine,answer:"mean-below-median"}} as typeof task;
  expect(assessInterpretationResponse(stale,"mean-above-median")).toBe("correct");
});
it("preserves maximum uint32 and rejects unavailable levels and invalid seeds",()=>{
  expect(createInterpretationPracticeTask("hard",4294967295).id).toBe("st104-hard-4294967295");
  for(const level of ["advanced","expert"] as const) expect(()=>createInterpretationPracticeTask(level,0)).toThrow(RangeError);
  for(const seed of [-1,0.5,4294967296,NaN,Infinity]) expect(()=>createInterpretationPracticeTask("easy",seed)).toThrow(RangeError);
});
