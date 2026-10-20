import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f, type AnswerSpec } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { asymptoteFamilies } from "./analysisLimitsAsymptotes";
import { a, m, s, q, eq, auditCalculation } from "./audit";
import type { Rational } from "../rational";
import { rational as r } from "../rational";
import { polishLearningText } from "../../e2e/helpers/localization";

const fraction = (x: Rational) => { const reduced = r(x.numerator, x.denominator); return `${reduced.numerator}/${reduced.denominator}`; };
const line = (slope: Rational, intercept: Rational) => `line:${fraction(slope)}:${fraction(intercept)}`;
const pair = (positive: string, negative: string) => `plus:${positive}|minus:${negative}`;
const nonzero = (x: Rational) => x.numerator !== 0n;
function expected(problem: ReturnType<typeof makeUniversityTask>["university"], spec: AnswerSpec) {
  if (problem.kind === "analysis-euler") {
    const firstOrder = problem.mode === "basic" || problem.mode === "scaled" ? problem.a : s(problem.a, problem.c);
    const exponent = m(firstOrder, problem.mode === "basic" ? q(1) : problem.b);
    if (!nonzero(exponent)) {
      expect(spec.kind).toBe("scalar");
      if (spec.kind === "scalar") expect(eq(spec.value, q(1))).toBe(true);
    } else {
      expect(spec.kind).toBe("choice");
      if (spec.kind === "choice") expect(spec.value).toBe(`exp:${fraction(exponent)}`);
    }
    // Exact first-order coefficient: (n+a)/(n+c)-1=(a-c)/(n+c),
    // or (1+ax)/(1+cx)-1=(a-c)x/(1+cx).
    if (problem.mode === "ratio" || problem.mode === "offset") {
      expect(eq(a(problem.c, firstOrder), problem.a)).toBe(true);
      if (problem.variable === "sequence") expect(problem.b.numerator).toBeGreaterThan(0n);
    }
    return;
  }
  if (problem.kind === "analysis-asymptote-vertical") {
    const positive = problem.coefficient.numerator > 0n;
    const left = problem.mode === "hole" ? "none" : problem.mode === "double" ? positive ? "+∞" : "−∞" : positive ? "−∞" : "+∞";
    const right = problem.mode === "hole" ? "none" : positive ? "+∞" : "−∞";
    expect(spec.kind).toBe("choice");
    if (spec.kind === "choice") expect(spec.value).toBe(left === "none" ? "asymptote-none" : `${left}:${right}`);
    return;
  }
  if (problem.kind === "analysis-asymptote-horizontal") {
    const p = problem.mode === "linear" ? "none" : problem.mode === "radical" ? line(q(0), a(problem.a, problem.b)) : line(q(0), problem.a);
    const n = problem.mode === "linear" ? "none" : problem.mode === "radical" ? line(q(0), s(problem.a, problem.b)) : line(q(0), problem.a);
    expect(spec.kind).toBe("choice");
    if (spec.kind === "choice") expect(spec.value).toBe(pair(p, n));
    if (problem.mode === "rational") {
      // The numerator equals a(x+c)+(b-ac), independently of division code.
      const remainder = s(problem.b, m(problem.a, problem.c));
      expect(eq(a(m(problem.a, problem.c), remainder), problem.b)).toBe(true);
    } else if (problem.mode === "radical") {
      expect(nonzero(problem.b)).toBe(true);
    }
    return;
  }
  if (problem.kind === "analysis-asymptote-oblique") {
    const intercept = a(problem.b, m(problem.a, problem.at));
    const p = problem.mode === "quadratic" ? "none" : problem.mode === "radical" ? line(q(2), problem.b) : line(problem.a, intercept);
    const n = problem.mode === "quadratic" ? "none" : problem.mode === "radical" ? line(q(0), problem.b) : line(problem.a, intercept);
    expect(spec.kind).toBe("choice");
    if (spec.kind === "choice") expect(spec.value).toBe(pair(p, n));
    if (problem.mode === "rational") {
      const remainder = a(problem.c, m(problem.at, intercept));
      // (ax+intercept)(x-at)+remainder reproduces ax²+bx+c.
      expect(eq(s(intercept, m(problem.a, problem.at)), problem.b)).toBe(true);
      expect(eq(s(remainder, m(problem.at, intercept)), problem.c)).toBe(true);
    }
    return;
  }
  throw new Error("Unexpected P1 problem");
}

describe("MT-EDU-007 P1 exact symbolic limits and asymptotes", () => {
  it("explains identically unit Euler bases without dividing by zero in either language", () => {
    for (const family of ["analysis-euler-sequence", "analysis-euler-function"])
      for (const variant of [0, 6, 12, 18]) {
        const task = makeUniversityTask(family, variant, "expert");
        expect(task.university.kind).toBe("analysis-euler");
        if (task.university.kind !== "analysis-euler") throw new Error("Unexpected task");
        expect(eq(task.university.a, task.university.c)).toBe(true);
        for (const locale of ["pl", "en"] as const) {
          const lesson = localizeUniversity(task, locale);
          expect(lesson.answer).toEqual({ kind: "scalar", value: r(1) });
          expect(assessAnswer(lesson.answer, "1").kind).toBe("correct");
          expect(assessAnswer(lesson.answer, "2").kind).toBe("incorrect");
          expect(assessAnswer(lesson.answer, "1/0").kind).toBe("invalid");
          const explanation = [lesson.hint, lesson.nextHint, lesson.explanation, ...lesson.solution!.map(step => `${step.action} ${step.reason}`)].join("\n");
          expect(explanation).toContain("t=0");
          expect(explanation).toContain("ln L=0");
          expect(explanation).not.toContain("ln(1+t)/t");
          expect(explanation).toContain(locale === "pl" ? "podstaw" : "base");
        }
      }
    for (const family of ["analysis-euler-sequence", "analysis-euler-function"]) {
      const task = makeUniversityTask(family, 1, "expert");
      expect(task.university.kind).toBe("analysis-euler");
      if (task.university.kind !== "analysis-euler") throw new Error("Unexpected task");
      expect(eq(task.university.a, task.university.c)).toBe(false);
      for (const locale of ["pl", "en"] as const)
        expect(localizeUniversity(task, locale).explanation).toContain("ln(1+t)/t");
    }
  });

  it("independently audits every variant, locale, domain and typed answer", () => {
    let total = 0, symbolic = 0, eZero = 0;
    for (const family of asymptoteFamilies) for (const level of family.supportedDifficulties) {
      const seen = new Set<string>();
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask(family.id, variant, level);
        seen.add(task.contentKey); total++;
        for (const locale of ["pl", "en"] as const) {
          const lesson = localizeUniversity(task, locale), spec = lesson.answer;
          expect(lesson.id).toBe(task.id);
          expect(lesson.contentKey).toBe(task.contentKey);
          expect(lesson.question).not.toBe("");
          expect(lesson.hint).not.toBe("");
          expect(lesson.nextHint).not.toBe("");
          expect(lesson.solution!.length).toBeGreaterThan(2);
          if (locale === "en") for (const text of [lesson.title, lesson.question, lesson.hint, lesson.nextHint, lesson.explanation, ...lesson.solution!.map(step => step.action + step.reason)]) expect(text).not.toMatch(polishLearningText);
          for (const step of lesson.solution!) if (step.kind === "working") {
            expect(step.action).not.toBe(""); expect(step.reason).not.toBe("");
            for (const calculation of step.calculations) expect(auditCalculation(calculation)).toBe(true);
          }
          expected(task.university, spec);
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          if (spec.kind === "scalar") {
            eZero++;
            expect(assessAnswer(spec, f(spec.value)).kind).toBe("correct");
            expect(assessAnswer(spec, "2.718").kind).toBe("incorrect");
            expect(assessAnswer(spec, "1/0").kind).toBe("invalid");
          } else if (spec.kind === "choice") {
            if (spec.value.startsWith("exp:")) {
              symbolic++;
              expect(assessAnswer(spec, { kind: "choice", value: "2.718" }).kind).toBe("invalid");
            }
            expect(spec.options.length).toBeGreaterThan(1);
            expect(spec.options.some(option => option.value === spec.value)).toBe(true);
            expect(assessAnswer(spec, { kind: "choice", value: spec.value }).kind).toBe("correct");
            expect(assessAnswer(spec, { kind: "choice", value: spec.options.find(option => option.value !== spec.value)!.value }).kind).toBe("incorrect");
          } else throw new Error("Unexpected P1 answer kind");
        }
      }
      expect(seen.size, `${family.id}/${level}`).toBe(24);
    }
    expect(total).toBe(384);
    expect(symbolic).toBeGreaterThan(0);
    expect(eZero).toBeGreaterThan(0);
  }, 30_000);
});
