import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { competencyIndex } from "../competencyIndex";
import { makeUniversityTask, localizeUniversity, universityFamilies } from "./catalog";
import { exponentialFunctionRatioLimit } from "./functionLimitsExponentialRatio";

describe("G04 exponential function ratio — catalog integration", () => {
  it("registers one hard-only family, preserving partial source coverage", () => {
    const matches = universityFamilies.filter(f => f.id === "limit-exponential-function-ratio");
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("function-limits");
    expect(matches[0].supportedDifficulties).toEqual(["hard"]);
    expect(competencyIndex.G04.coverage).toBe("partial");
    expect(competencyIndex.G04.familyIds).toContain("limit-mixed-fractional-roots");
    expect(competencyIndex.G04.familyIds).toContain("limit-exponential-function-ratio");
    for (const level of ["easy", "medium", "advanced", "expert"] as const)
      expect(() => makeUniversityTask("limit-exponential-function-ratio", 0, level)).toThrow();
  });

  it("exposes all 24 distinct tasks with PL/EN hints, steps and grading", () => {
    const ids = new Set<string>();
    const classes = new Set<string>();
    for (let v = 0; v < 24; v++) {
      const task = makeUniversityTask("limit-exponential-function-ratio", v, "hard");
      if (task.university.kind !== "limit-exponential-function-ratio")
        throw Error("Wrong G04 exponential kind");
      const expected = exponentialFunctionRatioLimit(task.university);
      ids.add(task.id);
      classes.add(expected.kind);
      for (const locale of ["pl", "en"] as const) {
        const shown = localizeUniversity(task, locale);
        expect(shown.question).toContain("x→+∞");
        expect(shown.question).toContain("^x");
        expect(shown.hint.length).toBeGreaterThan(30);
        expect(shown.nextHint.length).toBeGreaterThan(30);
        if (!shown.solution) throw Error("Missing G04 exponential worked solution");
        expect(shown.solution.length).toBeGreaterThanOrEqual(6);
        if (shown.answer.kind !== "limit") throw Error("Expected limit answer");
        expect(shown.answer.value.kind).toBe(expected.kind);
        expect(assessAnswer(shown.answer, emptyAnswer(shown.answer)).kind).toBe("invalid");
        const correct = {
          kind: "limit" as const,
          classification: expected.kind,
          value: expected.kind === "finite" ? formatRational(expected.value) : "",
        };
        const wrong = {
          kind: "limit" as const,
          classification: expected.kind === "positive-infinity" ? "negative-infinity" : "positive-infinity",
          value: "",
        };
        expect(assessAnswer(shown.answer, correct).kind).toBe("correct");
        expect(assessAnswer(shown.answer, wrong).kind).toBe("incorrect");
        if (locale === "pl") expect(shown.question).toContain("Wyznacz granicę");
        else expect(shown.question).toContain("Find the limit");
      }
    }
    expect(ids.size).toBe(24);
    expect(classes).toEqual(new Set(["finite", "positive-infinity", "negative-infinity"]));
  });
});
