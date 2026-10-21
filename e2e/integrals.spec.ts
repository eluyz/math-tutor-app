import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational, type AnswerSpec } from "../src/answers";
import { polishLearningText } from "./helpers/localization";

const cases = [
  { id: "integral-direct", level: "hard", pl: "Całki bezpośrednie wielomianów", en: "Direct polynomial integrals" },
  { id: "integral-table", level: "hard", pl: "Całki tablicowe i trygonometryczne", en: "Table and trigonometric integrals" },
  { id: "integral-substitution", level: "advanced", pl: "Podstawienie w całce", en: "Substitution in integrals" },
  { id: "integral-parts", level: "expert", pl: "Całkowanie przez części", en: "Integration by parts" },
  { id: "integral-recurring", level: "expert", pl: "Całki powracające", en: "Recurring integrals" },
  { id: "integral-definite", level: "expert", pl: "Całki oznaczone wielomianów", en: "Definite polynomial integrals" },
] as const;
const levelNames = { hard: ["Trudny", "Hard"], advanced: ["Zaawansowany", "Advanced"], expert: ["Ekspert", "Expert"] };
async function fill(page: Page, spec: AnswerSpec, wrong: boolean) {
  if (spec.kind === "scalar") {
    await page.locator("#answer").fill(wrong ? "99999" : formatRational(spec.value));
  } else if (spec.kind === "primitive") {
    for (let i = 0; i < spec.terms.length; i++)
      await page.locator(i ? `#answer-${i}` : "#answer").fill(wrong && i === 0 ? "99999" : formatRational(spec.terms[i].coefficient));
    await page.getByRole("checkbox", { name: /(?:Dodaj stałą całkowania|Include integration constant)/ }).check();
  } else throw new Error(`Unexpected answer kind: ${spec.kind}`);
}
for (const width of [375, 768, 1280]) for (const en of [false, true])
  test(`MT-EDU-008 ${width}px ${en ? "EN" : "PL"}: six integral families, answers and solutions`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    if (en) await page.getByRole("button", { name: "English", exact: true }).click();
    await page.getByRole("button", { name: en ? "University mathematics" : "Matematyka na studia", exact: true }).click();
    await page.getByRole("button", { name: en ? "Integrals" : "Całki", exact: true }).click();
    for (const item of cases) {
      await page.getByRole("group", { name: en ? "Difficulty level" : "Poziom trudności" })
        .getByRole("button", { name: levelNames[item.level][en ? 1 : 0], exact: true }).click();
      await page.locator(".exercise-item").filter({ has: page.getByText(item[en ? "en" : "pl"], { exact: true }) }).click();
      const question = await page.locator(".question").innerText();
      const task = taskPool("integrals", item.level).filter((candidate) => candidate.templateId === item.id)
        .map((candidate) => localizeTask(candidate, en ? "en" : "pl")).find((candidate) => candidate.question === question);
      expect(task, `${item.id} must be in its declared pool`).toBeDefined();
      const spec = getAnswerSpec(task!);
      await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
      if (spec.kind === "primitive") {
        await fill(page, spec, false);
        await page.getByRole("checkbox", { name: /(?:Dodaj stałą całkowania|Include integration constant)/ }).uncheck();
        await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
        await expect(page.locator(".feedback")).toContainText(en ? "+C is missing" : "brakuje stałej całkowania +C");
      }
      await fill(page, spec, true);
      await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await fill(page, spec, false);
      await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await page.getByRole("button", { name: en ? "Show solution" : "Pokaż rozwiązanie" }).click();
      await page.getByRole("button", { name: en ? "Show all steps" : "Pokaż wszystkie kroki" }).click();
      await expect(page.locator(".solution-panel")).toContainText(en ? "Final answer" : "Końcowa odpowiedź");
      if (spec.kind === "primitive") await expect(page.locator(".solution-panel")).toContainText("+ C");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
    if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(errors).toEqual([]);
  });

test("MT-EDU-008: active integral session locks category/level and preserves notes and answer on language switch", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Matematyka na studia", exact: true }).click();
  await page.getByRole("button", { name: "Całki", exact: true }).click();
  await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
  const first = await page.locator(".question").getAttribute("data-exercise-run");
  await expect(page.getByRole("button", { name: "Pochodne", exact: true })).toBeDisabled();
  await expect(page.getByRole("group", { name: "Poziom trudności" }).getByRole("button", { name: "Trudny", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Pokaż brudnopis" }).click();
  await page.getByRole("button", { name: "Pisz", exact: true }).click();
  await page.getByLabel("Notatki tekstowe").fill("∫ x dx");
  await page.locator("#answer").fill("1/2");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".question")).toHaveAttribute("data-exercise-run", first!);
  await expect(page.getByLabel("Text notes")).toHaveValue("∫ x dx");
  await expect(page.locator("#answer")).toHaveValue("1/2");
  await expect(page.locator(".session-progress")).toHaveText("Session: exercise 1 of 10");
  const sessionQuestions = new Set<string>();
  for (let i = 0; i < 10; i++) {
    sessionQuestions.add(await page.locator(".question").innerText());
    await page.getByRole("button", { name: i === 9 ? "Finish session" : "Next exercise" }).click();
  }
  expect(sessionQuestions.size).toBe(10);
  await expect(page.getByText("Session complete!")).toBeVisible();
});
