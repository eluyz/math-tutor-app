import type { Page } from "@playwright/test";
import { parseAnswer, type Rational } from "../../src/rational";
import { a, m, s, d, q, laplace } from "../../src/university/audit";
const parse = (text: string) => {
  const p = parseAnswer(text.trim());
  if (p.kind !== "valid")
    throw new Error(`Invalid displayed fraction: ${text}`);
  return p.value;
};
export const fractionText = (v: Rational) => `${v.numerator}/${v.denominator}`;
export async function readSystem(page: Page) {
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
  if (!answer.values.length) throw new Error("A unique system was expected");
  const classification = await page
    .locator("#answer")
    .evaluate((e) => e.tagName === "SELECT");
  if (classification) await page.locator("#answer").selectOption("system-one");
  for (let i = 0; i < answer.values.length; i++)
    await page
      .locator(
        classification ? `#system-value-${i}` : i ? `#answer-${i}` : "#answer",
      )
      .fill(fractionText(answer.values[i]));
  return answer;
}
