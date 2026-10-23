import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as format } from "../answers";
import type { Rational } from "../rational";
import { createGenerator, taskPool } from "../generators";
import { advanceSession, createSession, recordFirstAttempt, summarizeSession } from "../session";
import { getAnswerSpec } from "../exercises";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { gaussRectangularParameterFamilies } from "./gaussRectangularParameters";
import { a, s, m, d, eq, q, laplace } from "./audit";

type Matrix = readonly (readonly Rational[])[];
const combinations = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) => combinations(n - i - 1, k - 1)
    .map(rest => [i, ...rest.map(j => j + i + 1)])).flat();
/** All minors, independently of production Gaussian elimination. */
function rank(matrix: Matrix): number {
  for (let k = Math.min(matrix.length, matrix[0].length); k > 0; k--)
    for (const rows of combinations(matrix.length, k))
      for (const cols of combinations(matrix[0].length, k))
        if (laplace(rows.map(i => cols.map(j => matrix[i][j]))).numerator !== 0n) return k;
  return 0;
}
/** Greedy independent columns + Cramer's rule on a nonsingular minor gives
 * the canonical affine solution without calling production RREF/solvers. */
function independentSolution(A: Matrix, b: readonly Rational[]) {
  const n = A[0].length, pivots: number[] = [];
  for (let col = 0; col < n; col++)
    if (rank(A.map(row => [...pivots, col].map(j => row[j]))) > pivots.length) pivots.push(col);
  const free = Array.from({ length: n }, (_, j) => j).filter(j => !pivots.includes(j));
  const selected = combinations(A.length, pivots.length).find(rows =>
    laplace(rows.map(i => pivots.map(j => A[i][j]))).numerator !== 0n)!;
  const B = selected.map(i => pivots.map(j => A[i][j])), D = laplace(B);
  const values = Array.from({ length: n }, (_, j) => {
    const f = free.indexOf(j);
    if (f >= 0) return [q(0), ...free.map((_, k) => q(k === f ? 1 : 0))];
    const pivot = pivots.indexOf(j);
    return Array.from({ length: free.length + 1 }, (_, k) => {
      const rhs = selected.map(i => k === 0 ? b[i] : m(q(-1), A[i][free[k - 1]]));
      return d(laplace(B.map((row, i) => row.map((c, col) => col === pivot ? rhs[i] : c))), D);
    });
  });
  return { values, free, pivots };
}
const parseFraction = (text: string) => { const [n, d = "1"] = text.trim().replace(/−/g, "-").split("/"); return q(BigInt(n), BigInt(d)); };
function shownMatrix(text: string): Rational[][] {
  return text.slice(text.indexOf("[[") + 1, text.lastIndexOf("]"))
    .split("; ").map(row => row.replace(/[\[\]]/g, "").split(", ").map(parseFraction));
}
function sameMatrix(actual: Matrix, expected: Matrix) {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i].length).toBe(expected[i].length);
    actual[i].forEach((v, j) => expect(eq(v, expected[i][j])).toBe(true));
  }
}

describe("MT-EDU-014 P2 rectangular full solutions", () => {
  it("preserves published square Gauss examples and uses matching parameters for rectangular families", () => {
    const cases = [
      ["gauss-parameters-one", "hard", "x=c+at1+bt2"],
      ["gauss-parameters-two", "advanced", "x=c+at1+bt2"],
      ["gauss-rectangular-3x2-parameters", "hard", "x=c+at1"],
      ["gauss-rectangular-4x3-parameters", "advanced", "x=c+at1"],
      ["gauss-rectangular-4x3-parameters", "expert", "x=c+at1+bt2"],
      ["gauss-rectangular-2x3-parameters", "advanced", "x=c+at1"],
      ["gauss-rectangular-2x3-parameters", "expert", "x=c+at1+bt2"],
    ] as const;
    for (const [family, level, example] of cases) {
      const task = makeUniversityTask(family, 0, level);
      for (const locale of ["pl", "en"] as const) {
        const question = localizeUniversity(task, locale).question;
        expect(question).toContain(`${locale === "pl" ? "np." : "e.g."} ${example}.`);
        if (example === "x=c+at1") expect(question).not.toContain("x=c+at1+bt2");
      }
    }
  });
  it("matches three hand-derived coefficient examples, including a free first column", () => {
    for (const [shape, level, variant, expected] of [
      ["3x2", "hard", 0, ["-12", "3", "0", "1"]],
      ["4x3", "advanced", 0, ["-6", "3/2", "-9/2", "1/2", "0", "1"]],
      // Variant 1 gives 3y+z=−11: x=t1, z=t2, y=−11/3−(1/3)t2.
      ["2x3", "expert", 1, ["0", "1", "0", "-11/3", "0", "-1/3", "0", "0", "1"]],
    ] as const) {
      const answer = makeUniversityTask(`gauss-rectangular-${shape}-parameters`, variant, level).answer;
      if (answer.kind !== "list") throw Error("Wrong answer type");
      answer.values.forEach((value, j) => expect(eq(value, parseFraction(expected[j]))).toBe(true));
    }
  });
  it("declares three families, six supported pairs and 144 new variants", () => {
    expect(gaussRectangularParameterFamilies).toHaveLength(3);
    expect(gaussRectangularParameterFamilies.reduce((n, f) => n + f.supportedDifficulties.length * 24, 0)).toBe(144);
  });
  for (const family of gaussRectangularParameterFamilies) for (const level of family.supportedDifficulties)
    it(`${family.id}/${level}: audits every variant, canonical coefficients, intermediate rows, and PL/EN`, () => {
      const tasks = taskPool("systems", level).filter(t => t.templateId === family.id);
      expect(tasks).toHaveLength(24);
      expect(new Set(tasks.map(t => t.contentKey)).size).toBe(24);
      const solutionSets: Matrix[] = [];
      const [rows, columns] = family.id.includes("3x2") ? [3, 2] : family.id.includes("4x3") ? [4, 3] : [2, 3];
      const freeCount = columns === 2 || level !== "expert" ? 1 : 2;
      let fractions = false, negatives = false, zeros = false;
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask(family.id, v, level), p = task.university;
        if (p.kind !== "linear-system") throw Error("Wrong kind");
        expect(p.method).toBe("parameters");
        expect(p.matrix).toHaveLength(rows);
        expect(p.matrix.every(row => row.length === columns)).toBe(true);
        const augmented = p.matrix.map((row, i) => [...row, p.rhs[i]]);
        expect(rank(p.matrix)).toBe(columns - freeCount);
        expect(rank(augmented)).toBe(columns - freeCount);
        const independent = independentSolution(p.matrix, p.rhs);
        expect(independent.free).toHaveLength(freeCount);
        expect(rank(independent.values.map(row => row.slice(1)))).toBe(freeCount);
        // Compare fractions by cross-products: unreduced Cramer fractions must
        // not make two equivalent affine sets appear different.
        expect(solutionSets.some(saved => saved.flat().every((value, j) =>
          eq(value, independent.values.flat()[j])))).toBe(false);
        solutionSets.push(independent.values);
        fractions ||= augmented.flat().some(x => x.denominator !== 1n);
        negatives ||= augmented.flat().some(x => x.numerator < 0n);
        zeros ||= independent.values.flat().some(x => x.numerator === 0n);
        for (const locale of ["pl", "en"] as const) {
          const local = localizeUniversity(task, locale), answer = local.answer;
          expect(answer.kind).toBe("list");
          if (answer.kind !== "list") throw Error("Expected coefficient fields");
          expect(answer.values).toHaveLength(columns * (freeCount + 1));
          answer.values.forEach((value, j) => expect(eq(value, independent.values.flat()[j])).toBe(true));
          expect(answer.labels).toHaveLength(answer.values.length);
          expect(local.question).toContain(locale === "pl" ? "Zmienne swobodne" : "Free variables");
          expect(local.hint).toContain("t1");
          if (freeCount === 1) expect(local.question).not.toContain("t2");
          for (const [k, col] of independent.free.entries())
            expect(local.question).toContain(`${["x", "y", "z"][col]}=t${k + 1}`);
          for (let i = 0; i < rows; i++) for (let k = 0; k <= freeCount; k++) {
            const lhs = p.matrix[i].map((c, j) => m(c, answer.values[j * (freeCount + 1) + k])).reduce(a, q(0));
            expect(eq(lhs, k === 0 ? p.rhs[i] : q(0))).toBe(true);
          }
          const checks = local.solution!.filter(step => /^R\d+: /.test(step.action));
          expect(checks).toHaveLength(rows);
          checks.forEach((step, i) => {
            const terms = step.action.split("; ");
            expect(terms).toHaveLength(freeCount + 1);
            terms.forEach((term, k) => {
              const factors = [...term.matchAll(/\(([^)]+)\)·\(([^)]+)\)/g)];
              expect(factors).toHaveLength(columns);
              const total = factors.map((match, j) => {
                expect(eq(parseFraction(match[1]), p.matrix[i][j])).toBe(true);
                expect(eq(parseFraction(match[2]), independent.values[j][k])).toBe(true);
                return m(parseFraction(match[1]), parseFraction(match[2]));
              }).reduce(a, q(0));
              expect(eq(total, parseFraction(term.split(" = ")[1]))).toBe(true);
              expect(eq(total, k === 0 ? p.rhs[i] : q(0))).toBe(true);
            });
          });
          let previous: Matrix = augmented;
          for (const step of local.solution!) {
            if (!step.action.includes("[[")) continue;
            const shown = shownMatrix(step.action);
            const swap = step.action.match(/^R(\d+) ↔ R(\d+)/);
            const subtract = step.action.match(/^R(\d+) ← R\d+ − \(([^)]+)\)R(\d+)/);
            if (swap) {
              const expected = previous.map(row => [...row]);
              const i = Number(swap[1]) - 1, j = Number(swap[2]) - 1;
              [expected[i], expected[j]] = [expected[j], expected[i]];
              sameMatrix(shown, expected);
            } else if (subtract) {
              const i = Number(subtract[1]) - 1, j = Number(subtract[3]) - 1, factor = parseFraction(subtract[2]);
              sameMatrix(shown, previous.map((row, index) => index === i ? row.map((c, col) => s(c, m(factor, previous[j][col]))) : row));
            } else if (step.action.startsWith("RREF")) {
              const expected = independent.pivots.map((pivot, i) => Array.from({ length: columns + 1 }, (_, j) => {
                if (j === columns) return independent.values[pivot][0];
                const freeIndex = independent.free.indexOf(j);
                return freeIndex >= 0 ? m(q(-1), independent.values[pivot][freeIndex + 1]) : q(independent.pivots[i] === j ? 1 : 0);
              }));
              while (expected.length < rows) expected.push(Array.from({ length: columns + 1 }, () => q(0)));
              sameMatrix(shown, expected);
            } else sameMatrix(shown, augmented);
            previous = shown;
          }
          const correct = { kind: "list" as const, values: answer.values.map(format) };
          expect(assessAnswer(answer, correct).kind).toBe("correct");
          expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
          for (let j = 0; j < answer.values.length; j++) {
            const changed = [...correct.values]; changed[j] = format(a(answer.values[j], q(1)));
            expect(assessAnswer(answer, { ...correct, values: changed }).kind).toBe("incorrect");
          }
          expect(assessAnswer(answer, { ...correct, values: ["1/0", ...correct.values.slice(1)] }).kind).toBe("invalid");
          expect(assessAnswer(answer, { ...correct, values: [...correct.values.slice(0, -1), ""] }).kind).toBe("invalid");
          if (locale === "en") expect(local.question + local.explanation).not.toMatch(/Rozwiąż|Wpisz|stałą|współczynnik|równani/);
        }
      }
      expect(solutionSets).toHaveLength(24); // no rescaled duplicates of the same affine set
      expect(negatives && zeros).toBe(true);
      if (level !== "hard") expect(fractions).toBe(true);
    });

  for (const family of gaussRectangularParameterFamilies) for (const level of family.supportedDifficulties)
    it(`${family.id}/${level}: ten unique tasks preserve first valid attempt semantics`, () => {
      const generator = createGenerator(12345);
      let task = generator.next("systems", level, family.id).exercise;
      let session = createSession("systems", level, task.id, task.templateId);
      const seen = new Set<string>();
      for (let i = 0; i < 10; i++) {
        expect(seen.has(task.contentKey)).toBe(false); seen.add(task.contentKey);
        const answer = getAnswerSpec(task);
        if (answer.kind !== "list") throw Error("Expected list");
        session = recordFirstAttempt(session, task.id, assessAnswer(answer, emptyAnswer(answer)).kind);
        expect(session.entries[i].firstAttempt).toBeNull();
        if (i === 1) session = recordFirstAttempt(session, task.id, "incorrect");
        if (i < 9) session = recordFirstAttempt(session, task.id,
          assessAnswer(answer, { kind: "list", values: answer.values.map(format) }).kind);
        if (i < 9) {
          const next = generator.next("systems", level, family.id);
          expect(next.repeated).toBe(false);
          session = advanceSession(session, task.id, next.exercise.id, next.exercise.templateId);
          task = next.exercise;
        } else session = advanceSession(session, task.id);
      }
      expect(summarizeSession(session)).toEqual({ shown: 10, correct: 8, incorrect: 1, skipped: 1, solutionViewed: 0 });
    });
});
