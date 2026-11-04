import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { makeUniversityTask, localizeUniversity } from "../../src/university/catalog";
import type { AnswerInput } from "../../src/answers";
import type { Difficulty } from "../../src/difficulty";
import { polishLearningText } from "./localization";

type Task = ReturnType<typeof makeUniversityTask>;
export type AcceptanceRow = { family: string; level: Difficulty; variants: readonly number[] };
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const categories = {
  "sequence-limits": ["Granice ciągów", "Limits of sequences"],
  "functions": ["Funkcje", "Functions"],
  "function-limits": ["Granice funkcji", "Limits of functions"],
  "derivatives": ["Pochodne", "Derivatives"],
};
const levels = { easy: ["Łatwy", "Easy"], medium: ["Średni", "Medium"], hard: ["Trudny", "Hard"], advanced: ["Zaawansowany", "Advanced"], expert: ["Ekspert", "Expert"] };
async function fill(page: Page, input: AnswerInput) {
  if (typeof input === "string") throw Error("Unexpected scalar");
  if (input.kind === "limit") {
    await page.locator("#answer").selectOption(input.classification);
    if (input.classification === "finite") await page.locator("#limit-value").fill(input.value);
  } else if (input.kind === "list") {
    const fields = page.locator("form .coefficient-field input");
    await expect(fields).toHaveCount(input.values.length);
    for (let i = 0; i < input.values.length; i++) await fields.nth(i).fill(input.values[i]);
  } else if (input.kind === "choice") await page.locator("#answer").selectOption(input.value);
  else throw Error("Unexpected input");
}

export async function runPinnedAcceptance(
  page: Page, info: TestInfo, row: AcceptanceRow, locale: "pl" | "en", width: number,
  oracle: (task: Task) => AnswerInput,
  wrong: (answer: AnswerInput, task: Task) => AnswerInput,
) {
    test.setTimeout(180_000);
    const en = locale === "en", lang = en ? 1 : 0;
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text() + " " + message.location().url); });
    page.on("response", response => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
    page.on("requestfailed", request => errors.push(request.url() + ": " + request.failure()?.errorText));
    await page.setViewportSize({ width, height: 900 });
    // Reproducible generator order; production code has no QA backdoor.
    await page.addInitScript(() => { Date.now = () => 151169; });
    await page.goto("/");
    if (en) await button(page, "English").click();
    await button(page, en ? "University mathematics" : "Matematyka na studia").click();
    const candidates = Array.from({ length: 24 }, (_, v) => makeUniversityTask(row.family, v, row.level));
    const category = candidates[0].category as keyof typeof categories;
    await button(page, categories[category][lang]).click();
    await button(page, levels[row.level][lang]).click();
    const title = localizeUniversity(candidates[0], locale).title;
    await page.locator("button.exercise-item").filter({ hasText: title }).click();
    const pending = new Set<number>(row.variants);
    const witnessed: string[] = [];
    for (let attempt = 0; attempt < 24 && pending.size; attempt++) {
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", row.family);
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", row.level);
      const displayed = await page.locator(".question").innerText();
      const matches = candidates.filter(task => localizeUniversity(task, locale).question === displayed);
      expect(matches, "Rendered question must identify one exact variant").toHaveLength(1);
      const task = matches[0], variant = Number(task.id.split(":").at(-1));
      if (pending.has(variant)) {
        const view = localizeUniversity(task, locale), expected = oracle(task);
        const checked = async (kind: string) => {
          await button(page, en ? "Check" : "Sprawdź").click();
          await expect(page.locator(".feedback")).toHaveClass("feedback " + kind);
        };
        await checked("invalid");
        await fill(page, wrong(expected, task));
        await checked("incorrect");
        await expect(page.locator(".learning-hint")).toHaveCount(1);
        await expect(page.locator(".learning-hint").first()).toContainText(view.hint);
        await button(page, en ? "Show another hint" : "Pokaż kolejną podpowiedź").click();
        await expect(page.locator(".learning-hint")).toHaveCount(2);
        await expect(page.locator(".learning-hint").nth(1)).toContainText(view.nextHint);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        await fill(page, expected);
        await checked("correct");
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-final")).toBeVisible();
        for (const step of view.solution ?? []) if (step.kind === "working") {
          await expect(page.locator(".solution-panel")).toContainText(step.action);
          await expect(page.locator(".solution-panel")).toContainText(step.reason);
        }
        if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        expect(errors).toEqual([]);
        witnessed.push(task.id);
        pending.delete(variant);
        if (pending.size === 0) await info.attach("solution", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
      }
      if (pending.size) await button(page, en ? "New example" : "Nowy przykład").click();
    }
    expect([...pending], "Every pinned variant must be visited").toEqual([]);
    expect(errors).toEqual([]);
    await info.attach("witnesses", { body: JSON.stringify({ locale, width, witnessed, errors }), contentType: "application/json" });
}
