import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational, type AnswerSpec } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { elementaryAnalysisFamilies } from "./elementaryAnalysis";
import { selectedSetContains, cmp } from "./functions-audit";
import { a, d, eq, m, q, s, auditCalculation } from "./audit";
import type { Rational } from "../rational";
import { polishLearningText } from "../../e2e/helpers/localization";

const power = (base: Rational, exponent: number) => {
  let value = q(1);
  for (let i = 0; i < Math.abs(exponent); i++) value = m(value, base);
  return exponent < 0 ? d(q(1), value) : value;
};
const setHas = (spec: AnswerSpec, at: Rational) => {
  expect(spec.kind).toBe("choice");
  return selectedSetContains((spec as Extract<AnswerSpec, { kind: "choice" }>).value, at);
};
function audit(problem: ReturnType<typeof makeUniversityTask>["university"], answer: AnswerSpec) {
  if (problem.kind === "analysis-log-domain") {
    const p = problem.p, second = a(p, q(2)), forbidden = a(p, q(1));
    const points = [s(p, q(3)), p, a(p, q(1, 2)), forbidden, a(p, q(3, 2)), second, a(p, q(3))];
    for (const x of points) {
      const valid = problem.mode === "linear" ? cmp(x, p) > 0
        : problem.mode === "ratio" ? cmp(x, p) < 0 || cmp(x, second) > 0
        : cmp(x, p) > 0 && !eq(x, forbidden);
      expect(setHas(answer, x), `${problem.kind}/${problem.mode} at ${x.numerator}/${x.denominator}`).toBe(valid);
    }
  } else if (problem.kind === "analysis-power-law") {
    expect(answer.kind).toBe("scalar");
    const expected = problem.mode === "log-power" ? q(problem.exponent)
      : problem.mode === "power-log" ? problem.argument : a(q(problem.exponent), problem.argument);
    expect(eq((answer as Extract<AnswerSpec, { kind: "scalar" }>).value, expected)).toBe(true);
    expect(cmp(problem.argument, q(0))).toBeGreaterThan(0);
    expect(cmp(problem.base, q(0))).toBeGreaterThan(0);
    expect(eq(problem.base, q(1))).toBe(false);
  } else if (problem.kind === "analysis-elementary-equation") {
    expect(answer.kind).toBe("scalar");
    const x = (answer as Extract<AnswerSpec, { kind: "scalar" }>).value;
    if (problem.mode === "exponential") {
      expect(eq(a(m(problem.multiplier, x), problem.shift), q(problem.exponent))).toBe(true);
      expect(problem.multiplier.numerator).not.toBe(0n);
    } else if (problem.mode === "logarithmic") {
      expect(cmp(x, problem.p)).toBeGreaterThan(0);
      expect(eq(s(x, problem.p), power(problem.base, problem.exponent))).toBe(true);
    } else {
      const other = s(problem.p, q(1)), rejected = s(x, q(3));
      expect(cmp(x, problem.p)).toBeGreaterThan(0);
      expect(eq(m(s(x, problem.p), s(x, other)), power(problem.base, problem.exponent))).toBe(true);
      expect(cmp(rejected, problem.p)).toBeLessThanOrEqual(0);
    }
  } else if (problem.kind === "analysis-log-inequality") {
    const boundary = a(problem.p, power(problem.base, problem.exponent));
    const points = [s(problem.p, q(1)), problem.p, d(a(problem.p, boundary), q(2)), boundary, a(boundary, q(1))];
    for (const x of points) {
      const increasing = cmp(problem.base, q(1)) > 0;
      const valid = cmp(x, problem.p) > 0 && (problem.relation === "greater"
        ? (increasing ? cmp(x, boundary) > 0 : cmp(x, boundary) < 0)
        : (increasing ? cmp(x, boundary) <= 0 : cmp(x, boundary) >= 0));
      expect(setHas(answer, x), `${problem.kind}/${problem.relation} base ${problem.base.numerator}/${problem.base.denominator} at ${x.numerator}/${x.denominator}, answer ${answer.kind === "choice" ? answer.value : "other"}`).toBe(valid);
    }
  } else if (problem.kind === "analysis-absolute") {
    const p = problem.p, h = problem.radius, lo = s(p, h), hi = a(p, h);
    const absolute = (x: Rational) => cmp(x, q(0)) < 0 ? s(q(0), x) : x;
    if (problem.mode === "equation") {
      expect(answer.kind).toBe("roots");
      if (answer.kind === "roots") {
        expect(answer.values).toHaveLength(2);
        expect(eq(answer.values[0], lo)).toBe(true);
        expect(eq(answer.values[1], hi)).toBe(true);
      }
    } else {
      const boundary = a(problem.q, h);
      const points = [s(lo, q(1)), lo, d(a(lo, p), q(2)), p, hi, d(a(hi, boundary), q(2)), boundary, a(boundary, q(1))];
      for (const x of points) {
        const distance = absolute(s(x, p));
        const sum = a(distance, absolute(s(x, problem.q)));
        const bound = a(s(problem.q, p), m(q(2), h));
        const valid = problem.mode === "domain" ? cmp(distance, h) >= 0
          : problem.mode === "inside" ? cmp(distance, h) < 0
          : problem.mode === "sum-inside" ? cmp(sum, bound) <= 0 : cmp(sum, bound) >= 0;
        expect(setHas(answer, x)).toBe(valid);
      }
    }
  } else throw new Error("Unexpected P0 family");
}

describe("MT-EDU-007 P0 independent exact audit", () => {
  it("checks every supported level and all 24 variants in PL/EN", () => {
    let total = 0;
    for (const family of elementaryAnalysisFamilies) for (const level of family.supportedDifficulties) {
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
          audit(task.university, spec);
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          if (spec.kind === "scalar") {
            expect(assessAnswer(spec, formatRational(spec.value)).kind).toBe("correct");
            expect(assessAnswer(spec, formatRational(a(spec.value, q(1)))).kind).toBe("incorrect");
            expect(assessAnswer(spec, "1/0").kind).toBe("invalid");
          } else if (spec.kind === "roots") {
            const correct = { kind: "roots" as const, classification: "two", values: spec.values.map(formatRational) };
            expect(assessAnswer(spec, correct).kind).toBe("correct");
            expect(assessAnswer(spec, { ...correct, values: ["999", correct.values[1]] }).kind).toBe("incorrect");
            expect(assessAnswer(spec, { ...correct, values: ["", correct.values[1]] }).kind).toBe("invalid");
          } else if (spec.kind === "choice") {
            expect(spec.options.length).toBeGreaterThanOrEqual(2);
            expect(assessAnswer(spec, { kind: "choice", value: spec.value }).kind).toBe("correct");
            expect(assessAnswer(spec, { kind: "choice", value: spec.options.find(item => item.value !== spec.value)!.value }).kind).toBe("incorrect");
            expect(assessAnswer(spec, { kind: "choice", value: "unknown" }).kind).toBe("invalid");
          }
        }
      }
      expect(seen.size, `${family.id}/${level}`).toBe(24);
    }
    expect(total).toBe(384);
  }, 30_000);
});
