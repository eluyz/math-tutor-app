import { expect, test, type Page } from "@playwright/test";

// ST-103 acceptance: population variance only; sample variance is intentionally excluded.
for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  const en = locale === "en";
  const c = {
    title: en ? "ST-103 — Population variance" : "ST-103 — Wariancja populacyjna",
    answer: en ? "Your answer" : "Twoja odpowiedź",
    check: en ? "Check" : "Sprawdź",
    correct: en ? "Correct answer." : "Poprawna odpowiedź.",
    incorrect: en ? "The result differs." : "Wynik jest inny.",
    hint: en ? "Show hint" : "Pokaż podpowiedź",
    hint2: en ? "Show second hint" : "Pokaż drugą podpowiedź",
    solution: en ? "Show solution" : "Pokaż rozwiązanie",
    medium: en ? "Medium" : "Średni",
    hard: en ? "Hard" : "Trudny",
    mean: en ? "Arithmetic mean" : "Średnia arytmetyczna",
  };
  test.describe(`ST-103 population variance ${locale} ${width}px`, () => {
    test.use({ viewport: { width, height: 850 } });
    const panel = (page: Page) => page.locator(".statistics-practice");
    async function open(page: Page) {
      await page.goto("/");
      if (en) await page.getByRole("button", { name: "English", exact: true }).click();
      await page.locator(".subject-navigation").getByRole("button", { name: /Statystyka|Statistics/ }).click();
      const p = panel(page);
      await p.locator("[data-topic=dispersion]").click();
      await expect(p.getByRole("heading", { name: c.title, exact: true })).toBeVisible();
      await expect(p.locator(".question")).toHaveAttribute("data-lesson", "variance");
      return p;
    }
    async function answer(page: Page, value: string) {
      const p = panel(page);
      await p.getByLabel(c.answer, { exact: true }).fill(value);
      await p.getByRole("button", { name: c.check, exact: true }).click();
      return p.locator(".feedback");
    }
    test("checks exact variance and separates population from sample across levels", async ({ page }) => {
      const p = await open(page);
      await expect(p.locator(".question")).toContainText("3, 2, 2, 1, 2");
      for (const value of ["2/5", "4/10", "0.4"]) {
        await expect(await answer(page, value)).toContainText(c.correct);
      }
      for (const value of ["", "abc", "1/0"]) {
        await expect(await answer(page, value)).toHaveClass(/invalid/);
      }
      // For seed 0, the sample variance would be 1/2; it must not be accepted.
      await expect(await answer(page, "1/2")).toContainText(c.incorrect);
      await p.getByRole("button", { name: c.medium, exact: true }).click();
      await expect(p.locator(".question")).toHaveAttribute("data-difficulty", "medium");
      await expect(await answer(page, "1109/36")).toContainText(c.correct);
      await p.getByRole("button", { name: c.hard, exact: true }).click();
      await expect(p.locator(".question")).toContainText("-16, -13, 8, 17, -1, 14, -9");
      await expect(await answer(page, "1056/7")).toContainText(c.correct);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
    test("teaches all squared deviations, preserves locale state and isolates Math storage", async ({ page }) => {
      const p = await open(page);
      const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
      await p.getByRole("button", { name: c.hint, exact: true }).click();
      await p.getByRole("button", { name: c.hint2, exact: true }).click();
      await expect(p.locator(".learning-hint")).toHaveCount(2);
      await p.getByRole("button", { name: c.solution, exact: true }).click();
      const steps = await p.locator(".solution-calculation").allTextContents();
      expect(steps).toHaveLength(4);
      expect(steps[0]).toContain("μ = ");
      expect(steps[1]).toContain("² = ");
      expect(steps[2]).toContain("Σ(x − μ)²");
      expect(steps[3]).toBe("σ² = (2)/5 = 2/5");
      await expect(await answer(page, "2/5")).toContainText(c.correct);
      await page.getByRole("button", { name: en ? "Polski" : "English", exact: true }).click();
      await expect(p.locator(".question")).toHaveAttribute("data-lesson", "variance");
      await expect(p.getByRole("textbox")).toHaveValue("2/5");
      await expect(p.locator(".learning-hint")).toHaveCount(2);
      await expect(p.locator(".solution-calculation").last()).toHaveText("σ² = (2)/5 = 2/5");
      const after = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
      expect(after).toEqual(before);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  });
}
