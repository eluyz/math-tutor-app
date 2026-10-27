import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import { taskPool } from "../generators";
import type { Rational } from "../rational";
import { a, d, eq, laplace, m, q } from "./audit";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { constructGaussFive, gaussFiveFamilies } from "./gaussFive";

type Matrix = readonly (readonly Rational[])[];
const combinations = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) =>
    combinations(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();

/** An independent exact-rank oracle enumerating nonzero minors.
 * It does not call the production RREF, classifySystem, or Gauss solver. */
function minorRank(A: Matrix): number {
  for (let size = Math.min(A.length, A[0].length); size >= 1; size--)
    for (const rows of combinations(A.length, size))
      for (const cols of combinations(A[0].length, size))
        if (laplace(rows.map(i => cols.map(j => A[i][j]))).numerator !== 0n)
          return size;
  return 0;
}

/** Reconstruct canonical affine coefficients via a nonsingular minor and
 * Cramer's rule, separately for the particular solution and each free basis. */
function independentAffine(A: Matrix, rhs: readonly Rational[]) {
  const n = A[0].length, pivots: number[] = [];
  for (let col = 0; col < n; col++) {
    const candidate = [...pivots, col];
    if (minorRank(A.map(row => candidate.map(j => row[j]))) > pivots.length)
      pivots.push(col);
  }
  const free = Array.from({ length: n }, (_, j) => j).filter(j => !pivots.includes(j));
  const selected = combinations(A.length, pivots.length).find(rows =>
    laplace(rows.map(i => pivots.map(j => A[i][j]))).numerator !== 0n);
  if (!selected) throw Error("No independent rows");
  const B = selected.map(i => pivots.map(j => A[i][j]));
  const determinant = laplace(B);
  const coefficients = Array.from({ length: n }, (_, j) => {
    const freeIndex = free.indexOf(j);
    if (freeIndex >= 0) return [q(0), ...free.map((_, k) => q(k === freeIndex ? 1 : 0))];
    const pivot = pivots.indexOf(j);
    return Array.from({ length: free.length + 1 }, (_, k) => {
      const values = selected.map(i => k === 0 ? rhs[i] : m(q(-1), A[i][free[k - 1]]));
      return d(laplace(B.map((row, i) =>
        row.map((v, column) => column === pivot ? values[i] : v))), determinant);
    });
  });
  return { coefficients, pivots, free };
}

describe("MT-EDU-030 five-variable rectangular Gaussian systems", () => {
  it("registers exactly two families and 144 cases with stable bounds", () => {
    expect(gaussFiveFamilies).toHaveLength(2);
    expect(gaussFiveFamilies.reduce((total, f) =>
      total + 24 * f.supportedDifficulties.length, 0)).toBe(144);
    for (const bad of [-1, 24, 0.5, Number.NaN, Number.POSITIVE_INFINITY])
      expect(() => constructGaussFive(bad, "hard", 3)).toThrow();
    expect(() => constructGaussFive(0, "easy", 3)).toThrow();
    expect(() => constructGaussFive(0, "hard", 2 as 3)).toThrow();
    expect(() => makeUniversityTask("gauss-five-3x5", 0, "medium")).toThrow();
  });

  for (const family of gaussFiveFamilies)
    for (const level of family.supportedDifficulties)
      it(family.id + "/" + level + ": independently audits ranks, canonical parameters and 24 PL/EN answers", () => {
        const rows = family.id.includes("3x5") ? 3 : 4;
        const tasks = taskPool("systems", level).filter(task => task.templateId === family.id);
        expect(tasks).toHaveLength(24);
        expect(new Set(tasks.map(task => task.contentKey)).size).toBe(24);
        let incompatible = 0, consistent = 0;
        let hasFraction = false, hasNegative = false, hasPivotAfterFree = false;
        for (let variant = 0; variant < 24; variant++) {
          const task = makeUniversityTask(family.id, variant, level);
          const problem = task.university;
          if (problem.kind !== "linear-system") throw Error("Wrong problem kind");
          expect(problem.matrix).toHaveLength(rows);
          expect(problem.matrix.every(row => row.length === 5)).toBe(true);
          expect(problem.rhs).toHaveLength(rows);
          hasFraction ||= problem.matrix.flat().some(value => value.denominator !== 1n);
          hasNegative ||= problem.matrix.flat().some(value => value.numerator < 0n);
          const augmented = problem.matrix.map((row, i) => [...row, problem.rhs[i]]);
          const rankA = minorRank(problem.matrix), rankAugmented = minorRank(augmented);
          const inconsistent = variant % 6 === 0;
          expect(rankA).toBe(inconsistent ? 2 : 3);
          expect(rankAugmented).toBe(inconsistent ? 3 : 3);
          expect(problem.method).toBe(inconsistent ? "classification" : "parameters");
          const canonical = inconsistent ? null : independentAffine(problem.matrix, problem.rhs);
          if (!inconsistent) {
            consistent++;
            expect(canonical!.free).toHaveLength(2);
            hasPivotAfterFree ||= canonical!.free.some(free =>
              canonical!.pivots.some(pivot => pivot > free));
          } else incompatible++;
          for (const locale of ["pl", "en"] as const) {
            const local = localizeUniversity(task, locale);
            expect(local.solution!.length).toBeGreaterThan(3);
            const result = local.answer;
            if (inconsistent) {
              expect(result.kind).toBe("choice");
              if (result.kind !== "choice") throw Error("Expected classification");
              expect(result.value).toBe("system-none");
              expect(local.solution!.some(step =>
                step.action.includes("0 = ") || step.action.includes("0="))).toBe(true);
              expect(assessAnswer(result, { kind: "choice", value: "system-none" }).kind).toBe("correct");
              expect(assessAnswer(result, { kind: "choice", value: "system-many" }).kind).toBe("incorrect");
              expect(assessAnswer(result, emptyAnswer(result)).kind).toBe("invalid");
            } else {
              expect(result.kind).toBe("list");
              if (result.kind !== "list") throw Error("Expected affine coefficients");
              const expected = canonical!.coefficients.flat();
              expect(result.values).toHaveLength(15);
              expect(result.labels).toHaveLength(15);
              result.values.forEach((value, i) =>
                expect(eq(value, expected[i]), family.id + ":" + variant + ":" + i).toBe(true));
              for (let k = 0; k <= 2; k++)
                for (let i = 0; i < rows; i++) {
                  const lhs = problem.matrix[i]
                    .map((factor, j) => m(factor, result.values[j * 3 + k]))
                    .reduce(a, q(0));
                  expect(eq(lhs, k === 0 ? problem.rhs[i] : q(0))).toBe(true);
                }
              for (const [i, col] of canonical!.free.entries())
                expect(local.question).toContain(["x","y","z","w","v"][col] + "=t" + (i + 1));
              expect(local.question).toContain("t2");
              expect(local.solution!.some(step => step.action.startsWith("RREF"))).toBe(true);
              expect(local.solution!.filter(step => /^R\d+: /.test(step.action))).toHaveLength(rows);
              const correct = { kind: "list" as const, values: result.values.map(fmt) };
              expect(assessAnswer(result, correct).kind).toBe("correct");
              expect(assessAnswer(result, emptyAnswer(result)).kind).toBe("invalid");
              const wrong = [...correct.values];
              wrong[0] = fmt(a(result.values[0], q(1)));
              expect(assessAnswer(result, { ...correct, values: wrong }).kind).toBe("incorrect");
              expect(assessAnswer(result, { ...correct,
                values: ["1/0", ...correct.values.slice(1)] }).kind).toBe("invalid");
            }
            for (const text of [local.question, local.hint, local.nextHint, local.explanation,
              ...local.solution!.map(step => step.action + " " + step.reason)]) {
              expect(text).not.toMatch(/undefined|NaN/);
              expect(text).not.toHaveLength(0);
              if (locale === "en") expect(text).not.toMatch(/Rozwiąż|Zmienne swobodne|wierszy|macierz rozszerzoną|Sprawdzamy/);
            }
          }
        }
        expect(incompatible).toBe(4);
        expect(consistent).toBe(20);
        expect(hasNegative).toBe(true);
        expect(hasPivotAfterFree).toBe(true);
        if (level !== "hard") expect(hasFraction).toBe(true);
      });
});