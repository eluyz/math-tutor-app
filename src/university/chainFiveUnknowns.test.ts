import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Rational } from "../rational";
import { a, d, eq, laplace, m, q, s } from "./audit";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  constructFiveUnknownChain,
  fiveUnknownChainStage,
  presentFiveUnknownChain,
  solveFiveUnknownChain,
} from "./chainFiveUnknowns";

/** The independent oracle does not call the staged solver, presenter,
 * production Gaussian elimination, or inspect a prepared answer.
 * From E1=E6 through E5=E6, construct A*x=b and apply exact 5x5 Cramer. */
function oracle(problem: ReturnType<typeof constructFiveUnknownChain>) {
  const E = problem.expressions, last = E[5];
  const A = E.slice(0, 5).map(e =>
    e.coefficients.map((value, col) => s(value, last.coefficients[col])));
  const rhs = E.slice(0, 5).map(e => s(last.constant, e.constant));
  const determinant = laplace(A);
  expect(determinant.numerator).not.toBe(0n);
  const Dx = laplace(A.map((row, i) => row.map((v, j) => j === 0 ? rhs[i] : v)));
  const x = d(Dx, determinant);
  return { x, determinant, A, rhs };
}
const value = (coeffs: readonly Rational[], constants: Rational,
  unknowns: readonly Rational[]) =>
  coeffs.map((coefficient, i) => m(coefficient, unknowns[i])).reduce(a, constants);

describe("U04: five-unknown source-shaped equality chains, stage-only", () => {
  it("identifies the source-form gap without changing the published two-unknown family", () => {
    expect(fiveUnknownChainStage.id).toBe("system-chain-five-unknowns");
    expect(fiveUnknownChainStage.supportedDifficulties).toEqual([
      "medium", "hard", "advanced", "expert"]);
    const published = makeUniversityTask("system-chain-five", 0, "medium");
    expect(published.university.kind).toBe("linear-chain-five");
    if (published.university.kind !== "linear-chain-five") throw Error("Unexpected old family shape");
    expect(published.university.expressions).toHaveLength(6);
    expect(published.university.expressions.every(e => "a" in e && "b" in e)).toBe(true);
    for (const locale of ["pl", "en"] as const)
      expect(localizeUniversity(published, locale).question).toContain("y");
    const registered = makeUniversityTask("system-chain-five-unknowns", 0, "medium");
    expect(registered.university.kind).toBe("linear-chain-five-unknowns");
    expect(registered.id).not.toBe(published.id);
  });
  it("rejects unsupported levels and malformed variant IDs", () => {
    for (const variant of [-1, 24, 1.1, NaN, Infinity, -Infinity])
      expect(() => constructFiveUnknownChain(variant, "medium")).toThrow();
    for (const level of ["easy", "beginner"] as Difficulty[])
      expect(() => constructFiveUnknownChain(0, level)).toThrow();
  });
  for (const level of ["medium", "hard", "advanced", "expert"] as const satisfies readonly Difficulty[])
    it(`${level}: exact independent Cramer and all six original identities for 24 PL/EN cases`, () => {
      const seen = new Set<string>(), xValues = new Set<string>(), kValues = new Set<string>();
      let negative = false, nonInteger = false;
      for (let variant = 0; variant < 24; variant++) {
        const p = constructFiveUnknownChain(variant, level);
        expect(p.kind).toBe("linear-chain-five-unknowns");
        expect(p.target).toBe("x");
        expect(p.expressions).toHaveLength(6);
        expect(p.expressions.every(e => e.coefficients.length === 5)).toBe(true);
        const k = p.expressions[4].coefficients[0];
        kValues.add(fmt(k));
        const independent = oracle(p);
        const actual = solveFiveUnknownChain(p);
        expect(actual).toHaveLength(5);
        expect(eq(actual[0], independent.x), `${level}/${variant}`).toBe(true);
        for (const e of p.expressions)
          expect(eq(value(e.coefficients, e.constant, actual),
            p.expressions[5].constant)).toBe(true);
        for (let row = 0; row < 5; row++)
          expect(eq(p.expressions[row].coefficients.reduce((total, c, i) =>
            a(total, m(c, actual[i])), q(0)), independent.rhs[row])).toBe(true);
        negative ||= actual.some(v => v.numerator < 0n);
        nonInteger ||= actual.some(v => v.denominator !== 1n);
        xValues.add(fmt(independent.x));
        const questions: string[] = [];
        for (const locale of ["pl", "en"] as const) {
          const lesson = presentFiveUnknownChain(p, locale);
          expect(lesson.answer.kind).toBe("scalar");
          if (lesson.answer.kind !== "scalar") throw Error("Expected requested scalar x only");
          expect(eq(lesson.answer.value, independent.x)).toBe(true);
          expect(lesson.question.split(" = ")).toHaveLength(6);
          for (const variable of ["x", "y", "z", "u", "v"])
            expect(lesson.question).toContain(`·${variable}`);
          expect(lesson.solution.length).toBeGreaterThanOrEqual(7);
          expect(lesson.solution.some(step => step.action.includes("x=" + fmt(actual[0])))).toBe(true);
          expect(lesson.solution.some(step => step.action.includes("E6="))).toBe(true);
          expect(lesson.question).not.toMatch(/NaN|undefined|Infinity/);
          const good = fmt(independent.x);
          expect(assessAnswer(lesson.answer, good).kind).toBe("correct");
          expect(assessAnswer(lesson.answer, fmt(a(independent.x, q(1)))).kind).toBe("incorrect");
          expect(assessAnswer(lesson.answer, emptyAnswer(lesson.answer)).kind).toBe("invalid");
          questions.push(lesson.question);
        }
        expect(questions[0]).not.toBe(questions[1]);
        seen.add(questions[0]);
      }
      expect(seen.size).toBe(24);
      expect(xValues.size).toBeGreaterThan(7);
      expect(kValues.size).toBe(5);
      expect(negative).toBe(true);
      expect(nonInteger).toBe(true);
    });
});
