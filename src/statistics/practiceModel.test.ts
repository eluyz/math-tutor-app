import { describe, expect, it } from "vitest";
import { createStatisticsPracticeTask } from "./practiceModel";

const fixed = [
 {lesson:"mean",difficulty:"medium",seed:0,values:[3,3,1,16,7,13],n:43n,d:6n},
 {lesson:"median",difficulty:"easy",seed:0,values:[3,2,2,2,1],n:2n,d:1n},
 {lesson:"median",difficulty:"easy",seed:1,values:[1,6,9,4,5],n:5n,d:1n},
 {lesson:"median",difficulty:"medium",seed:0,values:[3,3,1,16,7,13],n:5n,d:1n},
 {lesson:"median",difficulty:"medium",seed:1,values:[2,2,3,10,1,7],n:5n,d:2n},
 {lesson:"median",difficulty:"hard",seed:0,values:[-16,-13,8,17,-1,14,-9],n:-1n,d:1n},
] as const;

describe("Statistics playable lesson adapter",()=>{
 it.each(fixed)("uses the actual displayed $lesson/$difficulty/$seed task",({lesson,difficulty,seed,values,n,d})=>{
  const task=createStatisticsPracticeTask(lesson,difficulty,seed);
  expect(task.values).toEqual(values);
  expect(task.answer).toEqual({numerator:n,denominator:d});
  expect(task.lesson).toBe(lesson);
  expect(Object.isFrozen(task)).toBe(true);
  expect(Object.isFrozen(task.values)).toBe(true);
 });
 it.each(["easy","medium","hard"] as const)("independently checks %s medians by ranks and means by sums",difficulty=>{
  for(const seed of [...Array.from({length:64},(_,i)=>i),4294967295]) {
   const median=createStatisticsPracticeTask("median",difficulty,seed);
   const count=median.values.length;
   expect(median.answer.denominator).toBeGreaterThan(0n);
   const rank=(k:number)=>{
    const v=median.values.find(x=>median.values.filter(y=>y<x).length<k && median.values.filter(y=>y<=x).length>=k);
    if(v===undefined) throw new Error("Missing oracle rank"); return v;
   };
   const a=rank(Math.floor((count+1)/2)),b=rank(Math.floor(count/2)+1);
   expect(2n*median.answer.numerator).toBe(BigInt(a+b)*median.answer.denominator);
   expect(createStatisticsPracticeTask("median",difficulty,seed)).toEqual(median);
   const mean=createStatisticsPracticeTask("mean",difficulty,seed);
   expect(mean.answer.denominator).toBeGreaterThan(0n);
   const sum=mean.values.reduce((s,x)=>s+BigInt(x),0n);
   expect(mean.answer.numerator*BigInt(mean.values.length)).toBe(sum*mean.answer.denominator);
  }
 });
 it("rejects unavailable lessons/levels without a fallback",()=>{
  expect(()=>createStatisticsPracticeTask("variance" as "mean","easy",0)).toThrow(RangeError);
  for(const level of ["advanced","expert"] as const) expect(()=>createStatisticsPracticeTask("median",level,0)).toThrow(RangeError);
  expect(()=>createStatisticsPracticeTask("median","easy",-1)).toThrow(RangeError);
 });
});
