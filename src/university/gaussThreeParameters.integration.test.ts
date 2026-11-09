import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as format } from "../answers";
import { allTemplates, taskPool } from "../generators";
import { batchDOracle } from "../qa/batchD";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { gaussThreeParameterFamilies, presentGaussThreeParameters } from "./gaussThreeParameters";

describe("U06/U08 three-parameter systems: catalog integration", () => {
  it("registers exactly two new families and 144 generated tasks", () => {
    expect(gaussThreeParameterFamilies.map(f => f.id)).toEqual([
      "gauss-three-by-five-three-parameters", "gauss-five-three-parameters",
    ]);
    expect(gaussThreeParameterFamilies.every(f => allTemplates.some(t => t.id === f.id))).toBe(true);
    expect(gaussThreeParameterFamilies.reduce((sum, f) => sum + 24 * f.supportedDifficulties.length, 0)).toBe(144);
  });

  for (const family of gaussThreeParameterFamilies)
    for (const difficulty of family.supportedDifficulties)
      it(`${family.id}/${difficulty}: 24 distinct public lessons in PL/EN, correct score and archival isolation`, () => {
        const pool = taskPool("systems", difficulty).filter(t => t.templateId === family.id);
        expect(pool).toHaveLength(24);
        expect(new Set(pool.map(t => t.id)).size).toBe(24);
        expect(new Set(pool.map(t => t.contentKey)).size).toBe(24);
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, difficulty);
          const p = task.university;
          if (p.kind !== "linear-system") throw Error("Expected a linear system");
          expect(p.method).toBe("parameters-three");
          expect(p.matrix).toHaveLength(family.id.startsWith("gauss-three-by-five") ? 3 : 4);
          expect(p.matrix.every(row => row.length === 5)).toBe(true);
          expect(task.id).toBe(`${family.id}:${difficulty}:${v}`);
          expect(task.templateId).toBe(family.id);
          expect(task.contentKey.startsWith("university:")).toBe(true);
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale);
            const isolated = presentGaussThreeParameters(p, locale);
            expect(localized.question).toBe(isolated.question);
            expect(localized.answer).toEqual(isolated.answer);
            expect(localized.solution).toEqual(isolated.solution);
            expect(localized.id).toBe(task.id);
            expect(localized.contentKey).toBe(task.contentKey);
            expect(localized.title).toBe(family.titles[locale]);
            expect(localized.answer.kind).toBe("list");
            if (localized.answer.kind !== "list") throw Error("Expected all parameter coefficients");
            expect(localized.answer.values).toHaveLength(20);
            expect(localized.answer.labels).toHaveLength(20);
            const correct = { kind: "list" as const, values: localized.answer.values.map(format) };
            expect(assessAnswer(localized.answer, correct).kind).toBe("correct");
            expect(assessAnswer(localized.answer, emptyAnswer(localized.answer)).kind).toBe("invalid");
            expect(assessAnswer(localized.answer, { ...correct, values: ["7654321", ...correct.values.slice(1)] }).kind).toBe("incorrect");
          }
        }
      });

  it("agrees with the separate exact Batch D minor/Cramer oracle for 24 edge variants", () => {
    for (const family of gaussThreeParameterFamilies)
      for (const difficulty of family.supportedDifficulties)
        for (const variant of [0, 1, 2, 3]) {
          const task = makeUniversityTask(family.id, variant, difficulty);
          const oracle = batchDOracle(task);
          expect(oracle.kind).toBe("list");
          if (typeof oracle === "string" || oracle.kind !== "list") throw Error("Expected a full coefficient list");
          expect(oracle.values).toHaveLength(20);
          expect(assessAnswer(task.answer, oracle).kind).toBe("correct");
        }
  });

  it("preserves existing 3x5 and 4x5 two-parameter family routing", () => {
    for (const family of ["gauss-five-3x5", "gauss-five-4x5"] as const)
      for (const locale of ["pl", "en"] as const) {
        const task = makeUniversityTask(family, 1, "advanced");
        const localized = localizeUniversity(task, locale);
        expect(localized.university.kind).toBe("linear-system");
        expect(localized.answer.kind).toBe("list");
        if (localized.answer.kind !== "list") throw Error("Existing five-unknown answer changed");
        expect(localized.answer.values).toHaveLength(15);
        expect(localized.question).toContain("t2");
        expect(localized.question).not.toContain("t3");
      }
  });
});
