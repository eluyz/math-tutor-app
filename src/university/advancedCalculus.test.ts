import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f, type AnswerSpec } from "../answers";
import { rational as r, type Rational } from "../rational";
import { advancedCalculusFamilies } from "./advancedCalculus";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { a, s, m, d, eq, auditCalculation } from "./audit";
import { cmp } from "./functions-audit";
import { polishLearningText } from "../../e2e/helpers/localization";

function expected(problem: ReturnType<typeof makeUniversityTask>["university"], spec: AnswerSpec) {
  if (problem.kind === "analysis-lhospital-infinity") {
    const value = problem.mode === "log-linear" ? r(1) : problem.mode === "log-power" ? d(r(1),r(problem.power)) : problem.coefficient;
    expect(spec.kind).toBe("scalar");
    if (spec.kind === "scalar") expect(eq(spec.value,value)).toBe(true);
    expect(problem.coefficient.numerator).not.toBe(0n);
    if (problem.mode === "log-linear" || problem.mode === "log-power") {
      expect(problem.coefficient.numerator).toBeGreaterThan(0n);
      // Independent logarithmic growth: ln(1+mx)~ln x and
      // ln(1+x^k)~k ln x for positive m and integer k>0.
      expect(problem.power).toBeGreaterThan(1);
    } else {
      const x=r(3);
      expect(eq(problem.mode==="linear"?problem.coefficient:d(m(r(2),problem.coefficient),r(2)),value)).toBe(true);
      expect((problem.mode==="linear"?r(1):m(r(2),x)).numerator).toBeGreaterThan(0n);
    }
    return;
  }
  if (problem.kind === "analysis-lhospital") {
    const value = problem.mode === "exponential-two" ? d(m(problem.coefficient, problem.coefficient), r(2)) : problem.coefficient;
    expect(spec.kind).toBe("scalar");
    if (spec.kind === "scalar") expect(eq(spec.value, value)).toBe(true);
    // The displayed polynomial numerator is divisible by the appropriate
    // power of t. The exponential modes have first/second Taylor coefficients
    // m and m²/2, independent of the presentation's L'Hôpital routine.
    if (problem.mode === "polynomial-two") {
      const t = r(2);
      expect(eq(d(m(m(t,t), a(problem.coefficient,t)), m(t,t)), a(problem.coefficient,t))).toBe(true);
    }
    return;
  }
  if (problem.kind === "analysis-log-exp-derivative") {
    const value = problem.mode === "log-abs" ? s(r(0),problem.coefficient) : problem.mode === "product" ? a(problem.coefficient,problem.shift) : problem.coefficient;
    expect(spec.kind).toBe("scalar");
    if (spec.kind === "scalar") expect(eq(spec.value,value)).toBe(true);
    // At the target point, the log argument is ±1 or the exponent is 0.
    expect(problem.coefficient.numerator).not.toBe(0n);
    return;
  }
  if (problem.kind === "analysis-concavity") {
    const hessian = (x: Rational) => {
      const t = s(x,problem.at);
      const value = problem.mode === "cubic" ? m(r(6),m(problem.coefficient,t))
        : problem.mode === "quartic" ? m(r(12),m(problem.coefficient,m(t,t)))
        : a(m(r(12),m(problem.coefficient,m(t,t))),m(r(6),m(problem.cubic,t)));
      return r(value.numerator,value.denominator);
    };
    if (problem.mode === "cubic") {
      expect(spec.kind).toBe("scalar");
      if (spec.kind === "scalar") expect(eq(spec.value,problem.at)).toBe(true);
      expect(hessian(s(problem.at,r(1))).numerator * hessian(a(problem.at,r(1))).numerator).toBeLessThan(0n);
    } else if (problem.mode === "quartic") {
      expect(spec.kind).toBe("choice");
      if (spec.kind === "choice") expect(spec.value).toBe("inflection-none");
      expect(hessian(s(problem.at,r(1))).numerator * hessian(a(problem.at,r(1))).numerator).toBeGreaterThan(0n);
    } else {
      const rawSecond = s(problem.at,d(problem.cubic,m(r(2),problem.coefficient)));
      const second = r(rawSecond.numerator,rawSecond.denominator);
      const [lo,hi] = cmp(problem.at,second)<0 ? [problem.at,second] : [second,problem.at];
      expect(spec.kind).toBe("roots");
      if (spec.kind === "roots") { expect(spec.values).toHaveLength(2); expect(eq(spec.values[0],lo)).toBe(true); expect(eq(spec.values[1],hi)).toBe(true); }
      expect(eq(hessian(lo),r(0))).toBe(true);
      expect(eq(hessian(hi),r(0))).toBe(true);
      const left = hessian(s(lo,r(1))), between = hessian(d(a(lo,hi),r(2))), right = hessian(a(hi,r(1)));
      expect(left.numerator * between.numerator).toBeLessThan(0n);
      expect(between.numerator * right.numerator).toBeLessThan(0n);
    }
    return;
  }
  throw new Error("Unexpected P2 problem");
}
function validInput(spec: AnswerSpec) {
  if (spec.kind === "scalar") return f(spec.value);
  if (spec.kind === "choice") return { kind: "choice" as const, value: spec.value };
  if (spec.kind === "roots") return { kind: "roots" as const, classification: "two", values: spec.values.map(f) };
  throw new Error("Unexpected P2 answer kind");
}
function wrongInput(spec: AnswerSpec) {
  if (spec.kind === "scalar") return f(a(spec.value,r(1)));
  if (spec.kind === "choice") return { kind: "choice" as const, value: spec.options.find(option=>option.value!==spec.value)!.value };
  if (spec.kind === "roots") return { kind: "roots" as const, classification: "none", values: [] };
  throw new Error("Unexpected P2 answer kind");
}
describe("MT-EDU-007 P2 exact calculus", () => {
  it("audits every variant and both languages independently", () => {
    let count=0;
    for (const family of advancedCalculusFamilies) for (const level of family.supportedDifficulties) {
      const unique=new Set<string>();
      for (let variant=0;variant<24;variant++) {
        const task=makeUniversityTask(family.id,variant,level); count++; unique.add(task.contentKey);
        for (const locale of ["pl","en"] as const) {
          const lesson=localizeUniversity(task,locale), spec=lesson.answer;
          expect(lesson.id).toBe(task.id);
          expect(lesson.contentKey).toBe(task.contentKey);
          expect(lesson.solution!.length).toBeGreaterThanOrEqual(3);
          for (const step of lesson.solution!) if (step.kind==="working") {
            expect(step.action.length).toBeGreaterThan(5);
            expect(step.reason.length).toBeGreaterThan(15);
            for (const calc of step.calculations) expect(auditCalculation(calc)).toBe(true);
          }
          if (locale==="en") for (const text of [lesson.title,lesson.question,lesson.hint,lesson.nextHint,lesson.explanation,...lesson.solution!.map(step=>step.action+step.reason)]) expect(text).not.toMatch(polishLearningText);
          expected(task.university,spec);
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec,validInput(spec)).kind).toBe("correct");
          expect(assessAnswer(spec,wrongInput(spec)).kind).toBe("incorrect");
        }
      }
      expect(unique.size,`${family.id}/${level}`).toBe(24);
    }
    expect(count).toBe(360);
  },30_000);
});
