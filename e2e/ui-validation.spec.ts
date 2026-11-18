import { expect, test, type Page } from "@playwright/test";

async function fitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

// Screenshot evidence is uploaded by CI; no generated images are committed.
// Captures show current rendering, but automated geometry checks are not a visual sign-off.
for (const width of [375, 390, 768, 1280, 1440]) for (const en of [false, true]) {
  test(`UI acceptance journey ${width}px ${en ? "EN" : "PL"}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const button = (name: string) => page.getByRole("button", { name, exact: true });
    if (en) await button("English").click();
    await expect(page.locator("html")).toHaveAttribute("lang", en ? "en" : "pl");
    const capture = async (name: string, selected: boolean) => {
      await fitsViewport(page);
      if (selected) {
        const path = `test-results/ui-evidence/${name}-${width}-${en ? "en" : "pl"}.png`;
        await page.screenshot({ path, fullPage: true });
        await info.attach(name, { path, contentType: "image/png" });
      }
    };
    await expect(button(en ? "Start practice" : "Rozpocznij ćwiczenie")).toBeVisible();
    await capture("home", (width === 1280 && !en) || (width === 1440 && en));

    await button(en ? "Start practice" : "Rozpocznij ćwiczenie").click();
    await expect(page.locator("#exercise-title")).toBeFocused();
    await expect(page.locator(".question")).toBeVisible();
    await button(en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await capture("mathematics", (width === 390 && !en) || (width === 768 && en));

    const subjects = page.getByRole("navigation", { name: en ? "Math Tutor subjects" : "Działy Math Tutor" });
    await subjects.getByRole("button", { name: en ? /Statistics & Probability/ : /Statystyka i prawdopodobieństwo/ }).click();
    const stats = page.locator(".statistics-practice");
    await expect(stats.locator("#st101-answer")).toBeVisible();
    await stats.locator('button[type="submit"]').click();
    await expect(stats.locator("#st101-answer")).toHaveAttribute("aria-invalid", "true");
    await capture("statistics", (width === 375 && !en) || (width === 1280 && en));

    await subjects.getByRole("button").filter({ has: page.getByText(en ? "Mathematics" : "Matematyka", { exact: true }) }).click();
    await button(en ? "Exam" : "Sprawdzian").click();
    await page.getByRole("button", { name: en ? "Start exam" : "Rozpocznij sprawdzian" }).click();
    const questions = page.getByRole("navigation", { name: en ? "Review your answers" : "Przegląd odpowiedzi" });
    await expect(questions.getByRole("button")).toHaveCount(5);
    await expect(questions.getByRole("button").first()).toHaveAttribute("aria-current", "step");
    await capture("exam", width === 390 && en);
    await button(en ? "Submit exam" : "Oddaj sprawdzian").click();
    await button(en ? "Confirm submission" : "Potwierdź oddanie").click();
    await expect(page.locator(".exam-score")).toContainText("0 / 5");

    await button(en ? "My progress" : "Moje postępy").click();
    await expect(page.locator(".progress-empty")).toBeVisible();
    await capture("progress", width === 1440 && !en);
  });
}
