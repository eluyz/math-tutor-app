import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational, type AnswerSpec } from "../src/answers";
import { rational as r, addRational as add } from "../src/rational";
import { polishLearningText } from "./helpers/localization";

const familyId = "analysis-euler-function-infinity";
async function setAnswer(page: Page, spec: AnswerSpec, correct: boolean) {
  if (spec.kind === "scalar") {
    await page.locator("#answer").fill(formatRational(correct ? spec.value : add(spec.value, r(1))));
  } else if (spec.kind === "choice") {
    const value = correct ? spec.value : spec.options.find(option => option.value !== spec.value)!.value;
    await page.locator("#answer").selectOption(value);
  } else throw Error("Unexpected G06 answer type");
}

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test(`G06 integration ${width}px ${locale}: search, UI grading and solution`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    if (locale === "en") await page.getByRole("button", { name: "English", exact: true }).click();

    const search = page.getByRole("searchbox", {
      name: locale === "pl" ? "Szukaj rodziny zadań" : "Search exercise families",
    });
    await search.fill("G06");
    await expect(page.locator("#catalog-search-competency")).toContainText("G06:");
    await expect(page.locator("#catalog-search-competency")).toContainText(
      locale === "pl" ? "Pokrycie częściowe" : "Partial coverage",
    );
    const results = page.locator(".catalog-search-list button");
    await expect(results).toHaveCount(2);
    const name = locale === "pl" ? "Granica Eulera funkcji przy +∞" : "Euler-type function limits at +∞";
    await results.filter({ hasText: name }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", familyId);
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");

    const question = await page.locator(".question").innerText();
    expect(question).toContain("x→+∞");
    const match = taskPool("function-limits", "hard")
      .filter(item => item.templateId === familyId)
      .map(item => localizeTask(item, locale))
      .find(item => item.question === question);
    expect(match).toBeDefined();
    const spec = getAnswerSpec(match!);

    await page.getByRole("button", { name: locale === "pl" ? "Sprawdź" : "Check", exact: true }).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await setAnswer(page, spec, false);
    await page.getByRole("button", { name: locale === "pl" ? "Sprawdź" : "Check", exact: true }).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await setAnswer(page, spec, true);
    await page.getByRole("button", { name: locale === "pl" ? "Sprawdź" : "Check", exact: true }).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");

    await page.getByRole("button", { name: locale === "pl" ? "Pokaż rozwiązanie" : "Show solution", exact: true }).click();
    await page.getByRole("button", { name: locale === "pl" ? "Pokaż wszystkie kroki" : "Show all steps", exact: true }).click();
    await expect(page.locator(".solution-panel")).toContainText(locale === "pl" ? "Końcowa odpowiedź" : "Final answer");
    if (locale === "en") expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
