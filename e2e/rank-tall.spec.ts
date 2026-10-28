import { test, expect, type Page } from "@playwright/test";
import { parseAnswer, type Rational } from "../src/rational";
import { laplace } from "../src/university/audit";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const choose = (n: number, k: number): number[][] => k === 0 ? [[]] :
  Array.from({ length: n }, (_, i) =>
    choose(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => i + j + 1)])).flat();
const parse = (s: string): Rational => {
  const value = parseAnswer(s.trim());
  if (value.kind !== "valid") throw Error("Invalid matrix entry " + s);
  return value.value;
};
function independentRank(A: Rational[][]): number {
  for (let k = Math.min(A.length, A[0].length); k > 0; k--)
    for (const rows of choose(A.length, k))
      for (const cols of choose(A[0].length, k))
        if (laplace(rows.map(i => cols.map(j => A[i][j]))).numerator !== 0n)
          return k;
  return 0;
}
for (const width of [375, 1280])
  for (const en of [false, true])
    for (const shape of ["5x4", "6x3"] as const)
      test("MT-EDU-031 rank " + shape + " " + width + "px " + (en ? "EN" : "PL"), async ({ page }) => {
        await page.setViewportSize({ width, height: 920 });
        await page.goto("/");
        if (en) await button(page, "English").click();
        await button(page, en ? "University mathematics" : "Matematyka na studia").click();
        await button(page, en ? "Matrices" : "Macierze").click();
        await button(page, en ? "Hard" : "Trudny").click();
        const title = en ? (shape === "5x4" ? "5×4 matrix rank: dependent rows" :
          "6×3 matrix rank: row elimination") :
          (shape === "5x4" ? "Rząd macierzy 5×4: zależne wiersze" :
          "Rząd macierzy 6×3: eliminacja wierszy");
        await page.locator(".exercise-list-items .exercise-item").filter({ hasText: title }).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id",
          shape === "5x4" ? "matrix-rank-five-four" : "matrix-rank-six-three");
        const table = page.locator(".linear-algebra-matrices .given-matrix").first();
        await expect(table.locator("tbody tr")).toHaveCount(Number(shape[0]));
        await expect(table.locator("tbody tr").first().locator("td")).toHaveCount(Number(shape[2]));
        const A = await Promise.all((await table.locator("tbody tr").all()).map(async row =>
          (await row.locator("td").allTextContents()).map(parse)));
        const answer = independentRank(A);
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").fill(String(answer + 1));
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").fill(String(answer));
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-panel")).toContainText("RREF(A)");
        await expect(page.locator(".solution-panel")).toContainText("rank(A)");
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      });
