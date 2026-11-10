import { test, expect } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational } from "../src/answers";
import { isUniversityTask } from "../src/university/catalog";
import { polishLearningText } from "./helpers/localization";

const familyId = "limit-exponential-function-ratio";

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test(`G04 exponential function limit ${width}px ${locale}: search, hints, incorrect/empty/correct, solution`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (locale === "en") await page.getByRole("button", { name: "English", exact: true }).click();

    const search = page.getByRole("searchbox", {
      name: locale === "pl" ? "Szukaj rodziny zadań" : "Search exercise families",
    });
    await search.fill("G04");
    await expect(page.locator("#catalog-search-competency")).toContainText("G04:");
    await expect(page.locator("#catalog-search-competency")).toContainText(
      locale === "pl" ? "Pokrycie częściowe" : "Partial coverage",
    );
    const title = locale === "pl"
      ? "Porównywanie potęg wykładniczych w granicach przy +∞"
      : "Comparing exponential powers in function limits at +∞";
    await page.locator(".catalog-search-list button").filter({ hasText: title }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", familyId);
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
    const question = await page.locator(".question").innerText();
    expect(question).toContain("x→+∞");
    expect(question).toContain("^x");

    const matching = taskPool("function-limits", "hard")
      .filter(task => task.templateId === familyId)
      .map(task => localizeTask(task, locale))
      .find(task => task.question === question);
    expect(matching).toBeDefined();
    if (!matching || !isUniversityTask(matching) || matching.university.kind !== familyId)
      throw Error("Selected task was not the new G04 exponential method");
    const answer = getAnswerSpec(matching);
    if (answer.kind !== "limit") throw Error("Expected limit answer");
    const expected = answer.value.kind;
    const check = page.getByRole("button", {
      name: locale === "pl" ? "Sprawdź" : "Check", exact: true,
    });
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");

    await page.locator("#answer").selectOption(
      expected === "positive-infinity" ? "negative-infinity" : "positive-infinity",
    );
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");

    await page.locator("#answer").selectOption(expected);
    if (answer.value.kind === "finite")
      await page.locator("#limit-value").fill(formatRational(answer.value.value));
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");

    await page.getByRole("button", {
      name: locale === "pl" ? "Pokaż rozwiązanie" : "Show solution", exact: true,
    }).click();
    await page.getByRole("button", {
      name: locale === "pl" ? "Pokaż wszystkie kroki" : "Show all steps", exact: true,
    }).click();
    await expect(page.locator(".solution-panel")).toContainText(
      locale === "pl" ? "Końcowa odpowiedź" : "Final answer",
    );
    await expect(page.locator(".solution-panel")).toContainText("A^(x+k)");
    if (locale === "en")
      expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
