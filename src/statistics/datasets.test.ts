import { describe, expect, it, vi } from "vitest";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";

const difficulties: DatasetDifficulty[] = ["easy", "medium", "hard"];

describe("ST-101 deterministic integer datasets", () => {
  it.each([
    { difficulty: "easy", values: [3, 2, 2, 1, 2], n: 2n, d: 1n },
    { difficulty: "medium", values: [3, 3, 1, 16, 7, 13], n: 43n, d: 6n },
    { difficulty: "hard", values: [-16, -13, 8, 17, -1, 14, -9], n: 0n, d: 1n },
  ] as const)("matches hand-summed seed-0 $difficulty fixture", ({ difficulty, values, n, d }) => {
    const task = generateMeanDataset(difficulty, 0);
    expect(task.values).toEqual(values);
    expect(task.mean).toEqual({ numerator: n, denominator: d });
    expect(task.seed).toBe(0);
    expect(task.difficulty).toBe(difficulty);
  });

  it.each(difficulties)("keeps %s repeatable and independent of intervening calls", (difficulty) => {
    const original = generateMeanDataset(difficulty, 42);
    for (const other of difficulties) generateMeanDataset(other, 98765);
    const repeated = generateMeanDataset(difficulty, 42);
    expect(repeated).toEqual(original);
    expect(repeated).not.toBe(original);
    expect(repeated.values).not.toBe(original.values);
  });

  it.each(difficulties)("has varied, bounded %s data and independently exact means", (difficulty) => {
    const lists = new Set<string>();
    const lengths = new Set<number>();
    const denominators = new Set<bigint>();
    // This is a bounded policy sweep, not an exhaustive count of possible variants.
    for (const seed of [...Array.from({ length: 256 }, (_, index) => index), 4294967295]) {
      const { values, mean } = generateMeanDataset(difficulty, seed);
      const minimum = difficulty === "easy" ? 5 : difficulty === "medium" ? 6 : 7;
      const maximum = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 9;
      expect(values.length).toBeGreaterThanOrEqual(minimum);
      expect(values.length).toBeLessThanOrEqual(maximum);
      expect(values.every(Number.isSafeInteger)).toBe(true);
      expect(Math.min(...values)).toBeGreaterThanOrEqual(difficulty === "hard" ? -20 : 0);
      expect(Math.max(...values)).toBeLessThanOrEqual(difficulty === "easy" ? 12 : 20);
      if (difficulty === "medium") expect(new Set(values).size).toBeLessThan(values.length);
      if (difficulty === "hard") expect(values.some((value) => value < 0)).toBe(true);
      if (difficulty === "easy") expect(mean.denominator).toBe(1n);
      // Separate oracle: Σx/n = p/q iff q*Σx = n*p. No descriptive/rational helper.
      const sum = values.reduce((total, value) => total + BigInt(value), 0n);
      expect(mean.denominator * sum).toBe(BigInt(values.length) * mean.numerator);
      expect(mean.denominator).toBeGreaterThan(0n);
      lists.add(values.join(","));
      lengths.add(values.length);
      denominators.add(mean.denominator);
    }
    expect(lists.size).toBeGreaterThan(20);
    expect([...lengths].sort()).toEqual(difficulty === "easy" ? [5] : difficulty === "medium" ? [6, 7, 8] : [7, 8, 9]);
    expect(denominators.has(1n)).toBe(true);
    if (difficulty !== "easy") expect([...denominators].some((value) => value > 1n)).toBe(true);
  });

  it.each(difficulties)("freezes %s results without sharing mutable state", (difficulty) => {
    const task = generateMeanDataset(difficulty, 20);
    expect(Object.isFrozen(task)).toBe(true);
    expect(Object.isFrozen(task.values)).toBe(true);
    expect(Object.isFrozen(task.mean)).toBe(true);
    expect(() => { (task.values as number[])[0] = 999; }).toThrow(TypeError);
    expect(() => { Object.assign(task.mean, { numerator: 999n }); }).toThrow(TypeError);
    expect(() => { Object.assign(task, { seed: 999 }); }).toThrow(TypeError);
    expect(generateMeanDataset(difficulty, 20)).toEqual(task);
  });

  it.each([-1, 4294967296, 0.5, NaN, Infinity, -Infinity, "42", null, undefined])(
    "rejects invalid seed %s rather than coercing or truncating it", (seed) => {
      expect(() => generateMeanDataset("easy", seed as number)).toThrow(RangeError);
    },
  );

  it("rejects unknown difficulty at runtime", () => {
    for (const difficulty of ["expert", "", undefined, null, "toString"]) {
      expect(() => generateMeanDataset(difficulty as DatasetDifficulty, 0)).toThrow(RangeError);
    }
  });

  it("does not consult Math.random or the wall clock", () => {
    const random = vi.spyOn(Math, "random").mockImplementation(() => { throw new Error("random must not be used"); });
    const clock = vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("clock must not be used"); });
    try {
      expect(generateMeanDataset("medium", 0).mean).toEqual({ numerator: 43n, denominator: 6n });
    } finally {
      random.mockRestore();
      clock.mockRestore();
    }
  });
});
