import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as format } from "../answers";
import { taskPool } from "../generators";
import { competencyIndex } from "../competencyIndex";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { matrixCoefficientPairFamilies } from "./matrixPairCoefficientStage";

describe("M05 matrix-coefficient source-form: student catalog integration", () => {
  const id = "matrix-coefficient-coupled-equations";
  it("registers 96 synthetic tasks and M05 search without upgrading source acceptance", () => {
    expect(matrixCoefficientPairFamilies.map(f => f.id)).toEqual([id]);
    expect(matrixCoefficientPairFamilies[0].supportedDifficulties).toEqual([
      "medium", "hard", "advanced", "expert",
    ]);
    expect(competencyIndex.M05.familyIds).toContain(id);
    expect(competencyIndex.M05.coverage).toBe("partial");
  });

  for (const difficulty of ["medium", "hard", "advanced", "expert"] as const)
    it(difficulty + ": all 24 tasks display, grade, and localize PL/EN", () => {
      const pool = taskPool("matrices", difficulty).filter(t => t.templateId === id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t => t.id)).size).toBe(24);
      expect(new Set(pool.map(t => t.contentKey)).size).toBe(24);
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask(id, variant, difficulty);
        expect(task.university.kind).toBe("linear-matrix-coefficient-pair");
        expect(task.id).toBe(id + ":" + difficulty + ":" + variant);
        for (const locale of ["pl", "en"] as const) {
          const localized = localizeUniversity(task, locale);
          expect(localized.question).toMatch(/X \+ AY = C; BX \+ Y = D/);
          expect(localized.hint.length).toBeGreaterThan(20);
          expect(localized.nextHint).toContain("(I−AB)");
          expect(localized.solution).toHaveLength(7);
          expect(localized.solution.at(-1)?.kind).toBe("answer");
          expect(localized.title).toBe(matrixCoefficientPairFamilies[0].titles[locale]);
          expect(localized.answer.kind).toBe("list");
          if (localized.answer.kind !== "list") throw Error("Missing eight-field list");
          expect(localized.answer.values).toHaveLength(8);
          expect(localized.answer.labels).toEqual([
            "X[1,1]", "X[1,2]", "X[2,1]", "X[2,2]",
            "Y[1,1]", "Y[1,2]", "Y[2,1]", "Y[2,2]",
          ]);
          const correct = {
            kind: "list" as const,
            values: localized.answer.values.map(format),
          };
          expect(assessAnswer(localized.answer, correct).kind).toBe("correct");
          expect(assessAnswer(localized.answer, emptyAnswer(localized.answer)).kind).toBe("invalid");
          expect(assessAnswer(localized.answer, {
            kind: "list", values: correct.values.slice(0, 7),
          }).kind).toBe("invalid");
          expect(assessAnswer(localized.answer, {
            kind: "list", values: [format(localized.answer.values[0]) + "0", ...correct.values.slice(1)],
          }).kind).not.toBe("correct");
          expect(assessAnswer(localized.answer, {
            kind: "list", values: ["1/0", ...correct.values.slice(1)],
          }).kind).toBe("invalid");
        }
      }
    });
});
