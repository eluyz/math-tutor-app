import { describe, expect, it } from "vitest";
import { addRational as add, equalRational as eq, rational as r, type Rational } from "../rational";
import { assessAnswer, emptyAnswer } from "../answers";
import {
  createExponentialFunctionRatio, exponentialFunctionRatioLimit,
  exponentialFunctionRatioStage, groupExponentials, presentExponentialFunctionRatio,
  type ExponentialFunctionRatioProblem, type ExponentialFunctionTerm,
} from "./functionLimitsExponentialRatio";

const value = (a: Rational) => Number(a.numerator) / Number(a.denominator);
const calc = (terms: readonly ExponentialFunctionTerm[], x: number) =>
  terms.reduce((total, t) => total + value(t.coefficient) * value(t.base) ** x, 0);
const evaluate = (p: ExponentialFunctionRatioProblem, x: number) =>
  calc(p.numerator, x) / calc(p.denominator, x);
const independent = (v: number) => {
  const mode = v % 6, group = Math.floor(v / 6);
  const c = 2 + v % 5, b = 1 + v % 7;
  const a = [2, -3, 4, -5][group];
  if (mode === 0 || mode === 4) return { kind: "finite" as const, expected: r(0) };
  if (mode === 1) return { kind: "finite" as const, expected: r(a, c) };
  if (mode === 5) return { kind: "finite" as const, expected: r(b, c) };
  return { kind: mode === 2 ? "positive-infinity" as const : "negative-infinity" as const };
};

describe("G04 exponential function ratio — isolated stage QA", () => {
  it("exposes exactly 24 bounded variants and rejects malformed indices", () => {
    expect(exponentialFunctionRatioStage.id).toBe("limit-exponential-function-ratio");
    expect(exponentialFunctionRatioStage.variantCount).toBe(24);
    expect(exponentialFunctionRatioStage.supportedDifficulties).toEqual(["hard"]);
    for (const bad of [-1, 24, 1.25, NaN, Infinity, -Infinity])
      expect(() => createExponentialFunctionRatio(bad)).toThrow();
  });

  it("independently checks leading bases, cancellation, values, both languages and grading", () => {
    const questions = new Set<string>();
    const histogram = { zero: 0, finite: 0, positive: 0, negative: 0 };
    for (let v = 0; v < 24; v++) {
      const p = createExponentialFunctionRatio(v);
      const oracle = independent(v), result = exponentialFunctionRatioLimit(p);
      expect(result.kind).toBe(oracle.kind);
      if (result.kind === "finite") {
        expect(oracle.kind).toBe("finite");
        if (oracle.kind === "finite") expect(eq(result.value, oracle.expected)).toBe(true);
        if (result.value.numerator === 0n) histogram.zero++; else histogram.finite++;
      } else if (result.kind === "positive-infinity") histogram.positive++;
      else if (result.kind === "negative-infinity") histogram.negative++;
      else throw Error("Unexpected limit class");

      expect(p.denominator.every(t => t.coefficient.numerator > 0n)).toBe(true);
      expect(p.denominator.every(t => t.base.numerator > 0n)).toBe(true);
      const near = evaluate(p, 20), far = evaluate(p, 100);
      expect(Number.isFinite(near) && Number.isFinite(far)).toBe(true);
      if (oracle.kind === "finite") {
        expect(Math.abs(far - value(oracle.expected))).toBeLessThan(0.00001);
        if (oracle.expected.numerator === 0n)
          expect(Math.abs(far)).toBeLessThan(Math.abs(near));
      } else {
        expect(Math.sign(far)).toBe(oracle.kind === "positive-infinity" ? 1 : -1);
        expect(Math.abs(far)).toBeGreaterThan(3 * Math.abs(near));
      }
      if (v % 6 >= 4) {
        expect(p.numerator[0].base).toEqual(p.numerator[1].base);
        const grouped = groupExponentials(p.numerator);
        expect(grouped).toHaveLength(1);
        expect(grouped[0].base).toEqual(p.numerator[2].base);
      }

      for (const locale of ["pl", "en"] as const) {
        const present = presentExponentialFunctionRatio(p, locale);
        const spec = present.answer;
        if (spec.kind !== "limit") throw Error("Expected exact limit answer");
        expect(spec.value.kind).toBe(oracle.kind);
        expect(present.question).toContain("x→+∞");
        expect(present.question).toContain("^x");
        expect(present.hint.length).toBeGreaterThan(30);
        expect(present.nextHint.length).toBeGreaterThan(30);
        expect(present.solution.filter(step => step.kind === "working")).toHaveLength(5);
        for (const step of present.solution) {
          expect(step.action.length).toBeGreaterThan(10);
          expect(step.reason.length).toBeGreaterThan(20);
        }
        expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
        const correct = {
          kind: "limit" as const,
          classification: oracle.kind,
          value: oracle.kind === "finite" ? String(value(oracle.expected)) : "",
        };
        expect(assessAnswer(spec, correct).kind).toBe("correct");
        const wrong = {
          kind: "limit" as const,
          classification: oracle.kind === "positive-infinity" ? "negative-infinity" : "positive-infinity",
          value: "",
        };
        expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
        if (spec.value.kind === "finite") {
          expect(assessAnswer(spec, { ...correct, value: String(value(add(spec.value.value, r(1)))) }).kind).toBe("incorrect");
        }
        if (locale === "pl") {
          expect(present.question).toContain("Wyznacz granicę");
          expect(present.hint).toContain("Zbierz");
        } else {
          expect(present.question).toContain("Find the limit");
          expect(present.hint).toContain("Collect");
          expect(present.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
      questions.add(p.numerator.map(x => String(x.coefficient.numerator) + ":" + String(x.base.numerator)).join("|") +
        "/" + p.denominator.map(x => String(x.coefficient.numerator) + ":" + String(x.base.numerator)).join("|"));
    }
    expect(questions.size).toBe(24);
    expect(histogram).toEqual({ zero: 8, finite: 8, positive: 4, negative: 4 });
  });

  it("enforces the exact-domain guard, equal-base cancellation and zero numerator", () => {
    const p = createExponentialFunctionRatio(2);
    expect(() => exponentialFunctionRatioLimit({ ...p, denominator: [] })).toThrow();
    expect(() => exponentialFunctionRatioLimit({ ...p, denominator: [{ base: r(2), coefficient: r(-1) }] })).toThrow();
    expect(() => exponentialFunctionRatioLimit({ ...p, denominator: [{ base: r(0), coefficient: r(1) }] })).toThrow();
    expect(() => exponentialFunctionRatioLimit({ ...p, numerator: [{ base: r(-2), coefficient: r(1) }] })).toThrow();
    const cancelled = [{ coefficient: r(3), base: r(7) }, { coefficient: r(-3), base: r(7) }];
    expect(groupExponentials(cancelled)).toEqual([]);
    const z = exponentialFunctionRatioLimit({ ...p, numerator: cancelled });
    expect(z.kind).toBe("finite");
    if (z.kind === "finite") expect(z.value.numerator).toBe(0n);
  });
});
