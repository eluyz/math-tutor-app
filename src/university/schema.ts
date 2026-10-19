import type { Matrix } from "../matrices";
import type { Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { CategoryId } from "../exercises";
import type { Locale } from "../locales/types";
import type { Polynomial, PolynomialFormula } from "./polynomial";

export type SystemProblem = Readonly<{
  kind: "system";
  coefficients: Matrix;
  rhs: readonly Rational[];
  method: "substitution" | "elimination" | "classification" | "cramer";
  coordinates?: "sum-difference" | "triangular";
  shifts?: readonly Rational[];
}>;
export type FunctionProblem =
  | Readonly<{
      kind: "function-value";
      numerator: Polynomial;
      denominator: Polynomial;
      at: Rational;
      inner?: Polynomial;
      difference?: boolean;
    }>
  | Readonly<{
      kind: "function-domain";
      mode:
        | "all"
        | "one-pole"
        | "two-poles"
        | "root-ray"
        | "root-over-linear"
        | "root-over-two"
        | "root-ratio";
      p: Rational;
      q: Rational;
      r: Rational;
      sign: Rational;
    }>
  | Readonly<{
      kind: "function-zeros";
      formula: PolynomialFormula;
      denominator: Polynomial;
    }>
  | Readonly<{
      kind: "function-linear";
      points: readonly [Rational, Rational, Rational, Rational];
      known?: Polynomial;
      relation?: "sum" | "composition";
    }>
  | Readonly<{ kind: "function-monotonicity"; formula: PolynomialFormula }>
  | Readonly<{
      kind: "function-shape";
      formula: PolynomialFormula;
      target: "vertex" | "range";
    }>
  | Readonly<{
      kind: "function-composition";
      outer: Polynomial;
      inner: Polynomial;
      commutator: boolean;
    }>;
export type RationalExpression =
  | Readonly<{ kind: "ratio"; numerator: Polynomial; denominator: Polynomial }>
  | Readonly<{
      kind: "difference" | "product";
      left: RationalExpression;
      right: RationalExpression;
    }>;
export type GeometricTerm = Readonly<{ coefficient: Rational; base: Rational }>;
export type SequenceProblem =
  | Readonly<{ kind: "sequence-rational"; expression: RationalExpression }>
  | Readonly<{
      kind: "sequence-geometric";
      terms: readonly GeometricTerm[];
      denominator?: readonly GeometricTerm[];
    }>
  | Readonly<{
      kind: "sequence-conjugate";
      mode: "basic" | "scaled" | "multiply" | "second-order";
      a: Rational;
      b: Rational;
      k: Rational;
    }>;
export type FunctionLimitProblem =
  | Readonly<{
      kind: "limit-conjugate";
      at: Rational;
      s: Rational;
      k: Rational;
      b: Rational;
      c: Rational;
      mode: "linear" | "quadratic" | "second-order" | "two-roots";
    }>
  | Readonly<{
      kind: "limit-point";
      numerator: PolynomialFormula;
      denominator: Polynomial;
      at: Rational;
      side: "both" | "left" | "right";
      definedAt?: Rational;
    }>
  | Readonly<{
      kind: "limit-infinity";
      expression: RationalExpression;
      direction: "positive" | "negative";
    }>;
export type DerivativeProblem =
  | Readonly<{
      kind: "derivative";
      formula: PolynomialFormula;
      target: "formula" | "point" | "tangent";
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-analysis";
      formula: PolynomialFormula;
      target: "stationary" | "classification" | "positive" | "negative";
    }>
  | Readonly<{
      kind: "derivative-economics";
      cost: PolynomialFormula;
      revenue: PolynomialFormula;
      target: "cost" | "revenue" | "profit";
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-rational";
      numerator: PolynomialFormula;
      denominator: Polynomial;
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-maximum";
      profit: PolynomialFormula;
      cost?: PolynomialFormula;
      revenue?: PolynomialFormula;
      cap: Rational;
    }>;
export type UniversityProblem =
  | SystemProblem
  | FunctionProblem
  | SequenceProblem
  | FunctionLimitProblem
  | DerivativeProblem;
export const isFunctionProblem = (p: UniversityProblem): p is FunctionProblem =>
  p.kind.startsWith("function-");
export type UniversityFamily = Readonly<{
  id: string;
  category: CategoryId;
  titles: Record<Locale, string>;
  supportedDifficulties: readonly Difficulty[];
  create: (variant: number, difficulty: Difficulty) => UniversityProblem;
}>;
