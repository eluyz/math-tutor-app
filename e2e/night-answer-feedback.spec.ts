import { expect, test } from "@playwright/test";

// Never disable Chromium sandbox for sprint evidence.
test.use({launchOptions:{chromiumSandbox:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined}});
import { numeric } from "./helpers/arithmetic";

// NIGHT BUILD is the sprint name; these checks use the existing default theme.
for (const width of [375, 1280]) {
  for (const locale of ["pl", "en"] as const) {
    test(`answer feedback remains associated and resets while editing — ${locale}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      if (locale === "en") await page.getByRole("button", { name: "English", exact: true }).click();
      await page.getByRole("button", { name: locale === "pl" ? "Rozpocznij ćwiczenie" : "Start practice", exact: true }).click();

      const answer = page.getByLabel(locale === "pl" ? "Twoja odpowiedź" : "Your answer", { exact: true });
      const feedback = page.locator("#answer-feedback");
      const check = page.getByRole("button", { name: locale === "pl" ? "Sprawdź" : "Check", exact: true });
      await expect(page.locator("#exercise-title")).toBeFocused();
      await answer.focus();
      await expect(answer).toHaveAttribute("aria-describedby", "answer-help answer-feedback");
      await expect(answer).not.toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toHaveAttribute("role", "status");
      await expect(feedback).toBeEmpty();

      // Empty and malformed answers must remain distinguishable from math errors.
      await answer.press("Enter");
      await expect(answer).toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toContainText(locale === "pl" ? "Sprawdź odpowiedź" : "Check your answer");
      await answer.fill("abc");
      await expect(answer).not.toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toBeEmpty();
      await check.click();
      await expect(answer).toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toContainText(locale === "pl" ? "Sprawdź odpowiedź" : "Check your answer");

      const expected = numeric(await page.locator(".question").innerText());
      // Initial practice is integer arithmetic; derive the result from the displayed problem.
      expect(expected.denominator).toBe(1n);
      await answer.fill(String(expected.numerator + 1n));
      await check.click();
      await expect(answer).toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toContainText(locale === "pl" ? "Spróbuj jeszcze raz" : "Try again");

      await answer.fill(String(expected.numerator));
      await expect(answer).not.toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toBeEmpty();
      await answer.press("Enter");
      await expect(answer).not.toHaveAttribute("aria-invalid", "true");
      await expect(feedback).toContainText(locale === "pl" ? "Brawo!" : "Well done!");
      await expect(answer).toHaveAttribute("aria-describedby", "answer-help answer-feedback");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
}
