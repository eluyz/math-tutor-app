import type { Page } from "@playwright/test";
import { parseAnswer, rational, type Rational } from "../../src/rational";
import { a, m, s, d, q, laplace } from "../../src/university/audit";
const parse = (text: string) => {
  const p = parseAnswer(text.trim());
  if (p.kind !== "valid")
    throw new Error(`Invalid displayed fraction: ${text}`);
  return p.value;
};
/** Reduce exact fractions before entering the app's max-100-character answer fields. */
export const fractionText = (v: Rational) => {
  const reduced = rational(v.numerator, v.denominator);
  return `${reduced.numerator}/${reduced.denominator}`;
};
const subsets = (n: number, k: number): number[][] => k === 0 ? [[]] : Array.from({ length: n }, (_, i) => subsets(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();
function referenceRank(matrix: Rational[][]): number {
  for (let size = Math.min(matrix.length, matrix[0].length); size >= 1; size--)
    for (const rows of subsets(matrix.length, size))
      for (const columns of subsets(matrix[0].length, size))
        if (laplace(rows.map(i => columns.map(j => matrix[i][j]))).numerator !== 0n) return size;
  return 0;
}
export async function readSystem(page: Page) {
  const augmentedTable = page.locator(".linear-algebra-matrices .given-matrix");
  if (await augmentedTable.count()) {
    const matrix = await Promise.all((await augmentedTable.first().locator("tbody tr").all()).map(async row =>
      (await row.locator("td").allTextContents()).map(parse)));
    const n = matrix[0].length - 1;
    const coefficients = matrix.map(row => row.slice(0, n));
    const rhs = matrix.map(row => row[n]);
    const rankA = referenceRank(coefficients), rankAugmented = referenceRank(matrix);
    const classification = rankA < rankAugmented ? "system-none" : rankA === n ? "system-one" : "system-many";
    const determinant = classification === "system-one" ? laplace(coefficients) : null;
    return { classification, values: determinant ? Array.from({ length: n }, (_, column) =>
      d(laplace(coefficients.map((row, i) => row.map((v, j) => j === column ? rhs[i] : v))), determinant)) : [] };
  }
  const text = await page.locator(".question").innerText();
  const rows = text.split("\n").filter((line) => line.includes(" = "));
  const coefficients = rows.map((row) =>
    [...row.matchAll(/\(([^()]+)\)·/g)].map((match) => parse(match[1])),
  );
  const rhs = rows.map((row, i) => {
    const shown = parse(row.split(" = ").at(-1)!);
    const shifts = [...row.matchAll(/·\([xyz] \+ \(([^)]+)\)\)/g)].map(
      (match) => parse(match[1]),
    );
    return shifts.length
      ? s(shown, coefficients[i].map((v, j) => m(v, shifts[j])).reduce(a, q(0)))
      : shown;
  });
  const original = coefficients.map((row) =>
    text.includes("·(y + z)")
      ? [row[0], a(row[0], row[1]), a(row[1], row[2])]
      : text.includes("·(x + y)")
        ? [a(row[0], row[1]), s(row[0], row[1])]
        : row,
  );
  const det = laplace(original);
  if (det.numerator === 0n) {
    const dx = laplace(original.map((row, i) => [rhs[i], row[1]])),
      dy = laplace(original.map((row, i) => [row[0], rhs[i]]));
    return {
      classification:
        dx.numerator !== 0n || dy.numerator !== 0n
          ? "system-none"
          : "system-many",
      values: [],
    };
  }
  return {
    classification: "system-one",
    values: rhs.map((_, column) =>
      d(
        laplace(
          original.map((row, i) =>
            row.map((v, j) => (j === column ? rhs[i] : v)),
          ),
        ),
        det,
      ),
    ),
  };
}
export async function fillSystem(page: Page) {
  const answer = await readSystem(page);
  const classification = await page
    .locator("#answer")
    .evaluate((e) => e.tagName === "SELECT");
  if (classification) await page.locator("#answer").selectOption(answer.classification);
  const fields = classification ? await page.locator("[id^='system-value-']").count() : answer.values.length;
  for (let i = 0; i < fields; i++)
    await page
      .locator(
        classification ? `#system-value-${i}` : i ? `#answer-${i}` : "#answer",
      )
      .fill(fractionText(answer.values[i]));
  return answer;
}
