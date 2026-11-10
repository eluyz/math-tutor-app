import { describe, expect, it } from "vitest";
import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, equalRational as eq,
} from "../rational";
import { product, identity, type ExactMatrix } from "./linearAlgebraMath";
import {
  makeCoupledCoefficientProblem, solveCoupledCoefficientProblem,
  presentCoupledCoefficientStage, acceptsCoupledCoefficientAnswer,
} from "./matrixPairCoefficientStage";

const minus = (a: ExactMatrix, b: ExactMatrix): ExactMatrix =>
  a.map((row, i) => row.map((v, j) => sub(v, b[i][j])));
const same = (a: ExactMatrix, b: ExactMatrix): boolean =>
  a.length === b.length && a.every((row, i) =>
    row.length === b[i].length && row.every((v, j) => eq(v, b[i][j])));

/** Independent direct adjugate oracle; never calls the production inverse(). */
function inverseTwo(a: ExactMatrix): ExactMatrix {
  const det = sub(mul(a[0][0], a[1][1]), mul(a[0][1], a[1][0]));
  if (det.numerator === 0n) throw Error("Singular independent oracle");
  return [
    [div(a[1][1], det), div(mul(r(-1), a[0][1]), det)],
    [div(mul(r(-1), a[1][0]), det), div(a[0][0], det)],
  ];
}

describe("M05 matrix-coefficient coupled equations (isolated stage only)", () => {
  for (const level of ["medium", "hard", "advanced", "expert"] as const)
    for (let variant = 0; variant < 24; variant++)
      it(level + " v" + variant + ": oracle, PL/EN, answer acceptance", () => {
        const p = makeCoupledCoefficientProblem(variant, level);
        const factor = minus(identity(2), product(p.a, p.b));
        const referenceX = product(inverseTwo(factor), minus(p.c, product(p.a, p.d)));
        const referenceY = minus(p.d, product(p.b, referenceX));
        const solved = solveCoupledCoefficientProblem(p);
        expect(same(solved.x, referenceX)).toBe(true);
        expect(same(solved.y, referenceY)).toBe(true);
        // Explicitly exercise the noncommutative case, absent from scalar X/Y systems.
        expect(same(product(p.a, p.b), product(p.b, p.a))).toBe(false);
        for (const locale of ["pl", "en"] as const) {
          const display = presentCoupledCoefficientStage(p, locale);
          expect(display.question).toContain("X + AY = C; BX + Y = D");
          expect(display.hints).toHaveLength(2);
          expect(display.steps).toHaveLength(6);
          expect(display.answer).toHaveLength(8);
          expect(acceptsCoupledCoefficientAnswer(p, display.answer)).toBe(true);
          expect(acceptsCoupledCoefficientAnswer(p, display.answer.slice(0, 7))).toBe(false);
          expect(acceptsCoupledCoefficientAnswer(p, [...display.answer.slice(0, 7), null])).toBe(false);
          expect(acceptsCoupledCoefficientAnswer(p, [
            ...display.answer.slice(0, 7), add(display.answer[7], r(1)),
          ])).toBe(false);
        }
      });

  it("rejects invalid indexes, easy tier, bad size and singular I-AB", () => {
    expect(() => makeCoupledCoefficientProblem(-1, "medium")).toThrow();
    expect(() => makeCoupledCoefficientProblem(24, "expert")).toThrow();
    expect(() => makeCoupledCoefficientProblem(0, "easy")).toThrow();
    const p = makeCoupledCoefficientProblem(0, "medium");
    expect(() => solveCoupledCoefficientProblem({ ...p, a: [[r(1)]] })).toThrow();
    expect(() => solveCoupledCoefficientProblem({
      ...p, a: identity(2), b: identity(2),
    })).toThrow();
  });
});
