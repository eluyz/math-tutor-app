import { expect, test, type Page } from "@playwright/test";
import { createGenerator } from "../src/generators";
import { a, d, eq, laplace, m, q } from "../src/university/audit";
import type { Rational } from "../src/rational";
import { HISTORY_KEY } from "../src/progress/model";
import { shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { polishLearningText } from "./helpers/localization";

type Matrix = Rational[][];
const combinations = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) =>
    combinations(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();
function rank(A: Matrix): number {
  for (let n = Math.min(A.length, A[0].length); n >= 1; n--)
    for (const rows of combinations(A.length, n))
      for (const cols of combinations(A[0].length, n))
        if (laplace(rows.map(i => cols.map(j => A[i][j]))).numerator !== 0n) return n;
  return 0;
}
/** Visible-matrix-only reference, using 2x2 Cramer (not the app's RREF,
 * prepared answer, task details, or production parameterization helper). */
function oracle(augmented: Matrix) {
  const n = augmented[0].length - 1;
  expect(n).toBe(5);
  const A = augmented.map(row => row.slice(0, n)), rhs = augmented.map(row => row[n]);
  expect(rank(A)).toBe(2);
  expect(rank(augmented)).toBe(2);
  const pivots: number[] = [];
  for (let j = 0; j < n; j++)
    if (rank(A.map(row => [...pivots, j].map(col => row[col]))) > pivots.length)
      pivots.push(j);
  expect(pivots).toHaveLength(2);
  const free = Array.from({ length: n }, (_, j) => j).filter(j => !pivots.includes(j));
  expect(free).toHaveLength(3);
  const rows = combinations(A.length, 2).find(indices =>
    laplace(indices.map(i => pivots.map(j => A[i][j]))).numerator !== 0n);
  if (!rows) throw Error("Independent 2x2 basis not found");
  const B = rows.map(i => pivots.map(j => A[i][j])), D = laplace(B);
  const coefficients = Array.from({ length: 5 }, (_, variable) => {
    const freeIndex = free.indexOf(variable);
    if (freeIndex !== -1) return [q(0), ...free.map((_, k) => q(k === freeIndex ? 1 : 0))];
    const col = pivots.indexOf(variable);
    return Array.from({ length: 4 }, (_, term) => {
      const values = rows.map(i => term === 0 ? rhs[i] : m(q(-1), A[i][free[term - 1]]));
      const replaced = B.map((row, i) => row.map((v, j) => j === col ? values[i] : v));
      return d(laplace(replaced), D);
    });
  });
  for (let row = 0; row < A.length; row++)
    for (let term = 0; term < 4; term++) {
      const lhs = A[row].map((coefficient, col) => m(coefficient, coefficients[col][term])).reduce(a, q(0));
      expect(eq(lhs, term === 0 ? rhs[row] : q(0))).toBe(true);
    }
  return { values: coefficients.flat(), free };
}
async function readVisible(page: Page): Promise<Matrix> {
  const table = page.locator(".linear-algebra-matrices .given-matrix").first();
  return Promise.all((await table.locator("tbody tr").all()).map(async row =>
    (await row.locator("td").allTextContents()).map(shownFraction)));
}
async function complete(page: Page, values: readonly Rational[]) {
  const fields = page.locator("form .coefficient-field input");
  await expect(fields).toHaveCount(20);
  for (let i = 0; i < values.length; i++) await fields.nth(i).fill(fractionText(values[i]));
  await expect.poll(() => fields.evaluateAll(nodes =>
    nodes.map(node => (node as HTMLInputElement).value))).toEqual(values.map(fractionText));
}
async function open(page: Page, width: number, en: boolean) {
  await page.setViewportSize({ width, height: 950 });
  await page.goto("/");
  if (en) await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: en ? "University mathematics" : "Matematyka na studia", exact: true }).click();
  await page.getByRole("button", { name: en ? "Systems of equations" : "Układy równań", exact: true }).click();
}
const cases = [
  { shape: "3x5", id: "gauss-three-by-five-three-parameters", label: "Gauss 3×5:" },
  { shape: "4x5", id: "gauss-five-three-parameters", label: "Gauss 4×5:" },
] as const;

for (const width of [375, 1280])
  for (const en of [false, true])
    test(`U08 ${width}px ${en ? "EN" : "PL"}: student-visible 3x5 and 4x5 coefficient solutions`, async ({ page }) => {
      // Six full 20-field browser answers; default 30s is not enough for this bounded audit.
      test.setTimeout(150_000);
      await open(page, width, en);
      for (const level of ["hard", "advanced", "expert"] as const) {
        const levelLabel = level === "hard" ? en ? "Hard" : "Trudny" :
          level === "advanced" ? en ? "Advanced" : "Zaawansowany" : en ? "Expert" : "Ekspert";
        await page.getByRole("button", { name: levelLabel, exact: true }).click();
        for (const item of cases) {
          const suffix = en ? "full solution with three parameters" : "pełne rozwiązanie z trzema parametrami";
          const title = `Gauss ${item.shape.replace("x", "×")}: ${suffix}`;
          // Catalog buttons have a leading ordinal (e.g. "01") in their accessible
          // name, so an anchored ^Gauss role locator cannot match the real UI.
          const family = page.locator(".exercise-list-items button.exercise-item").filter({ hasText: title });
          await expect(family, `Exactly one visible family: ${title}`).toHaveCount(1);
          await family.click();
          await expect(page.locator(".question")).toHaveAttribute("data-template-id", item.id);
          const augmented = await readVisible(page);
          expect(augmented).toHaveLength(Number(item.shape[0]));
          const expected = oracle(augmented);
          await expect(page.locator("form .coefficient-field input")).toHaveCount(20);
          await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
          await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
          await complete(page, expected.values);
          await page.locator("#answer").fill("987654");
          await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
          await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
          await page.locator("#answer").fill(fractionText(expected.values[0]));
          await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
          await expect(page.locator(".feedback")).toHaveClass("feedback correct");
          await page.getByRole("button", { name: en ? "Show solution" : "Pokaż rozwiązanie", exact: true }).click();
          await page.getByRole("button", { name: en ? "Show all steps" : "Pokaż wszystkie kroki", exact: true }).click();
          await expect(page.locator(".solution-panel")).toContainText("RREF");
          await expect(page.locator(".solution-panel")).toContainText(en ? "constant and each t1, t2, t3 coefficient" : "stałą i współczynniki t1, t2, t3");
          if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
          expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        }
      }
    });

// Ten-task real UI session, independent first-answer from the visible matrix.
// Seed is chosen by the test, never by supplying production task answers.
const seeds = Object.fromEntries(cases.map(item => {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const seed = 2_000_000 + attempt * 7919;
    if (createGenerator(seed).next("systems", "advanced").exercise.templateId === item.id)
      return [item.id, seed];
  }
  throw Error("No deterministic category-session seed for " + item.id);
})) as Record<string, number>;
for (const en of [false, true]) for (const item of cases)
  test(`U08 375px ${en ? "EN" : "PL"} ${item.shape} ten-task session and honest local history`, async ({ page }) => {
    await open(page, 375, en);
    await page.getByRole("button", { name: en ? "Advanced" : "Zaawansowany", exact: true }).click();
    await page.clock.setFixedTime(new Date(seeds[item.id]));
    await page.getByRole("button", { name: en ? "Start a session (10 exercises)" : "Rozpocznij sesję (10 zadań)", exact: true }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", item.id);
    const expected = oracle(await readVisible(page));
    await complete(page, expected.values);
    await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const question = await page.locator(".question").innerText();
      expect(seen.has(question)).toBe(false);
      seen.add(question);
      await page.getByRole("button", { name: i === 9 ? en ? "Finish session" : "Zakończ sesję" : en ? "Next exercise" : "Następne zadanie", exact: true }).click();
    }
    const history = JSON.parse((await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY))!);
    expect(history.sessions).toHaveLength(1);
    expect(history.sessions[0].shown).toBe(10);
    expect(history.sessions[0].correct).toBe(1);
    expect(history.sessions[0].skipped).toBe(9);
    expect(history.sessions[0].entries[0].templateId).toBe(item.id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
