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
export type UniversityProblem =
  | SystemProblem
  | FunctionProblem
  | SequenceProblem;
export type UniversityFamily = Readonly<{
  id: string;
  category: CategoryId;
  titles: Record<Locale, string>;
  supportedDifficulties: readonly Difficulty[];
  create: (variant: number, difficulty: Difficulty) => UniversityProblem;
}>;
