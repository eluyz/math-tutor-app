import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Rational } from "../rational";
import { a, d, eq, laplace, m, q } from "./audit";
import {
  constructGaussThreeParameters,
  gaussThreeParameterFamilies,
  presentGaussThreeParameters,
} from "./gaussThreeParameters";

type Matrix = readonly (readonly Rational[])[];
const names = ["x", "y", "z", "w", "v"];
const combinations = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) =>
    combinations(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();

/** An exact independent oracle via square minors, NEVER the production
 * classifySystem/row-reduction routines or its answer specification. */
function independentRank(matrix: Matrix): number {
  for (let size = Math.min(matrix.length, matrix[0].length); size >= 1; size--)
    for (const rows of combinations(matrix.length, size))
      for (const cols of combinations(matrix[0].length, size))
        if (laplace(rows.map(i => cols.map(j => matrix[i][j]))).numerator !== 0n)
          return size;
  return 0;
}

/** Reconstruct each of five c+a*t1+b*t2+d*t3 forms from 2x2 Cramer
 * replacements, independently of the production RREF and presenter. */
function independentCoefficients(A: Matrix, rhs: readonly Rational[]) {
  const n = A[0].length, pivots: number[] = [];
  for (let column = 0; column < n; column++) {
    if (independentRank(A.map(row => [...pivots, column].map(j => row[j]))) > pivots.length)
      pivots.push(column);
  }
  expect(pivots).toHaveLength(2);
  const free = Array.from({ length: n }, (_, j) => j).filter(j => !pivots.includes(j));
  const selected = combinations(A.length, 2).find(rows =>
    laplace(rows.map(i => pivots.map(j => A[i][j]))).numerator !== 0n);
  if (!selected) throw Error("No independent 2x2 row minor");
  const B = selected.map(i => pivots.map(j => A[i][j])), D = laplace(B);
  const coefficients = Array.from({ length: n }, (_, j) => {
    const freeIndex = free.indexOf(j);
    if (freeIndex !== -1) return [q(0), ...free.map((_, k) => q(k === freeIndex ? 1 : 0))];
    const pivotIndex = pivots.indexOf(j);
    return Array.from({ length: 4 }, (_, k) => {
      const rhsColumn = selected.map(i => k === 0 ? rhs[i] : m(q(-1), A[i][free[k - 1]]));
      return d(laplace(B.map((row, i) =>
        row.map((value, column) => column === pivotIndex ? rhsColumn[i] : value))), D);
    });
  });
  return { coefficients, pivots, free };
}

describe("U06/U08 isolated 4x5 / rank-two / three-parameter method", () => {
  it("stages one candidate family and rejects invalid variants/levels", () => {
    expect(gaussThreeParameterFamilies).toHaveLength(1);
    expect(gaussThreeParameterFamilies[0].id).toBe("gauss-five-three-parameters");
    expect(gaussThreeParameterFamilies[0].supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    for (const bad of [-1, 24, 0.5, Number.NaN, Number.POSITIVE_INFINITY])
      expect(() => constructGaussThreeParameters(bad, "hard")).toThrow();
    expect(() => constructGaussThreeParameters(0, "easy")).toThrow();
    expect(() => constructGaussThreeParameters(0, "medium")).toThrow();
  });

  for (const level of ["hard", "advanced", "expert"] as const satisfies readonly Difficulty[])
    it(level + ": independently checks all 24 variants, 20 fields, every equation, and PL/EN grading", () => {
      const unique = new Set<string>();
      let fractional = false, negative = false, pivotAfterFree = false, swapped = false;
      for (let variant = 0; variant < 24; variant++) {
        const p = constructGaussThreeParameters(variant, level);
        expect(p.kind).toBe("linear-system");
        expect(p.method).toBe("parameters");
        expect(p.matrix).toHaveLength(4);
        expect(p.matrix.every(row => row.length === 5)).toBe(true);
        expect(p.rhs).toHaveLength(4);
        const augmented = p.matrix.map((row, i) => [...row, p.rhs[i]]);
        // Explicitly prove rank(A)=rank([A|b])=2 by nonzero 2x2 and zero 3x3+ minors.
        expect(independentRank(p.matrix)).toBe(2);
        expect(independentRank(augmented)).toBe(2);
        const oracle = independentCoefficients(p.matrix, p.rhs);
        expect(oracle.free).toHaveLength(3);
        pivotAfterFree ||= oracle.free.some(f => oracle.pivots.some(piv => piv > f));
        fractional ||= augmented.flat().some(value => value.denominator !== 1n);
        negative ||= augmented.flat().some(value => value.numerator < 0n);
        const questions: string[] = [];
        for (const locale of ["pl", "en"] as const) {
          const view = presentGaussThreeParameters(p, locale);
          const answer = view.answer;
          expect(answer.kind).toBe("list");
          if (answer.kind !== "list") throw Error("Expected full 20-field answer");
          expect(answer.labels).toHaveLength(20);
          expect(answer.values).toHaveLength(20);
          const expected = oracle.coefficients.flat();
          answer.values.forEach((value, i) =>
            expect(eq(value, expected[i]), `${level}/${variant}/${locale}/field-${i}`).toBe(true));
          for (let i = 0; i < 4; i++)
            for (let k = 0; k <= 3; k++) {
              const lhs = p.matrix[i].map((c, j) => m(c, answer.values[j * 4 + k])).reduce(a, q(0));
              expect(eq(lhs, k === 0 ? p.rhs[i] : q(0)),
                `${level}/${variant}/${locale}/row-${i}/term-${k}`).toBe(true);
            }
          for (const [i, col] of oracle.free.entries())
            expect(view.question).toContain(names[col] + "=t" + (i + 1));
          for (const term of ["t1", "t2", "t3", "x=c+at1+bt2+dt3"])
            expect(view.question).toContain(term);
          expect(view.solution.some(step => step.action.startsWith("RREF"))).toBe(true);
          expect(view.solution.filter(step => /^R\d+: /.test(step.action))).toHaveLength(4);
          swapped ||= view.solution.some(step => step.action.includes("↔"));
          const right = { kind: "list" as const, values: answer.values.map(fmt) };
          expect(assessAnswer(answer, right).kind).toBe("correct");
          expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
          const incorrect = [...right.values];
          incorrect[0] = fmt(a(answer.values[0], q(1)));
          expect(assessAnswer(answer, { ...right, values: incorrect }).kind).toBe("incorrect");
          expect(assessAnswer(answer, { ...right,
            values: ["1/0", ...right.values.slice(1)] }).kind).toBe("invalid");
          for (const text of [view.question, view.hint, view.nextHint, view.explanation,
            ...view.solution.map(step => step.action + " " + step.reason)]) {
            expect(text).not.toMatch(/undefined|NaN/);
            expect(text.length).toBeGreaterThan(0);
            if (locale === "en") expect(text).not.toMatch(/Rozwiąż|Zmienne swobodne|niewiadomych|Sprawdź|zredukowanej/);
          }
          questions.push(view.question);
        }
        // Locale must never change the underlying mathematical system.
        expect(questions[0]).not.toBe(questions[1]);
        unique.add(questions[0]);
      }
      expect(unique.size).toBe(24);
      expect(negative).toBe(true);
      expect(pivotAfterFree).toBe(true);
      expect(swapped).toBe(true);
      if (level !== "hard") expect(fractional).toBe(true);
    });
});
