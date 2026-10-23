import { describe, expect, it } from "vitest";
import { rational as r, addRational as add, multiplyRational as mul, divideRational as div, equalRational as eq } from "../rational";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { functionExtensionFamilies, type FunctionExtensionProblem } from "./functionExtensions";

const evaluate = (coefficients: FunctionExtensionProblem & { kind: "function-parity" }, x: ReturnType<typeof r>) =>
  coefficients.coefficients.reduceRight((value, coefficient) => add(mul(value, x), coefficient), r(0));
const negate = (x: ReturnType<typeof r>) => r(-x.numerator, x.denominator);
const direct = (p: Extract<FunctionExtensionProblem, {kind:"function-affine-inverse"}>, x: ReturnType<typeof r>) =>
  p.form === "expanded" ? add(mul(p.a, x), p.b)
    : p.form === "shifted" ? add(mul(p.a, add(x, negate(p.b))), p.c)
    : div(add(mul(p.a, x), p.b), p.c);
describe("MT-EDU-015B P1: independent mathematical verification of every variant", () => {
  it.each(functionExtensionFamilies)("$id: exact result, independent checks and PL/EN", (family) => {
    for (const level of family.supportedDifficulties) {
      const questions = new Set<string>();
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask(family.id, v, level);
        const p = task.university as FunctionExtensionProblem;
        questions.add(task.contentKey);
        if (p.kind === "function-parity") {
          expect(task.answer.kind).toBe("choice");
          if (task.answer.kind !== "choice") throw Error("Expected parity choice");
          const even = p.coefficients.every((x, i) => i % 2 === 0 || x.numerator === 0n);
          const odd = p.coefficients.every((x, i) => i % 2 !== 0 || x.numerator === 0n);
          expect(task.answer.value).toBe(even ? "even" : odd ? "odd" : "neither");
          // Every result is an algebraic identity checked on independent exact points.
          for (const x of [r(-3), r(-1, 2), r(1), r(2)]) {
            if (even) expect(eq(evaluate(p, negate(x)), evaluate(p, x))).toBe(true);
            if (odd) expect(eq(evaluate(p, negate(x)), negate(evaluate(p, x)))).toBe(true);
          }
        } else {
          expect(task.answer.kind).toBe("list");
          if (task.answer.kind !== "list") throw Error("Expected inverse coefficients");
          const [m, n] = task.answer.values;
          expect(m.numerator).not.toBe(0n);
          // Independently check f(f⁻¹(x))=x and f⁻¹(f(x))=x for exact inputs.
          for (const x of [r(-3), r(-1, 2), r(0), r(2), r(5, 2)]) {
            const inverse = add(mul(m, x), n);
            expect(eq(direct(p, inverse), x)).toBe(true);
            expect(eq(add(mul(m, direct(p, x)), n), x)).toBe(true);
          }
        }
        for (const locale of ["pl", "en"] as const) {
          const localized = localizeUniversity(task, locale), spec = localized.answer;
          const correct = spec.kind === "choice" ? {kind:"choice" as const,value:spec.value}
            : spec.kind === "list" ? {kind:"list" as const,values:spec.values.map(f)} : null;
          if (!correct) throw Error("Unexpected spec");
          expect(assessAnswer(spec, correct).kind).toBe("correct");
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          if (spec.kind === "choice") {
            expect(assessAnswer(spec, {kind:"choice",value:spec.options.find(o=>o.value!==spec.value)!.value}).kind).toBe("incorrect");
            expect(assessAnswer(spec, {kind:"choice",value:"not-an-option"}).kind).toBe("invalid");
          } else if (spec.kind === "list") {
            expect(assessAnswer(spec, {kind:"list",values:[f(add(spec.values[0],r(1))),f(spec.values[1])]}).kind).toBe("incorrect");
            expect(assessAnswer(spec, {kind:"list",values:["1/0",f(spec.values[1])]}).kind).toBe("invalid");
          }
          expect(localized.solution?.length).toBeGreaterThan(2);
          expect(localized.question).toBeTruthy();
          expect(localized.nextHint).toBeTruthy();
        }
      }
      expect(questions.size, `${family.id}/${level}`).toBe(24);
    }
  });
});
