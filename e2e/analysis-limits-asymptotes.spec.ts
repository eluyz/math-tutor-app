import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational, type AnswerSpec } from "../src/answers";
import { rational as r, addRational as add } from "../src/rational";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const cases = [
  { id: "analysis-euler-sequence", category: "sequence-limits", level: "expert", pl: "Granica Eulera ciągu", en: "Euler limit of a sequence" },
  { id: "analysis-euler-function", category: "function-limits", level: "hard", pl: "Granica Eulera funkcji", en: "Euler limit of a function" },
  { id: "analysis-asymptote-vertical", category: "function-limits", level: "advanced", pl: "Asymptota pionowa lub dziura", en: "Vertical asymptote or removable hole" },
  { id: "analysis-asymptote-horizontal", category: "function-limits", level: "hard", pl: "Asymptoty poziome w obu kierunkach", en: "Horizontal asymptotes in both directions" },
  { id: "analysis-asymptote-oblique", category: "function-limits", level: "expert", pl: "Asymptota ukośna i pozioma", en: "Oblique and horizontal asymptotes" },
] as const;
async function enter(page: Page, spec: AnswerSpec, wrong: boolean) {
  if (spec.kind === "scalar") await page.locator("#answer").fill(formatRational(wrong ? add(spec.value, r(1)) : spec.value));
  else if (spec.kind === "choice") await page.locator("#answer").selectOption(wrong ? spec.options.find(option => option.value !== spec.value)!.value : spec.value);
  else throw Error(`Unexpected answer kind ${spec.kind}`);
}
for (const width of [375, 768, 1280]) for (const en of [false, true]) test(`MT-EDU-007 P1 ${width}px ${en ? "EN" : "PL"}: Euler and asymptotes`, async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  if (en) await button(page, "English").click();
  for (const item of cases) {
    await button(page, en ? "University mathematics" : "Matematyka na studia").click();
    await button(page, item.category === "sequence-limits" ? en ? "Limits of sequences" : "Granice ciągów" : en ? "Limits of functions" : "Granice funkcji").click();
    await button(page, ({ expert: en ? "Expert" : "Ekspert", advanced: en ? "Advanced" : "Zaawansowany", hard: en ? "Hard" : "Trudny" } as const)[item.level]).click();
    await page.getByRole("button", { name: item[en ? "en" : "pl"], exact: false }).click();
    const question = await page.locator(".question").innerText();
    const task = taskPool(item.category, item.level).filter(candidate => candidate.templateId === item.id).map(candidate => localizeTask(candidate, en ? "en" : "pl")).find(candidate => candidate.question === question);
    expect(task, `${item.id}: question in declared pool`).toBeDefined();
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
