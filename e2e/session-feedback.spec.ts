import { expect, test, type Page } from "@playwright/test";
import { expectOnlyProgressStorage } from "./helpers/progress";

type Outcome = "correct" | "corrected" | "incorrect" | "skip";
const accept = "Rozpocznij kolejną sesję na sugerowanym poziomie";
const repeat = "Rozpocznij sesję na obecnym poziomie";

function solveOrder(question: string): string {
  let match = question.match(/^(\d+) \+ (\d+) × (\d+) = \?$/);
  if (match) return String(Number(match[1]) + Number(match[2]) * Number(match[3]));
  match = question.match(/^(\d+) − (\d+) × (\d+) = \?$/);
  if (match) return String(Number(match[1]) - Number(match[2]) * Number(match[3]));
  match = question.match(/^\((\d+) \+ (\d+)\) × (\d+) = \?$/);
  if (match) return String((Number(match[1]) + Number(match[2])) * Number(match[3]));
  throw new Error(`Nieznana treść zadania: ${question}`);
}

async function submit(page: Page, raw: string) {
  await page.getByLabel("Twoja odpowiedź").fill(raw);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
}

async function completeSession(page: Page, outcomes: Outcome[], stressRetries = false) {
  expect(outcomes).toHaveLength(10);
  for (const [index, outcome] of outcomes.entries()) {
    await expect(page.locator(".session-progress")).toHaveText(`Sesja: zadanie ${index + 1} z 10`);
    const right = solveOrder(await page.locator(".question").innerText());
    if (stressRetries && index === 0) {
      for (const invalid of ["", "abc", "1/0"]) {
        await submit(page, invalid);
        await expect(page.locator(".feedback")).toHaveClass(/invalid/);
      }
    }
    if (outcome === "incorrect" || outcome === "corrected") {
      await submit(page, "99999");
      await expect(page.locator(".feedback")).toHaveClass(/incorrect/);
      if (stressRetries) {
        await page.getByRole("button", { name: "Sprawdź", exact: true }).dblclick();
        await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
        await expect(page.locator(".learning-hint")).toHaveCount(2);
      }
    }
    if (outcome === "correct" || outcome === "corrected") {
      await submit(page, right);
      await expect(page.locator(".feedback")).toHaveClass(/^feedback correct$/);
      if (stressRetries && index === 0) {
        await page.getByRole("button", { name: "Sprawdź", exact: true }).dblclick();
        // Kolejna błędna ocena i edycja nie zmieniają pierwszej poprawnej próby.
        await submit(page, "99999");
        await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
        await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
        await page.locator("#step-answer").fill("0");
        await page.getByRole("button", { name: "Sprawdź krok" }).click();
        await page.getByLabel("Twoja odpowiedź").fill(right);
      }
    }
    if (outcome === "skip" && stressRetries) {
      await submit(page, "");
      await submit(page, "nie liczba");
      await expect(page.locator(".feedback")).toHaveClass(/invalid/);
      // Poprawnie wpisana, ale niesprawdzona odpowiedź pozostaje pominięciem.
      await page.getByLabel("Twoja odpowiedź").fill(right);
    }
    const next = page.getByRole("button", { name: index === 9 ? "Zakończ sesję" : "Następne zadanie" });
    if (stressRetries && index === 1) await next.dblclick();
    else await next.click();
  }
}

async function expectSummary(page: Page, correct: number, incorrect: number, skipped: number) {
  const summary = page.getByRole("region", { name: "Sesja zakończona!" });
  await expect(summary).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sesja zakończona!" })).toBeFocused();
  for (const [label, value] of [
    ["Pokazane zadania", "10"],
    ["Poprawne za pierwszą ważną próbą", `${correct}/10`],
    ["Wymagały poprawy po pierwszej ważnej próbie", String(incorrect)],
    ["Pominięte bez ważnej oceny", String(skipped)],
  ]) {
    await expect(summary.getByText(label, { exact: true }).locator("..").locator("dd")).toHaveText(value);
  }
  await expect(summary).toContainText("To prosty wskaźnik z jednej sesji, nie diagnoza umiejętności.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "telefon", viewport: { width: 375, height: 812 } },
]) {
  test.describe(`MT-003B.1 — ${name}`, () => {
    test.use({ viewport });
    test.setTimeout(60_000);
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => { Date.now = () => 42; });
      await page.goto("/");
      await page.getByRole("button", { name: "Średni", exact: true }).click();
      await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
    });

    test("liczy pierwszą ważną próbę, poprawki i pominięcia bez podwajania", async ({ page }) => {
      const external: string[] = [];
      page.on("request", (request) => {
        if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) external.push(request.url());
      });
      await completeSession(page, [
        "correct", "correct", "correct", "correct", "correct", "correct", "correct", "corrected", "corrected", "skip",
      ], true);
      await expectSummary(page, 7, 2, 1);
      await expect(page.getByRole("status")).toHaveText("Sugerowany poziom: Średni");
      await expect(page.getByRole("button", { name: "Średni", exact: true })).toHaveAttribute("aria-pressed", "true");
      expect(external).toEqual([]);
      await expectOnlyProgressStorage(page);
    });

    test("akceptacja sugestii zmienia poziom dopiero po kliknięciu i resetuje statystyki", async ({ page }) => {
      await completeSession(page, [
        "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "incorrect", "skip",
      ]);
      await expectSummary(page, 8, 1, 1);
      await expect(page.getByRole("status")).toHaveText("Sugerowany poziom: Trudny");
      await expect(page.getByRole("button", { name: "Średni", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("button", { name: "Trudny", exact: true })).toHaveAttribute("aria-pressed", "false");
      await page.getByRole("button", { name: accept }).dblclick();
      await expect(page.locator(".session-progress")).toHaveText("Sesja: zadanie 1 z 10");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
      await expect(page.getByRole("button", { name: "Kolejność działań", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByLabel("Twoja odpowiedź")).toHaveValue("");
      await expect(page.locator(".feedback")).toHaveCount(0);
      await expect(page.getByRole("region", { name: "Sesja zakończona!" })).toHaveCount(0);

      await completeSession(page, Array(10).fill("skip"));
      await expectSummary(page, 0, 0, 10);
      await expect(page.getByRole("status")).toHaveText("Za mało danych do sugestii poziomu");
      await expect(page.getByRole("button", { name: accept })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Trudny", exact: true })).toHaveAttribute("aria-pressed", "true");
      await page.getByRole("button", { name: repeat }).click();
      await expect(page.locator(".session-progress")).toHaveText("Sesja: zadanie 1 z 10");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
    });

    test("sugestia niższego poziomu pozwala pozostać lub ręcznie wybrać inny poziom", async ({ page }) => {
      await completeSession(page, [
        "correct", "correct", "correct", "correct", "incorrect", "incorrect", "incorrect", "skip", "skip", "skip",
      ]);
      await expectSummary(page, 4, 3, 3);
      await expect(page.getByRole("status")).toHaveText("Sugerowany poziom: Łatwy");
      await expect(page.getByRole("button", { name: "Średni", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("button", { name: repeat })).toBeVisible();
      await page.getByRole("button", { name: "Trudny", exact: true }).click();
      await expect(page.getByRole("region", { name: "Sesja zakończona!" })).toHaveCount(0);
      await expect(page.locator(".session-progress")).toHaveCount(0);
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      const question = await page.locator(".question").innerText();
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).not.toHaveText(question);
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "order-add-product");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
    });
  });
}
