import { test, expect, type Page } from "@playwright/test";
import { polishLearningText } from "./helpers/localization";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

for (const width of [375, 1280]) for (const pl of [true, false])
for (const [level, levelPl, levelEn] of [
  ["hard", "Trudny", "Hard"],
  ["advanced", "Zaawansowany", "Advanced"],
  ["expert", "Ekspert", "Expert"],
] as const) {
  test("F05 integrated sloping asymptotes " + level + " " + width + "px " +
    (pl ? "PL" : "EN"), async ({ page }) => {
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on("pageerror", err => runtimeErrors.push(err.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (!pl) await button(page, "English").click();
    await button(page, pl ? "Matematyka na studia" : "University mathematics").click();
    await button(page, pl ? "Funkcje" : "Functions").click();
    await button(page, pl ? levelPl : levelEn).click();
    await page.getByRole("button", { name: pl ?
      /Sześć własności wykresu z dwiema asymptotami i ukośnymi odcinkami/ :
      /Six properties of a graph with two asymptotes and sloping outer segments/ }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-integrated-asymptotes");
    const figure = page.locator('figure[data-graph-kind="function-integrated-asymptotes"]');
    await expect(figure.locator("svg[role=img]")).toBeVisible();
    await expect(figure.getByTestId("integrated-pole-left")).toHaveCount(1);
    await expect(figure.getByTestId("integrated-pole-right")).toHaveCount(1);
    await expect(figure.getByTestId("integrated-asymptote-middle")).toHaveCount(1);
    await expect(figure.getByTestId("integrated-sloping-segment")).toHaveCount(2);
    await expect(figure.getByTestId("integrated-outer-point")).toHaveCount(4);
    await expect(figure.getByTestId("integrated-x-tick")).toHaveCount(7);
    const leftPole = Number(await figure.getByTestId("integrated-pole-left").getAttribute("data-x"));
    const rightPole = Number(await figure.getByTestId("integrated-pole-right").getAttribute("data-x"));
    expect(leftPole).toBeLessThan(rightPole);
    for (const segment of await figure.getByTestId("integrated-sloping-segment").all())
      expect(Number(await segment.getAttribute("data-slope"))).not.toBe(0);
    const fields = ["domain", "range", "increasing", "decreasing", "injective", "parity"] as const;
    const field = (key: string) => page.locator(key === "domain" ? "#answer" : "#answer-" + key);
    for (const key of fields) {
      await expect(field(key)).toBeVisible();
      expect(await field(key).locator("option").count()).toBeGreaterThan(2);
    }
    await button(page, pl ? "Sprawdź" : "Check").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
    for (const key of fields) {
      const values = await field(key).locator("option").evaluateAll(nodes => nodes
        .map(n => (n as HTMLOptionElement).value).filter(Boolean));
      await field(key).selectOption(values[0]);
    }
    await button(page, pl ? "Sprawdź" : "Check").click();
    await expect(page.locator(".feedback")).toHaveClass(/feedback (correct|incorrect)/);
    await expect(page.locator('[data-field-result="correct"],[data-field-result="incorrect"]')).toHaveCount(6);
    await button(page, pl ? "Pokaż rozwiązanie" : "Show solution").click();
    await button(page, pl ? "Pokaż wszystkie kroki" : "Show all steps").click();
    await expect(page.locator(".solution-panel")).toContainText(pl ? "Zbiór wartości" : "Range");
    await expect(page.locator(".solution-panel")).toContainText(pl ? "Różnowartościowość" : "Injectivity");
    await figure.locator("summary").click();
    await expect(figure.locator(".function-graph-text p")).toContainText(pl ?
      "Lewy ukośny odcinek" : "Left sloping segment");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (!pl) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(runtimeErrors).toEqual([]);
  });
}
