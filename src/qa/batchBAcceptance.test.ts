import { describe, expect, it } from "vitest";
import { batchB, batchBOracle, wrongBatchBAnswer } from "./batchB";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { assessAnswer, emptyAnswer } from "../answers";
import { auditCalculation } from "../university/audit";
import { polishLearningText } from "../../e2e/helpers/localization";

describe("Batch B independent method acceptance — no source acceptance", () => {
  for (const row of batchB) it(`${row.skill} ${row.family}/${row.level}: all 24 variants, PL/EN`, () => {
    const keys = new Set<string>();
    for (let v = 0; v < 24; v++) {
      const task = makeUniversityTask(row.family, v, row.level);
      expect(task.id).toBe(`${row.family}:${row.level}:${v}`);
      keys.add(task.contentKey);
      const expected = batchBOracle(task);
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale);
        expect(assessAnswer(view.answer, expected).kind).toBe("correct");
        expect(assessAnswer(view.answer, wrongBatchBAnswer(expected, task)).kind).toBe("incorrect");
        expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        expect(view.hint).not.toBe(view.nextHint);
        expect(view.explanation.length).toBeGreaterThan(20);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        const steps = view.solution?.filter(step => step.kind === "working") ?? [];
        expect(steps.length).toBeGreaterThan(0);
        for (const step of steps) if (step.kind === "working") {
          expect(step.action.trim()).not.toBe("");
          expect(step.reason.length).toBeGreaterThan(10);
          for (const calculation of step.calculations) expect(auditCalculation(calculation)).toBe(true);
        }
        if (locale === "en") expect([view.question, view.hint, view.nextHint, view.explanation, ...steps.map(step => step.kind === "working" ? step.action + " " + step.reason : "")].join(" ")).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
  });

  it("G05 linear radicands explain their actual leading degree in PL/EN", () => {
    const task = makeUniversityTask("limit-root-infinity-conjugates", 2, "advanced");
    for (const locale of ["pl", "en"] as const) {
      const first = localizeUniversity(task, locale).solution?.find(step => step.kind === "working");
      if (first?.kind !== "working") throw Error("Missing first working step");
      expect(first.reason).toContain("s²x");
      expect(first.reason).not.toContain("s²x²");
      expect(first.reason).not.toContain("s|x|");
    }
  });
});
