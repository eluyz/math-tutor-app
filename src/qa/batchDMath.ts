import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq, type Rational } from "../rational";

export { r, add, sub, mul, div, eq };
export type Matrix = readonly (readonly Rational[])[];
export function requireMath(condition: boolean, message: string): asserts condition {
  if (!condition) throw Error("Independent Batch D check: " + message);
}
export const identity = (n: number): Rational[][] => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => r(i === j ? 1 : 0)));
export const same = (a: Matrix, b: Matrix) => a.length === b.length && a.every((row, i) => row.length === b[i].length && row.every((x, j) => eq(x, b[i][j])));
export const transpose = (a: Matrix): Rational[][] => a[0].map((_, j) => a.map(row => row[j]));
export function product(a: Matrix, b: Matrix): Rational[][] {
  requireMath(a[0].length === b.length, "incompatible product dimensions");
  return a.map(row => b[0].map((_, j) => row.reduce((sum, x, k) => add(sum, mul(x, b[k][j])), r(0))));
}
export function combine(a: Matrix, b: Matrix, scale = r(1)): Rational[][] {
  requireMath(a.length === b.length && a[0].length === b[0].length, "incompatible sum dimensions");
  return a.map((row, i) => row.map((x, j) => add(x, mul(scale, b[i][j]))));
}
export const scale = (a: Matrix, factor: Rational) => a.map(row => row.map(x => mul(x, factor)));

/** Leibniz expansion over permutations, never production Laplace/elimination. */
export function determinant(a: Matrix): Rational {
  const n = a.length;
  requireMath(a.every(row => row.length === n), "square determinant required");
  let sum = r(0);
  const visit = (columns: number[], used: Set<number>) => {
    if (columns.length === n) {
      let inversions = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (columns[i] > columns[j]) inversions++;
      const term = columns.reduce((value, col, row) => mul(value, a[row][col]), r(inversions % 2 ? -1 : 1));
      sum = add(sum, term);
      return;
    }
    for (let col = 0; col < n; col++) if (!used.has(col)) visit([...columns, col], new Set([...used, col]));
  };
  visit([], new Set());
  return sum;
}
export const minor = (a: Matrix, rows: readonly number[], cols: readonly number[]): Rational[][] => rows.map(i => cols.map(j => a[i][j]));
export function combinations(n: number, k: number): number[][] {
  const out: number[][] = [];
  const visit = (prefix: number[], next: number) => {
    if (prefix.length === k) { out.push(prefix); return; }
    for (let i = next; i <= n - (k - prefix.length); i++) visit([...prefix, i], i + 1);
  };
  visit([], 0);
  return out;
}
/** Largest nonzero minor; independent of the application's pivot algorithms. */
export function rank(a: Matrix): number {
  for (let k = Math.min(a.length, a[0].length); k > 0; k--)
    for (const rows of combinations(a.length, k)) for (const cols of combinations(a[0].length, k))
      if (determinant(minor(a, rows, cols)).numerator !== 0n) return k;
  return 0;
}
/** Cofactor adjugate, rather than production Gauss–Jordan. */
export function inverse(a: Matrix): Rational[][] | null {
  const det = determinant(a), n = a.length;
  if (!det.numerator) return null;
  const indices = Array.from({ length: n }, (_, i) => i);
  const value = indices.map(i => indices.map(j => div(mul(r((i + j) % 2 ? -1 : 1), determinant(minor(a, indices.filter(k => k !== j), indices.filter(k => k !== i)))), det)));
  requireMath(same(product(a, value), identity(n)) && same(product(value, a), identity(n)), "both inverse products must equal I");
  return value;
}
export const augment = (a: Matrix, b: readonly Rational[]) => a.map((row, i) => [...row, b[i]]);
export function affineSystem(a: Matrix, b: readonly Rational[]) {
  const rankA = rank(a), rankAugmented = rank(augment(a, b)), n = a[0].length;
  const classification = rankA < rankAugmented ? "system-none" : rankA === n ? "system-one" : "system-many";
  if (classification === "system-none") return { classification, rankA, rankAugmented, free: [] as number[], coefficients: [] as Rational[][] };
  // The lexicographically first independent column basis is the canonical
  // left-to-right pivot basis; pick any nonsingular row minor to solve it.
  let pivotRows: number[] = [], pivotCols: number[] = [];
  search: for (const cols of combinations(n, rankA)) for (const rows of combinations(a.length, rankA))
    if (determinant(minor(a, rows, cols)).numerator !== 0n) { pivotRows = rows; pivotCols = cols; break search; }
  const free = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i));
  const inv = rankA ? inverse(minor(a, pivotRows, pivotCols))! : [];
  const coefficients = Array.from({ length: n }, () => Array.from({ length: free.length + 1 }, () => r(0)));
  free.forEach((col, k) => { coefficients[col][k + 1] = r(1); });
  for (let k = 0; k <= free.length; k++) {
    const rhs = pivotRows.map(i => [k === 0 ? b[i] : mul(r(-1), a[i][free[k - 1]])]);
    const solved = rankA ? product(inv, rhs) : [];
    pivotCols.forEach((col, i) => { coefficients[col][k] = solved[i][0]; });
    const actual = product(a, coefficients.map(row => [row[k]]));
    requireMath(actual.every((row, i) => eq(row[0], k === 0 ? b[i] : r(0))), "particular/direction vector must satisfy every original equation");
  }
  requireMath(free.length === n - rankA, "null-space dimension");
  return { classification, rankA, rankAugmented, free, coefficients };
}
