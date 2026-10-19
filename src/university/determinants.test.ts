import { describe, expect, it } from "vitest";
import {
  determinantFamilies,
  exactDeterminant,
  minor,
  validDeterminantMatrix,
  applyDeterminantRowOperation,
} from "./determinants";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { q, a, s, m, d, eq, auditCalculation } from "./audit";
import { formatRational as f, assessAnswer } from "../answers";
import type { Rational } from "../rational";
import type {
  DeterminantProblem,
  SquareDeterminantMatrix as Square,
} from "./schema";
import { polishLearningText } from "../../e2e/helpers/localization";
const normal = (value: Rational): Rational => {
  let x = value.numerator < 0n ? -value.numerator : value.numerator;
  let y = value.denominator;
  while (y) [x, y] = [y, x % y];
  const factor = x || 1n;
  return {
    numerator: value.numerator / factor,
    denominator: value.denominator / factor,
  };
};

// An independent Gaussian solver. It never calls production determinant/minor/row helpers.
function gaussian(input: Square): Rational {
  const n = input.length;
  if (!n || input.some((row) => row.length !== n))
    throw new Error("bad audit matrix");
  const rows = input.map((row) => [...row]);
  let sign = q(1);
  for (let col = 0; col < n; col++) {
    const pivot = rows.findIndex(
      (row, i) => i >= col && row[col].numerator !== 0n,
    );
    if (pivot < 0) return q(0);
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      sign = m(sign, q(-1));
    }
    for (let i = col + 1; i < n; i++) {
      const ratio = d(rows[i][col], rows[col][col]);
      for (let j = col; j < n; j++)
        rows[i][j] = s(rows[i][j], m(ratio, rows[col][j]));
    }
  }
  return rows.map((row, i) => row[i]).reduce(m, sign);
}
const compact = (matrix: Square) =>
  matrix
    .map((row) => `[${row.map((cell) => f(normal(cell))).join(", ")}]`)
    .join("; ");
const independentMinor = (matrix: Square, row: number, col: number) =>
  matrix
    .filter((_, i) => i !== row)
    .map((line) => line.filter((_, j) => j !== col));
function checkWorking(
  p: DeterminantProblem,
  steps: readonly { kind: string; action: string; reason: string }[],
) {
  const whole = steps.map((step) => `${step.action} ${step.reason}`).join("\n");
  if (p.dependentRows) {
    expect(gaussian(p.matrix).numerator).toBe(0n);
    expect(whole).toContain("= 0");
    return;
  }
  if (p.reductions) {
    let current = p.matrix;
    let factor = q(1);
    for (const op of p.reductions) {
      const old = gaussian(current);
      const out = current.map((row) => [...row]);
      if (op.kind === "add") {
        out[op.target] = out[op.target].map((cell, j) =>
          a(cell, m(op.multiple, out[op.source][j])),
        );
        expect(eq(gaussian(out), old)).toBe(true);
      } else if (op.kind === "swap") {
        [out[op.first], out[op.second]] = [out[op.second], out[op.first]];
        expect(eq(gaussian(out), m(q(-1), old))).toBe(true);
        factor = m(factor, q(-1));
      } else {
        out[op.row] = out[op.row].map((cell) => m(cell, op.factor));
        expect(eq(gaussian(out), m(op.factor, old))).toBe(true);
        factor = d(factor, op.factor);
      }
      current = out;
      expect(whole).toContain(compact(current));
      expect(whole).toContain(`det(A) = (${f(normal(factor))}) det(`);
    }
    expect(eq(gaussian(p.matrix), m(factor, gaussian(current)))).toBe(true);
    for (let i = 0; i < current.length; i++)
      for (let j = 0; j < i; j++) expect(current[i][j].numerator).toBe(0n);
  } else {
    // Reconstruct every displayed 5→4→3 / 4→3 minor independently and
    // verify each displayed cofactor sign and contribution with Gaussian.
    const visit = (matrix: Square) => {
      if (matrix.length < 4) return;
      const shownTerms: Rational[] = [];
      for (let i = 0; i < matrix.length; i++)
        for (let j = 0; j < matrix.length; j++) {
          const cell = matrix[i][j];
          const sub = independentMinor(matrix, i, j);
          if (cell.numerator === 0n) continue;
          const label = `M${i + 1}${j + 1} = ${compact(sub)}; (−1)^(${i + 1}+${j + 1}) = ${(i + j) % 2 ? "−1" : "+1"}`;
          // A legitimate sparse expansion need only show its chosen axis.
          if (!whole.includes(label)) continue;
          const contribution = normal(
            m(m(q((i + j) % 2 ? -1 : 1), cell), gaussian(sub)),
          );
          expect(whole).toContain(
            `C${i + 1}${j + 1}: ${(i + j) % 2 ? "−" : "+"}(${f(cell)})·(${f(normal(gaussian(sub)))}) = ${f(contribution)}`,
          );
          shownTerms.push(contribution);
          visit(sub);
        }
      expect(shownTerms.length).toBeGreaterThan(0);
      expect(eq(shownTerms.reduce(a,q(0)),gaussian(matrix))).toBe(true);
    };
    visit(p.matrix);
    expect(whole).toContain("3×3");
  }
}
describe("MT-EDU-006A exact determinant audit", () => {
  it.each(determinantFamilies)(
    "$id: every supported level, 24 distinct questions and PL/EN solutions",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level);
          const p = task.university;
          if (p.kind !== "determinant" || task.answer.kind !== "scalar")
            throw new Error("wrong determinant task");
          keys.add(task.contentKey);
          expect(validDeterminantMatrix(p.matrix)).toBe(
            p.method === "laplace-five" ? 5 : 4,
          );
          if (p.method === "row-operations")
            expect(
              p.matrix.every(
                (row) =>
                  row.filter((cell) => cell.numerator !== 0n).length >= 2,
              ),
              `${level}/${v}: ${compact(p.matrix)}`,
            ).toBe(true);
          expect(eq(task.answer.value, gaussian(p.matrix))).toBe(true);
          expect(eq(exactDeterminant(p.matrix), gaussian(p.matrix))).toBe(true);
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale);
            const spec = localized.answer;
            if (spec.kind !== "scalar") throw new Error("wrong answer type");
            expect(localized.id).toBe(task.id);
            expect(localized.contentKey).toBe(task.contentKey);
            expect(localized.university).toBe(p);
            expect(eq(spec.value, gaussian(p.matrix))).toBe(true);
            expect(localized.solution).toBeDefined();
            const steps = localized.solution!;
            expect(steps.length).toBeGreaterThanOrEqual(3);
            expect(steps.at(-1)?.kind).toBe("answer");
            for (const step of steps) {
              expect(step.reason.length).toBeGreaterThan(20);
              if (step.kind === "working")
                for (const calc of step.calculations)
                  expect(auditCalculation(calc)).toBe(true);
              if (locale === "en")
                expect(
                  polishLearningText.test(`${step.action} ${step.reason}`),
                ).toBe(false);
            }
            if (locale === "en") {
              expect(
                polishLearningText.test(
                  `${localized.question} ${localized.hint} ${localized.nextHint}`,
                ),
              ).toBe(false);
            }
            checkWorking(p, steps);
            expect(assessAnswer(spec, f(spec.value))).toEqual({
              kind: "correct",
            });
            expect(assessAnswer(spec, f(a(spec.value, q(1))))).toEqual({
              kind: "incorrect",
            });
            expect(assessAnswer(spec, "").kind).toBe("invalid");
            expect(assessAnswer(spec, "1/0").kind).toBe("invalid");
            expect(assessAnswer(spec, "abc").kind).toBe("invalid");
          }
        }
        expect(keys.size, `${family.id}/${level}`).toBe(24);
      }
    },
  );
  it("rejects malformed sizes, non-rational entries, bad minors and invalid row operations", () => {
    for (const bad of [
      [],
      [[q(1)]],
      Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => q(1))),
      [[q(1), q(2)], [q(3)]],
      [
        [q(1), {} as Rational],
        [q(2), q(3)],
      ],
      [
        [q(1), { numerator: 1n, denominator: 0n }],
        [q(2), q(3)],
      ],
    ])
      expect(() => validDeterminantMatrix(bad)).toThrow();
    const matrix = [
      [q(1), q(2)],
      [q(3), q(4)],
    ];
    expect(() => minor(matrix, 2, 0)).toThrow();
    expect(() =>
      applyDeterminantRowOperation(matrix, {
        kind: "scale",
        row: 0,
        factor: q(0),
      }),
    ).toThrow();
    expect(() =>
      applyDeterminantRowOperation(matrix, {
        kind: "add",
        target: 0,
        source: 0,
        multiple: q(1),
      }),
    ).toThrow();
    expect(eq(gaussian(matrix), q(-2))).toBe(true);
    expect(
      eq(
        gaussian([
          [q(1), q(0)],
          [q(0), q(1)],
        ]),
        q(1),
      ),
    ).toBe(true);
    expect(
      eq(
        gaussian([
          [q(1), q(2)],
          [q(1), q(2)],
        ]),
        q(0),
      ),
    ).toBe(true);
    expect(
      eq(
        gaussian([
          [q(1, 2), q(-3)],
          [q(4), q(2, 3)],
        ]),
        q(37, 3),
      ),
    ).toBe(true);
  });
  it("audits identity, triangular, dependent, swapped, scaled and fractional 4×4/5×5 matrices", () => {
    const identity = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => q(i === j ? 1 : 0)),
      );
    for (const n of [4, 5]) {
      const unit = identity(n);
      const triangular = unit.map((row, i) =>
        row.map((_, j) =>
          i > j ? q(0) : i === j ? q(i % 2 ? -2 : 3) : q(i - j),
        ),
      );
      const swapped = unit.map((row) => [...row]);
      [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
      const scaled = unit.map((row) => [...row]);
      scaled[2][2] = q(-3, 2);
      const dependent = unit.map((row) => [...row]);
      dependent[2] = dependent[1].map((cell) => m(q(-2), cell));
      const added = unit.map((row) => [...row]);
      added[3] = added[3].map((cell, j) => a(cell, m(q(-7, 3), added[0][j])));
      for (const [matrix, answer] of [
        [unit, q(1)],
        [swapped, q(-1)],
        [scaled, q(-3, 2)],
        [dependent, q(0)],
        [added, q(1)],
      ] as const) {
        expect(eq(exactDeterminant(matrix), answer)).toBe(true);
        expect(eq(gaussian(matrix), answer)).toBe(true);
      }
      expect(eq(exactDeterminant(triangular), gaussian(triangular))).toBe(true);
    }
  });
});
