// Test-only helpers live here to keep independent arithmetic shared by audits.
// No production solver imports this module.
import type { Rational } from "../rational";
import type { Calculation } from "../solutions/types";
export const q = (n: number | bigint, d: number | bigint = 1): Rational => ({
  numerator: BigInt(n),
  denominator: BigInt(d),
});
export const a = (x: Rational, y: Rational): Rational =>
  q(
    x.numerator * y.denominator + y.numerator * x.denominator,
    x.denominator * y.denominator,
  );
export const m = (x: Rational, y: Rational): Rational =>
  q(x.numerator * y.numerator, x.denominator * y.denominator);
export const neg = (x: Rational): Rational => q(-x.numerator, x.denominator);
export const s = (x: Rational, y: Rational): Rational => a(x, neg(y));
export const d = (x: Rational, y: Rational): Rational => {
  if (y.numerator === 0n) throw new Error("Independent zero division");
  return q(x.numerator * y.denominator, x.denominator * y.numerator);
};
export const eq = (x: Rational, y: Rational) =>
  x.numerator * y.denominator === y.numerator * x.denominator;
export function laplace(matrix: readonly (readonly Rational[])[]): Rational {
  if (matrix.length === 1) return matrix[0][0];
  return matrix[0]
    .map((v, j) =>
      m(
        q(j % 2 ? -1 : 1),
        m(
          v,
          laplace(matrix.slice(1).map((row) => row.filter((_, k) => j !== k))),
        ),
      ),
    )
    .reduce(a, q(0));
}
export function auditCalculation(c: Calculation): boolean {
  return eq(
    c.operands
      .slice(1)
      .reduce(
        { sum: a, difference: s, product: m, quotient: d }[c.operation],
        c.operands[0],
      ),
    c.result,
  );
}
