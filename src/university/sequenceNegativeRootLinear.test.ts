import {describe, it, expect} from "vitest";
import {rational as r, type Rational, addRational as add} from "../rational";
import {assessAnswer, emptyAnswer, formatRational as f} from "../answers";
import {
  createNegativeRootLinearSequence, negativeRootLinearSequenceLimit,
  presentNegativeRootLinearSequence, type NegativeRootLinearSequence,
} from "./sequenceNegativeRootLinear";

const levels = ["medium", "hard", "advanced", "expert"] as const;
const numeric = (q: Rational) => Number(q.numerator) / Number(q.denominator);
const equal = (a: Rational, b: Rational) => a.numerator * b.denominator === b.numerator * a.denominator;
const calculate = (p: NegativeRootLinearSequence, n: number) => {
  const a = numeric(p.rootLeading), b = numeric(p.rootLinear), c = numeric(p.rootConstant);
  const d = numeric(p.denominatorLeading), e = numeric(p.denominatorConstant);
  return -Math.sqrt(a * a * n * n + b * n + c) / (d * n + e);
};

describe("C02 isolated negative-root-over-linear method (NOT catalog registered)", () => {
  it("96 distinct source-shaped variants with independently derived exact limits and PL/EN answers", () => {
    const seen = new Set<string>();
    for (const level of levels) for (let variant = 0; variant < 24; variant++) {
      const p = createNegativeRootLinearSequence(variant, level);
      const expected = r(
        -p.rootLeading.numerator * p.denominatorLeading.denominator,
        p.rootLeading.denominator * p.denominatorLeading.numerator
      );
      const actual = negativeRootLinearSequenceLimit(p);
      expect(equal(actual.value, expected)).toBe(true);
      expect(actual.value.numerator).toBeLessThan(0n);
      expect(Math.abs(calculate(p, 100000) - numeric(expected))).toBeLessThan(0.0001);
      for (const locale of ["pl", "en"] as const) {
        const task = presentNegativeRootLinearSequence(p, locale);
        expect(task.question).toContain("n→+∞");
        expect(task.question).toContain("-√(");
        expect(task.solution.length).toBeGreaterThanOrEqual(5);
        expect(task.solution.some(x => x.kind === "working" && x.action.includes("n²"))).toBe(true);
        expect(task.hint.length).toBeGreaterThan(10);
        expect(task.nextHint.length).toBeGreaterThan(10);
        expect(assessAnswer(task.answer, {kind: "limit", classification: "finite", value: f(expected)}).kind).toBe("correct");
        expect(assessAnswer(task.answer, {kind: "limit", classification: "finite", value: f(add(expected, r(1)))}).kind).toBe("incorrect");
        expect(assessAnswer(task.answer, {kind: "limit", classification: "positive-infinity", value: ""}).kind).toBe("incorrect");
        expect(assessAnswer(task.answer, emptyAnswer(task.answer)).kind).toBe("invalid");
        expect(assessAnswer(task.answer, {kind: "limit", classification: "finite", value: "1/0"}).kind).toBe("invalid");
        if (locale === "en") expect(task.question).not.toMatch(/[ąćęłńóśźż]/i);
      }
      seen.add(presentNegativeRootLinearSequence(p, "pl").question);
    }
    expect(seen.size).toBe(96);
  });

  it("rejects unsupported indices, difficulty, and unsafe radical/linear domains", () => {
    expect(() => createNegativeRootLinearSequence(-1, "medium")).toThrow();
    expect(() => createNegativeRootLinearSequence(24, "medium")).toThrow();
    expect(() => createNegativeRootLinearSequence(1.5, "medium")).toThrow();
    expect(() => createNegativeRootLinearSequence(0, "easy")).toThrow();
    const p = createNegativeRootLinearSequence(0, "medium");
    expect(() => negativeRootLinearSequenceLimit({...p, rootLeading: r(0)})).toThrow();
    expect(() => negativeRootLinearSequenceLimit({...p, rootLinear: r(-1)})).toThrow();
    expect(() => negativeRootLinearSequenceLimit({...p, rootConstant: r(-100)})).toThrow();
    expect(() => negativeRootLinearSequenceLimit({...p, denominatorLeading: r(0)})).toThrow();
    expect(() => negativeRootLinearSequenceLimit({...p, denominatorConstant: r(-1)})).toThrow();
  });
});
