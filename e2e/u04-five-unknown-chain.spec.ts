import { expect, test, type Page } from "@playwright/test";
import { createGenerator } from "../src/generators";
import { HISTORY_KEY } from "../src/progress/model";
import { a, q } from "../src/university/audit";
import { polishLearningText } from "./helpers/localization";
import { fractionText, readFiveUnknownChain } from "./helpers/systems";

const familyId = "system-chain-five-unknowns";
async function open(page: Page, width: number, en: boolean) {
  await page.setViewportSize({ width, height: 950 });
  await page.goto("/");
  if (en) await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: en ? "University mathematics" : "Matematyka na studia", exact: true }).click();
  await page.getByRole("button", { name: en ? "Systems of equations" : "Układy równań", exact: true }).click();
}
const difficultyNames = {
  medium: { pl: "Średni", en: "Medium" },
  hard: { pl: "Trudny", en: "Hard" },
  advanced: { pl: "Zaawansowany", en: "Advanced" },
  expert: { pl: "Ekspert", en: "Expert" },
} as const;

for (const width of [375, 1280])
  for (const en of [false, true])
    test(`U04 ${width}px ${en ? "EN" : "PL"}: independently solve all visible five-unknown chain difficulty forms`, async ({ page }) => {
      test.setTimeout(140_000);
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await open(page, width, en);
      for (const level of ["medium", "hard", "advanced", "expert"] as const) {
        await page.getByRole("button", {
          name: difficultyNames[level][en ? "en" : "pl"], exact: true,
        }).click();
        const title = en
          ? "Five unknowns in a five-equality chain — find x"
          : "Pięć niewiadomych w łańcuchu pięciu równości — oblicz x";
        const family = page.locator(".exercise-list-items button.exercise-item").filter({ hasText: title });
        await expect(family, "Exactly one source-shaped five-unknown family").toHaveCount(1);
        await family.click();
        const question = page.locator(".question");
        await expect(question).toHaveAttribute("data-template-id", familyId);
        const text = await question.innerText();
        const computed = readFiveUnknownChain(text);
        expect(computed.expressions).toHaveLength(6);
        expect(computed.expressions.every(e => e.coefficients.length === 5)).toBe(true);
        await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").fill(fractionText(a(computed.answer, q(1))));
        await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").fill(fractionText(computed.answer));
        await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await page.getByRole("button", { name: en ? "Show solution" : "Pokaż rozwiązanie", exact: true }).click();
        await page.getByRole("button", { name: en ? "Show all steps" : "Pokaż wszystkie kroki", exact: true }).click();
        await expect(page.locator(".solution-panel")).toContainText("E6=");
        await expect(page.locator(".solution-panel")).toContainText("x=");
        if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      }
      expect(errors).toEqual([]);
    });

const sessionSeed = (() => {
  for (let attempt = 0; attempt < 20_000; attempt++) {
    const seed = 3_000_000 + attempt * 7919;
    if (createGenerator(seed).next("systems", "advanced").exercise.templateId === familyId) return seed;
  }
  throw Error("Cannot find deterministic U04 mixed-session seed");
})();

for (const en of [false, true])
  test(`U04 375px ${en ? "EN" : "PL"}: ten-exercise session records correct original-chain result and nine skips`, async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, 375, en);
    await page.getByRole("button", {
      name: en ? "Advanced" : "Zaawansowany", exact: true,
    }).click();
    await page.clock.setFixedTime(new Date(sessionSeed));
    await page.getByRole("button", {
      name: en ? "Start a session (10 exercises)" : "Rozpocznij sesję (10 zadań)", exact: true,
    }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", familyId);
    const first = readFiveUnknownChain(await page.locator(".question").innerText());
    await page.locator("#answer").fill(fractionText(first.answer));
    await page.getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true }).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const question = await page.locator(".question").innerText();
      expect(seen.has(question)).toBe(false);
      seen.add(question);
      await page.getByRole("button", {
        name: i === 9 ? en ? "Finish session" : "Zakończ sesję" : en ? "Next exercise" : "Następne zadanie",
        exact: true,
      }).click();
    }
    const historyText = await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY);
    if (!historyText) throw Error("Missing persisted ten-question session");
    const history = JSON.parse(historyText);
    expect(history.sessions).toHaveLength(1);
    expect(history.sessions[0].shown).toBe(10);
    expect(history.sessions[0].correct).toBe(1);
    expect(history.sessions[0].skipped).toBe(9);
    expect(history.sessions[0].entries[0].templateId).toBe(familyId);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
