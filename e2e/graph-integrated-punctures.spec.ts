import { test, expect, type Page } from "@playwright/test";
import { polishLearningText } from "./helpers/localization";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

for (const width of [375, 1280]) for (const pl of [true, false])
for (const [level, levelPl, levelEn] of [
  ["hard", "Trudny", "Hard"],
  ["advanced", "Zaawansowany", "Advanced"],
  ["expert", "Ekspert", "Expert"],
] as const) {
  test("F05 P0J punctured six-field graph " + level + " " + width + "px " + (pl ? "PL" : "EN"), async ({ page }) => {
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on("pageerror", e => runtimeErrors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (!pl) await button(page, "English").click();
    await button(page, pl ? "Matematyka na studia" : "University mathematics").click();
    await button(page, pl ? "Funkcje" : "Functions").click();
    await button(page, pl ? levelPl : levelEn).click();
    await page.getByRole("button", {
      name: pl ? /Sześć własności wykresu z dziurami/ : /Six properties of a graph with holes/,
    }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-integrated-punctures");
    const figure = page.locator('figure[data-graph-kind="function-integrated-punctures"]');
    await expect(figure.locator("svg[role=img]")).toBeVisible();
    await expect(figure.getByTestId("punctured-segment")).toHaveCount(4);
    const vertices: { x: number; y: number; included: boolean }[] = [];
    for (let i = 0; i < 5; i++) {
      const n = figure.getByTestId("punctured-node-" + i);
      vertices.push({
        x: Number(await n.getAttribute("data-x")),
        y: Number(await n.getAttribute("data-y")),
        included: await n.getAttribute("data-included") === "true",
      });
    }
    expect(vertices[0].x).toBe(-vertices[4].x);
    expect(vertices[1].x).toBe(-vertices[3].x);
    expect(vertices.filter(n => !n.included).length).toBeGreaterThan(0);
    const fields = ["domain", "range", "increasing", "decreasing", "injective", "parity"] as const;
    const field = (key: string) => page.locator(key === "domain" ? "#answer" : "#answer-" + key);
    for (const key of fields) {
      await expect(field(key)).toBeVisible();
      expect(await field(key).locator("option").count()).toBeGreaterThan(2);
    }
    await button(page, pl ? "Sprawdź" : "Check").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
    // A single unanswered field remains invalid even if the other five are selected.
    for (const key of fields.slice(0, 5)) {
      const options = await field(key).locator("option").evaluateAll(nodes => nodes
        .map(n => (n as HTMLOptionElement).value).filter(Boolean));
      await field(key).selectOption(options[0]);
    }
    await button(page, pl ? "Sprawdź" : "Check").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    const last = field("parity");
    const lastOptions = await last.locator("option").evaluateAll(nodes => nodes
      .map(n => (n as HTMLOptionElement).value).filter(Boolean));
    await last.selectOption(lastOptions[0]);
    await button(page, pl ? "Sprawdź" : "Check").click();
    await expect(page.locator(".feedback")).toHaveClass(/feedback (correct|incorrect)/);
    await expect(page.locator('[data-field-result="correct"],[data-field-result="incorrect"]')).toHaveCount(6);
    await button(page, pl ? "Pokaż rozwiązanie" : "Show solution").click();
    await button(page, pl ? "Pokaż wszystkie kroki" : "Show all steps").click();
    await expect(page.locator(".solution-panel")).toContainText(pl ? "Zbiór wartości" : "Range");
    await expect(page.locator(".solution-panel")).toContainText(pl ? "Różnowartościowość" : "Injectivity");
    await figure.locator("summary").click();
    await expect(figure.locator(".function-graph-text p")).toContainText(pl ? "Puste punkty" : "Hollow points");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (!pl) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(runtimeErrors).toEqual([]);
  });
}
