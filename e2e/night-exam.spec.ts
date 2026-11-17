import { expect, test } from "@playwright/test";

// Keep Chromium's sandbox enabled for every launch of this presentation suite.
test.use({ launchOptions: {
  chromiumSandbox: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
} });

for (const width of [375, 1280]) for (const en of [false, true]) {
  test(`exam answer presence stays separate from scoring ${width}px ${en ? "EN" : "PL"}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (en) await page.getByRole("button", { name: "English", exact: true }).click();
    await page.getByRole("button", { name: en ? "Exam" : "Sprawdzian", exact: true }).click();
    await page.getByRole("button", { name: en ? "Start exam" : "Rozpocznij sprawdzian" }).click();
    const navigation = page.getByRole("navigation", { name: en ? "Review your answers" : "Przegląd odpowiedzi" });
    const first = navigation.getByRole("button").nth(0);
    const second = navigation.getByRole("button").nth(1);
    const entered = en ? "Answer entered" : "Wpisano odpowiedź";
    const blank = en ? "No answer" : "Brak odpowiedzi";
    await expect(first).toHaveAttribute("aria-current", "step");
    await expect(first).toContainText(blank);
    await expect(second).toContainText(blank);
    await page.locator("#exam-answer").fill("1/0");
    await expect(first).toContainText(entered);
    await expect(first).toHaveAccessibleName(`${en ? "Question 1 of 5" : "Zadanie 1 z 5"}: ${entered}`);
    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-current", "step");
    await expect(first).not.toHaveAttribute("aria-current");
    await expect(first).toContainText(entered);
    await expect(second).toContainText(blank);
    await first.click();
    await expect(page.locator("#exam-answer")).toHaveValue("1/0");
    await expect(page.locator(".exam-work .feedback, .exam-work .solution-panel, .exam-results")).toHaveCount(0);
    await expect(navigation).not.toContainText(en ? "Correct" : "Poprawne");
    await page.locator("#exam-answer").fill("");
    await expect(first).toContainText(blank);
    await page.getByRole("button", { name: en ? "Submit exam" : "Oddaj sprawdzian", exact: true }).click();
    await expect(page.locator(".exam-confirm")).toContainText(en ? "Unanswered questions: 5" : "Niewypełnione zadania: 5");
    await page.getByRole("button", { name: en ? "Confirm submission" : "Potwierdź oddanie" }).click();
    await expect(page.getByRole("heading", { name: en ? "Exam result" : "Wynik sprawdzianu" })).toBeFocused();
    await expect(page.locator(".exam-review > li")).toHaveCount(5);
    await expect(page.locator(".exam-score")).toContainText("0 / 5");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole("button", { name: en ? "My progress" : "Moje postępy", exact: true }).click();
    await expect(page.locator(".progress-empty")).toBeVisible();
    await expect(page.locator(".progress-filters select")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
