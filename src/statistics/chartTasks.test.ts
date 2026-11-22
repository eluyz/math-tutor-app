import { describe, expect, it } from "vitest";
import type { DatasetDifficulty } from "./datasets";
import {
  assessChartAnswer, evaluateChartClaim, evaluateChartQuery, generateChartTask,
  type ChartClaim, type ChartRow, type ChartTask,
} from "./chartTasks";

const rows = [{ category: "C", value: 4 }, { category: "A", value: 0 }, { category: "B", value: 4 }] as const;
const levels = ["easy", "medium", "hard"] as const;

describe("chart query evaluation", () => {
  it("reads zero and preserves all members of tied extrema in category order", () => {
    expect(evaluateChartQuery(rows, { family: "read", category: "A" })).toEqual({ kind: "count", value: 0 });
    expect(evaluateChartQuery(rows, { family: "largest" })).toEqual({ kind: "extrema", value: 4, categories: ["B", "C"] });
    expect(evaluateChartQuery(rows, { family: "smallest" })).toEqual({ kind: "extrema", value: 0, categories: ["A"] });
    expect(evaluateChartQuery([{ category: "E", value: 2 }], { family: "largest" })).toEqual({
      kind: "extrema", value: 2, categories: ["E"],
    });
    expect(evaluateChartQuery(rows.map(row => ({ ...row, value: 0 })), { family: "smallest" })).toEqual({
      kind: "extrema", value: 0, categories: ["A", "B", "C"],
    });
  });

  it("compares in the requested order and uses absolute differences", () => {
    expect(evaluateChartQuery(rows, { family: "compare", left: "C", right: "B" })).toEqual({ kind: "relation", value: "=" });
    expect(evaluateChartQuery(rows, { family: "compare", left: "A", right: "C" })).toEqual({ kind: "relation", value: "<" });
    expect(evaluateChartQuery(rows, { family: "compare", left: "C", right: "A" })).toEqual({ kind: "relation", value: ">" });
    expect(evaluateChartQuery(rows, { family: "difference", left: "A", right: "C" })).toEqual({ kind: "count", value: 4 });
    expect(evaluateChartQuery(rows, { family: "difference", left: "C", right: "A" })).toEqual({ kind: "count", value: 4 });
    expect(evaluateChartQuery(rows, { family: "difference", left: "C", right: "B" })).toEqual({ kind: "count", value: 0 });
  });

  it("sums distinct categories exactly at the allowed data boundary", () => {
    const edge = [{ category: "A", value: 100 }, { category: "B", value: 100 }, { category: "C", value: 0 }] as const;
    expect(evaluateChartQuery(edge, { family: "sum", left: "B", right: "A" })).toEqual({ kind: "count", value: 200 });
    expect(evaluateChartQuery(edge, { family: "difference", left: "C", right: "A" })).toEqual({ kind: "count", value: 100 });
    expect(evaluateChartQuery(edge, { family: "sum", left: "B", right: "C" })).toEqual({ kind: "count", value: 100 });
  });

  it("rejects malformed data, categories and queries", () => {
    for (const value of [-1, 1.5, 101, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "4", null]) {
      expect(() => evaluateChartQuery([{ category: "A", value }] as ChartRow[], { family: "largest" })).toThrow(RangeError);
    }
    expect(() => evaluateChartQuery([], { family: "largest" })).toThrow(RangeError);
    expect(() => evaluateChartQuery([rows[0], rows[0]], { family: "largest" })).toThrow(RangeError);
    expect(() => evaluateChartQuery([{ category: "F", value: 2 }] as unknown as ChartRow[], { family: "largest" })).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "read", category: "E" })).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "sum", left: "A", right: "A" })).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "compare", left: "D", right: "B" })).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "other" } as never)).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, null as never)).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "unsupported", left: "A", right: "C", limit: "anything" } as never)).toThrow(RangeError);
    expect(() => evaluateChartQuery(rows, { family: "supported", left: "A", right: "C" } as never)).toThrow(RangeError);
  });
});

describe("chart evidence", () => {
  it("distinguishes factual support, numerical contradiction and a missing explanation or observation", () => {
    expect(evaluateChartClaim(rows, { kind: "sum", left: "A", right: "C", value: 4 })).toBe("supported");
    expect(evaluateChartClaim(rows, { kind: "read", category: "C", value: 3 })).toBe("contradicted");
    expect(evaluateChartClaim(rows, { kind: "comparison", left: "C", right: "B", relation: "=" })).toBe("supported");
    expect(evaluateChartClaim(rows, { kind: "comparison", left: "C", right: "B", relation: ">" })).toBe("contradicted");
    expect(evaluateChartClaim(rows, { kind: "difference", left: "A", right: "C", value: 4 })).toBe("supported");
    expect(evaluateChartClaim(rows, { kind: "cause", category: "C" })).toBe("underdetermined");
    expect(evaluateChartClaim(rows, { kind: "future", category: "C", value: 4 })).toBe("underdetermined");
    expect(evaluateChartClaim(rows, { kind: "population" })).toBe("underdetermined");
    expect(() => evaluateChartClaim(rows, { kind: "future", category: "D", value: 4 })).toThrow(RangeError);
    expect(() => evaluateChartClaim(rows, { kind: "sum", left: "C", right: "C", value: 8 })).toThrow(RangeError);
    expect(() => evaluateChartClaim(rows, { kind: "read", category: "C", value: -1 })).toThrow(RangeError);
    expect(() => evaluateChartClaim(rows, { kind: "comparison", left: "C", right: "B", relation: "!=" } as never)).toThrow(RangeError);
    expect(() => evaluateChartClaim(rows, { kind: "causation" } as never)).toThrow(RangeError);
  });
});

// The oracle reads the task operands and values directly. It never uses the production evaluator.
function expectedClaims(task: ChartTask, claim: ChartClaim) {
  const get = (category: string) => task.rows.find(row => row.category === category)!.value;
  switch (claim.kind) {
    case "cause":
    case "future":
    case "population":
      return "underdetermined";
    case "read":
      return get(claim.category) === claim.value ? "supported" : "contradicted";
    case "sum":
      return get(claim.left) + get(claim.right) === claim.value ? "supported" : "contradicted";
    case "difference":
      return Math.max(get(claim.left), get(claim.right)) - Math.min(get(claim.left), get(claim.right)) === claim.value
        ? "supported" : "contradicted";
    case "comparison": {
      const pair = [get(claim.left), get(claim.right)];
      const truth = claim.relation === "<" ? pair[0] < pair[1] : claim.relation === ">" ? pair[0] > pair[1] : pair[0] === pair[1];
      return truth ? "supported" : "contradicted";
    }
  }
}

function oracle(task: ChartTask, answer: ChartTask["options"][number]["answer"]) {
  const { query, rows: table } = task;
  const get = (category: string) => table.find(row => row.category === category)!.value;
  switch (query.family) {
    case "read":
      return answer.kind === "count" && answer.value === get(query.category);
    case "largest":
    case "smallest": {
      const sorted = [...table].sort((a, b) => query.family === "largest" ? b.value - a.value : a.value - b.value);
      expect(sorted[0].value).not.toBe(sorted[1].value);
      return answer.kind === "category" && answer.category === sorted[0].category;
    }
    case "compare": {
      const difference = get(query.left) - get(query.right);
      return answer.kind === "relation" && (answer.value === "=" ? difference === 0 : answer.value === ">" ? difference > 0 : difference < 0);
    }
    case "difference":
      return answer.kind === "count" && answer.value === Math.max(get(query.left), get(query.right)) - Math.min(get(query.left), get(query.right));
    case "sum":
      return answer.kind === "count" && answer.value === get(query.left) + get(query.right);
    case "supported":
    case "unsupported":
      expect(answer.kind).toBe("claim");
      return answer.kind === "claim" && expectedClaims(task, answer.claim) === (query.family === "supported" ? "supported" : "underdetermined");
  }
}

describe("seeded chart exercises", () => {
  it.each(levels)("replays every %s family and grades against a separate oracle", difficulty => {
    const families = new Set<string>();
    const evidenceLimits = new Set<string>();
    const correctPositions = new Set<number>();
    const seeds = [...Array.from({ length: 256 }, (_, seed) => seed), 0x80000000, 0xfffffffe, 0xffffffff];
    for (const seed of seeds) {
      const task = generateChartTask(difficulty, seed);
      expect(generateChartTask(difficulty, seed)).toEqual(task);
      expect(task.rows.length).toBeGreaterThanOrEqual(3);
      expect(task.rows.length).toBeLessThanOrEqual(5);
      expect(new Set(task.rows.map(row => row.category)).size).toBe(task.rows.length);
      for (const row of task.rows) {
        expect(row.category).toMatch(/^[A-E]$/);
        expect(Number.isInteger(row.value) && row.value >= 0 && row.value <= 20).toBe(true);
      }
      families.add(task.query.family);
      expect(task.options).toHaveLength(3);
      expect(new Set(task.options.map(option => option.id)).size).toBe(3);
      expect(new Set(task.options.map(option => JSON.stringify(option.answer))).size).toBe(3);
      const correct = task.options.filter(option => oracle(task, option.answer));
      expect(correct).toHaveLength(1);
      correctPositions.add(task.options.indexOf(correct[0]));
      for (const option of task.options) {
        expect(assessChartAnswer(task, option.id)).toBe(option === correct[0] ? "correct" : "incorrect");
      }
      if (task.query.family === "supported" || task.query.family === "unsupported") {
        const claims = task.options.flatMap(({ answer }) => answer.kind === "claim" ? [answer.claim] : []);
        expect(claims.map(claim => expectedClaims(task, claim)).sort()).toEqual(task.query.family === "supported"
          ? ["contradicted", "contradicted", "supported"] : ["supported", "supported", "underdetermined"]);
        for (const claim of claims) {
          if (expectedClaims(task, claim) === "underdetermined") evidenceLimits.add(claim.kind);
        }
      }
      expect(assessChartAnswer(task, " \t")).toBe("empty");
      expect(assessChartAnswer(task, "0")).toBe("invalid");
    }
    expect([...families].sort()).toEqual({
      easy: ["largest", "read", "smallest"],
      medium: ["compare", "difference", "sum"],
      hard: ["supported", "unsupported"],
    }[difficulty]);
    expect([...correctPositions].sort()).toEqual([0, 1, 2]);
    if (difficulty === "hard") expect([...evidenceLimits].sort()).toEqual(["cause", "future", "population"]);
  });

  it("offers a real zero answer for the all-zero introduction", () => {
    const task = generateChartTask("easy", 0);
    expect(task.rows.every(row => row.value === 0)).toBe(true);
    const zero = task.options.find(option => option.answer.kind === "count" && option.answer.value === 0);
    expect(zero).toBeDefined();
    expect(assessChartAnswer(task, zero?.id)).toBe("correct");
    expect(assessChartAnswer(task, "")).toBe("empty");
  });

  it("rejects malformed seeds and levels, foreign IDs and modified options", () => {
    for (const seed of [-1, 1.2, NaN, Infinity, 0x100000000, "0", null]) {
      expect(() => generateChartTask("medium", seed as number)).toThrow(RangeError);
    }
    expect(() => generateChartTask("expert" as DatasetDifficulty, 0)).toThrow(RangeError);
    const task = generateChartTask("easy", 0);
    const [first, second, third] = task.options;
    expect(assessChartAnswer(task, undefined)).toBe("invalid");
    expect(assessChartAnswer(task, generateChartTask("easy", 1).options[0].id)).toBe("invalid");
    expect(assessChartAnswer(task, generateChartTask("medium", 0).options[0].id)).toBe("invalid");
    expect(assessChartAnswer(task, ` ${first.id}`)).toBe("invalid");
    expect(assessChartAnswer({ ...task, options: [first, first, third] }, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, options: [{ ...first, answer: second.answer }, second, third] }, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, options: [null, second, third] } as unknown as ChartTask, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, rows: [{ ...task.rows[0], value: 100 }, ...task.rows.slice(1)] }, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, query: { family: "largest" } }, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, seed: -1 }, first.id)).toBe("invalid");
    expect(assessChartAnswer({ ...task, id: "" }, first.id)).toBe("invalid");
  });
});
