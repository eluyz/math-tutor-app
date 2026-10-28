import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { taskPool } from "../generators";
import type { Rational } from "../rational";
import { eq, laplace, q } from "./audit";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { checkMatrix, inverse, rank } from "./linearAlgebraMath";
import { constructTallRank, reduceTallRank, tallRankFamilies } from "./rankTall";

type Matrix = readonly (readonly Rational[])[];
const choose = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) =>
    choose(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();
/** Independent exact minor oracle, never calling production RREF or pivot logic. */
function rankByMinors(A: Matrix): number {
  for (let k = Math.min(A.length, A[0].length); k >= 1; k--)
    for (const rows of choose(A.length, k))
      for (const cols of choose(A[0].length, k))
        if (laplace(rows.map(i => cols.map(j => A[i][j]))).numerator !== 0n)
          return k;
  return 0;
}
describe("MT-EDU-031 M14 tall rectangular matrix ranks", () => {
  it("limits new reduction to the authorized shapes without widening legacy matrix APIs", () => {
    expect(tallRankFamilies).toHaveLength(2);
    for (const family of tallRankFamilies)
      expect(family.supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    for (const wrong of [-1, 24, 1.2, NaN, Infinity])
      expect(() => constructTallRank(wrong, "hard", 5)).toThrow();
    expect(() => constructTallRank(0, "easy", 5)).toThrow();
    expect(() => constructTallRank(0, "hard", 4 as 5)).toThrow();
    const tall = constructTallRank(1, "hard", 5).matrix;
    expect(() => checkMatrix(tall)).toThrow();
    expect(() => rank(tall)).toThrow();
    expect(() => inverse(tall)).toThrow();
    expect(() => reduceTallRank(tall.slice(0, 4))).toThrow();
    expect(() => reduceTallRank([[q(1), q(1), q(1), q(1)]])).toThrow();
  });
  for (const family of tallRankFamilies)
    it(family.id + ": 72 distinct exact tasks, PL/EN and independent minors", () => {
      const rows = family.id.includes("five") ? 5 : 6;
      const columns = rows === 5 ? 4 : 3;
      const keys = new Set<string>(), ranks = new Set<number>();
      let manySteps = 0, fractions = 0, swaps = 0, skippedFirstColumn = 0;
      for (const level of family.supportedDifficulties) {
        const pool = taskPool("matrices", level).filter(t => t.templateId === family.id);
        expect(pool).toHaveLength(24);
        expect(new Set(pool.map(t => t.contentKey)).size).toBe(24);
        for (let variant = 0; variant < 24; variant++) {
          const task = makeUniversityTask(family.id, variant, level);
          if (task.university.kind !== "linear-rank") throw Error("Expected rank problem");
          const A = task.university.matrix;
          expect(A).toHaveLength(rows);
          expect(A.every(row => row.length === columns)).toBe(true);
          const expected = rankByMinors(A);
          const reduced = reduceTallRank(A);
          ranks.add(expected);
          keys.add(task.contentKey);
          expect(reduced.pivots.length).toBe(expected);
          expect(rankByMinors(reduced.matrix)).toBe(expected);
          for (const [i, col] of reduced.pivots.entries()) {
            expect(eq(reduced.matrix[i][col], q(1))).toBe(true);
            expect(reduced.matrix.every((row, j) =>
              j === i || row[col].numerator === 0n)).toBe(true);
          }
          if (variant % 8 === 1)
            for (const step of reduced.steps) expect(rankByMinors(step.matrix)).toBe(expected);
          manySteps += reduced.steps.length > 1 ? 1 : 0;
          fractions += A.flat().some(v => v.denominator !== 1n) ? 1 : 0;
          swaps += reduced.steps.some(s => s.action.includes("↔")) ? 1 : 0;
          skippedFirstColumn += expected > 0 &&
            A.every(row => row[0].numerator === 0n) ? 1 : 0;
          for (const locale of ["pl", "en"] as const) {
            const view = localizeUniversity(task, locale);
            expect(view.answer.kind).toBe("scalar");
            if (view.answer.kind !== "scalar") throw Error("Expected scalar");
            expect(eq(view.answer.value, q(expected))).toBe(true);
            expect(assessAnswer(view.answer, String(expected)).kind).toBe("correct");
            expect(assessAnswer(view.answer, String((expected + 1) % (columns + 1))).kind).toBe("incorrect");
            expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
            expect(assessAnswer(view.answer, "1/0").kind).toBe("invalid");
            expect(view.solution!.some(s => s.action.includes("RREF(A)"))).toBe(true);
            expect(view.solution!.some(s => s.action.includes("rank(A)"))).toBe(true);
            expect(view.hint.length).toBeGreaterThan(0);
            expect(view.nextHint.length).toBeGreaterThan(0);
            expect(view.explanation).not.toMatch(/undefined|NaN/);
            if (locale === "en") expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      }
      expect(keys.size).toBe(72);
      expect([...ranks].sort()).toEqual(Array.from({ length: columns + 1 }, (_, i) => i));
      expect(manySteps).toBeGreaterThan(30);
      expect(fractions).toBeGreaterThan(0);
      expect(swaps).toBeGreaterThan(0);
      expect(skippedFirstColumn).toBeGreaterThan(0);
    }, 45_000);
});
