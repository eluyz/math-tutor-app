import { expect, test, type Page } from "@playwright/test";

async function expectExercise(page: Page, templateId: string, difficulty: string, title: string) {
  await expect(page.locator(".question")).toHaveAttribute("data-template-id", templateId);
  await expect(page.locator(".question")).toHaveAttribute("data-difficulty", difficulty);
  await expect(page.locator(".exercise-panel h3")).toHaveText(title);
  await expect(page.locator('.exercise-item[aria-current="step"]')).toContainText(title);
}

async function expectCleanAnswer(page: Page) {
  await expect(page.getByLabel("Twoja odpowiedź")).toHaveValue("");
  await expect(page.locator(".feedback")).toHaveCount(0);
  await expect(page.locator(".diagnosis")).toHaveCount(0);
  await expect(page.locator(".learning-hint")).toHaveCount(0);
  await expect(page.locator(".step-form")).toHaveCount(0);
  await expect(page.locator(".step-feedback")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Następny przykład" })).toHaveCount(0);
}

async function revealFeedbackAndStep(page: Page) {
  const question = await page.locator(".question").innerText();
  const match = question.match(/^(\d+) \+ (\d+) × (\d+) = \?$/);
  expect(match).not.toBeNull();
  const [, a, b, c] = match!.map(Number);
  await page.getByLabel("Twoja odpowiedź").fill(String((a + b) * c));
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".diagnosis")).toContainText("Możliwe, że");
  await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
  await expect(page.locator(".learning-hint")).toHaveCount(2);
  await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
  await page.getByLabel(`Ile wynosi ${b} × ${c}?`).fill("0");
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText("Ten krok wymaga poprawy");
  return question;
}

for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "telefon", viewport: { width: 375, height: 812 } },
]) {
  test.describe(`MT-003A.1 — ${name}`, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      // Stały seed rzeczywistego generatora; nie zastępujemy jego wyników.
      await page.addInitScript(() => { Date.now = () => 42; });
      await page.goto("/");
    });

    test("Nowy przykład rozpoczyna ćwiczenie przy pustym panelu", async ({ page }) => {
      await expect(page.locator(".question")).toHaveCount(0);
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", /^order-/);
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "easy");
      await expectCleanAnswer(page);
    });

    test("swobodne przykłady i zmiana poziomu zachowują rodzinę aż do świadomej zmiany", async ({ page }) => {
      await page.getByRole("button", { name: "Podstawy algebry", exact: true }).click();
      await page.getByRole("button", { name: /Mnożenie przez nawias/ }).click();
      await expectExercise(page, "algebra-distribute", "easy", "Mnożenie przez nawias");
      const seen = new Set([await page.locator(".question").innerText()]);
      for (let index = 0; index < 3; index++) {
        const previous = await page.locator(".question").innerText();
        await page.getByRole("button", { name: "Nowy przykład" }).click();
        await expect(page.locator(".question")).not.toHaveText(previous);
        await expectExercise(page, "algebra-distribute", "easy", "Mnożenie przez nawias");
        const question = await page.locator(".question").innerText();
        expect(seen.has(question)).toBe(false);
        seen.add(question);
        await expectCleanAnswer(page);
      }

      const question = await page.locator(".question").innerText();
      const match = question.match(/^Oblicz (\d+)\(x \+ (\d+)\) dla x = (\d+)\.$/);
      expect(match).not.toBeNull();
      const [, a, b, x] = match!.map(Number);
      await page.getByLabel("Twoja odpowiedź").fill(String(a * (x + b)));
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toContainText("Brawo!");
      await page.getByRole("button", { name: "Następny przykład" }).click();
      await expect(page.locator(".question")).not.toHaveText(question);
      await expectExercise(page, "algebra-distribute", "easy", "Mnożenie przez nawias");
      expect(seen.has(await page.locator(".question").innerText())).toBe(false);
      await expectCleanAnswer(page);

      for (const level of [{ label: "Średni", id: "medium" }, { label: "Trudny", id: "hard" }]) {
        const previous = await page.locator(".question").innerText();
        await page.getByLabel("Twoja odpowiedź").fill("9999");
        await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
        await expect(page.locator(".feedback")).toBeVisible();
        await page.getByRole("button", { name: level.label, exact: true }).click();
        await expectExercise(page, "algebra-distribute", level.id, "Mnożenie przez nawias");
        await expect(page.getByRole("button", { name: level.label, exact: true })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(".question")).not.toHaveText(previous);
        await expectCleanAnswer(page);
        const changedLevelQuestion = await page.locator(".question").innerText();
        await page.getByRole("button", { name: "Nowy przykład" }).click();
        await expect(page.locator(".question")).not.toHaveText(changedLevelQuestion);
        await expectExercise(page, "algebra-distribute", level.id, "Mnożenie przez nawias");
        await expectCleanAnswer(page);
      }

      await page.getByRole("button", { name: /Jednomiany podobne/ }).click();
      await expectExercise(page, "algebra-like-terms", "hard", "Jednomiany podobne");
      const otherFamilyQuestion = await page.locator(".question").innerText();
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).not.toHaveText(otherFamilyQuestion);
      await expectExercise(page, "algebra-like-terms", "hard", "Jednomiany podobne");
      await page.getByRole("button", { name: "Ułamki", exact: true }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", /^fraction-/);
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
      const categoryFamily = await page.locator(".question").getAttribute("data-template-id");
      const categoryQuestion = await page.locator(".question").innerText();
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).not.toHaveText(categoryQuestion);
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", categoryFamily!);
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
      await expectCleanAnswer(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });

    test("zmiana treści czyści odpowiedź, hipotezy, obie wskazówki i etap pomocniczy", async ({ page }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      const first = await revealFeedbackAndStep(page);
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).not.toHaveText(first);
      await expectExercise(page, "order-add-product", "easy", "Najpierw mnożenie");
      await expectCleanAnswer(page);

      const second = await revealFeedbackAndStep(page);
      await page.getByRole("button", { name: "Średni", exact: true }).click();
      await expect(page.locator(".question")).not.toHaveText(second);
      await expectExercise(page, "order-add-product", "medium", "Najpierw mnożenie");
      await expectCleanAnswer(page);
    });

    test("pamięta niewidziane treści rodziny i informuje o wyczerpaniu puli", async ({ page }) => {
      await page.getByRole("button", { name: "Liczby dodatnie i ujemne", exact: true }).click();
      await page.getByRole("button", { name: /Dodawanie różnych znaków/ }).click();
      await page.getByRole("button", { name: "Średni", exact: true }).click();
      const seen = new Set<string>();
      const repeated = page.getByText("Pula wariantów w tym temacie i poziomie się wyczerpała; zaczynamy ją ponownie.", { exact: true });
      // Poziom średni ma dziewięć różnych sum: −[7, 8, 9] + [3, 4, 5].
      for (let index = 0; index < 9; index++) {
        await expectExercise(page, "signed-add", "medium", "Dodawanie różnych znaków");
        const question = await page.locator(".question").innerText();
        expect(seen.has(question)).toBe(false);
        seen.add(question);
        await expect(repeated).toHaveCount(0);
        if (index < 8) await page.getByRole("button", { name: "Nowy przykład" }).click();
      }
      expect(seen.size).toBe(9);
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(repeated).toBeVisible();
      await expectExercise(page, "signed-add", "medium", "Dodawanie różnych znaków");
      expect(seen.has(await page.locator(".question").innerText())).toBe(true);
    });

    test("sesja miesza rodziny, blokuje ręczne zmiany i kończy się po dziesięciu zadaniach", async ({ page }) => {
      await page.getByRole("button", { name: "Podstawy algebry", exact: true }).click();
      await page.getByRole("button", { name: /Mnożenie przez nawias/ }).click();
      await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
      await expect(page.locator(".exercise-item:enabled")).toHaveCount(0);
      await expect(page.locator(".difficulty-picker button:enabled")).toHaveCount(0);
      await expect(page.locator(".category-picker button:enabled")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Nowy przykład" })).toHaveCount(0);
      const seen = new Set<string>();
      const families = new Set<string>();
      for (let number = 1; number <= 10; number++) {
        await expect(page.locator(".session-progress")).toHaveText(`Sesja: zadanie ${number} z 10`);
        await expect(page.locator(".panel-top")).toContainText(`SESJA ${number} / 10`);
        await expect(page.locator(".question")).toHaveAttribute("data-template-id", /^algebra-/);
        await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "easy");
        const question = await page.locator(".question").innerText();
        expect(seen.has(question)).toBe(false);
        seen.add(question);
        families.add((await page.locator(".question").getAttribute("data-template-id"))!);
        await expect(page.getByLabel("Twoja odpowiedź")).toHaveValue("");
        await expect(page.locator(".feedback")).toHaveCount(0);
        await page.getByLabel("Twoja odpowiedź").fill("9999");
        await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
        await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
        await page.getByRole("button", { name: number === 10 ? "Zakończ sesję" : "Następne zadanie" }).click();
      }
      expect(seen.size).toBe(10);
      expect(families.size).toBeGreaterThan(1);
      await expect(page.getByRole("heading", { name: "Sesja zakończona!" })).toBeVisible();
      await expect(page.locator(".question")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" })).toBeVisible();
    });
  });
}
