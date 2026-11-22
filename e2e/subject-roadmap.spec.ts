import { expect, test } from "@playwright/test";

for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "mobile", viewport: { width: 375, height: 812 } },
]) {
  test.describe(`subject roadmap — ${name}`, () => {
    test.use({ viewport });

    test("shows accurate status labels and preserves mathematics navigation", async ({ page }) => {
      await page.goto("/");
      const subjects = page.getByRole("navigation", { name: "Działy Math Tutor" });
      await expect(subjects.getByRole("button")).toHaveCount(4);
      await expect(subjects.getByRole("button", { name: /Matematyka Dostępne/ })).toHaveAttribute("aria-current", "page");

      await subjects.getByRole("button", { name: /Statystyka i prawdopodobieństwo/ }).click();
      await expect(page.getByRole("heading", { name: "Statystyka i prawdopodobieństwo" })).toBeVisible();
      await expect(page.getByText("W rozwoju").last()).toBeVisible();
      await expect(page.getByText(/Pilotaż obejmuje średnią arytmetyczną, medianę, dominantę, wariancję populacyjną i interpretację statystyczną z dokładnym sprawdzaniem odpowiedzi/)).toBeVisible();
      await expect(page.locator(".statistics-heading .subject-roadmap-description")).toContainText("wykresy słupkowe");
      await expect(page.getByText(/czytać tabele liczebności i obliczać udziały/)).toBeVisible();
      await expect(page.getByRole("heading", { name: "ST-101 — Średnia arytmetyczna" })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Działy Math Tutor" }).getByRole("button", { name: /Statystyka i prawdopodobieństwo/ })).toHaveAttribute("aria-current", "page");

      await subjects.getByRole("button", { name: /Ekonometria/ }).click();
      await expect(page.getByRole("heading", { name: "Ekonometria" })).toBeVisible();
      await expect(page.getByText("Planowane").last()).toBeVisible();

      await subjects.getByRole("button", { name: /Matematyka Dostępne/ }).click();
      await expect(page.getByRole("heading", { name: /Wybierz temat/ }).first()).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Działy Math Tutor" }).getByRole("button", { name: /Matematyka Dostępne/ })).toHaveAttribute("aria-current", "page");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });

    test("has complete English copy and no false available claims", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "English" }).click();
      const subjects = page.getByRole("navigation", { name: "Math Tutor subjects" });
      await subjects.getByRole("button", { name: /Financial Mathematics/ }).click();
      await expect(page.getByRole("heading", { name: "Financial Mathematics" })).toBeVisible();
      await expect(page.getByText(/No exercises have been released/)).toBeVisible();
      await expect(page.getByRole("link", { name: /View the public roadmap/ })).toHaveAttribute(
        "href", "https://github.com/eluyz/math-tutor-app/blob/main/docs/SUBJECT_EXPANSION_PLAN.md"
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  });
}
