import { addRational as add, subtractRational as sub, multiplyRational as mul, rational as r, type Rational } from "./rational";

export type Matrix = readonly (readonly Rational[])[];

export function matrixShape(matrix: Matrix): { rows: number; columns: number } {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  if (rows < 1 || rows > 3 || columns < 1 || columns > 3 || matrix.some((row) => row.length !== columns))
    throw new Error("Matrix must be rectangular, from 1×1 to 3×3");
  if (matrix.some((row) => row.some((v) => typeof v.numerator !== "bigint" || typeof v.denominator !== "bigint" || v.denominator <= 0n)))
    throw new Error("Invalid rational matrix entry");
  return { rows, columns };
}

function sameShape(a: Matrix, b: Matrix) {
  const left = matrixShape(a), right = matrixShape(b);
  if (left.rows !== right.rows || left.columns !== right.columns) throw new Error("Incompatible matrix dimensions");
}

export function addMatrices(a: Matrix, b: Matrix): Matrix {
  sameShape(a, b);
  return a.map((row, i) => row.map((v, j) => add(v, b[i][j])));
}
export function subtractMatrices(a: Matrix, b: Matrix): Matrix {
  sameShape(a, b);
  return a.map((row, i) => row.map((v, j) => sub(v, b[i][j])));
}
export function scaleMatrix(a: Matrix, scalar: Rational): Matrix {
  matrixShape(a);
  return a.map((row) => row.map((v) => mul(v, scalar)));
}
export function transposeMatrix(a: Matrix): Matrix {
  const { columns } = matrixShape(a);
  return Array.from({ length: columns }, (_, j) => a.map((row) => row[j]));
}
export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  const left = matrixShape(a), right = matrixShape(b);
  if (left.columns !== right.rows) throw new Error("Inner matrix dimensions must agree");
  return a.map((row) => Array.from({ length: right.columns }, (_, j) =>
    row.reduce((sum, v, k) => add(sum, mul(v, b[k][j])), r(0))));
}

export function sarrusProducts(a: Matrix): { positive: Rational[]; negative: Rational[] } {
  const shape = matrixShape(a);
  if (shape.rows !== 3 || shape.columns !== 3) throw new Error("Sarrus requires 3×3");
  const product = (i: number, j: number, k: number) => mul(mul(a[0][i], a[1][j]), a[2][k]);
  return { positive: [product(0, 1, 2), product(1, 2, 0), product(2, 0, 1)],
    negative: [product(2, 1, 0), product(0, 2, 1), product(1, 0, 2)] };
}

export function determinant(a: Matrix): Rational {
  const { rows, columns } = matrixShape(a);
  if (rows !== columns || (rows !== 2 && rows !== 3)) throw new Error("Determinant requires 2×2 or 3×3");
  if (rows === 2) return sub(mul(a[0][0], a[1][1]), mul(a[0][1], a[1][0]));
  const products = sarrusProducts(a);
  return sub(products.positive.reduce(add, r(0)), products.negative.reduce(add, r(0)));
}
