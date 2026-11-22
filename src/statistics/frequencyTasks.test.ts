import { describe, expect, it } from "vitest";
import {
  assessFrequencyAnswer, createFrequencyQuestion, generateFrequencyTask, summarizeFrequencyQuery,
  type FrequencyQuery, type FrequencyRow,
} from "./frequencyTasks";

const rows = [
  { value: 4, frequency: 2 },
  { value: 0, frequency: 0 },
  { value: -2, frequency: 1 },
] as const;

function oracle(rows: readonly FrequencyRow[], query: FrequencyQuery) {
  const total = rows.reduce((sum, row) => sum + BigInt(row.frequency), 0n);
  let selected = 0n;
  for (const row of rows) {
    const included = query.family === "total-count"
      || (query.family === "subset-relative" && query.values.includes(row.value))
      || (query.family === "cumulative-count" && row.value <= query.value)
      || (query.family === "complement-percentage" && row.value !== query.value)
      || ((query.family === "frequency" || query.family === "percentage" ||
        query.family === "relative-frequency") && row.value === query.value);
    if (included) selected += BigInt(row.frequency);
  }
  if (query.family === "percentage" || query.family === "complement-percentage") {
    return { total, selected, numerator: 100n * selected, denominator: total, unit: "percentage" };
  }
  if (query.family === "relative-frequency" || query.family === "subset-relative") {
    return { total, selected, numerator: selected, denominator: total, unit: "relative" };
  }
  return { total, selected, numerator: selected, denominator: 1n, unit: "count" };
}

describe("ST-106 literal table fixtures", () => {
  const fixtures: [FrequencyQuery, number, bigint, bigint, string][] = [
    [{ family: "frequency", value: 0 }, 0, 0n, 1n, "count"],
    [{ family: "total-count" }, 3, 3n, 1n, "count"],
    [{ family: "relative-frequency", value: -2 }, 1, 1n, 3n, "relative"],
    [{ family: "percentage", value: -2 }, 1, 100n, 3n, "percentage"],
    [{ family: "percentage", value: 0 }, 0, 0n, 1n, "percentage"],
    [{ family: "subset-relative", values: [4, -2] }, 3, 1n, 1n, "relative"],
    [{ family: "cumulative-count", value: 0 }, 1, 1n, 1n, "count"],
    [{ family: "complement-percentage", value: 0 }, 3, 100n, 1n, "percentage"],
  ];

  it.each(fixtures)("derives %j from unsorted signed categories", (query, selected, numerator, denominator, unit) => {
    const summary = summarizeFrequencyQuery(rows, query);
    expect(summary).toMatchObject({ total: 3, selected, unit, answer: { numerator, denominator } });
    const question = createFrequencyQuestion(rows, query);
    expect(question.rows).toEqual(rows);
    expect(assessFrequencyAnswer(question, "")).toBe("empty");
    expect(assessFrequencyAnswer(question, `${question.id}:${unit}:${numerator}/${denominator}`)).toBe("correct");
  });

  it("reduces 2/4, compares an equivalent offered value exactly and rejects an equivalent duplicate", () => {
    const tied = [{ value: -1, frequency: 2 }, { value: 0, frequency: 2 }];
    const question = createFrequencyQuestion(tied, { family: "relative-frequency", value: 0 });
    const id = `${question.id}:relative:1/2`;
    const correct = question.options.find(option => option.id === id)!;
    expect(correct.value).toEqual({ numerator: 1n, denominator: 2n });
    const equivalent = { ...correct, value: { numerator: 2n, denominator: 4n } };
    const options = question.options.map(option => option.id === id ? equivalent : option);
    expect(assessFrequencyAnswer({ ...question, options: [...options].reverse() }, id)).toBe("correct");
    expect(assessFrequencyAnswer({
      ...question, options: [correct, { ...equivalent, id: `${question.id}:relative:2/4` }, options.find(option => option.id !== id)!],
    }, id)).toBe("invalid");
    expect(assessFrequencyAnswer(question, `${question.id}:relative:2/4`)).toBe("invalid");
  });

  it("keeps exact arithmetic for safe endpoint counts and three options for a one-observation table", () => {
    const large = [{ value: Number.MIN_SAFE_INTEGER, frequency: Number.MAX_SAFE_INTEGER }, { value: 0, frequency: 0 }];
    expect(summarizeFrequencyQuery(large, { family: "percentage", value: Number.MIN_SAFE_INTEGER }).answer)
      .toEqual({ numerator: 100n, denominator: 1n });
    for (const query of [{ family: "total-count" }, { family: "relative-frequency", value: 0 }] as const) {
      const question = createFrequencyQuestion([{ value: 0, frequency: 1 }], query);
      expect(new Set(question.options.map(option => option.id)).size).toBe(3);
    }
  });

  it("rejects sparse, malformed or ambiguous displayed data", () => {
    const invalidRows = [
      [], new Array<FrequencyRow>(3), [{ value: 0, frequency: 0 }],
      [{ value: 4, frequency: 1 }, { value: 4, frequency: 2 }],
      [{ value: 1, frequency: Number.MAX_SAFE_INTEGER }, { value: 2, frequency: 1 }],
      ...[NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1].map(value => [{ value, frequency: 2 }]),
      ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map(frequency => [{ value: 0, frequency }]),
    ];
    const task = generateFrequencyTask("easy", 0);
    for (const invalid of invalidRows) {
      expect(() => createFrequencyQuestion(invalid, { family: "total-count" })).toThrow(RangeError);
      expect(assessFrequencyAnswer({ ...task, rows: invalid }, task.options[0].id)).toBe("invalid");
    }
    for (const query of [
      { family: "frequency", value: 12 },
      { family: "cumulative-count", value: Infinity },
      { family: "subset-relative", values: [0, 0] },
      { family: "subset-relative", values: [0, 3] },
      { family: "subset-relative", values: new Array<number>(2) },
      { family: "unknown" },
    ]) expect(() => createFrequencyQuestion(rows, query as FrequencyQuery)).toThrow(RangeError);
  });

  it("validates all options and distinguishes omitted, stale and forged responses", () => {
    const task = generateFrequencyTask("easy", 0);
    const other = generateFrequencyTask("easy", 1);
    const [first, second, third] = task.options;
    const invalidOptions = [
      [first, second], [first, first, third], [first, second, third, third],
      [first, second, { ...third, id: "forged" }],
      [first, second, { ...third, unit: "relative" }],
      [first, second, { ...third, value: { numerator: 0n, denominator: 0n } }],
      [first, second, { ...third, value: { numerator: 700n, denominator: 1n } }],
      [first, second, { ...third, value: { numerator: 12, denominator: 1n } }],
      new Array(3),
    ];
    for (const options of invalidOptions) {
      expect(assessFrequencyAnswer({ ...task, options } as typeof task, first.id)).toBe("invalid");
    }
    for (const raw of [undefined, null, 0, {}, "forged", other.options[0].id]) {
      expect(assessFrequencyAnswer(task, raw)).toBe("invalid");
    }
    expect(assessFrequencyAnswer(task, "  ")).toBe("empty");
  });

  it("rejects invalid seeds and disabled or unknown difficulties", () => {
    for (const seed of [-1, 4294967296, 1.5, NaN, Infinity]) {
      expect(() => generateFrequencyTask("easy", seed)).toThrow(RangeError);
    }
    for (const difficulty of ["advanced", "expert", "unknown"]) {
      expect(() => generateFrequencyTask(difficulty as "easy", 0)).toThrow(RangeError);
    }
  });
});

describe("ST-106 seeded tables against an independent BigInt cross-product oracle", () => {
  it.each([
    ["easy", ["frequency", "total-count"]],
    ["medium", ["percentage", "relative-frequency"]],
    ["hard", ["subset-relative", "cumulative-count", "complement-percentage"]],
  ] as const)("%s reaches all its families while retaining one exact answer per seed", (level, families) => {
    const seen = new Set<string>();
    const keys = new Set<string>();
    const outcomes = new Set<string>();
    for (const seed of [...Array.from({ length: 256 }, (_, index) => index), 2147483648, 4294967294, 4294967295]) {
      const task = generateFrequencyTask(level, seed);
      expect(generateFrequencyTask(level, seed)).toEqual(task);
      expect(task.id).toBe(`st106-${level}-${seed}`);
      expect(task.difficulty).toBe(level);
      expect(task.seed).toBe(seed);
      expect(task.rows.length).toBeGreaterThanOrEqual(3);
      expect(task.rows.length).toBeLessThanOrEqual(5);
      expect(new Set(task.rows.map(row => row.value)).size).toBe(task.rows.length);
      expect(task.rows.every(row => Number.isSafeInteger(row.value) && Number.isSafeInteger(row.frequency) && row.frequency >= 0)).toBe(true);
      expect(task.rows.some(row => row.value === 0)).toBe(true);
      expect(task.rows.some(row => row.value < 0)).toBe(true);
      const { total, selected, numerator, denominator, unit } = oracle(task.rows, task.query);
      expect(total).toBeGreaterThan(0n);
      expect(total).toBeLessThanOrEqual(30n);
      expect(summarizeFrequencyQuery(task.rows, task.query)).toMatchObject({ total: Number(total), selected: Number(selected) });
      seen.add(task.query.family);
      outcomes.add(`${unit}:${numerator === 0n ? "zero" : selected === total ? "all" : "some"}`);
      expect(task.options).toHaveLength(3);
      const correct = task.options.filter(option => option.value.numerator * denominator === numerator * option.value.denominator);
      expect(correct).toHaveLength(1);
      for (const [index, option] of task.options.entries()) {
        expect(option.unit).toBe(unit);
        expect(option.value.denominator).toBeGreaterThan(0n);
        expect(option.id).toBe(`${task.id}:${unit}:${option.value.numerator}/${option.value.denominator}`);
        expect(keys.has(option.id)).toBe(false);
        keys.add(option.id);
        for (const previous of task.options.slice(0, index)) {
          expect(option.value.numerator * previous.value.denominator)
            .not.toBe(previous.value.numerator * option.value.denominator);
        }
        expect(assessFrequencyAnswer(task, option.id)).toBe(option === correct[0] ? "correct" : "incorrect");
      }
    }
    expect([...seen].sort()).toEqual([...families].sort());
    if (level === "medium") {
      expect(outcomes.has("percentage:zero")).toBe(true);
      expect(outcomes.has("percentage:all")).toBe(true);
    }
  });
});
