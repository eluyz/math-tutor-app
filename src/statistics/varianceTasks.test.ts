import { describe, expect, it } from "vitest";
import { generateVarianceTask } from "./varianceTasks";
import { summarizeIntegerDataset } from "./descriptive";

const fixtures = [
  { difficulty: "easy", seed: 0, values: [3,2,2,1,2], mean: [2n,1n], variance: [2n,5n] },
  { difficulty: "easy", seed: 19, values: [8,8,8,8,8], mean: [8n,1n], variance: [0n,1n] },
  { difficulty: "medium", seed: 0, values: [3,3,1,16,7,13], mean: [43n,6n], variance: [1109n,36n] },
  { difficulty: "medium", seed: 1, values: [2,2,3,10,1,7], mean: [25n,6n], variance: [377n,36n] },
  { difficulty: "hard", seed: 0, values: [-16,-13,8,17,-1,14,-9], mean: [0n,1n], variance: [1056n,7n] },
] as const;

describe("ST-103 population variance tasks", () => {
  it.each(fixtures)("matches hand-checked $difficulty/$seed mean and population variance", ({difficulty,seed,values,mean,variance}) => {
    const task = generateVarianceTask(difficulty, seed);
    expect(task.values).toEqual(values);
    expect(task.mean).toEqual({numerator: mean[0], denominator: mean[1]});
    expect(task.populationVariance).toEqual({numerator: variance[0], denominator: variance[1]});
    expect(task.id).toBe(`st103-${difficulty}-${seed}`);
    expect(task.difficulty).toBe(difficulty);
    expect(task.seed).toBe(seed);
  });

  it.each(["easy", "medium", "hard"] as const)("checks %s using the independent sum-of-squares identity", (difficulty) => {
    for (const seed of [...Array.from({length:256}, (_,i) => i), 4294967295]) {
      const task = generateVarianceTask(difficulty, seed);
      const n = BigInt(task.values.length);
      const sum = task.values.reduce((s,x) => s + BigInt(x), 0n);
      const squares = task.values.reduce((s,x) => s + BigInt(x)*BigInt(x), 0n);
      const numerator = n*squares - sum*sum;
      const variance = task.populationVariance;
      // Different from production's scaled-deviation summation. No Rational helper.
      expect(variance.numerator * n*n).toBe(numerator * variance.denominator);
      expect(variance.denominator).toBeGreaterThan(0n);
      expect(variance.numerator).toBeGreaterThanOrEqual(0n);
      expect(task.mean.numerator*n).toBe(sum*task.mean.denominator);
      expect(variance.numerator === 0n).toBe(new Set(task.values).size === 1);
      if (numerator > 0n) {
        // Sample variance would have denominator n*(n-1), not n^2 in this identity.
        expect(variance.numerator*n*(n-1n)).not.toBe(numerator*variance.denominator);
      }
      const transformed = summarizeIntegerDataset([...task.values].reverse().map(x => x+7));
      expect(transformed.populationVariance).toEqual(variance);
    }
  });

  it("is deterministic and returns fresh frozen observations and exact summaries", () => {
    const first = generateVarianceTask("medium", 0);
    const before = [...first.values];
    generateVarianceTask("hard", 1);
    const second = generateVarianceTask("medium", 0);
    expect(second).toEqual(first);
    expect(second.values).not.toBe(first.values);
    expect(first.values).toEqual(before);
    for (const object of [first, first.values, first.mean, first.populationVariance]) {
      expect(Object.isFrozen(object)).toBe(true);
    }
    expect(() => { (first.values as number[])[0] = 999; }).toThrow(TypeError);
    expect(() => Object.assign(first.populationVariance,{numerator:999n})).toThrow(TypeError);
  });

  it("rejects malformed seeds/difficulties using the unchanged dataset contract", () => {
    for (const seed of [-1,4294967296,0.2,NaN,Infinity,"1",null]) {
      expect(() => generateVarianceTask("easy", seed as number)).toThrow(RangeError);
    }
    expect(() => generateVarianceTask("expert" as "easy",0)).toThrow(RangeError);
  });
});
