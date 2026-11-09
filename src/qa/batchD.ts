import type { makeUniversityTask } from "../university/catalog";
import { formatRational as f, type AnswerInput } from "../answers";
import { parseAnswer } from "../rational";
import { r, add, sub, mul, div, eq, determinant, inverse, rank, affineSystem, product, combine, transpose, scale, same, identity, requireMath, type Matrix } from "./batchDMath";

export const batchD = [
  { block: "D1", skill: "M03", family: "matrix-rectangular-evaluation", level: "medium", variants: [0, 1, 2] },
  { block: "D1", skill: "M03", family: "matrix-transpose-dimensions", level: "hard", variants: [0, 4] },
  { block: "D1", skill: "M04", family: "matrix-composite-operations", level: "advanced", variants: [0, 1] },
  { block: "D1", skill: "M04", family: "matrix-negative-square-three", level: "hard", variants: [0] },
  { block: "D1", skill: "M05", family: "matrix-axb-three", level: "hard", variants: [0, 1] },
  { block: "D1", skill: "M05", family: "matrix-coupled-equations", level: "expert", variants: [0, 1] },
  { block: "D1", skill: "M06", family: "determinant-radical-two", level: "hard", variants: [0, 1] },
  { block: "D1", skill: "M11", family: "determinant-properties", level: "medium", variants: [0] },
  { block: "D1", skill: "M11", family: "determinant-properties", level: "expert", variants: [0, 1, 2] },
  { block: "D2", skill: "M09", family: "determinant-gaussian-pivot-four", level: "advanced", variants: [0, 1] },
  { block: "D2", skill: "M10", family: "determinant-gaussian-pivot-five", level: "expert", variants: [0, 1] },
  { block: "D2", skill: "M10", family: "determinant-dense-five", level: "advanced", variants: [0] },
  { block: "D2", skill: "M12", family: "inverse-four-gauss-jordan", level: "advanced", variants: [0, 1] },
  { block: "D2", skill: "M13", family: "inverse-four-xa-equation", level: "expert", variants: [0, 1] },
  { block: "D2", skill: "M13", family: "inverse-four-ax-equation", level: "hard", variants: [0, 1] },
  { block: "D2", skill: "M14", family: "matrix-rank-four-rectangular", level: "expert", variants: [0, 1, 4] },
  { block: "D2", skill: "M14", family: "matrix-rank-six-three", level: "hard", variants: [0, 2] },
  { block: "D3", skill: "U01", family: "cramer-applicability", level: "hard", variants: [0, 1, 2] },
  { block: "D3", skill: "U03", family: "cramer-four-singular-minors", level: "hard", variants: [0, 1, 2] },
  { block: "D3", skill: "U03", family: "cramer-four-forced-pivot", level: "hard", variants: [0] },
  { block: "D3", skill: "U06", family: "gauss-four-dependent-diagnostic", level: "expert", variants: [0, 1, 2] },
  { block: "D3", skill: "U07", family: "gauss-four-forced-pivot", level: "hard", variants: [1] },
  { block: "D3", skill: "U08", family: "gauss-parameters-two", level: "expert", variants: [0, 1] },
  { block: "D3", skill: "U08", family: "gauss-rectangular-2x3-parameters", level: "advanced", variants: [0] },
] as const;

type Task = ReturnType<typeof makeUniversityTask>;
const matrixInput = (value: Matrix): AnswerInput => ({ kind: "matrix", values: value.map(row => row.map(f)) });
const invert = (a: Matrix) => { const value = inverse(a); requireMath(value !== null, "invertible input required"); return value; };

/** Only original problem parameters are read. No answer field or application
 * determinant/inverse/rank/system solver is used by this oracle. */
export function batchDOracle(task: Task): AnswerInput {
  const p = task.university;
  if (p.kind === "linear-matrix-practice") {
    const [A, B, C] = p.matrices.map(item => item.values);
    const evaluate = (): Matrix => {
      switch (p.expression) {
        case "AB+C": return combine(product(A, B), C);
        case "(A+B)C": return product(combine(A, B), C);
        case "A(B−C)": return product(A, combine(B, C, r(-1)));
        case "(AB)ᵀ−C": return combine(transpose(product(A, B)), C, r(-1));
        case "(AB)ᵀ−(3/2)C": return combine(transpose(product(A, B)), C, r(-3, 2));
        case "Aᵀ(B+C)": return product(transpose(A), combine(B, C));
        case "(AB)ᵀ+C": return combine(transpose(product(A, B)), C);
        case "ABᵀ+C": return combine(product(A, transpose(B)), C);
        case "(A+Bᵀ)C": return product(combine(A, transpose(B)), C);
        default: throw Error("Uncovered matrix expression: " + p.expression);
      }
    };
    if (p.mode === "transpose-dimensions") {
      try { const out = evaluate(); return { kind: "choice", value: `${out.length}x${out[0].length}` }; }
      catch (error) {
        if (error instanceof Error && error.message.includes("incompatible")) return { kind: "choice", value: "not-possible" };
        throw error;
      }
    }
    return matrixInput(evaluate());
  }
  if (p.kind === "matrix-negative-square-three") {
    const inv = invert(p.A), result = product(inv, inv), squared = product(p.A, p.A);
    requireMath(same(product(squared, result), identity(3)) && same(product(result, squared), identity(3)), "negative square identity on both sides");
    return matrixInput(result);
  }
  if (p.kind === "linear-matrix-equation" && p.mode === "axb") {
    const x = product(product(invert(p.left), p.rhs), invert(p.right));
    requireMath(same(product(product(p.left, x), p.right), p.rhs), "AXB must reconstruct C");
    return matrixInput(x);
  }
  if (p.kind === "linear-matrix-pair") {
    const [a, b, c, d] = p.coefficients, det = sub(mul(a, d), mul(b, c));
    const X = scale(combine(scale(p.first, d), scale(p.second, b), r(-1)), div(r(1), det));
    const Y = scale(combine(scale(p.second, a), scale(p.first, c), r(-1)), div(r(1), det));
    requireMath(same(combine(scale(X, a), scale(Y, b)), p.first) && same(combine(scale(X, c), scale(Y, d)), p.second), "both coupled matrix equations");
    return { kind: "list", values: [...X.flat(), ...Y.flat()].map(f) };
  }
  if (p.kind === "determinant-radical-two") {
    // Independently evaluate each product using its own root. The original
    // family has one global radicand; M06 mixed-root exercises supply entry-local
    // radicands without changing this problem kind.
    const effectiveRoot = (cell: { radicand?: number }) => cell.radicand ?? p.radicand;
    const pair = (x: { whole: number; root: number; radicand?: number },
      y: { whole: number; root: number; radicand?: number }) => {
      requireMath(effectiveRoot(x) === effectiveRoot(y), "unmatched radical factors");
      return [
        add(mul(r(x.whole), r(y.whole)), mul(r(effectiveRoot(x)), mul(r(x.root), r(y.root)))),
        add(mul(r(x.whole), r(y.root)), mul(r(x.root), r(y.whole))),
      ];
    };
    const [[a, b], [c, d]] = p.matrix;
    const ad = pair(a, d), bc = pair(b, c);
    if (effectiveRoot(a) === effectiveRoot(b))
      requireMath(sub(ad[1], bc[1]).numerator === 0n, "irrational parts cancel exactly");
    else
      requireMath(ad[1].numerator === 0n && bc[1].numerator === 0n,
        "distinct radical coefficients must cancel separately");
    return f(sub(ad[0], bc[0]));
  }
  if (p.kind === "determinant") {
    const value = determinant(p.matrix);
    if (p.dependentRows) requireMath(value.numerator === 0n && rank(p.dependentRows.map(i => p.matrix[i])) <= 1, "claimed proportional rows and zero determinant");
    return f(value);
  }
  if (p.kind === "linear-inverse") {
    const value = inverse(p.matrix);
    if (value === null) {
      requireMath(rank(p.matrix) < p.matrix.length, "singularity by independent minors");
      return { kind: "choice", value: "inverse-no" };
    }
    return matrixInput(value);
  }
  if (p.kind === "linear-application") {
    const inv = invert(p.matrix), x = p.method === "xa" ? product(p.rhs, inv) : product(inv, p.rhs);
    requireMath(same(p.method === "xa" ? product(x, p.matrix) : product(p.matrix, x), p.rhs), "original matrix equation and multiplication order");
    return matrixInput(x);
  }
  if (p.kind === "linear-rank") return f(r(rank(p.matrix)));
  if (p.kind === "linear-system" || p.kind === "linear-cramer-diagnostic" || p.kind === "linear-cramer-four") {
    const result = affineSystem(p.matrix, p.rhs), n = p.matrix[0].length;
    if (p.kind === "linear-cramer-diagnostic" || p.kind === "linear-cramer-four") {
      const D = determinant(p.matrix);
      requireMath((D.numerator !== 0n) === (result.classification === "system-one"), "Cramer eligibility from determinant and independent ranks");
      const minors = Array.from({ length: n }, (_, j) => determinant(p.matrix.map((row, i) => row.map((x, k) => k === j ? p.rhs[i] : x))));
      if (D.numerator) {
        const x = minors.map(value => div(value, D));
        requireMath(same(product(p.matrix, x.map(value => [value])), p.rhs.map(value => [value])), "Cramer ratios satisfy every original equation");
        requireMath(x.every((value, j) => eq(value, result.coefficients[j][0])), "Cramer and independent minor-basis solutions agree");
        if (p.kind === "linear-cramer-four") return { kind: "system", classification: "system-one", values: x.map(f) };
      } else if (result.classification === "system-many") requireMath(minors.every(value => value.numerator === 0n), "singular consistent Cramer minors all vanish");
      else if (result.rankA === n - 1) requireMath(minors.some(value => value.numerator !== 0n), "rank n-1 contradiction has a nonzero replaced determinant");
      if (p.kind === "linear-cramer-diagnostic" && p.target === "minors") return { kind: "list", values: [D, ...minors].map(f) };
      return { kind: "choice", value: result.classification };
    }
    if (p.method === "parameters") {
      requireMath(result.classification === "system-many", "parameter task is consistent and underdetermined");
      return { kind: "list", values: result.coefficients.flat().map(f) };
    }
    if (p.method === "classification" || result.classification !== "system-one") return { kind: "choice", value: result.classification };
    return { kind: "system", classification: "system-one", values: result.coefficients.map(row => f(row[0])) };
  }
  throw Error("Uncovered Batch D form: " + p.kind);
}

export function wrongBatchDAnswer(correct: AnswerInput, task: Task): AnswerInput {
  const changed = (value: string) => {
    const parsed = parseAnswer(value);
    requireMath(parsed.kind === "valid", "oracle returned an exact rational string");
    return f(add(parsed.value, r(1)));
  };
  if (typeof correct === "string") return changed(correct);
  if (correct.kind === "matrix") return { kind: "matrix", values: correct.values.map((row, i) => row.map((v, j) => i === 0 && j === 0 ? changed(v) : v)) };
  if (correct.kind === "list") return { kind: "list", values: [changed(correct.values[0]), ...correct.values.slice(1)] };
  if (correct.kind === "system") return correct.classification === "system-one"
    ? { ...correct, values: [changed(correct.values[0]), ...correct.values.slice(1)] }
    : { kind: "system", classification: "system-one", values: task.university.kind === "linear-system" ? task.university.matrix[0].map(() => "0") : [] };
  if (correct.kind === "choice") {
    // All selected choices below have at least two valid classifications.
    const value = correct.value.startsWith("system-") ? (correct.value === "system-none" ? "system-many" : "system-none")
      : correct.value.startsWith("inverse-") ? (correct.value === "inverse-no" ? "inverse-yes" : "inverse-no")
      : correct.value === "not-possible" ? "2x2" : "not-possible";
    return { kind: "choice", value };
  }
  throw Error("Unsupported Batch D input");
}
