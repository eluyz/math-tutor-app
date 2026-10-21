import { expect, test } from "@playwright/test";

for (const width of [375, 768, 1280]) {
  for (const en of [false, true]) {
    test(`MT-UWM-001 ${width}px ${en ? "EN" : "PL"}: curated determinant opens existing generator`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      if (en) await page.getByRole("button", { name: "English", exact: true }).click();

      const panel = page.locator(".uwm-prep");
      await expect(panel.getByRole("heading", {
        name: en ? "UWM entrance quiz practice" : "Przygotowanie do wejściówki UWM",
      })).toBeVisible();
      const button = panel.getByRole("button", { name: en ? /Practice:.*4×4/i : /Ćwicz:.*4×4/i }).first();
      await button.click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "determinant-laplace-four");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
      await expect(page.locator(".exercise-panel #exercise-title")).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
}

test("MT-UWM-001 method sheet and quiz is a static local page", async ({ page }) => {
  await page.goto("/");
  const link = page.locator(".uwm-prep a");
  await expect(link).toHaveAttribute("href", /uwm-wejsciowka\.html$/);
  await page.goto("/uwm-wejsciowka.html");
  await expect(page.getByRole("heading", { name: /Przygotowanie do wejściówki/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /próbna wejściówka.*7 punktów/i })).toBeVisible();
  await expect(page.getByText(/det\(A\)=−25/)).not.toBeVisible();
  await page.getByText("Rozwiązanie zadania 1").click();
  await expect(page.getByText(/det\(A\)=−25/)).toBeVisible();
});

test("MT-UWM-001 shortcuts are disabled during active ten-task session", async ({ page }) => {
  await page.goto("/");
  await page.locator(".uwm-prep").getByRole("button", { name: /Ćwicz:.*4×4/ }).first().click();
  await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
  await expect(page.locator(".uwm-prep button").first()).toBeDisabled();
  await expect(page.locator(".uwm-prep-locked")).toBeVisible();
});
