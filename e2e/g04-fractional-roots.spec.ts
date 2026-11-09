import { test, expect } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { isUniversityTask } from "../src/university/catalog";
import { polishLearningText } from "./helpers/localization";

const familyId = "limit-mixed-fractional-roots";

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test(`G04 fractional roots ${width}px ${locale}: catalog, negative/blank/correct, solution`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
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
      ? "Porównywanie pierwiastków kwadratowych i sześciennych przy +∞"
      : "Square-root versus cube-root growth at +∞";
    await page.locator(".catalog-search-list button").filter({ hasText: title }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", familyId);
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");

    const question = await page.locator(".question").innerText();
    expect(question).toContain("x→+∞");
    expect(question).toContain("√x");
    expect(question).toContain("∛x");

    const matching = taskPool("function-limits", "hard")
      .filter(task => task.templateId === familyId)
      .map(task => localizeTask(task, locale))
      .find(task => task.question === question);
    expect(matching).toBeDefined();
    if (!matching || !isUniversityTask(matching) || matching.university.kind !== "limit-mixed-fractional-roots") {
      throw Error("Selected task was not the new G04 method");
    }
    const p = matching.university;
    const expected = p.mode === "cuberoot-over-sqrt"
      ? "finite"
      : (p.a.numerator > 0n) === (p.d.numerator > 0n)
        ? "positive-infinity" : "negative-infinity";
    const answer = getAnswerSpec(matching);
    expect(answer.kind).toBe("limit");
    if (answer.kind !== "limit") throw Error("Expected limit answer");
    expect(answer.value.kind).toBe(expected);

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
    if (expected === "finite") await page.locator("#limit-value").fill("0");
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
    await expect(page.locator(".solution-panel")).toContainText("1/6");
    if (locale === "en") expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
