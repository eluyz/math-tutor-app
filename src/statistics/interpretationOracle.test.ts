import { describe, expect, it } from "vitest";
import { assessInterpretationAnswer, generateInterpretationTask, type InterpretationDataset } from "./interpretationTasks";

// No production arithmetic or summary helpers compute the expectations here.
// The median uses counted ranks instead of the engine's sorting algorithm;
// fractions stay unreduced and are compared by BigInt cross multiplication.
type Fraction={n:bigint;d:bigint};
function rank(values:readonly number[],position:number):bigint {
  const match=values.find(value=>values.filter(x=>x<value).length<position && values.filter(x=>x<=value).length>=position);
  if(match===undefined) throw new Error("Missing rank witness");
  return BigInt(match);
}
function oracle(values:readonly number[]) {
  return {mean:{n:values.reduce((sum,value)=>sum+BigInt(value),0n),d:BigInt(values.length)},
    median:{n:rank(values,Math.floor((values.length+1)/2))+rank(values,Math.floor(values.length/2)+1),d:2n}};
}
function compare(a:Fraction,b:Fraction) { const d=a.n*b.d-b.n*a.d;return d<0n?-1:d>0n?1:0; }
function change(a:Fraction,b:Fraction):Fraction {const n=a.n*b.d-b.n*a.d;return {n:n<0n?-n:n,d:a.d*b.d};}
function checkDataset(dataset:InterpretationDataset) {
  const expected=oracle(dataset.values);
  expect(dataset.mean.numerator*expected.mean.d).toBe(expected.mean.n*dataset.mean.denominator);
  expect(dataset.median.numerator*expected.median.d).toBe(expected.median.n*dataset.median.denominator);
  expect(dataset.mean.denominator).toBeGreaterThan(0n);
  expect(dataset.median.denominator).toBeGreaterThan(0n);
  return expected;
}
const seeds=[...Array.from({length:256},(_,i)=>i),0xffffffff];
for(const difficulty of ["easy","medium","hard"] as const) describe(`ST-104 independent ${difficulty} oracle`,()=>{
  it.each(seeds)("replays seed %i and independently verifies every choice",seed=>{
    const task=generateInterpretationTask(difficulty,seed);
    expect(task.id).toBe(`st104-${difficulty}-${seed}`);
    expect(task.seed).toBe(seed);
    expect(task.difficulty).toBe(difficulty);
    // Interleaving another stream must not change replay or share mutable state.
    generateInterpretationTask(difficulty,(seed^0x1000)>>>0);
    expect(generateInterpretationTask(difficulty,seed)).toEqual(task);
    const n=task.original.values.length;
    expect(task.original.values.every(Number.isSafeInteger)).toBe(true);
    const original=checkDataset(task.original);
    let answer:string;
    if(task.kind==="compare-centres") {
      const order=compare(original.mean,original.median);
      answer=order<0?"mean-below-median":order>0?"mean-above-median":"mean-equals-median";
    } else {
      expect(task.modified.values).toHaveLength(n);
      expect(task.modified.values).toEqual(task.original.values.map((x,i)=>i===task.replacement.index?task.replacement.to:x));
      expect(task.replacement.from).toBe(task.original.values[task.replacement.index]);
      // Generated interventions are outside the entire original range, not
      // unspecified "add an outlier" questions with ambiguous sample counts.
      const direction=task.replacement.to>Math.max(...task.original.values)?1:-1;
      expect(direction===1?task.replacement.to>Math.max(...task.original.values):task.replacement.to<Math.min(...task.original.values)).toBe(true);
      const modified=checkDataset(task.modified);
      const mean=change(original.mean,modified.mean),median=change(original.median,modified.median);
      expect(task.absoluteChange.mean.numerator*mean.d).toBe(mean.n*task.absoluteChange.mean.denominator);
      expect(task.absoluteChange.median.numerator*median.d).toBe(median.n*task.absoluteChange.median.denominator);
      const order=compare(mean,median);
      answer=order<0?"mean-changes-less":order>0?"median-changes-less":"equal-change";
    }
    expect(task.answer).toBe(answer);
    expect(task.options).toHaveLength(3);
    expect(new Set(task.options).size).toBe(3);
    expect(task.options).toContain(answer);
    for(const option of task.options) expect(assessInterpretationAnswer(task,option)).toBe(option===answer?"correct":"incorrect");
  });
  it("covers its advertised sample sizes and all answers without a positional shortcut",()=>{
    const counts=new Set<number>(),answers=new Set<string>(),positions=new Set<number>();
    let negatives=0,fractions=0,halfMedians=0,repeats=0,unsorted=0,constant=0;
    const replacementDirections=new Set<number>();
    for(const seed of seeds) {
      const task=generateInterpretationTask(difficulty,seed),values=task.original.values;
      counts.add(values.length);answers.add(task.answer);positions.add((task.options as readonly string[]).indexOf(task.answer));
      negatives+=Number(values.some(x=>x<0));
      fractions+=Number(task.original.mean.denominator!==1n);halfMedians+=Number(task.original.median.denominator!==1n);
      repeats+=Number(new Set(values).size<values.length);constant+=Number(new Set(values).size===1);
      unsorted+=Number(values.some((value,i)=>i>0 && value<values[i-1]));
      if(task.kind==="compare-changes") replacementDirections.add(task.replacement.to>Math.max(...values)?1:-1);
    }
    expect([...counts].sort()).toEqual(difficulty==="easy"?[5]:difficulty==="medium"?[6,7,8]:[7,8,9]);
    expect([...answers].sort()).toEqual(["mean-below-median","mean-equals-median","mean-above-median","mean-changes-less","median-changes-less","equal-change"].sort());
    expect([...positions].sort()).toEqual([0,1,2]);
    expect(repeats).toBeGreaterThan(0);expect(unsorted).toBeGreaterThan(0);expect(constant).toBeGreaterThan(0);
    if(difficulty==="easy") {expect(negatives).toBe(0);expect(fractions).toBe(0);}
    else {expect(fractions).toBeGreaterThan(0);expect(halfMedians).toBeGreaterThan(0);}
    if(difficulty==="hard") {expect(negatives).toBe(seeds.length);expect([...replacementDirections].sort()).toEqual([-1,1]);}
  });
});
