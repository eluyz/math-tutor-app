/** Test-only reference: direct powers and coefficient convolution, never Horner. */
import type { Rational } from "../rational";
import type { Polynomial, PolynomialFormula } from "./polynomial";
import { q, a, m, s, d, neg, eq } from "./audit";
import type { RationalExpression } from "./schema";
import type { LimitValue } from "../answers";
export function canonical(x: Rational): Rational {
  const abs = (v: bigint) => (v < 0n ? -v : v);
  let n = abs(x.numerator),
    denominator = abs(x.denominator);
  if (denominator === 0n) throw new Error("Reference zero denominator");
  while (denominator) [n, denominator] = [denominator, n % denominator];
  return q(
    (x.numerator * (x.denominator < 0n ? -1n : 1n)) / n,
    abs(x.denominator) / n,
  );
}
export const cmp = (x: Rational, y: Rational) => {
  const value = canonical(s(x, y)).numerator;
  return value < 0n ? -1 : value > 0n ? 1 : 0;
};
export function directValue(p: Polynomial, x: Rational): Rational {
  let power = q(1),
    sum = q(0);
  for (const c of p) {
    sum = canonical(a(sum, m(c, power)));
    power = canonical(m(power, x));
  }
  return sum;
}
export const referenceSum = (
  p: Polynomial,
  b: Polynomial,
  subtract = false,
): Polynomial =>
  Array.from({ length: Math.max(p.length, b.length) }, (_, i) =>
    canonical((subtract ? s : a)(p[i] ?? q(0), b[i] ?? q(0))),
  );
export function convolution(p: Polynomial, b: Polynomial): Polynomial {
  return Array.from({ length: p.length + b.length - 1 }, (_, power) =>
    p.reduce(
      (sum, c, i) =>
        power - i >= 0 && power - i < b.length
          ? canonical(a(sum, m(c, b[power - i])))
          : sum,
      q(0),
    ),
  );
}
export function directComposition(
  outer: Polynomial,
  inner: Polynomial,
): Polynomial {
  let power: Polynomial = [q(1)],
    sum: Polynomial = [q(0)];
  for (const c of outer) {
    sum = referenceSum(
      sum,
      power.map((v) => canonical(m(c, v))),
    );
    power = convolution(power, inner);
  }
  return sum;
}
export function referenceExpand(p: PolynomialFormula): Polynomial {
  switch (p.kind) {
    case "polynomial":
      return p.coefficients;
    case "composition":
      return directComposition(p.outer, p.inner);
    case "difference":
      return referenceSum(
        referenceExpand(p.left),
        referenceExpand(p.right),
        true,
      );
    case "vertex":
      return [a(m(p.a, m(p.h, p.h)), p.k), neg(m(q(2), m(p.a, p.h))), p.a];
  }
}
function binaryRoot(value: bigint): bigint {
  let low = 0n,
    high = value + 1n;
  while (high - low > 1n) {
    const middle = (low + high) / 2n;
    if (middle * middle <= value) low = middle;
    else high = middle;
  }
  if (low * low !== value) throw new Error("Irrational reference root");
  return low;
}
export function referenceRoots(p: Polynomial): Rational[] {
  const values = [...p];
  while (values.length > 1 && eq(values.at(-1)!, q(0))) values.pop();
  const [c, b = q(0), leading = q(0)] = values;
  if (values.length === 1) {
    if (eq(c, q(0))) throw new Error("Infinite roots");
    return [];
  }
  if (values.length === 2) return [canonical(d(neg(c), b))];
  if (values.length !== 3) throw new Error("Reference supports degree two");
  const delta = canonical(s(m(b, b), m(q(4), m(leading, c))));
  if (delta.numerator < 0n) return [];
  const root = q(binaryRoot(delta.numerator), binaryRoot(delta.denominator)),
    divisor = m(q(2), leading);
  return (
    delta.numerator === 0n ? [neg(b)] : [s(neg(b), root), a(neg(b), root)]
  ).map((v) => canonical(d(v, divisor)));
}
export function selectedSetContains(key: string, x: Rational): boolean {
  if (!key.startsWith("set:")) throw new Error("Reference set key expected");
  const intervals = JSON.parse(key.slice(4)) as [
    string | null,
    string | null,
    boolean,
    boolean,
  ][];
  const fraction = (text: string) => {
    const [n, d] = text.split("/").map(BigInt);
    return q(n, d);
  };
  return intervals.some(
    ([lower, upper, lc, uc]) =>
      (lower === null ||
        cmp(x, fraction(lower)) > 0 ||
        (lc && eq(x, fraction(lower)))) &&
      (upper === null ||
        cmp(x, fraction(upper)) < 0 ||
        (uc && eq(x, fraction(upper)))),
  );
}

export function referenceRatio(p: RationalExpression): {
  n: Polynomial;
  d: Polynomial;
} {
  if (p.kind === "ratio") return { n: p.numerator, d: p.denominator };
  const l = referenceRatio(p.left),
    r = referenceRatio(p.right);
  return {
    n:
      p.kind === "product"
        ? convolution(l.n, r.n)
        : referenceSum(convolution(l.n, r.d), convolution(r.n, l.d), true),
    d: convolution(l.d, r.d),
  };
}
export function referencePolynomialLimit(
  top: Polynomial,
  bottom: Polynomial,
): LimitValue {
  const nonzero = (p: Polynomial) =>
    p
      .map((v, i) => ({ v, i }))
      .filter((t) => t.v.numerator !== 0n)
      .at(-1);
  const n = nonzero(top),
    den = nonzero(bottom);
  if (!den) throw new Error("Reference zero denominator");
  if (!n || n.i < den.i) return { kind: "finite", value: q(0) };
  const quotient = canonical(d(n.v, den.v));
  return n.i === den.i
    ? { kind: "finite", value: quotient }
    : {
        kind:
          quotient.numerator > 0n ? "positive-infinity" : "negative-infinity",
      };
}

/** Binomial expansion at a: coefficient of h^j in P(a+h). No synthetic division. */
export function referenceShift(p: Polynomial, at: Rational): Polynomial {
  const choose = (n: number, k: number) => {
    let value = 1n;
    for (let j = 1; j <= k; j++)
      value = (value * BigInt(n + 1 - j)) / BigInt(j);
    return value;
  };
  const power = (n: number) =>
    Array.from({ length: n }).reduce<Rational>(
      (v) => canonical(m(v, at)),
      q(1),
    );
  return p.map((_, j) =>
    p
      .slice(j)
      .reduce(
        (sum, c, index) =>
          canonical(a(sum, m(c, m(q(choose(index + j, j)), power(index))))),
        q(0),
      ),
  );
}
export function referencePointLimit(
  top: Polynomial,
  bottom: Polynomial,
  at: Rational,
  side: "both" | "left" | "right",
): LimitValue {
  const first = (p: Polynomial) =>
    referenceShift(p, at)
      .map((v, i) => ({ v, i }))
      .find((t) => t.v.numerator !== 0n);
  const n = first(top),
    den = first(bottom);
  if (!den) throw new Error("Reference zero denominator");
  if (!n || n.i > den.i) return { kind: "finite", value: q(0) };
  const quotient = canonical(d(n.v, den.v));
  if (n.i === den.i) return { kind: "finite", value: quotient };
  const odd = (den.i - n.i) % 2 !== 0;
  if (side === "both" && odd) return { kind: "does-not-exist" };
  const sign =
    (quotient.numerator > 0n ? 1 : -1) * (side === "left" && odd ? -1 : 1);
  return { kind: sign > 0 ? "positive-infinity" : "negative-infinity" };
}
