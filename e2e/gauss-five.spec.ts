import { test, expect, type Page } from "@playwright/test";
import { readSystem, fillParametricSystem } from "./helpers/systems";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

for (const width of [375, 1280]) for (const en of [false, true])
  for (const shape of ["3x5", "4x5"] as const)
    test("MT-EDU-030 five unknowns " + shape + " " + width + "px " + (en ? "EN" : "PL"), async ({page}) => {
      await page.setViewportSize({ width, height: 920 });
      await page.goto("/");
      if (en) await button(page, "English").click();
      await button(page, en ? "University mathematics" : "Matematyka na studia").click();
      await button(page, en ? "Systems of equations" : "Układy równań").click();
      await button(page, en ? "Hard" : "Trudny").click();
      const title = en ? "Gaussian systems " + shape.replace("x", "×") + ": five unknowns" :
        "Gauss " + shape.replace("x", "×") + ": pięć niewiadomych";
      await page.locator(".exercise-list-items .exercise-item").filter({ hasText: title }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "gauss-five-" + shape);
      const table = page.locator(".linear-algebra-matrices .given-matrix");
      await expect(table.locator("tbody tr")).toHaveCount(Number(shape[0]));
      await expect(table.locator("tbody tr").first().locator("td")).toHaveCount(6);
      const answer = await readSystem(page);
      expect(["system-many","system-none"]).toContain(answer.classification);
      await button(page, en ? "Check" : "Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
      if (answer.classification === "system-many") {
        await expect(page.locator("form .coefficient-field input")).toHaveCount(15);
        await fillParametricSystem(page);
      } else {
        await page.locator("#answer").selectOption("system-many");
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").selectOption("system-none");
      }
      await button(page, en ? "Check" : "Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
      await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
      const solution = page.locator(".solution-panel");
      await expect(solution).toContainText("rank(A)");
      if (answer.classification === "system-many") {
        await expect(solution).toContainText("RREF");
        await expect(solution).toContainText(en ? "constant terms" : "wyrazy stałe");
      } else {
        await expect(solution).toContainText("0 =");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
