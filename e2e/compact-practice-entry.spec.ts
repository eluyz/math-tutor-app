import { expect, test } from "@playwright/test";

for (const { label, viewport } of [
  { label: "desktop", viewport: { width: 1280, height: 800 } },
  { label: "mobile", viewport: { width: 375, height: 812 } },
]) {
  test.describe(`compact practice entry — ${label}`, () => {
    test.use({ viewport });

    test("shows topic selection near the top without the removed hero", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(".hero, .hero-art, .art-card")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: /Wybierz temat/ })).toBeVisible();
      const practiceTop = await page.locator("#practice").evaluate((section) => section.getBoundingClientRect().top);
      expect(practiceTop).toBeLessThan(450);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      await expect(page.locator(".question")).toBeVisible();
      await expect(page.getByLabel("Twoja odpowiedź")).toBeVisible();

      await page.getByRole("button", { name: "English" }).click();
      await expect(page.getByRole("heading", { name: /Choose a topic/ })).toBeVisible();
      await expect(page.locator(".hero, .hero-art")).toHaveCount(0);
    });
  });
}
