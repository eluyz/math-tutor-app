import { describe, expect, it } from "vitest";
import { generateMedianTask } from "./medianTasks";
import { generateMeanDataset } from "./datasets";
import { summarizeIntegerDataset } from "./descriptive";

const fixtures = [
  { difficulty: "easy", seed: 0, values: [3,2,2,2,1], numerator: 2n, denominator: 1n },
  { difficulty: "easy", seed: 1, values: [1,6,9,4,5], numerator: 5n, denominator: 1n },
  { difficulty: "medium", seed: 0, values: [3,3,1,16,7,13], numerator: 5n, denominator: 1n },
  { difficulty: "medium", seed: 1, values: [2,2,3,10,1,7], numerator: 5n, denominator: 2n },
  { difficulty: "medium", seed: 3, values: [10,10,11,17,19,7], numerator: 21n, denominator: 2n },
  { difficulty: "hard", seed: 0, values: [-16,-13,8,17,-1,14,-9], numerator: -1n, denominator: 1n },
] as const;

// Independent order statistics by counting ranks, not production's sorting.
function atRank(values: readonly number[], rank: number): number {
  const result = values.find((candidate) => values.filter((x) => x < candidate).length < rank
    && values.filter((x) => x <= candidate).length >= rank);
  if (result === undefined) throw new Error("Rank not found");
  return result;
}

describe("ST-102 median exercises", () => {
  it.each(fixtures)("matches independently fixed $difficulty/$seed median", ({ difficulty, seed, values, numerator, denominator }) => {
    const task = generateMedianTask(difficulty, seed);
    expect(task.values).toEqual(values);
    expect(task.median).toEqual({ numerator, denominator });
    expect(task.id).toBe(`st102-${difficulty}-${seed}`);
    expect(task.difficulty).toBe(difficulty);
    expect(task.seed).toBe(seed);
  });

  it.each(["easy", "medium", "hard"] as const)("checks %s ranks, permutation and translation independently", (difficulty) => {
    const parities = new Set<number>();
    for (const seed of [...Array.from({length: 256}, (_, i) => i), 4294967295]) {
      const task = generateMedianTask(difficulty, seed);
      const n = task.values.length;
      parities.add(n % 2);
      const left = atRank(task.values, Math.floor((n + 1) / 2));
      const right = atRank(task.values, Math.floor(n / 2) + 1);
      expect(2n * task.median.numerator).toBe(BigInt(left + right) * task.median.denominator);
      expect(task.median.denominator).toBeGreaterThan(0n);
      expect(summarizeIntegerDataset([...task.values].reverse()).median).toEqual(task.median);
      const shifted = summarizeIntegerDataset(task.values.map((value) => value + 7)).median;
      expect(shifted.numerator * task.median.denominator).toBe(
        (task.median.numerator + 7n * task.median.denominator) * shifted.denominator,
      );
    }
    expect([...parities].sort()).toEqual(difficulty === "easy" ? [1] : [0, 1]);
  });

  it("easy lessons do not systematically reveal the median as the third displayed value", () => {
    let thirdPositionIsNotMedian = 0;
    const medianPositions = new Set<number>();
    for (let seed = 0; seed < 256; seed += 1) {
      const source = generateMeanDataset("easy", seed);
      const task = generateMedianTask("easy", seed);
      expect([...task.values].sort((a, b) => a - b)).toEqual([...source.values].sort((a, b) => a - b));
      expect(task.median).toEqual(summarizeIntegerDataset(source.values).median);
      const median = Number(task.median.numerator) / Number(task.median.denominator);
      if (task.values[2] !== median) thirdPositionIsNotMedian += 1;
      medianPositions.add(task.values.indexOf(median));
      expect(generateMeanDataset("easy", seed).values).toEqual(source.values);
    }
    // Pre-fixed center shortcuts would produce zero. The median also varies in position.
    expect(thirdPositionIsNotMedian).toBeGreaterThan(100);
    expect(medianPositions.size).toBeGreaterThan(2);
  });

  it("replays without mutating source data or sharing mutable results", () => {
    const source = generateMeanDataset("hard", 0);
    const before = [...source.values];
    const first = generateMedianTask("hard", 0);
    generateMedianTask("medium", 1);
    const second = generateMedianTask("hard", 0);
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(second.values).not.toBe(first.values);
    expect(source.values).toEqual(before);
    expect(first.values).toEqual(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.values)).toBe(true);
    expect(Object.isFrozen(first.median)).toBe(true);
    expect(() => { (first.values as number[])[0] = 999; }).toThrow(TypeError);
    expect(() => Object.assign(first.median, { numerator: 999n })).toThrow(TypeError);
  });

  it("rejects malformed seeds and difficulty without coercion", () => {
    for (const seed of [-1, 4294967296, 1.2, NaN, Infinity, "4", undefined]) {
      expect(() => generateMedianTask("medium", seed as number)).toThrow(RangeError);
    }
    expect(() => generateMedianTask("expert" as "easy", 0)).toThrow(RangeError);
  });
});
