import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { searchCatalog } from "../catalogSearch";
import { allTemplates, taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity } from "./catalog";

const id = "analysis-euler-function-infinity";

describe("G06 catalog integration (24 synthetic x→+∞ Euler variants)", () => {
  it("registers one hard-only function-limit family searchable by G06", () => {
    const family = allTemplates.filter(item => item.id === id);
    expect(family).toHaveLength(1);
    expect(family[0].category).toBe("function-limits");
    expect(family[0].supportedDifficulties).toEqual(["hard"]);
    expect(searchCatalog("G06").map(item => item.id)).toContain(id);
    expect(searchCatalog("granica funkcji typu eulera").map(item => item.id)).toContain(id);
    expect(taskPool("function-limits", "hard").filter(item => item.templateId === id)).toHaveLength(24);
    expect(taskPool("function-limits", "medium").some(item => item.templateId === id)).toBe(false);
    expect(() => makeUniversityTask(id, 0, "medium")).toThrow();
    expect(() => makeUniversityTask(id, 24, "hard")).toThrow();
  });

  it("presents all 24 variants in PL/EN with correct, wrong, empty and invalid grading", () => {
    const questions = new Set<string>();
    let exactOne = 0, symbolicPi = 0, symbolicRational = 0;
    for (let variant = 0; variant < 24; variant++) {
      const task = makeUniversityTask(id, variant, "hard");
      expect(task.university.kind).toBe("analysis-euler-infinity");
      questions.add(task.contentKey);
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale);
        const answer = view.answer;
        expect(view.question).toContain("x→+∞");
        expect(view.hint.length).toBeGreaterThan(5);
        expect(view.nextHint.length).toBeGreaterThan(5);
        expect(view.solution?.length).toBeGreaterThanOrEqual(4);
        expect(view.explanation).toContain("B(x)");
        const final = view.solution?.at(-1);
        expect(final?.kind).toBe("answer");
        if (final?.kind === "answer") expect(final.answer).toEqual(answer);
        expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
        if (answer.kind === "scalar") {
          exactOne++;
          expect(assessAnswer(answer, formatRational(answer.value)).kind).toBe("correct");
          expect(assessAnswer(answer, "2").kind).toBe("incorrect");
          expect(assessAnswer(answer, "1/0").kind).toBe("invalid");
        } else if (answer.kind === "choice") {
          if (answer.value.includes(":pi")) symbolicPi++;
          else symbolicRational++;
          expect(assessAnswer(answer, { kind: "choice", value: answer.value }).kind).toBe("correct");
          expect(assessAnswer(answer, { kind: "choice", value: answer.options.find(option => option.value !== answer.value)!.value }).kind).toBe("incorrect");
          expect(assessAnswer(answer, { kind: "choice", value: "unknown" }).kind).toBe("invalid");
        } else throw Error("Unexpected G06 answer type");
      }
    }
    expect(questions.size).toBe(24);
    expect(exactOne).toBeGreaterThan(0);
    expect(symbolicPi).toBeGreaterThan(0);
    expect(symbolicRational).toBeGreaterThan(0);
  });

  it("preserves original x→0 Euler tasks and their published variant count", () => {
    const old = taskPool("function-limits", "hard").filter(item => item.templateId === "analysis-euler-function");
    expect(old).toHaveLength(24);
    for (const variant of [0, 7, 23]) {
      const view = localizeUniversity(makeUniversityTask("analysis-euler-function", variant, "hard"), "pl");
      expect(view.question).toContain("x→0");
      expect(view.question).not.toContain("x→+∞");
    }
  });
});
