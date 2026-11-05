import { describe, expect, it } from "vitest";
import { batchD, batchDOracle, wrongBatchDAnswer } from "./batchD";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { assessAnswer, emptyAnswer } from "../answers";
import { auditCalculation } from "../university/audit";
import { polishLearningText } from "../../e2e/helpers/localization";
import { auditDisplayedRows } from "./batchDSteps";

describe("Batch D bounded independent mathematical acceptance", () => {
  it("keeps exactly 15 skills, 24 combinations, 576 unit tasks and 48 UI variants", () => {
    expect(new Set(batchD.map(row => row.skill)).size).toBe(15);
    expect(batchD).toHaveLength(24);
    expect(new Set(batchD.map(row => row.family + ":" + row.level)).size).toBe(24);
    expect(batchD.length * 24).toBe(576);
    const ids = batchD.flatMap(row => row.variants.map(v => `${row.family}:${row.level}:${v}`));
    expect(ids).toHaveLength(48);
    expect(new Set(ids).size).toBe(48);
  });
  for (const row of batchD) it(`${row.block} ${row.skill} ${row.family}/${row.level}: 24 exact PL/EN witnesses`, () => {
    const keys = new Set<string>();
    for (let v = 0; v < 24; v++) {
      const task = makeUniversityTask(row.family, v, row.level);
      keys.add(task.contentKey);
      expect(task.id).toBe(`${row.family}:${row.level}:${v}`);
      const expected = batchDOracle(task);
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale);
        expect(assessAnswer(view.answer, expected).kind).toBe("correct");
        expect(assessAnswer(view.answer, wrongBatchDAnswer(expected, task)).kind).toBe("incorrect");
        expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        expect(view.hint).not.toBe(view.nextHint);
        expect(view.explanation.length).toBeGreaterThan(20);
        const final = view.solution?.at(-1);
        expect(final?.kind).toBe("answer");
        if (final?.kind !== "answer") throw Error("Missing final solution answer");
        expect(assessAnswer(final.answer, expected).kind).toBe("correct");
        const work = view.solution?.filter(step => step.kind === "working") ?? [];
        auditDisplayedRows(task, view.solution ?? []);
        expect(work.length).toBeGreaterThan(0);
        for (const step of work) if (step.kind === "working") {
          expect(step.action.trim()).not.toBe("");
          expect(step.reason.length).toBeGreaterThan(10);
          for (const calc of step.calculations) expect(auditCalculation(calc)).toBe(true);
        }
        if (locale === "en") expect([view.question, view.hint, view.nextHint, view.explanation, ...work.map(step => step.action + " " + step.reason)].join(" ")).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
  });
});
