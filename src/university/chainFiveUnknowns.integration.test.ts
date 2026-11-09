import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import { allTemplates, taskPool } from "../generators";
import { batchDOracle } from "../qa/batchD";
import { localizeUniversity, makeUniversityTask } from "./catalog";
import { fiveUnknownChainStage, presentFiveUnknownChain } from "./chainFiveUnknowns";

describe("U04 five-unknown chain: registered student catalog integration", () => {
  it("adds exactly one 96-instance family and preserves existing two-unknown chain identities", () => {
    expect(allTemplates.filter(f => f.id === fiveUnknownChainStage.id)).toHaveLength(1);
    expect(fiveUnknownChainStage.supportedDifficulties).toEqual(["medium", "hard", "advanced", "expert"]);
    const old = makeUniversityTask("system-chain-five", 0, "medium");
    expect(old.university.kind).toBe("linear-chain-five");
    expect(old.templateId).toBe("system-chain-five");
    const newer = makeUniversityTask(fiveUnknownChainStage.id, 0, "medium");
    expect(newer.university.kind).toBe("linear-chain-five-unknowns");
    expect(newer.id).not.toBe(old.id);
    expect(newer.contentKey).not.toBe(old.contentKey);
  });

  for (const difficulty of ["medium", "hard", "advanced", "expert"] as const)
    it(`${difficulty}: 24 stable IDs, PL/EN full solutions and scalar x grading`, () => {
      const id = fiveUnknownChainStage.id;
      const pool = taskPool("systems", difficulty).filter(t => t.templateId === id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t => t.id)).size).toBe(24);
      expect(new Set(pool.map(t => t.contentKey)).size).toBe(24);
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask(id, v, difficulty);
        expect(task.id).toBe(`${id}:${difficulty}:${v}`);
        expect(task.parameters.variant).toBe(v);
        expect(task.university.kind).toBe("linear-chain-five-unknowns");
        const independentAnswer = batchDOracle(task);
        expect(typeof independentAnswer).toBe("string");
        expect(assessAnswer(task.answer, independentAnswer).kind).toBe("correct");
        if (task.university.kind !== "linear-chain-five-unknowns")
          throw Error("Expected 5-variable exercise");
        for (const locale of ["pl", "en"] as const) {
          const localized = localizeUniversity(task, locale);
          const isolated = presentFiveUnknownChain(task.university, locale);
          expect(localized.question).toBe(isolated.question);
          expect(localized.answer).toEqual(isolated.answer);
          expect(localized.solution).toEqual(isolated.solution);
          expect(localized.id).toBe(task.id);
          expect(localized.contentKey).toBe(task.contentKey);
          expect(localized.title).toBe(fiveUnknownChainStage.titles[locale]);
          expect(localized.question.split(" = ")).toHaveLength(6);
          expect(localized.answer.kind).toBe("scalar");
          if (localized.answer.kind !== "scalar") throw Error("One requested x expected");
          expect(assessAnswer(localized.answer, fmt(localized.answer.value)).kind).toBe("correct");
          expect(assessAnswer(localized.answer, fmt(localized.answer.value) + "1").kind).not.toBe("correct");
          expect(assessAnswer(localized.answer, emptyAnswer(localized.answer)).kind).toBe("invalid");
        }
      }
    });
});
