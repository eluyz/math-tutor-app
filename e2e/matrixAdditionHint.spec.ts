import { test, expect } from "@playwright/test";

for (const width of [375, 1280])
  for (const en of [false, true])
    test(`M01 visible second hint — ${width}px ${en ? "EN" : "PL"}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      if (en) await page.getByRole("button", { name: "English", exact: true }).click();
      await page.getByRole("button", {
        name: en ? "University mathematics" : "Matematyka na studia",
        exact: true,
      }).click();
      await page.getByRole("button", { name: en ? "Matrices" : "Macierze", exact: true }).click();
      await page.getByRole("button", {
        name: en ? /Adding matrices/ : /Dodawanie macierzy/,
      }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "matrix-add");

      // Any valid-but-wrong entry activates the learning hint panel.
      await page.locator(".matrix-grid input").first().fill("999999");
      await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.getByRole("button", {
        name: en ? "Show another hint" : "Pokaż kolejną podpowiedź",
        exact: true,
      }).click();

      const nextHint = page.locator(".learning-hint").last();
      await expect(nextHint).toBeVisible();
      if (en) {
        await expect(nextHint).toContainText("matching positions");
        await expect(nextHint).not.toContainText("Przy dodawaniu");
      } else {
        await expect(nextHint).toContainText("Przy dodawaniu liczby ujemnej");
        await expect(nextHint).not.toContainText("Przy odejmowaniu ujemnego elementu");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
