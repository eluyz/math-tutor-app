import { describe, expect, it } from "vitest";
import { batchC, batchCOracle } from "./batchC";
import { wrongAcceptanceAnswer } from "./acceptance";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { assessAnswer, emptyAnswer } from "../answers";
import { auditCalculation } from "../university/audit";
import { selectedSetContains } from "../university/functions-audit";
import { polishLearningText } from "../../e2e/helpers/localization";
import type { Rational } from "../rational";

const number = (x: Rational) => Number(x.numerator) / Number(x.denominator);
describe("Batch C: bounded independent method QA, never source acceptance", () => {
  it("enforces the four-skill, six-combination and sixteen-UI-witness budget", () => {
    expect(new Set(batchC.map(row => row.skill)).size).toBe(4);
    expect(batchC).toHaveLength(6);
    expect(new Set(batchC.map(row => row.family + ":" + row.level)).size).toBe(6);
    const ids = batchC.flatMap(row => row.variants.map(v => `${row.family}:${row.level}:${v}`));
    expect(ids).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);
    expect(batchC.every(row => row.variants.every(v => v >= 0 && v < 24))).toBe(true);
  });

  for (const row of batchC) it(`${row.skill} ${row.family}/${row.level}: exactly 24 variants × PL/EN`, () => {
    const keys = new Set<string>(), classes = new Set<string>(), directions = new Set<string>();
    for (let v = 0; v < 24; v++) {
      const task = makeUniversityTask(row.family, v, row.level), p = task.university;
      expect(task.id).toBe(`${row.family}:${row.level}:${v}`);
      keys.add(task.contentKey);
      const expected = batchCOracle(task);
      if (typeof expected === "string") throw Error("Expected typed input");
      if (expected.kind === "limit") classes.add(expected.classification);
      if (p.kind === "sequence-radical-ratio") {
        // Separate numerical evaluation of the displayed roots after stable
        // scaling. This checks the algebra behind the exact asymptotic oracle.
        const n = 1e6;
        const numerator = Math.sqrt((number(p.a) + number(p.b) / n) ** 2 + number(p.c) / n ** 2) + number(p.linear);
        const denominator = Math.sqrt((number(p.e) + number(p.offset) / n) ** 2 + number(p.remainder) / n ** 2) + number(p.lowerLinear);
        if (expected.kind !== "limit") throw Error("Expected limit");
        expect(Math.abs(numerator / denominator - Number(expected.value.replace("−", "-").split("/")[0]) / Number(expected.value.split("/")[1] ?? 1))).toBeLessThan(1e-4);
      }
      if (p.kind === "function-log-rational-domain") {
        if (expected.kind !== "choice") throw Error("Expected domain");
        for (const point of [p.p, p.q, p.pole]) expect(selectedSetContains(expected.value, point)).toBe(false);
        classes.add(number(p.pole) < number(p.p) ? "pole-before" : number(p.pole) > number(p.q) ? "pole-after" : "pole-inside");
      }
      if (p.kind === "limit-infinity" || p.kind === "limit-radical-infinity") directions.add(p.direction);
      const pl = localizeUniversity(task, "pl"), en = localizeUniversity(task, "en");
      expect(pl.hint).not.toBe(en.hint);
      expect(pl.nextHint).not.toBe(en.nextHint);
      for (const view of [pl, en]) {
        expect(assessAnswer(view.answer, expected).kind).toBe("correct");
        expect(assessAnswer(view.answer, wrongAcceptanceAnswer(expected, task)).kind).toBe("incorrect");
        expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        expect(view.hint).not.toBe(view.nextHint);
        expect(view.explanation.length).toBeGreaterThan(20);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        const steps = view.solution?.filter(step => step.kind === "working") ?? [];
        expect(steps.length).toBeGreaterThanOrEqual(3);
        for (const step of steps) if (step.kind === "working") {
          expect(step.action.trim()).not.toBe("");
          expect(step.reason.length).toBeGreaterThan(15);
          for (const calculation of step.calculations) expect(auditCalculation(calculation)).toBe(true);
        }
        if (view === en) expect([view.question, view.hint, view.nextHint, view.explanation, ...steps.map(step => step.action + " " + step.reason)].join(" ")).not.toMatch(polishLearningText);
      }
    }
    expect(keys.size).toBe(24);
    if (row.skill === "C04" || row.skill === "G04") expect(classes).toEqual(new Set(["finite", "positive-infinity", "negative-infinity"]));
    if (row.skill === "F02") expect(classes).toEqual(new Set(["pole-before", "pole-inside", "pole-after"]));
    if (row.skill === "G04") expect(directions).toEqual(new Set(["positive", "negative"]));
  });
});
