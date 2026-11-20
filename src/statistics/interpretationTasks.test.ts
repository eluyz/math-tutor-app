import { describe, expect, it } from "vitest";
import { assessInterpretationAnswer, compareCentres, compareReplacement, generateInterpretationTask } from "./interpretationTasks";
import type { DatasetDifficulty } from "./datasets";

describe("ST-104 literal interpretation witnesses", () => {
  it.each([
    { values: [2, 4, 6, 8, 10], answer: "mean-equals-median" },
    { values: [1, 1, 1, 1, 16], answer: "mean-above-median" },
    { values: [0, 10, 10, 10, 10], answer: "mean-below-median" },
  ])("compares the actual centres of $values", ({ values, answer }) => {
    expect(compareCentres(values).answer).toBe(answer);
  });

  it.each([
    {values:[1,2,3,4,5], index:4, to:105, mean:[20n,1n], median:[0n,1n], answer:"median-changes-less"},
    {values:[0,0,0,5,5], index:0, to:15, mean:[3n,1n], median:[5n,1n], answer:"mean-changes-less"},
    {values:[0,0,0,5,5], index:0, to:25, mean:[5n,1n], median:[5n,1n], answer:"equal-change"},
    {values:[-5,-5,-5,0,0], index:0, to:10, mean:[3n,1n], median:[5n,1n], answer:"mean-changes-less"},
    {values:[0,0,5,5,5,5], index:0, to:100, mean:[50n,3n], median:[0n,1n], answer:"median-changes-less"},
    {values:[0,0,0,2,2,2], index:0, to:6, mean:[1n,1n], median:[1n,1n], answer:"equal-change"},
    {values:[7], index:0, to:-9, mean:[16n,1n], median:[16n,1n], answer:"equal-change"},
    {values:[0,0,0,0,0], index:4, to:100, mean:[20n,1n], median:[0n,1n], answer:"median-changes-less"},
    {values:[1,1,3,3], index:0, to:1, mean:[0n,1n], median:[0n,1n], answer:"equal-change"},
  ])("compares literal absolute changes for $values, index $index -> $to", ({values,index,to,mean,median,answer})=>{
    const before=[...values];
    const result=compareReplacement(values,index,to);
    expect(result.answer).toBe(answer);
    expect(result.absoluteChange.mean).toEqual({numerator:mean[0],denominator:mean[1]});
    expect(result.absoluteChange.median).toEqual({numerator:median[0],denominator:median[1]});
    expect(result.replacement).toEqual({index,from:values[index],to});
    expect(result.modified.values).toEqual(values.map((v,i)=>i===index?to:v));
    expect(values).toEqual(before);
  });

  it("retains exact differences beyond Number's safe arithmetic range",()=>{
    const result=compareReplacement([9007199254740991],0,-9007199254740991);
    expect(result.absoluteChange.mean).toEqual({numerator:18014398509481982n,denominator:1n});
    expect(result.absoluteChange.median).toEqual({numerator:18014398509481982n,denominator:1n});
    expect(result.answer).toBe("equal-change");
    expect(compareCentres([-9007199254740991,9007199254740991]).answer).toBe("mean-equals-median");
  });

  it("preserves exact half-integer medians and the 100-observation boundary",()=>{
    expect(compareCentres([0,1]).original.median).toEqual({numerator:1n,denominator:2n});
    const data=Array.from({length:100},(_,i)=>i%2===0?-9007199254740991:9007199254740991);
    const result=compareCentres(data);
    expect(result.original.mean).toEqual({numerator:0n,denominator:1n});
    expect(result.original.median).toEqual({numerator:0n,denominator:1n});
    expect(result.answer).toBe("mean-equals-median");
  });

  it("preserves interpretation under permutation, translation and reflected scaling",()=>{
    const values=[0,0,0,5,5];
    for(const scale of [-3,1,2]) {
      const result=compareReplacement(values.map(x=>scale*x+7).reverse(),4,scale*15+7);
      expect(result.answer).toBe("mean-changes-less");
      expect(result.absoluteChange.mean).toEqual({numerator:BigInt(3*Math.abs(scale)),denominator:1n});
      expect(result.absoluteChange.median).toEqual({numerator:BigInt(5*Math.abs(scale)),denominator:1n});
    }
    expect(compareCentres([-1,-1,-1,-1,-16]).answer).toBe("mean-below-median");
  });

  it.each([{values:[]},{values:Array(101).fill(0)}])("rejects invalid dataset size",({values})=>{
    expect(()=>compareCentres(values)).toThrow(RangeError);
  });
  it.each([NaN,Infinity,-Infinity,0.5,9007199254740992,"1",undefined])("rejects non-integer observation %s",value=>{
    expect(()=>compareCentres([0,value as number])).toThrow(TypeError);
    expect(()=>compareReplacement([0],0,value as number)).toThrow(TypeError);
  });
  it("rejects sparse arrays without interpreting holes as zeros",()=>{
    expect(()=>compareCentres(Array(5))).toThrow(TypeError);
  });
  it.each([-1,0.5,NaN,Infinity,5])("rejects invalid replacement index %s",index=>{
    expect(()=>compareReplacement([1,2,3,4,5],index,10)).toThrow(RangeError);
  });
  it.each([-1,0.5,NaN,Infinity,-Infinity,4294967296,Number.MAX_SAFE_INTEGER,"0",undefined])("rejects invalid seed %s",seed=>{
    expect(()=>generateInterpretationTask("easy",seed as number)).toThrow(RangeError);
  });
  it.each(["advanced","expert","",undefined])("rejects unsupported difficulty %s",difficulty=>{
    expect(()=>generateInterpretationTask(difficulty as DatasetDifficulty,0)).toThrow(RangeError);
  });

  it("grades only allowed, language-independent IDs and derives truth from observations",()=>{
    const original={...compareCentres([1,1,1,1,16]),id:"manual",difficulty:"easy" as const,seed:0};
    const task={...original,answer:"mean-below-median" as const};
    expect(assessInterpretationAnswer(task,"mean-above-median")).toBe("correct");
    expect(assessInterpretationAnswer(task,"mean-below-median")).toBe("incorrect");
    expect(assessInterpretationAnswer(task,"  mean-above-median  ")).toBe("correct");
    for(const raw of ["", " \n\t"]) expect(assessInterpretationAnswer(task,raw)).toBe("empty");
    for(const raw of ["median-changes-less","Mediana","mean","MEAN-ABOVE-MEDIAN",null]) {
      expect(assessInterpretationAnswer(task,raw as string)).toBe("invalid");
    }
  });

  it("returns independent immutable tasks and snapshots",()=>{
    const task=generateInterpretationTask("hard",4);
    expect(task.kind).toBe("compare-changes");
    expect(Object.isFrozen(task)).toBe(true);
    expect(Object.isFrozen(task.options)).toBe(true);
    expect(Object.isFrozen(task.original)).toBe(true);
    expect(Object.isFrozen(task.original.values)).toBe(true);
    expect(Object.isFrozen(task.original.mean)).toBe(true);
    expect(Reflect.set(task.original.mean,"numerator",123n)).toBe(false);
    expect(Reflect.set(task.original.values,"0",123)).toBe(false);
    if(task.kind==="compare-changes") {
      expect(Object.isFrozen(task.modified)).toBe(true);
      expect(Object.isFrozen(task.replacement)).toBe(true);
      expect(Object.isFrozen(task.absoluteChange.median)).toBe(true);
    }
    expect(generateInterpretationTask("hard",4)).toEqual(task);
    expect(generateInterpretationTask("hard",4)).not.toBe(task);
    expect(generateInterpretationTask("hard",4).original.values).not.toBe(task.original.values);
  });
});
