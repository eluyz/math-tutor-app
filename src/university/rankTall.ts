import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul,
  divideRational as div, type Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import type { ExactMatrix, Reduction, RowStep } from "./linearAlgebraMath";

type TallRows = 5 | 6;
const isZero = (v: Rational) => v.numerator === 0n;

/** Exact row reduction is intentionally restricted to the new syllabus forms.
 * It does not broaden the established matrix, system or inverse API. */
export function reduceTallRank(source: ExactMatrix): Reduction {
  const rows = source.length, columns = source[0]?.length ?? 0;
  if (!((rows === 5 && columns === 4) || (rows === 6 && columns === 3)) ||
      source.some(row => row.length !== columns || row.some(v =>
        !v || typeof v.numerator !== "bigint" || typeof v.denominator !== "bigint" ||
        v.denominator <= 0n)))
    throw new Error("Tall rank reduction requires an exact 5×4 or 6×3 matrix");
  const a: Rational[][] = source.map(row => [...row]);
  const steps: RowStep[] = [], pivots: number[] = [];
  const record = (action: string) =>
    steps.push({ action, matrix: a.map(row => [...row]) });
  let lead = 0;
  for (let col = 0; col < columns && lead < rows; col++) {
    const index = a.findIndex((row, i) => i >= lead && !isZero(row[col]));
    if (index < 0) continue;
    if (index !== lead) {
      [a[index], a[lead]] = [a[lead], a[index]];
      record(`R${lead + 1} ↔ R${index + 1}`);
    }
    const pivot = a[lead][col];
    if (pivot.numerator !== pivot.denominator) {
      a[lead] = a[lead].map(value => div(value, pivot));
      record(`R${lead + 1} ← R${lead + 1} / (${pivot.numerator}/${pivot.denominator})`);
    }
    for (let i = 0; i < rows; i++) if (i !== lead && !isZero(a[i][col])) {
      const factor = a[i][col];
      a[i] = a[i].map((value, j) => sub(value, mul(factor, a[lead][j])));
      record(`R${i + 1} ← R${i + 1} − (${factor.numerator}/${factor.denominator})R${lead + 1}`);
    }
    pivots.push(col);
    lead++;
  }
  return { matrix: a, pivots, steps };
}

/** Exact independent echelon basis plus dependent rows and invertible operations.
 * Rank zero is emitted once per family; all other cases are nonzero. */
export function constructTallRank(variant: number, level: Difficulty, rows: TallRows):
  Extract<LinearAlgebraProblem, { kind: "linear-rank" }> {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(level) || (rows !== 5 && rows !== 6))
    throw new Error("Invalid tall-rank exercise");
  const columns = rows === 5 ? 4 : 3;
  const tier = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const targetRank = variant === 0 && level === "hard" ? 0 : 1 + (variant + tier) % columns;
  const offset = targetRank < columns && (variant + tier) % 3 === 0 ? 1 : 0;
  const pivots = Array.from({ length: targetRank }, (_, i) => i + offset);
  const denominator = tier === 1 ? 1 : tier === 2 ? 2 : 3;
  const basis = pivots.map((pivot, i) =>
    Array.from({ length: columns }, (_, j) => {
      if (j < pivot) return r(0);
      if (j === pivot) return r(variant + tier * 3 + i + 2, denominator);
      const raw = (variant + tier + 3 * i + 2 * j) % 7 - 3;
      return r(raw === 0 ? (i % 2 ? -1 : 2) : raw, denominator);
    }));
  let matrix = Array.from({ length: rows }, (_, i) =>
    i < targetRank ? [...basis[i]] : Array.from({ length: columns }, (_, j) =>
      basis.reduce((sum, row, k) =>
        add(sum, mul(r((variant + 2 * i + 3 * k + tier) % 5 - 2), row[j])), r(0))));
  for (let i = 1; i < rows; i++) {
    const factor = r((variant + i + tier) % 2 ? -1 : 2);
    matrix[i] = matrix[i].map((v, j) => add(v, mul(factor, matrix[i - 1][j])));
  }
  if (tier === 3)
    for (let i = rows - 2; i >= 0; i--)
      matrix[i] = matrix[i].map((v, j) => sub(v, matrix[i + 1][j]));
  if (variant % 2 === 1 || tier >= 2)
    [matrix[0], matrix[rows - 1]] = [matrix[rows - 1], matrix[0]];
  return { kind: "linear-rank", matrix };
}
export const tallRankFamilies: readonly UniversityFamily[] = [
  { id: "matrix-rank-five-four", category: "matrices",
    titles: { pl: "Rząd macierzy 5×4: zależne wiersze",
      en: "5×4 matrix rank: dependent rows" },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: (variant, level) => constructTallRank(variant, level, 5) },
  { id: "matrix-rank-six-three", category: "matrices",
    titles: { pl: "Rząd macierzy 6×3: eliminacja wierszy",
      en: "6×3 matrix rank: row elimination" },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: (variant, level) => constructTallRank(variant, level, 6) },
];
