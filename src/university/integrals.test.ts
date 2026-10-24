import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f, type AnswerSpec } from "../answers";
import { checkAnswer } from "../exercises";
import { feedback } from "../locales/pl";
import { uiCopy } from "../locales/ui";
import { difficulties } from "../difficulty";
import { taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { integralFamilies, type IntegralProblem } from "./integrals";
import { a, d, eq, m, neg, q, s } from "./audit";
import type { Rational } from "../rational";
import { rational } from "../rational";

const value = (n: number) => q(n);
const power = (x: Rational, n: number): Rational => Array.from({ length: n }, () => x).reduce(m, q(1));
const trueInput = (spec: AnswerSpec) => spec.kind === "primitive"
  ? { kind: "primitive" as const, coefficients: spec.terms.map((term) => f(term.coefficient)), hasConstant: true }
  : spec.kind === "scalar" ? f(spec.value) : (() => { throw new Error("Unexpected integral answer"); })();

function audit(p: IntegralProblem, spec: AnswerSpec) {
  if (p.method === "direct" || p.method === "definite") {
    const coefficients = p.polynomial!;
    if (p.method === "direct") {
      if (spec.kind !== "primitive") throw new Error("Expected primitive");
      expect(spec.terms).toHaveLength(coefficients.length);
      for (let i = 0; i < coefficients.length; i++)
        expect(eq(m(spec.terms[i].coefficient, value(i + 1)), coefficients[i])).toBe(true);
    } else {
      if (spec.kind !== "scalar") throw new Error("Expected scalar");
      const expected = coefficients.reduce((sum, c, i) => a(sum,
        d(m(c, s(power(p.upper!, i + 1), power(p.lower!, i + 1))), value(i + 1))), q(0));
      expect(eq(expected, spec.value)).toBe(true);
      expect(p.upper!.numerator * p.lower!.denominator > p.lower!.numerator * p.upper!.denominator).toBe(true);
    }
  } else {
    if (spec.kind !== "primitive") throw new Error("Expected primitive");
    if (p.method === "table") {
      const coefficient = spec.terms[0].coefficient;
      expect(eq(m(coefficient, p.a), p.mode === "sin" ? neg(p.k) : p.k)).toBe(true);
      expect(p.a.numerator).not.toBe(0n);
    } else if (p.method === "substitution") {
      const derivativeScale = p.mode === "linear-power" ? p.a : m(value(2), p.a);
      expect(eq(m(m(spec.terms[0].coefficient, derivativeScale), value(p.n + 1)), p.k)).toBe(true);
      if (p.mode === "quadratic-plus") expect(eq(m(spec.terms[1].coefficient, value(2)), p.q)).toBe(true);
    } else if (p.method === "parts") {
      expect(spec.terms).toHaveLength(p.n + 1);
      // Derivative of e^(ax) Q(x) is e^(ax)(aQ+Q').
      const coefficients = spec.terms.map((term) => term.coefficient).reverse();
      for (let i = 0; i <= p.n; i++) {
        const actual = a(m(p.a, coefficients[i]), i < p.n ? m(value(i + 1), coefficients[i + 1]) : q(0));
        expect(eq(actual, i === p.n ? p.k : q(0))).toBe(true);
      }
    } else {
      const [sin, cos] = spec.terms.map((term) => term.coefficient);
      expect(eq(s(m(p.a, sin), m(p.b, cos)), p.k)).toBe(true);
      expect(eq(a(m(p.b, sin), m(p.a, cos)), p.q)).toBe(true);
      expect(p.b.numerator).not.toBe(0n);
      expect(a(m(p.a, p.a), m(p.b, p.b)).numerator).toBeGreaterThan(0n);
    }
  }
}

describe("MT-EDU-008 exact integral audit", () => {
  it("keeps 8589 old instances and adds only declared integral levels", () => {
    const oldCategories = uiCopy.pl.studyCategories.filter((category) => category.id !== "integrals");
    const newFamilies = new Set(["determinant-gaussian-pivot-four","determinant-gaussian-pivot-five","matrix-ax-shift-three","matrix-axb-three","matrix-rectangular-evaluation","matrix-transpose-dimensions","cramer-applicability","cramer-four-singular-minors","determinant-strategy-four","determinant-strategy-five","multivar-stationary-point","multivar-hessian-classify","multivar-partial-point","multivar-gradient-point","derivative-product-point","derivative-quotient-point","derivative-trig-chain","derivative-trig-special-point","derivative-absolute-one-sided","derivative-piecewise-point","function-graph-monotonicity","function-graph-extrema","function-graph-symmetry","function-graph-domain-range", "function-graph-zeros", "function-tangent-domain", "function-mixed-domain", "function-parity", "function-affine-inverse", "sequence-radical-ratio", "sequence-exponential-ratio", "sequence-euler-product", "matrix-coupled-equations", "determinant-dense-four", "determinant-dense-five", "matrix-powers", "matrix-composite-operations", "matrix-compatibility", "matrix-chained-dimensions", "cramer-determinants-three", "cramer-determinants-four", "matrix-ax-shift", "matrix-axb", "matrix-inverse-plus", "matrix-bx-shift", "gauss-parameters-one", "gauss-parameters-two", "system-chain-five", "system-rectangular-3x2", "system-rectangular-4x3", "gauss-rectangular-3x2-parameters", "gauss-rectangular-4x3-parameters", "gauss-rectangular-2x3-parameters"]);
    const old = [...uiCopy.pl.categories, ...oldCategories].reduce((sum, category) =>
      sum + difficulties.reduce((count, level) => count + taskPool(category.id, level)
        .filter(task => !newFamilies.has(task.templateId)).length, 0), 0);
    expect(old).toBe(8589);
    expect(difficulties.reduce((sum, level) => sum + universityPool("integrals", level).length, 0)).toBe(576);
    expect(integralFamilies).toHaveLength(6);
    expect(integralFamilies.reduce((sum, family) => sum + family.supportedDifficulties.length, 0)).toBe(18);
  });

  it.each(integralFamilies)("audits all 24 variants for $id at each supported level", (family) => {
    for (const level of family.supportedDifficulties) {
      const questions = new Set<string>();
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask(family.id, variant, level);
        const p = task.university as IntegralProblem;
        const en = localizeUniversity(task, "en");
        questions.add(task.question);
        expect(task.category).toBe("integrals");
        expect(task.solution?.length).toBeGreaterThanOrEqual(3);
        if (family.id === "integral-direct" && level === "hard")
          expect(task.solution?.[0].reason).toContain("łączymy współczynniki");
        if (p.method === "table" && p.mode === "reciprocal") {
          expect(task.question).toContain("spójny przedział");
          expect(en.question).toContain("connected interval");
          if (task.answer.kind === "primitive") expect(task.answer.terms[0].basis).toContain("ln|");
        }
        if (p.method === "recurrence") {
          expect(task.solution?.some((step) => step.action.includes("J=") && step.action.includes("K="))).toBe(true);
          expect(task.solution?.some((step) => step.action.includes("D="))).toBe(true);
        }
        expect(en.solution?.length).toBe(task.solution?.length);
        expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
        expect(en.id).toBe(task.id);
        expect(en.contentKey).toBe(task.contentKey);
        expect(en.answer).toEqual(task.answer);
        audit(p, task.answer);
        if (p.method === "definite") {
          const primitive = p.polynomial!.map((coefficient, i) => d(coefficient, q(i + 1)));
          const evaluate = (x: Rational) => primitive.reduce((sum, coefficient, i) => a(sum, m(coefficient, power(x, i + 1))), q(0));
          const boundStep = task.solution?.find((step) => step.action.includes("F(") && step.action.includes(";"));
          const canonical = (x: Rational) => f(rational(x.numerator, x.denominator));
          expect(boundStep?.action).toContain(`F(${f(p.upper!)})=${canonical(evaluate(p.upper!))}`);
          expect(boundStep?.action).toContain(`F(${f(p.lower!)})=${canonical(evaluate(p.lower!))}`);
        }
        const input = trueInput(task.answer);
        expect(assessAnswer(task.answer, input)).toEqual({ kind: "correct" });
        expect(checkAnswer(task, input, feedback).kind).toBe("correct");
        expect(checkAnswer(en, input, uiCopy.en.feedback).kind).toBe("correct");
        if (task.answer.kind === "primitive") {
          expect(task.solution?.some((step) => step.action.includes("+C"))).toBe(true);
          expect(en.solution?.some((step) => step.action.includes("+C"))).toBe(true);
          expect(assessAnswer(task.answer, { ...input as Extract<typeof input, { kind: "primitive" }>, hasConstant: false })).toEqual({ kind: "incorrect", reason: "missing-constant" });
          const withoutConstant = checkAnswer(task, { ...input as Extract<typeof input, { kind: "primitive" }>, hasConstant: false }, feedback);
          expect(withoutConstant.kind).toBe("incorrect");
          if (withoutConstant.kind === "incorrect") expect(withoutConstant.diagnosis.kind).toBe("known");
          expect(assessAnswer(task.answer, { kind: "primitive", coefficients: task.answer.terms.map(() => "abc"), hasConstant: true }).kind).toBe("invalid");
          const wrong = { kind: "primitive" as const, hasConstant: true, coefficients: task.answer.terms.map((term, i) => i ? f(term.coefficient) : f(a(term.coefficient, q(1)))) };
          expect(assessAnswer(task.answer, wrong).kind).toBe("incorrect");
          expect(emptyAnswer(task.answer)).toEqual({ kind: "primitive", coefficients: task.answer.terms.map(() => ""), hasConstant: false });
        } else {
          expect(assessAnswer(task.answer, "99999").kind).toBe("incorrect");
          expect(assessAnswer(task.answer, "1/0").kind).toBe("invalid");
        }
      }
      expect(questions.size).toBe(24);
      const pool = universityPool("integrals", level).filter((task) => task.templateId === family.id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map((task) => task.contentKey)).size).toBe(24);
    }
    for (const level of difficulties.filter((level) => !family.supportedDifficulties.includes(level)))
      expect(() => makeUniversityTask(family.id, 0, level)).toThrow();
  });
});
