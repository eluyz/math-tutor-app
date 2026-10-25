import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational, type AnswerSpec } from "../src/answers";
import { rational as r, addRational as add } from "../src/rational";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const cases = [
  { id: "analysis-log-domain", category: "functions", level: "easy", pl: "Dziedzina logarytmu", en: "Logarithmic domain" },
  { id: "analysis-absolute", category: "functions", level: "advanced", pl: "Moduł: równania, dziedzina i nierówności", en: "Absolute value: equations, domain and inequalities" },
  { id: "analysis-power-law", category: "algebra", level: "easy", pl: "Prawa logarytmów i potęg", en: "Laws of logarithms and powers" },
  { id: "analysis-elementary-equation", category: "algebra", level: "hard", pl: "Równania wykładnicze i logarytmiczne", en: "Exponential and logarithmic equations" },
  { id: "analysis-log-inequality", category: "algebra", level: "hard", pl: "Nierówności logarytmiczne", en: "Logarithmic inequalities" },
] as const;

async function enter(page: Page, spec: AnswerSpec, wrong: boolean) {
  if (spec.kind === "scalar") await page.locator("#answer").fill(formatRational(wrong ? add(spec.value, r(1)) : spec.value));
  else if (spec.kind === "choice") await page.locator("#answer").selectOption(wrong ? spec.options.find(option => option.value !== spec.value)!.value : spec.value);
  else if (spec.kind === "roots") {
    await page.locator("#answer").selectOption(wrong ? "none" : "two");
    if (!wrong) for (let i = 0; i < spec.values.length; i++) await page.locator(`#root-${i}`).fill(formatRational(spec.values[i]));
  } else throw Error(`Unexpected answer kind ${spec.kind}`);
}

for (const width of [375, 768, 1280]) for (const en of [false, true]) test(`MT-EDU-007 P0 ${width}px ${en ? "EN" : "PL"}: domains, laws, equations, inequalities and absolute value`, async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  if (en) await button(page, "English").click();
  for (const item of cases) {
    await button(page, item.category === "functions" ? en ? "University mathematics" : "Matematyka na studia" : en ? "Review the basics" : "Powtórka podstaw").click();
    await button(page, item.category === "functions" ? en ? "Functions" : "Funkcje" : en ? "Algebra basics" : "Podstawy algebry").click();
    await button(page, ({ easy: en ? "Easy" : "Łatwy", advanced: en ? "Advanced" : "Zaawansowany", hard: en ? "Hard" : "Trudny" } as const)[item.level]).click();
    await page.locator("button.exercise-item:not([disabled])").filter({ hasText: item[en ? "en" : "pl"] }).click();
    const question = await page.locator(".question").innerText();
    const task = taskPool(item.category, item.level).filter(candidate => candidate.templateId === item.id).map(candidate => localizeTask(candidate, en ? "en" : "pl")).find(candidate => candidate.question === question);
    expect(task, `${item.id}: rendered question must belong to the declared pool`).toBeDefined();
    const spec = getAnswerSpec(task!);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await enter(page, spec, true);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await enter(page, spec, false);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
    await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en ? "Final answer" : "Końcowa odpowiedź");
    if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  expect(errors).toEqual([]);
});
