import { describe, expect, it } from "vitest";
import type { DatasetDifficulty } from "./datasets";
import { createModeQuestion, generateModeTask, summarizeMode } from "./modeTasks";

const min = Number.MIN_SAFE_INTEGER;
const max = Number.MAX_SAFE_INTEGER;

// Count each distinct value by a fresh scan, independently of the production frequency map.
function oracle(values: readonly number[]) {
  const distinct = [...new Set(values)].sort((a, b) => a - b);
  const rows = distinct.map(value => ({ value, frequency: values.filter(entry => entry === value).length }));
  const maximum = Math.max(...rows.map(row => row.frequency));
  return { rows, maximum, modes: rows.filter(row => maximum >= 2 && row.frequency === maximum).map(row => row.value) };
}

describe("ST-105 exact mode", () => {
  it.each([
    { values: [2, 4, 4, 5], modes: [4], maximum: 2 },
    { values: [7, -3, 0, 7, 0, -3, 8], modes: [-3, 0, 7], maximum: 2 },
    { values: [8, 3, 8, 3], modes: [3, 8], maximum: 2 },
    { values: [3, 0, -2, 5], modes: [], maximum: 1 },
    { values: [0, 0, 0], modes: [0], maximum: 3 },
    { values: [-9, -9], modes: [-9], maximum: 2 },
    { values: [0, -0], modes: [0], maximum: 2 },
    { values: [-9], modes: [], maximum: 1 },
    { values: [max, 0, min, max, min, max - 1], modes: [min, max], maximum: 2 },
    { values: Array.from({ length: 100 }, () => 7), modes: [7], maximum: 100 },
  ])("finds exactly $modes at maximum $maximum in $values", ({ values, modes, maximum }) => {
    expect(summarizeMode(values)).toEqual({ ...oracle(values), modes, maximum });
    const question = createModeQuestion(values);
    expect(question.values).toEqual(values);
    expect(question.options).toHaveLength(3);
    expect(new Set(question.options.map(option => option.id)).size).toBe(3);
    expect(new Set(question.options.map(option => option.values.join(","))).size).toBe(3);
    expect(question.options.filter(option => option.values.join(",") === modes.join(","))).toHaveLength(1);
    for (const option of question.options) expect(option.values.every(Number.isSafeInteger)).toBe(true);
  });

  it("detaches and freezes observations and options", () => {
    const values = [2, 1, 2];
    const question = createModeQuestion(values);
    values[0] = 7;
    expect(question.values).toEqual([2, 1, 2]);
    expect(Object.isFrozen(question.values)).toBe(true);
    expect(Object.isFrozen(question.options)).toBe(true);
    expect(question.options.every(option => Object.isFrozen(option) && Object.isFrozen(option.values))).toBe(true);
  });

  it.each([
    { values: [] }, { values: Array.from({ length: 101 }, () => 1) },
    { values: [1, NaN] }, { values: [Infinity] }, { values: [0.5] }, { values: [max + 1] }, { values: [min - 1] },
    { values: Array<number>(2) }, { values: ["4"] }, { values: null }, { values: "123" },
  ])("rejects invalid observations $values", ({ values }) => {
    expect(() => summarizeMode(values as readonly number[])).toThrow();
    expect(() => createModeQuestion(values as readonly number[])).toThrow();
  });
});

describe("ST-105 deterministic exercises across Easy, Medium and Hard", () => {
  const seeds = [...Array.from({ length: 256 }, (_, seed) => seed), 0x80000000, 0xfffffffe, 0xffffffff];
  it.each(["easy", "medium", "hard"] as const)("checks all 259 %s seeds with the independent count oracle", difficulty => {
    const positions = [new Set<number>(), new Set<number>(), new Set<number>()];
    const datasetSignatures = new Set<string>();
    const observations = new Set<number>();
    let unsorted = false;
    for (const seed of seeds) {
      const task = generateModeTask(difficulty, seed);
      expect(task).toEqual(generateModeTask(difficulty, seed));
      expect(task).toMatchObject({ id: `st105-${difficulty}-${seed}`, difficulty, seed });
      expect(task.values.length).toBeGreaterThanOrEqual(difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8);
      expect(task.values.length).toBeLessThanOrEqual(difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10);
      expect(task.values.every(Number.isSafeInteger)).toBe(true);
      expect(task.options).toHaveLength(3);
      expect(new Set(task.options.map(option => option.id)).size).toBe(3);
      expect(new Set(task.options.map(option => option.values.join(","))).size).toBe(3);
      const summary = oracle(task.values);
      expect(summarizeMode(task.values)).toEqual(summary);
      const right = task.options.map(option => option.values.join(",")).reduce<number[]>((found, key, index) => {
        if (key === summary.modes.join(",")) found.push(index);
        return found;
      }, []);
      expect(right).toHaveLength(1);
      positions[Math.min(summary.modes.length, 2)].add(right[0]);
      datasetSignatures.add(task.values.join(","));
      task.values.forEach(value => observations.add(value));
      unsorted ||= task.values.some((value, i) => i > 0 && value < task.values[i - 1]);
    }
    for (const seen of positions) expect([...seen].sort()).toEqual([0, 1, 2]);
    expect(datasetSignatures.size).toBeGreaterThan(100);
    expect(observations.has(0)).toBe(true);
    expect(unsorted).toBe(true);
    if (difficulty !== "easy") expect([...observations].some(value => value < 0)).toBe(true);
    if (difficulty === "hard") {
      expect(observations.has(min)).toBe(true);
      expect(observations.has(max)).toBe(true);
    }
  });

  it.each([-1, 0x100000000, 0.5, NaN, Infinity, "0", null])("rejects invalid seed %s", seed => {
    expect(() => generateModeTask("easy", seed as number)).toThrow(RangeError);
  });

  it.each(["advanced", "expert", "unknown", null])("rejects invalid difficulty %s", difficulty => {
    expect(() => generateModeTask(difficulty as DatasetDifficulty, 0)).toThrow(RangeError);
  });
});
