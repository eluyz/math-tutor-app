import { mathCopy } from "../locales/math";
import type { Locale } from "../locales/types";
import {
  rational as r,
  subtractRational as sub,
  multiplyRational as mul,
  equalRational as eq,
  type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import {
  calculate,
  calculationText,
  type Solution,
  type SolutionStep,
  type Calculation,
} from "../solutions/types";
import {
  addMatrices,
  subtractMatrices,
  multiplyMatrices,
  scaleMatrix,
  transposeMatrix,
  type Matrix,
} from "../matrices";
import type {
  Expression,
  MatrixExpression,
  MathProblem,
  Operator,
} from "./schema";
export const val = (n: number, d = 1): Expression => ({
  kind: "value",
  value: r(n, d),
});
export const variable: Expression = { kind: "variable" };
export const binary = (
  operator: Operator,
  left: Expression,
  right: Expression,
): Expression => ({ kind: "binary", operator, left, right });
export const sum = (a: Expression, b: Expression) => binary("sum", a, b);
export const difference = (a: Expression, b: Expression) =>
  binary("difference", a, b);
export const product = (a: Expression, b: Expression) =>
  binary("product", a, b);
export const quotient = (a: Expression, b: Expression) =>
  binary("quotient", a, b);
export const power = (base: Expression, exponent = 2): Expression => ({
  kind: "power",
  base,
  exponent,
});
export const affine = (a: Expression, b: Expression) =>
  sum(product(a, variable), b);
const signs = { sum: "+", difference: "−", product: "×", quotient: "÷" };
export function expressionText(e: Expression): string {
  switch (e.kind) {
    case "variable":
      return "x";
    case "value":
      return `(${f(e.value)})`;
    case "power":
      return `(${expressionText(e.base)})^${e.exponent}`;
    case "binary":
      return `(${expressionText(e.left)} ${signs[e.operator]} ${expressionText(e.right)})`;
  }
}
export function matrixExpressionText(e: MatrixExpression): string {
  switch (e.kind) {
    case "input":
      return e.name;
    case "transpose":
      return `(${matrixExpressionText(e.input)})ᵀ`;
    case "scale":
      return `(${f(e.scalar)})·(${matrixExpressionText(e.input)})`;
    default:
      return `(${matrixExpressionText(e.left)} ${signs[e.kind]} ${matrixExpressionText(e.right)})`;
  }
}
export function derive(
  problem: MathProblem,
  matrices: readonly { label: string; values: Matrix }[] = [],
  locale: Locale = "pl",
): { answer: AnswerSpec; solution: Solution; explanation: string } {
  const copy = mathCopy[locale];
  const steps: SolutionStep[] = [];
  const work = (
    [action, reason]: readonly [string, string],
    ...calculations: Calculation[]
  ) => {
    steps.push({ kind: "working", action, reason, calculations });
  };
  function numeric(e: Expression, at?: Rational): Rational {
    if (e.kind === "value") return e.value;
    if (e.kind === "variable") {
      if (!at) throw new Error("Missing substitution");
      return at;
    }
    if (e.kind === "power") {
      const base = numeric(e.base, at),
        c = calculate(
          "product",
          ...Array.from({ length: e.exponent }, () => base),
        );
      work(copy.power(expressionText(e)), c);
      return c.result;
    }
    const c = calculate(e.operator, numeric(e.left, at), numeric(e.right, at));
    work(copy.numeric(expressionText(e), e.operator), c);
    return c.result;
  }
  function polynomial(e: Expression): Rational[] {
    if (e.kind === "value") return [e.value];
    if (e.kind === "variable") return [r(0), r(1)];
    if (e.kind === "power") {
      if (e.exponent !== 2)
        throw new Error("Only square expansion is used here");
      const base = polynomial(e.base);
      return combine("product", base, base, expressionText(e));
    }
    return combine(
      e.operator,
      polynomial(e.left),
      polynomial(e.right),
      expressionText(e),
    );
  }
  function combine(
    op: Operator,
    a: Rational[],
    b: Rational[],
    text: string,
  ): Rational[] {
    if (op === "quotient" && (b.length !== 1 || eq(b[0], r(0))))
      throw new Error("Polynomial division requires a nonzero constant");
    const length =
      op === "product"
        ? a.length + b.length - 1
        : op === "quotient"
          ? a.length
          : Math.max(a.length, b.length);
    return Array.from({ length }, (_, n) => {
      const terms =
        op === "product"
          ? a.flatMap((v, i) =>
              n - i >= 0 && n - i < b.length
                ? [calculate("product", v, b[n - i])]
                : [],
            )
          : [];
      const c =
        op === "product"
          ? terms.length === 1
            ? terms[0]
            : calculate("sum", ...terms.map((v) => v.result))
          : calculate(op, a[n] ?? r(0), b[op === "quotient" ? 0 : n] ?? r(0));
      work(
        copy.coefficient(n, text, op),
        ...(op === "product" && terms.length > 1 ? terms : []),
        c,
      );
      return c.result;
    });
  }
  function matrix(e: MatrixExpression): Matrix {
    if (e.kind === "input") {
      const value = matrices.find((m) => m.label === e.name);
      if (!value) throw new Error("Missing matrix");
      return value.values;
    }
    const text = matrixExpressionText(e);
    if (e.kind === "transpose") {
      const a = matrix(e.input),
        result = transposeMatrix(a);
      work(
        copy.transpose(
          matrixExpressionText(e.input),
          `${a.length}×${a[0].length} → ${result.length}×${result[0].length}`,
        ),
      );
      result.forEach((row, i) =>
        row.forEach((v, j) =>
          work(
            copy.transposedCell(
              `c(${i + 1},${j + 1}) = a(${j + 1},${i + 1}) = ${f(v)}`,
            ),
          ),
        ),
      );
      return result;
    }
    const a = e.kind === "scale" ? matrix(e.input) : matrix(e.left);
    const b = e.kind === "scale" ? undefined : matrix(e.right);
    const result =
      e.kind === "scale"
        ? scaleMatrix(a, e.scalar)
        : e.kind === "sum"
          ? addMatrices(a, b!)
          : e.kind === "difference"
            ? subtractMatrices(a, b!)
            : multiplyMatrices(a, b!);
    work(
      copy.matrix(
        text,
        `${result.length}×${result[0].length}`,
        e.kind === "product" ? a[0].length : undefined,
      ),
    );
    result.forEach((row, i) =>
      row.forEach((_, j) => {
        if (e.kind === "product") {
          const products = a[i].map((v, k) =>
            calculate("product", v, b![k][j]),
          );
          work(
            copy.productCell(text, i + 1, j + 1),
            ...products,
            calculate("sum", ...products.map((p) => p.result)),
          );
        } else
          work(
            copy.cell(text, i + 1, j + 1, e.kind === "scale"),
            e.kind === "scale"
              ? calculate("product", e.scalar, a[i][j])
              : calculate(e.kind, a[i][j], b![i][j]),
          );
      }),
    );
    return result;
  }
  function determinant(a: Matrix): Rational {
    if (a.length === 2) {
      const ad = calculate("product", a[0][0], a[1][1]),
        bc = calculate("product", a[0][1], a[1][0]);
      work(copy.det2, ad, bc, calculate("difference", ad.result, bc.result));
      return sub(ad.result, bc.result);
    }
    const permutations = [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
      [0, 2, 1],
      [1, 0, 2],
    ];
    const products = permutations.map((js, k) => {
      const c = calculate("product", ...js.map((j, i) => a[i][j]));
      work(
        copy.sarrus(k, js.map((j, i) => `a(${i + 1},${j + 1})`).join("·")),
        c,
      );
      return c.result;
    });
    const positive = calculate("sum", ...products.slice(0, 3)),
      negative = calculate("sum", ...products.slice(3)),
      result = calculate("difference", positive.result, negative.result);
    work(copy.det3, positive, negative, result);
    return result.result;
  }
  function roots(a: Rational, b: Rational, c: Rational): Rational[] {
    const bs = calculate("product", b, b),
      fourac = calculate("product", r(4), a, c),
      delta = calculate("difference", bs.result, fourac.result);
    work(copy.delta(f(a), f(b), f(c)), bs, fourac, delta);
    if (delta.result.numerator < 0n) {
      work(copy.noRoots);
      return [];
    }
    const denominator = mul(r(2), a),
      negativeB = mul(r(-1), b);
    if (!delta.result.numerator) {
      const root = calculate("quotient", negativeB, denominator);
      work(copy.doubleRoot, root);
      return [root.result];
    }
    const sqrt = (n: bigint) => {
      let lo = 0n,
        hi = n + 1n;
      while (hi - lo > 1n) {
        const m = (lo + hi) / 2n;
        if (m * m <= n) lo = m;
        else hi = m;
      }
      if (lo * lo !== n) throw new Error("Irrational root outside scope");
      return lo;
    };
    const square = r(
      sqrt(delta.result.numerator),
      sqrt(delta.result.denominator),
    );
    work(copy.sqrt(f(square)), calculate("product", square, square));
    return ["difference", "sum"].map((op) => {
      const numerator = calculate(op as Operator, negativeB, square),
        root = calculate("quotient", numerator.result, denominator);
      work(copy.root(op === "difference"), numerator, root);
      return root.result;
    });
  }
  let answer: AnswerSpec;
  const coefficients = (p: Rational[]): AnswerSpec => ({
    kind: "list",
    labels: p.length === 2 ? copy.coefficients.slice(1) : copy.coefficients,
    values: [...p].reverse(),
  });
  switch (problem.kind) {
    case "numeric":
      answer = { kind: "scalar", value: numeric(problem.expression) };
      break;
    case "polynomial":
      if (problem.at) {
        work(copy.substitute(f(problem.at)));
        answer = {
          kind: "scalar",
          value: numeric(problem.expression, problem.at),
        };
      } else answer = coefficients(polynomial(problem.expression));
      break;
    case "linear": {
      const standard = combine(
        "difference",
        polynomial(problem.left),
        polynomial(problem.right),
        copy.differenceSides,
      );
      if (standard.length !== 2 || eq(standard[1], r(0)))
        throw new Error("Unique linear solution required");
      const root = calculate("quotient", mul(r(-1), standard[0]), standard[1]);
      work(copy.linear(f(standard[1]), f(mul(r(-1), standard[0]))), root);
      answer = { kind: "scalar", value: root.result };
      break;
    }
    case "quadratic": {
      const standard = combine(
        "difference",
        polynomial(problem.left),
        polynomial(problem.right),
        copy.differenceSides,
      );
      if (standard.length !== 3 || eq(standard[2], r(0)))
        throw new Error("Quadratic required");
      work(copy.standard(f(standard[2]), f(standard[1]), f(standard[0])));
      if (problem.factor) work(copy.factor);
      const values = roots(standard[2], standard[1], standard[0]);
      answer =
        problem.target === "roots"
          ? { kind: "roots", values }
          : {
              kind: "scalar",
              value: sub(
                mul(standard[1], standard[1]),
                mul(r(4), mul(standard[2], standard[0])),
              ),
            };
      break;
    }
    case "monomial": {
      const first = calculate("product", problem.a, problem.b),
        coefficient = calculate("quotient", first.result, problem.c),
        exponent = problem.p + problem.q - problem.s;
      work(copy.monomialProduct, first);
      work(copy.monomialDivide(f(problem.c)), coefficient);
      work(
        copy.exponents(problem.p, problem.q, problem.s, exponent),
        calculate("sum", r(problem.p), r(problem.q)),
        calculate("difference", r(problem.p + problem.q), r(problem.s)),
      );
      let result = coefficient.result;
      if (problem.combined) {
        const combined = calculate("sum", result, problem.d);
        work(copy.likeTerms, combined);
        result = combined.result;
      }
      answer = {
        kind: "list",
        labels: copy.monomialLabels,
        values: [result, r(exponent)],
      };
      break;
    }
    default: {
      const value = matrix(problem.expression);
      answer =
        problem.kind === "matrix"
          ? { kind: "matrix", values: value }
          : { kind: "scalar", value: determinant(value) };
    }
  }
  const end: SolutionStep = {
    kind: "answer",
    action: copy.final[0],
    reason: copy.final[1],
    answer,
  };
  if (!steps.length) throw new Error("Missing working");
  const solution: Solution = [steps[0], ...steps.slice(1), end];
  const explanation = steps
    .map((s) =>
      s.kind === "working"
        ? `${s.action}. ${s.reason}\n${s.calculations.map(calculationText).join("\n")}`
        : "",
    )
    .join("\n");
  return { answer, solution, explanation };
}
