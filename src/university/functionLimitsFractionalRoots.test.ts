import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { rational as r, type Rational } from "../rational";
import {
  createFractionalRootLimit,
  fractionalRootLimit,
  fractionalRootLimitStage,
  presentFractionalRootLimit,
  type FractionalRootLimitProblem,
} from "./functionLimitsFractionalRoots";

const number = (x: Rational) => Number(x.numerator) / Number(x.denominator);

/** Independent real-valued evaluation of the visible expression, not the production limit helper. */
function evaluate(p: FractionalRootLimitProblem, x: number) {
  const topRoot = p.mode === "sqrt-over-cuberoot" ? Math.sqrt(x) : Math.cbrt(x);
  const bottomRoot = p.mode === "sqrt-over-cuberoot" ? Math.cbrt(x) : Math.sqrt(x);
  return (number(p.a) * topRoot + number(p.b)) /
    (number(p.c) + number(p.d) * bottomRoot);
}

describe("G04 stage: independent fractional-root comparison at positive infinity", () => {
  it("provides 24 validated synthetic variants for the student catalog", () => {
    expect(fractionalRootLimitStage.id).toBe("limit-mixed-fractional-roots");
    expect(fractionalRootLimitStage.variantCount).toBe(24);
    expect(fractionalRootLimitStage.supportedDifficulties).toEqual(["hard"]);
    for (const bad of [-1, 24, 1.5, NaN, Infinity, -Infinity]) {
      expect(() => createFractionalRootLimit(bad)).toThrow();
    }
  });

  it("checks 24 distinct expressions, exact answers, growing/vanishing ratios, PL/EN and grading", () => {
    const questions = new Set<string>();
    const classes = new Set<string>();
    const modes = new Set<string>();
    for (let variant = 0; variant < 24; variant++) {
      const p = createFractionalRootLimit(variant);
      expect(p.a.numerator).not.toBe(0n);
      expect(p.d.numerator).not.toBe(0n);
      const expected = p.mode === "cuberoot-over-sqrt" ? "finite" :
        Math.sign(number(p.a) / number(p.d)) > 0
          ? "positive-infinity" : "negative-infinity";
      const exact = fractionalRootLimit(p);
      expect(exact.kind).toBe(expected);
      if (exact.kind === "finite") {
        expect(exact.value.numerator).toBe(0n);
        expect(exact.value.denominator).toBe(1n);
      }
      classes.add(expected);
      modes.add(p.mode);

      const near = evaluate(p, 1e12);
      const far = evaluate(p, 1e18);
      expect(Number.isFinite(near) && Number.isFinite(far)).toBe(true);
      if (expected === "finite") {
        // Cubic-root growth cannot keep up with the square-root denominator.
        expect(Math.abs(far)).toBeLessThan(0.01);
        expect(Math.abs(far)).toBeLessThan(Math.abs(near));
      } else {
        // Independently: f(x)/x^(1/6) -> a/d, preserving the infinity sign.
        expect(Math.sign(far)).toBe(Math.sign(number(p.a) / number(p.d)));
        expect(Math.abs(far)).toBeGreaterThan(2 * Math.abs(near));
        expect(Math.abs(far / Math.pow(1e18, 1 / 6) - number(p.a) / number(p.d)))
          .toBeLessThan(0.001);
      }

      for (const locale of ["pl", "en"] as const) {
        const view = presentFractionalRootLimit(p, locale);
        const answer = view.answer;
        if (answer.kind !== "limit") throw new Error("Expected limit answer");
        expect(answer.value.kind).toBe(expected);
        expect(view.question).toContain("x→+∞");
        expect(view.question).toContain("√x");
        expect(view.question).toContain("∛x");
        expect(view.hint.length).toBeGreaterThan(30);
        expect(view.nextHint.length).toBeGreaterThan(30);
        const steps = view.solution.filter(s => s.kind === "working");
        expect(steps.length).toBeGreaterThanOrEqual(4);
        for (const step of steps) {
          if (step.kind !== "working") continue;
          expect(step.action.length).toBeGreaterThanOrEqual(10);
          expect(step.reason.length).toBeGreaterThan(25);
        }
        expect(view.explanation).toContain("1/6");
        expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
        const correct = { kind: "limit" as const, classification: expected, value: expected === "finite" ? "0" : "" };
        expect(assessAnswer(answer, correct).kind).toBe("correct");
        const wrong = { kind: "limit" as const, classification: expected === "positive-infinity" ?
          "negative-infinity" : "positive-infinity", value: "" };
        expect(assessAnswer(answer, wrong).kind).toBe("incorrect");
        if (locale === "en") {
          expect(view.question).toContain("Find the limit");
          expect(view.hint).toContain("fractional powers");
        } else {
          expect(view.question).toContain("Wyznacz granicę");
          expect(view.hint).toContain("potęgi");
        }
      }
      questions.add(p.mode + "/" + number(p.a) + "/" + number(p.b) + "/" +
        number(p.c) + "/" + number(p.d));
    }
    expect(questions.size).toBe(24);
    expect(classes).toEqual(new Set(["finite", "positive-infinity", "negative-infinity"]));
    expect(modes).toEqual(new Set(["sqrt-over-cuberoot", "cuberoot-over-sqrt"]));
  });

  it("rejects zero leading coefficients rather than inventing the asymptotic class", () => {
    const p = createFractionalRootLimit(2);
    expect(() => fractionalRootLimit({ ...p, a: r(0) })).toThrow();
    expect(() => fractionalRootLimit({ ...p, d: r(0) })).toThrow();
  });
});
