import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { competencyIndex } from "../competencyIndex";
import { universityFamilies, makeUniversityTask, localizeUniversity } from "./catalog";

describe("G04 mixed fractional roots — catalog integration", () => {
  it("registers one hard-only family in G04 without claiming full syllabus coverage", () => {
    const matches = universityFamilies.filter(f => f.id === "limit-mixed-fractional-roots");
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("function-limits");
    expect(matches[0].supportedDifficulties).toEqual(["hard"]);
    expect(competencyIndex.G04.coverage).toBe("partial");
    expect(competencyIndex.G04.familyIds).toContain("limit-mixed-fractional-roots");
    for (const level of ["easy", "medium", "advanced", "expert"] as const) {
      expect(() => makeUniversityTask("limit-mixed-fractional-roots", 0, level)).toThrow();
    }
  });

  it("exposes 24 distinct tasks with bilingual grading and solution steps", () => {
    const ids = new Set<string>();
    const classes = new Set<string>();
    for (let variant = 0; variant < 24; variant++) {
      const task = makeUniversityTask("limit-mixed-fractional-roots", variant, "hard");
      expect(task.university.kind).toBe("limit-mixed-fractional-roots");
      if (task.university.kind !== "limit-mixed-fractional-roots") throw Error("Wrong G04 type");
      const p = task.university;
      const expected = p.mode === "cuberoot-over-sqrt"
        ? "finite" : (p.a.numerator > 0n) === (p.d.numerator > 0n)
          ? "positive-infinity" : "negative-infinity";
      classes.add(expected);
      ids.add(task.id);
      for (const locale of ["pl", "en"] as const) {
        const shown = localizeUniversity(task, locale);
        expect(shown.question).toContain("√x");
        expect(shown.question).toContain("∛x");
        expect(shown.question).toContain("x→+∞");
        expect(shown.hint.length).toBeGreaterThan(10);
        expect(shown.nextHint.length).toBeGreaterThan(10);
        if (!shown.solution) throw Error("Missing G04 worked solution");
        expect(shown.solution.length).toBeGreaterThanOrEqual(4);
        if (shown.answer.kind !== "limit") throw Error("Expected limit answer");
        expect(shown.answer.value.kind).toBe(expected);
        expect(assessAnswer(shown.answer, emptyAnswer(shown.answer)).kind).toBe("invalid");
        const good = { kind: "limit" as const, classification: expected, value: expected === "finite" ? "0" : "" };
        const wrong = { kind: "limit" as const, classification: expected === "positive-infinity" ? "negative-infinity" : "positive-infinity", value: "" };
        expect(assessAnswer(shown.answer, good).kind).toBe("correct");
        expect(assessAnswer(shown.answer, wrong).kind).toBe("incorrect");
      }
    }
    expect(ids.size).toBe(24);
    expect(classes).toEqual(new Set(["finite", "positive-infinity", "negative-infinity"]));
  });
});
