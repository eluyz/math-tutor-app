import { describe, expect, it } from "vitest";
import { assessModeResponse, createModePracticeTask } from "./modePractice";
import { createModeQuestion } from "./modeTasks";
import { modeCopy } from "./st105Copy";

const task = createModePracticeFixture([4, 0, -2, 4, 0, 6]);

function createModePracticeFixture(values: readonly number[]) {
  return {
    lesson: "mode" as const,
    id: "st105-easy-0",
    difficulty: "easy" as const,
    seed: 0,
    ...createModeQuestion(values),
  };
}

describe("ST-105 practice adapter", () => {
  it("creates a replayable Mode exercise with localized-independent identity", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      for (const seed of [0, 1, 0xffffffff]) {
        const practice = createModePracticeTask(difficulty, seed);
        expect(practice).toEqual(createModePracticeTask(difficulty, seed));
        expect(practice).toMatchObject({ lesson: "mode", id: `st105-${difficulty}-${seed}`, difficulty, seed });
      }
    }
    for (const difficulty of ["advanced", "expert"] as const) {
      expect(() => createModePracticeTask(difficulty, 0)).toThrow(RangeError);
    }
  });

  it("grades exactly the complete set of tied repeated values", () => {
    expect(assessModeResponse(task, "mode:0,4")).toBe("correct");
    for (const wrong of task.options.filter(option => option.id !== "mode:0,4")) {
      expect(assessModeResponse(task, wrong.id)).toBe("incorrect");
    }
    for (const invalid of ["mode:4,0", "mode:0,4 ", "mode:0,4,4", "0.00", "other", null, [], 0, {}]) {
      expect(assessModeResponse(task, invalid)).toBe("invalid");
    }
    expect(assessModeResponse(task, "")).toBe("empty");
    expect(assessModeResponse(task, " \n ")).toBe("empty");
  });

  it("uses explicit no-mode, including singleton, and recognizes all-equal repeats", () => {
    expect(assessModeResponse(createModePracticeFixture([2, -1, 0]), "no-mode")).toBe("correct");
    expect(assessModeResponse(createModePracticeFixture([0]), "no-mode")).toBe("correct");
    expect(assessModeResponse(createModePracticeFixture([0, 0]), "mode:0")).toBe("correct");
    expect(assessModeResponse(createModePracticeFixture([0, 0]), "no-mode")).toBe("incorrect");
  });

  it("accepts permutations but rejects incomplete, duplicated, forged and malformed options", () => {
    const [first, second, third] = task.options;
    expect(assessModeResponse({ ...task, options: [third, first, second] }, "mode:0,4")).toBe("correct");
    for (const options of [
      [], [first, second], [first, second, third, first], [first, first, third], [first, second, null],
      [first, second, { ...third, id: "malformed" }], [first, second, { ...third, values: [42] }],
      [first, second, { ...third, values: Array<number>(third.values.length) }], [first, second, { ...third, values: null }], null,
    ]) {
      const malformed = { ...task, options } as typeof task;
      expect(assessModeResponse(malformed, "mode:0,4")).toBe("invalid");
      expect(assessModeResponse(malformed, "")).toBe("invalid");
    }
    expect(assessModeResponse({ ...task, values: [] }, "")).toBe("invalid");
  });
});

describe("ST-105 PL/EN solutions from displayed observations", () => {
  it.each([
    { values: [2, 0, 2, -1], rows: [[-1, 1], [0, 1], [2, 2]], answer: "mode:2", result: "{2}" },
    { values: [4, 0, -2, 4, 0, 6], rows: [[-2, 1], [0, 2], [4, 2], [6, 1]], answer: "mode:0,4", result: "{0, 4}" },
    { values: [2, -1, 0], rows: [[-1, 1], [0, 1], [2, 1]], answer: "no-mode", result: "" },
  ])("uses exact matching work and choice IDs in both locales for $values", ({ values, rows, answer, result }) => {
    const question = createModeQuestion(values);
    const pl = modeCopy(question, "pl");
    const en = modeCopy(question, "en");
    for (const copy of [pl, en]) {
      expect(copy.prompt).toContain(`[${values.join(", ")}]`);
      expect(copy.hints).toHaveLength(2);
      expect(copy.steps).toHaveLength(3);
      expect(copy.table.rows.map(row => [row.value, row.frequency])).toEqual(rows);
      expect(copy.options.map(option => option.id)).toEqual(question.options.map(option => option.id));
      expect(new Set(copy.options.map(option => option.label)).size).toBe(3);
      expect(copy.options.find(option => option.id === answer)?.label).toBe(result || copy.options.find(option => option.id === "no-mode")?.label);
      if (result) expect(copy.conclusion).toContain(result);
    }
    expect(pl.prompt).toContain("co najmniej 2");
    expect(en.prompt).toContain("at least 2");
    expect(pl.hints[1]).toContain("brak dominanty");
    expect(en.hints[1]).toContain("no mode");
    expect(pl.table.caption).toBe("Tabela liczebności");
    expect(en.table.caption).toBe("Frequency table");
    expect(pl.table.rows).toEqual(en.table.rows);
    expect(pl.steps.map(step => step.calculation)).toEqual(en.steps.map(step => step.calculation));
    if (!result) {
      expect(pl.conclusion).toContain("Brak dominanty");
      expect(en.conclusion).toContain("No mode");
    }
  });
});
