import { test, expect } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { formatRational } from "../src/answers";

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
    const storedBefore = await page.evaluate(() => Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b)));
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
    await review.getByRole("button", { name: en ? "End recovery practice" : "Zakończ powtórkę" }).click();
    expect(await page.evaluate(() => Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b)))).toEqual(storedBefore);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });


for (const width of [375, 768, 1280]) for (const en of [false, true])
  test(`MT-DIAG-001: learning step verified and recovery can be interrupted ${width}px ${en ? "EN" : "PL"}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    if (en) await page.getByRole("button", { name: "English", exact: true }).click();
    await page.locator(".exercise-list-items .exercise-item").first().click();
    const question = await page.locator(".exercise-panel .question").innerText();
    const task = taskPool("order", "easy").map((source) => localizeTask(source, en ? "en" : "pl"))
      .find((source) => source.question === question);
    expect(task?.templateId).toBe("order-add-product");
    expect(task?.step).toBeDefined();
    await page.locator(".exercise-panel #answer").fill("99999");
    await page.locator(".exercise-panel form").first().locator('button[type="submit"]').click();
    const analysis = page.locator(".exercise-panel .mistake-help");
    await expect(analysis).toBeVisible();
    await analysis.getByRole("button", { name: en ? "Find my mistake" : "Znajdź mój błąd" }).click();
    const stepInput = analysis.locator(".mistake-step input");
    await stepInput.fill("1/0");
    await analysis.getByRole("button", { name: en ? "Check step" : "Sprawdź krok" }).click();
    await expect(analysis.getByText(en ? "Invalid step format" : "Nieprawidłowy zapis kroku", { exact: false })).toBeVisible();
    await stepInput.fill("99999");
    await analysis.getByRole("button", { name: en ? "Check step" : "Sprawdź krok" }).click();
    await expect(analysis.getByText(en ? "This specific entered step is incorrect" : "W tym konkretnym wpisanym kroku wystąpił błąd", { exact: false })).toBeVisible();
    await stepInput.fill(formatRational(task!.step!.answer));
    await analysis.getByRole("button", { name: en ? "Check step" : "Sprawdź krok" }).click();
    await expect(analysis.getByText(en ? "This step is correct" : "Ten krok jest poprawny", { exact: false })).toBeVisible();
    const storedBefore = await page.evaluate(() => Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b)));
    await analysis.getByRole("button", { name: en ? "Practice similar problems" : "Przećwicz podobne zadania" }).click();
    await expect(analysis.locator(".mistake-recovery-active")).toBeVisible();
    await analysis.getByRole("button", { name: en ? "End recovery practice" : "Zakończ powtórkę" }).click();
    await expect(analysis.locator(".mistake-recovery-active")).toHaveCount(0);
    expect(await page.evaluate(() => Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b)))).toEqual(storedBefore);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
