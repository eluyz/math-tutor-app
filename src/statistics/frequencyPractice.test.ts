import { describe, expect, it } from "vitest";
import { assessFrequencyResponse, createFrequencyPracticeTask } from "./frequencyPractice";
import { createFrequencyQuestion } from "./frequencyTasks";
import { frequencyCopy } from "./st106Copy";

describe("ST-106 bilingual practice adapter", () => {
  it("keeps the same correct choice, numbers and calculation across locale", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      for (const seed of [...Array.from({ length: 256 }, (_, index) => index), 4294967295]) {
        const task = createFrequencyPracticeTask(level, seed);
        expect(task.lesson).toBe("frequency-tables");
        const pl = frequencyCopy(task, "pl");
        const en = frequencyCopy(task, "en");
        expect(pl.prompt).not.toBe(en.prompt);
        expect(pl.table.rows).toEqual(task.rows);
        expect(en.table.rows).toEqual(task.rows);
        expect(pl.table.caption).not.toBe(en.table.caption);
        expect(pl.options).toEqual(en.options);
        expect(new Set(pl.options.map(option => option.label)).size).toBe(3);
        expect(pl.steps.map(step => step.calculation)).toEqual(en.steps.map(step => step.calculation));
        expect(pl.hints).toHaveLength(2);
        expect(en.hints).toHaveLength(2);
        for (const [index, hint] of pl.hints.entries()) expect(hint).not.toBe(en.hints[index]);
        expect(pl.conclusion).not.toBe(en.conclusion);
        expect(Object.keys(pl.feedback)).toEqual(["correct", "incorrect", "empty", "invalid"]);
        for (const state of ["correct", "incorrect", "empty", "invalid"] as const) expect(pl.feedback[state]).not.toBe(en.feedback[state]);
        if (seed === 0) {
          const correct = pl.options.filter(option => assessFrequencyResponse(task, option.id) === "correct");
          expect(correct).toHaveLength(1);
          expect(pl.conclusion).toContain(correct[0].label);
          expect(en.conclusion).toContain(correct[0].label);
        }
      }
    }
  });

  it("explains a nonterminating percentage with an exact fractional label", () => {
    const rows = [{ value: 0, frequency: 1 }, { value: -5, frequency: 2 }];
    const q = createFrequencyQuestion(rows, { family: "percentage", value: 0 });
    for (const locale of ["pl", "en"] as const) {
      const copy = frequencyCopy(q, locale);
      expect(copy.options.map(option => option.label)).toContain("(100/3)%");
      expect(copy.steps.map(step => step.calculation)).toEqual(["N = 1 + 2 = 3", "k = 1", "(100 × 1/3)% = (100/3)%"]);
      expect(copy.conclusion).toContain("(100/3)%");
    }
  });

  it("handles disabled levels, absent responses and stale option IDs", () => {
    const task = createFrequencyPracticeTask("easy", 0);
    const next = createFrequencyPracticeTask("easy", 1);
    expect(assessFrequencyResponse(task, next.options[0].id)).toBe("invalid");
    expect(assessFrequencyResponse(task, " ")).toBe("empty");
    expect(assessFrequencyResponse(task, 0)).toBe("invalid");
    expect(() => createFrequencyPracticeTask("advanced", 0)).toThrow(RangeError);
    expect(() => createFrequencyPracticeTask("expert", 0)).toThrow(RangeError);
    expect(() => frequencyCopy(task, "unsupported" as "pl")).toThrow(RangeError);
  });
});
