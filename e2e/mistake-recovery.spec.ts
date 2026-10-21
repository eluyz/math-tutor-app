import { test, expect } from "@playwright/test";

for (const width of [375, 768, 1280]) for (const en of [false, true])
  test(`MT-DIAG-001: recovery after submission ${width}px ${en ? "EN" : "PL"}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    if (en) await page.getByRole("button", { name: "English", exact: true }).click();
    await page.getByRole("button", { name: en ? "Exam" : "Sprawdzian", exact: true }).click();
    await page.getByRole("button", { name: en ? "Start exam" : "Rozpocznij sprawdzian" }).click();
    await expect(page.locator(".exam-work .mistake-help")).toHaveCount(0);
    await page.locator(".exam-work #exam-answer").fill("99999");
    await page.getByRole("button", { name: en ? "Submit exam" : "Oddaj sprawdzian" }).click();
    await page.getByRole("button", { name: en ? "Confirm submission" : "Potwierdź oddanie" }).click();
    const score = await page.locator(".exam-score").innerText();
    const review = page.locator(".exam-review > li").first();
    await expect(review.locator(".mistake-help")).toBeVisible();
    const trigger = review.getByRole("button", { name: en ? "Find my mistake" : "Znajdź mój błąd" });
    await trigger.click();
    await expect(review.getByText(en ? "The final answer alone does not identify" : "Nie udało się ustalić przyczyny", { exact: false })).toBeVisible();
    await review.getByRole("button", { name: en ? "Practice similar problems" : "Przećwicz podobne zadania" }).click();
    const panel = review.locator(".mistake-recovery-active");
    await expect(panel).toBeVisible();
    for (let index = 0; index < 3; index++) {
      await expect(panel.getByText(en ? `Recovery question ${index + 1} of 3` : `Ćwiczenie naprawcze ${index + 1} z 3`)).toBeVisible();
      await panel.locator("input[type=text]").first().fill("99999");
      await panel.getByRole("button", { name: en ? "Check answer" : "Sprawdź odpowiedź" }).click();
      await expect(panel.getByText(en ? "Incorrect." : "Odpowiedź jest niepoprawna.", { exact: false })).toBeVisible();
      await panel.getByRole("button", { name: en ? "Next question" : "Następne ćwiczenie" }).click();
    }
    await expect(review.getByText(en ? "Recovery practice finished" : "Ukończono powtórkę", { exact: false })).toBeVisible();
    await expect(page.locator(".exam-score")).toHaveText(score);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
