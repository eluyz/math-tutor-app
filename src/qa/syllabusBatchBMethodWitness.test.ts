import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { assessAnswer, emptyAnswer, formatRational as f, type AnswerSpec } from "../answers";
import { a, d, m, q, s, eq, auditCalculation } from "../university/audit";
import {
  referenceExpand, referencePointLimit, referencePolynomialLimit,
  referenceRatio, directValue, selectedSetContains, cmp,
} from "../university/functions-audit";
import { sameLimit } from "../university/sequences";
import type { Rational } from "../rational";

/**
 * Batch B: deterministic METHOD witnesses only.
 * The original source PDFs / keys must be independently reviewed before
 * changing any of the eight #151 entries to SOURCE_PASS.
 * These tests intentionally contain no private source exercises.
 */
const fixtures = [
  ["C01", "sequence-rational", "medium", 1],
  ["C03", "sequence-conjugate", "medium", 1],
  ["F01", "function-domain", "hard", 0],
  ["G01", "limit-point", "easy", 1],
  ["G02", "limit-point", "medium", 1],
  ["G03", "limit-point", "hard", 0],
  ["G05", "limit-conjugate", "advanced", 0],
  ["D01", "derivative-formula", "easy", 2],
] as const;

function gradeAllCases(spec: AnswerSpec) {
  expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
  if (spec.kind === "limit") {
    const value = spec.value;
    const correct = {
      kind: "limit" as const,
      classification: value.kind,
      value: value.kind === "finite" ? f(value.value) : "",
    };
    expect(assessAnswer(spec, correct).kind).toBe("correct");
    const wrong = value.kind === "finite"
      ? { ...correct, value: f(a(value.value, q(1))) }
      : { kind: "limit" as const, classification: "finite", value: "1" };
    expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
  } else if (spec.kind === "choice") {
    expect(assessAnswer(spec, { kind: "choice", value: spec.value }).kind).toBe("correct");
    const wrong = spec.options.find(option => option.value !== spec.value);
    expect(wrong).toBeDefined();
    expect(assessAnswer(spec, { kind: "choice", value: wrong!.value }).kind).toBe("incorrect");
  } else if (spec.kind === "list") {
    const correct = spec.values.map(f);
    expect(assessAnswer(spec, { kind: "list", values: correct }).kind).toBe("correct");
    const wrong = [f(a(spec.values[0], q(1))), ...correct.slice(1)];
    expect(assessAnswer(spec, { kind: "list", values: wrong }).kind).toBe("incorrect");
  } else {
    throw new Error("Unexpected answer type in Batch B witness");
  }
}

describe("#151 Batch B: bounded generator-method witnesses (NOT source acceptance)", () => {
  for (const [skill, familyId, level, variant] of fixtures) {
    it(skill + ": exact synthetic method, grading and bilingual working", () => {
      const task = makeUniversityTask(familyId, variant, level);
      expect(task.id).toBe(familyId + ":" + level + ":" + variant);
      const problem = task.university;
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale);
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        expect(view.explanation.length).toBeGreaterThan(15);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        const steps = view.solution?.filter(step => step.kind === "working") ?? [];
        expect(steps.length).toBeGreaterThan(0);
        for (const step of steps) {
          if (step.kind !== "working") throw new Error("Unexpected working step");
          expect(step.action.trim().length).toBeGreaterThan(0);
          expect(step.reason.trim().length).toBeGreaterThan(10);
          for (const calculation of step.calculations) {
            expect(auditCalculation(calculation)).toBe(true);
          }
        }
        gradeAllCases(view.answer);

        if (skill === "C01") {
          if (problem.kind !== "sequence-rational" || view.answer.kind !== "limit") throw new Error("C01 form");
          const ratio = referenceRatio(problem.expression);
          expect(sameLimit(view.answer.value, referencePolynomialLimit(ratio.n, ratio.d))).toBe(true);
        } else if (skill === "C03") {
          if (problem.kind !== "sequence-conjugate" || view.answer.kind !== "limit" ||
              view.answer.value.kind !== "finite" || problem.mode !== "basic") throw new Error("C03 form");
          expect(eq(view.answer.value.value, d(problem.a, m(q(2), problem.k)))).toBe(true);
        } else if (skill === "F01") {
          if (problem.kind !== "function-domain" || problem.mode !== "root-over-linear" ||
              view.answer.kind !== "choice") throw new Error("F01 form");
          const points: Rational[] = [problem.p, problem.q, problem.r];
          const boundaries = [...points].sort(cmp);
          points.push(s(boundaries[0], q(1)), a(boundaries[2], q(1)));
          for (let i = 1; i < boundaries.length; i++)
            points.push(d(a(boundaries[i - 1], boundaries[i]), q(2)));
          for (const x of points) {
            const allowed = m(s(x, problem.p), s(x, problem.q)).numerator >= 0n &&
              !eq(x, problem.r);
            expect(selectedSetContains(view.answer.value, x)).toBe(allowed);
          }
        } else if (skill === "G01" || skill === "G02" || skill === "G03") {
          if (problem.kind !== "limit-point" || view.answer.kind !== "limit") throw new Error("Point-limit form");
          const numerator = referenceExpand(problem.numerator);
          const expected = referencePointLimit(numerator, problem.denominator, problem.at, problem.side);
          expect(sameLimit(view.answer.value, expected)).toBe(true);
          if (skill === "G01") {
            expect(directValue(problem.denominator, problem.at).numerator).not.toBe(0n);
          } else if (skill === "G02") {
            expect(directValue(problem.denominator, problem.at).numerator).toBe(0n);
            expect(directValue(numerator, problem.at).numerator).toBe(0n);
            expect(expected.kind).toBe("finite");
          } else {
            expect(expected.kind).toBe("does-not-exist");
          }
        } else if (skill === "G05") {
          if (problem.kind !== "limit-conjugate" || problem.mode !== "second-order" ||
              view.answer.kind !== "limit" || view.answer.value.kind !== "finite") throw new Error("G05 form");
          const t = d(problem.k, m(q(2), problem.s));
          const result = d(s(problem.b, m(t, t)), m(q(2), problem.s));
          expect(eq(view.answer.value.value, result)).toBe(true);
        } else if (skill === "D01") {
          if (problem.kind !== "derivative" || problem.target !== "formula" ||
              view.answer.kind !== "list") throw new Error("D01 form");
          const polynomial = referenceExpand(problem.formula);
          const derivative = polynomial.slice(1).map((coefficient, index) => m(coefficient, q(index + 1)));
          expect(view.answer.values.map(f)).toEqual(derivative.reverse().map(f));
        }
      }
    });
  }
});
