import { test, expect, type Page } from "@playwright/test";
import { shownFraction } from "./helpers/functions";
import { compare } from "../src/university/realSets";
import { rational as r, addRational as add, subtractRational as sub, divideRational as div } from "../src/rational";
import { selectedSetContains } from "../src/university/functions-audit";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

/** #151 F01: render and solve the source-shaped, one-radical/one-pole family.
 * These are synthetic tasks; private P17 source numbers and keys are not embedded.
 */
for (const width of [375, 1280]) for (const en of [false, true]) {
  test("F01 single radical and one pole: independent browser witness " + width + "px " + (en ? "EN" : "PL"), async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (en) await button(page, "English").click();
    await button(page, en ? "University mathematics" : "Matematyka na studia").click();
    await button(page, en ? "Functions" : "Funkcje").click();
    await button(page, en ? "Medium" : "Średni").click();
    await page.getByRole("button", { name: en
      ? /Domain of a square root divided by a linear factor/
      : /Dziedzina pierwiastka podzielonego przez funkcję liniową/ }).click();
    const question = page.locator(".question");
    await expect(question).toHaveAttribute("data-template-id", "function-radical-over-linear-domain");
    const displayed = await question.innerText();
    expect(displayed).toContain("√");
    const terms = [...displayed.matchAll(/x\s*−\s*\(([^()]*)\)/g)].map(m => shownFraction(m[1]));
    expect(terms, "One radical boundary and exactly one denominator pole in the rendered formula").toHaveLength(2);
    const [boundary, pole] = terms;
    const points = [
      boundary, pole,
      sub(boundary, r(2)), add(boundary, r(2)),
      sub(pole, r(2)), add(pole, r(2)),
      div(add(boundary, pole), r(2)),
    ];
    const allowed = (x: typeof boundary) => compare(x, boundary) >= 0 && compare(x, pole) !== 0;
    const options = await page.locator("#answer option").evaluateAll(nodes =>
      nodes.map(node => (node as HTMLOptionElement).value).filter(value => value.startsWith("set:")));
    const matches = options.filter(key => points.every(x =>
      selectedSetContains(key, x) === allowed(x)));
    expect(matches, "Only one displayed option must satisfy the independent domain conditions").toHaveLength(1);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    const incorrect = options.find(key => key !== matches[0]);
    expect(incorrect).toBeDefined();
    await page.locator("#answer").selectOption(incorrect!);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").selectOption(matches[0]);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
    await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en ? "Domain" : "Dziedzina");
    await expect(page.locator(".solution-final")).toBeVisible();
    if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
