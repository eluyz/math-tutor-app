import { describe, expect, it } from "vitest";
import { parseAnswer, type Rational } from "../rational";
import { generateMeanDataset } from "./datasets";
import { summarizeIntegerDataset } from "./descriptive";

// Literal expectations, hand-calculated before calling either production function.
const cases = [
  { values: [1], mean: [1n, 1n], median: [1n, 1n] },
  { values: [0], mean: [0n, 1n], median: [0n, 1n] },
  { values: [2, 4], mean: [3n, 1n], median: [3n, 1n] },
  { values: [0, 1], mean: [1n, 2n], median: [1n, 2n] },
  { values: [-3, 0, 3], mean: [0n, 1n], median: [0n, 1n] },
  { values: [9, 1, 3], mean: [13n, 3n], median: [3n, 1n] },
  { values: [1, 1, 2, 2], mean: [3n, 2n], median: [3n, 2n] },
  { values: [0, 0, 0, 10], mean: [5n, 2n], median: [0n, 1n] },
  { values: [-5, -1, -1, 3, 4], mean: [0n, 1n], median: [-1n, 1n] },
  { values: [8, -2, 4, 0], mean: [5n, 2n], median: [2n, 1n] },
  { values: [7, 7, 7, 7, 7], mean: [7n, 1n], median: [7n, 1n] },
  { values: [-4, -3, -2, -1, 0, 1], mean: [-3n, 2n], median: [-3n, 2n] },
  { values: [2, 3, 6, 9, 10], mean: [6n, 1n], median: [6n, 1n] },
  { values: [20, 1, 1, 1, 2, 2], mean: [9n, 2n], median: [3n, 2n] },
] as const;

function hasRatio(actual: Rational, numerator: bigint, denominator: bigint) {
  expect(actual.denominator).toBeGreaterThan(0n);
  expect(actual.numerator * denominator).toBe(numerator * actual.denominator);
}

// Rank by counts, not production's sorting algorithm; repetitions occupy separate ranks.
function observationAtRank(values: readonly number[], rank: number): number {
  const result = values.find((candidate) => (
    values.filter((value) => value < candidate).length < rank &&
    values.filter((value) => value <= candidate).length >= rank
  ));
  if (result === undefined) throw new Error("Oracle rank outside dataset");
  return result;
}

describe("ST-101 Task B: fixed independent mean/median fixtures", () => {
  it.each(cases)("matches the literal fixture $values", ({ values, mean, median }) => {
    const result = summarizeIntegerDataset(values);
    hasRatio(result.mean, mean[0], mean[1]);
    hasRatio(result.median, median[0], median[1]);
  });

  it.each(cases)("preserves permutation and translation for $values", ({ values, mean, median }) => {
    const reversed = summarizeIntegerDataset([...values].reverse());
    hasRatio(reversed.mean, mean[0], mean[1]);
    hasRatio(reversed.median, median[0], median[1]);
    const shifted = summarizeIntegerDataset(values.map((value) => value + 7));
    hasRatio(shifted.mean, mean[0] + 7n * mean[1], mean[1]);
    hasRatio(shifted.median, median[0] + 7n * median[1], median[1]);
  });

  it.each(["easy", "medium", "hard"] as const)("checks actual %s generator outputs by separate arithmetic", (difficulty) => {
    for (let seed = 0; seed < 64; seed += 1) {
      const task = generateMeanDataset(difficulty, seed);
      // Integer Number accumulation is exact here: at most 9 observations in [-20,20].
      const sum = task.values.reduce((total, value) => total + value, 0);
      hasRatio(task.mean, BigInt(sum), BigInt(task.values.length));
      const n = task.values.length;
      const left = observationAtRank(task.values, Math.floor((n + 1) / 2));
      const right = observationAtRank(task.values, Math.floor(n / 2) + 1);
      hasRatio(summarizeIntegerDataset(task.values).median, BigInt(left + right), 2n);
    }
  });

  it("distinguishes population from sample variance on [1,3]", () => {
    // Mean 2, squared deviations 1+1=2: population 2/2=1, sample 2/(2-1)=2.
    hasRatio(summarizeIntegerDataset([1, 3]).populationVariance, 1n, 1n);
    expect(summarizeIntegerDataset([1, 3]).populationVariance.numerator).not.toBe(2n);
  });

  it("retains exact answer parsing without guessing the cause of a wrong answer", () => {
    expect(parseAnswer("86/12")).toEqual({ kind: "valid", value: { numerator: 43n, denominator: 6n } });
    expect(parseAnswer("43/5")).toEqual({ kind: "valid", value: { numerator: 43n, denominator: 5n } });
    expect(parseAnswer(" ")).toEqual({ kind: "invalid", reason: "empty" });
    expect(parseAnswer("1/0")).toEqual({ kind: "invalid", reason: "division-by-zero" });
    expect(parseAnswer("mean(1,2)")).toEqual({ kind: "invalid", reason: "format" });
  });
});
