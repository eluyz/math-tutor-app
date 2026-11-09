import {describe, it, expect} from "vitest";
import {rational as r, type Rational} from "../rational";
import {assessAnswer, emptyAnswer} from "../answers";
import {
  createQuadraticEulerSequence, quadraticEulerExponent,
  quadraticEulerAnswer, presentQuadraticEulerSequence,
  type QuadraticEulerSequence,
} from "./sequenceQuadraticEuler";

const levels = ["medium", "hard", "advanced", "expert"] as const;
const numeric = (x: Rational) => Number(x.numerator)/Number(x.denominator);
const same = (x: Rational, y: Rational) => x.numerator*y.denominator === y.numerator*x.denominator;
const key = (x: Rational) => `${x.numerator}/${x.denominator}`;
const approx = (p: QuadraticEulerSequence, n: number) =>
  Math.exp((numeric(p.c)*n*n+numeric(p.d)) * Math.log1p(numeric(p.a)/(n*n+numeric(p.b))));

describe("C05 isolated quadratic-scaling Euler limit (not catalog registered)", () => {
  it("96 unique bilingual synthetic tasks with independent exact exponent, answers, and relative convergence", () => {
    const seen = new Set<string>();
    for (const level of levels) for (let variant = 0; variant < 24; variant++) {
      const p = createQuadraticEulerSequence(variant, level);
      const expected = r(p.a.numerator*p.c.numerator, p.a.denominator*p.c.denominator);
      const exponent = quadraticEulerExponent(p);
      expect(same(expected, exponent)).toBe(true);
      const estimated = approx(p, 1000), target = Math.exp(numeric(expected));
      expect(Math.abs(estimated-target)/Math.max(1,target)).toBeLessThan(0.0001);
      for (const locale of ["pl","en"] as const) {
        const task = presentQuadraticEulerSequence(p, locale);
        expect(task.question).toContain("n→+∞");
        expect(task.question).toContain("n²");
        expect(task.solution.length).toBeGreaterThanOrEqual(5);
        expect(task.solution.some(x => x.kind === "working" && x.action.includes("ln(1+tₙ)/tₙ"))).toBe(true);
        expect(task.hint.length).toBeGreaterThan(15);
        expect(task.nextHint.length).toBeGreaterThan(15);
        expect(task.answer.kind).toBe("choice");
        if (task.answer.kind !== "choice") throw Error("Expected exact Euler choice");
        expect(task.answer.value).toBe(`exp:${key(expected)}`);
        expect(task.answer.options.some(x => x.value === task.answer.value)).toBe(true);
        expect(assessAnswer(task.answer, {kind:"choice",value:task.answer.value}).kind).toBe("correct");
        const wrong = task.answer.options.find(x => x.value !== task.answer.value);
        expect(wrong).toBeDefined();
        expect(assessAnswer(task.answer, {kind:"choice",value:wrong!.value}).kind).toBe("incorrect");
        expect(assessAnswer(task.answer, emptyAnswer(task.answer)).kind).toBe("invalid");
        if (locale === "en") expect(task.question).not.toMatch(/[ąćęłńóśźż]/i);
      }
      seen.add(presentQuadraticEulerSequence(p, "pl").question);
    }
    expect(seen.size).toBe(96);
  });
  it("handles exponent zero and enforces real logarithm domain", () => {
    const p = createQuadraticEulerSequence(0,"medium");
    expect(quadraticEulerAnswer(r(0))).toEqual({kind:"scalar",value:r(1)});
    const zero = presentQuadraticEulerSequence({...p,c:r(0)},"pl");
    expect(assessAnswer(zero.answer,"1").kind).toBe("correct");
    expect(() => createQuadraticEulerSequence(-1,"medium")).toThrow();
    expect(() => createQuadraticEulerSequence(24,"medium")).toThrow();
    expect(() => createQuadraticEulerSequence(0.5,"medium")).toThrow();
    expect(() => createQuadraticEulerSequence(0,"easy")).toThrow();
    expect(() => quadraticEulerExponent({...p,a:r(0)})).toThrow();
    expect(() => quadraticEulerExponent({...p,b:r(-1)})).toThrow();
    expect(() => quadraticEulerExponent({...p,a:r(-100)})).toThrow();
  });
});
