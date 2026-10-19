import {
  rational as r,
  addRational as add,
  multiplyRational as mul,
  subtractRational as sub,
  divideRational as div,
  type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import { calculate, type Calculation } from "../solutions/types";

/** Ascending coefficients: constant, x, x², ... . No symbolic string parser. */
export type Polynomial = readonly Rational[];
export type PolynomialFormula =
  | { kind: "polynomial"; coefficients: Polynomial }
  | { kind: "composition"; outer: Polynomial; inner: Polynomial }
  | { kind: "difference"; left: PolynomialFormula; right: PolynomialFormula }
  | { kind: "vertex"; a: Rational; h: Rational; k: Rational };
export const zero = (v: Rational) => v.numerator === 0n;
export function trim(p: Polynomial): Rational[] {
  const values = [...p];
  while (values.length > 1 && zero(values.at(-1)!)) values.pop();
  return values.length ? values : [r(0)];
}
function result(
  operation: Calculation["operation"],
  x: Rational,
  y: Rational,
  trace?: Calculation[],
): Rational {
  const calculation = calculate(operation, x, y);
  trace?.push(calculation);
  return calculation.result;
}
export function polynomialSum(
  a: Polynomial,
  b: Polynomial,
  subtract = false,
  trace?: Calculation[],
): Rational[] {
  return trim(
    Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
      result(
        subtract ? "difference" : "sum",
        a[i] ?? r(0),
        b[i] ?? r(0),
        trace,
      ),
    ),
  );
}
export function polynomialProduct(
  a: Polynomial,
  b: Polynomial,
  trace?: Calculation[],
): Rational[] {
  const out = Array.from({ length: a.length + b.length - 1 }, () => r(0));
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) {
      const product = result("product", a[i], b[j], trace);
      out[i + j] = result("sum", out[i + j], product, trace);
    }
  return trim(out);
}
export function polynomialComposition(
  outer: Polynomial,
  inner: Polynomial,
  trace?: Calculation[],
): Rational[] {
  let value: Polynomial = [r(0)];
  for (let i = outer.length - 1; i >= 0; i--)
    value = polynomialSum(
      polynomialProduct(value, inner, trace),
      [outer[i]],
      false,
      trace,
    );
  return trim(value);
}
export function polynomialValue(
  p: Polynomial,
  at: Rational,
  trace?: Calculation[],
): Rational {
  let value = r(0);
  for (let i = p.length - 1; i >= 0; i--)
    value = result("sum", result("product", value, at, trace), p[i], trace);
  return value;
}
export const powerLabel = (i: number, variable = "x") =>
  i === 0
    ? "1"
    : i === 1
      ? variable
      : `${variable}${["", "", "²", "³", "⁴", "⁵", "⁶"][i] ?? `^${i}`}`;
export function polynomialText(p: Polynomial, variable = "x"): string {
  return (
    p
      .map((v, i) =>
        zero(v) ? "" : i ? `(${f(v)})·${powerLabel(i, variable)}` : `(${f(v)})`,
      )
      .reverse()
      .filter(Boolean)
      .join(" + ") || "0"
  );
}
export function formulaText(p: PolynomialFormula): string {
  if (p.kind === "polynomial") return polynomialText(p.coefficients);
  if (p.kind === "vertex")
    return `(${f(p.a)})·(x − (${f(p.h)}))² + (${f(p.k)})`;
  if (p.kind === "composition")
    return polynomialText(p.outer, `(${polynomialText(p.inner)})`);
  return `(${formulaText(p.left)}) − (${formulaText(p.right)})`;
}
export function expandFormula(
  p: PolynomialFormula,
  trace?: Calculation[],
): Polynomial {
  if (p.kind === "polynomial") return trim(p.coefficients);
  if (p.kind === "vertex")
    return polynomialSum(
      polynomialProduct(
        [p.a],
        polynomialProduct(
          [sub(r(0), p.h), r(1)],
          [sub(r(0), p.h), r(1)],
          trace,
        ),
        trace,
      ),
      [p.k],
      false,
      trace,
    );
  if (p.kind === "composition")
    return polynomialComposition(p.outer, p.inner, trace);
  return polynomialSum(
    expandFormula(p.left, trace),
    expandFormula(p.right, trace),
    true,
    trace,
  );
}
function integerRoot(value: bigint): bigint {
  if (value < 0n) throw new Error("Negative radicand");
  if (value < 2n) return value;
  let x = 1n << BigInt(Math.ceil(value.toString(2).length / 2));
  let next = (x + value / x) / 2n;
  while (next < x) {
    x = next;
    next = (x + value / x) / 2n;
  }
  if (x * x !== value) throw new Error("A rational root was required");
  return x;
}
export function exactSquareRoot(value: Rational): Rational {
  return r(integerRoot(value.numerator), integerRoot(value.denominator));
}
export function polynomialRoots(p: Polynomial): Rational[] {
  const values = trim(p),
    [c, b = r(0), a = r(0)] = values;
  if (values.length > 3 || (values.length === 1 && zero(c)))
    throw new Error("Unsupported root set");
  if (values.length === 1) return [];
  if (values.length === 2) return [div(sub(r(0), c), b)];
  const delta = sub(mul(b, b), mul(r(4), mul(a, c)));
  if (delta.numerator < 0n) return [];
  const sqrt = exactSquareRoot(delta),
    negativeB = sub(r(0), b),
    divisor = mul(r(2), a);
  return zero(delta)
    ? [div(negativeB, divisor)]
    : [div(sub(negativeB, sqrt), divisor), div(add(negativeB, sqrt), divisor)];
}
