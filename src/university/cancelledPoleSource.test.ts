import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { referenceExpand, referencePointLimit, referenceShift } from "./functions-audit";
import { assessAnswer, emptyAnswer } from "../answers";
import { q, eq, auditCalculation } from "./audit";
import { polishLearningText } from "../../e2e/helpers/localization";

/** Synthetic G03 source-method witness, NOT the original private worksheet. */
describe("#151 G03: cancellation leaves opposite infinite one-sided limits", () => {
  it("proves all 24 algebraic pole orders, signs and bilingual grading", () => {
    const keys = new Set<string>();
    const signs = new Set<string>();
    for (let v = 0; v < 24; v++) {
      const task = makeUniversityTask("limit-cancelled-pole", v, "hard");
      const p = task.university;
      if (p.kind !== "limit-point") throw Error("Unexpected problem");
      expect(p.side).toBe("both");
      keys.add(task.contentKey);
      const numerator = referenceExpand(p.numerator);
      const top = referenceShift(numerator, p.at);
      const bottom = referenceShift(p.denominator, p.at);
      expect(top[0].numerator).toBe(0n);
      expect(top[1].numerator).not.toBe(0n);
      expect(bottom[0].numerator).toBe(0n);
      expect(bottom[1].numerator).toBe(0n);
      expect(bottom[2].numerator).not.toBe(0n);
      const left = referencePointLimit(numerator, p.denominator, p.at, "left");
      const right = referencePointLimit(numerator, p.denominator, p.at, "right");
      expect(new Set([left.kind, right.kind])).toEqual(new Set(["positive-infinity", "negative-infinity"]));
      expect(referencePointLimit(numerator, p.denominator, p.at, "both").kind).toBe("does-not-exist");
      signs.add(left.kind);
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale);
        expect(view.answer.kind).toBe("limit");
        if (view.answer.kind !== "limit") throw Error("Expected limit");
        expect(view.answer.value.kind).toBe("does-not-exist");
        expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
        expect(assessAnswer(view.answer, {kind:"limit",classification:"does-not-exist",value:""}).kind).toBe("correct");
        expect(assessAnswer(view.answer, {kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
        expect(view.hint.length).toBeGreaterThan(12);
        expect(view.nextHint.length).toBeGreaterThan(12);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        const workings = view.solution?.filter(step => step.kind === "working") ?? [];
        expect(workings.length).toBeGreaterThanOrEqual(3);
        expect(workings.some(step => step.kind === "working" && step.action.includes("M(x)") && step.action.includes("^2"))).toBe(true);
        expect(workings.some(step => step.kind === "working" && step.action.includes("limₓ→ₐ₋"))).toBe(true);
        for (const step of workings) if (step.kind === "working") {
          expect(step.reason.length).toBeGreaterThan(18);
          for (const calc of step.calculations) expect(auditCalculation(calc)).toBe(true);
        }
        if (locale === "en") expect(view.question + view.hint + view.nextHint + view.explanation).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
    expect(signs).toEqual(new Set(["positive-infinity", "negative-infinity"]));
    expect(() => makeUniversityTask("limit-cancelled-pole", 0, "medium")).toThrow();
  });
});
