import type { Rational } from "../rational";
export type Operator = "sum" | "difference" | "product" | "quotient";
export type Expression = { kind: "value"; value: Rational } | { kind: "variable" }
  | { kind: "binary"; operator: Operator; left: Expression; right: Expression }
  | { kind: "power"; base: Expression; exponent: number };
export type MatrixExpression = { kind: "input"; name: string }
  | { kind: "transpose"; input: MatrixExpression }
  | { kind: "scale"; scalar: Rational; input: MatrixExpression }
  | { kind: "sum" | "difference" | "product"; left: MatrixExpression; right: MatrixExpression };
export type MathProblem =
  | { kind: "numeric"; expression: Expression }
  | { kind: "polynomial"; expression: Expression; at?: Rational }
  | { kind: "linear"; left: Expression; right: Expression }
  | { kind: "quadratic"; left: Expression; right: Expression; target: "delta" | "roots"; factor?: boolean }
  | { kind: "monomial"; a: Rational; b: Rational; c: Rational; d: Rational; p: number; q: number; s: number; combined: boolean }
  | { kind: "matrix" | "determinant"; expression: MatrixExpression };
