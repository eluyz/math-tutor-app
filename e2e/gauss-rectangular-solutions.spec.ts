import { expect, test, type Page } from "@playwright/test";
import { createGenerator } from "../src/generators";
import { HISTORY_KEY } from "../src/progress/model";
import { shownFraction } from "./helpers/functions";
import { fillParametricSystem, fractionText, parametricCoefficients } from "./helpers/systems";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const shapes = ["3x2", "4x3", "2x3"] as const;
const id = (shape: string) => `gauss-rectangular-${shape}-parameters`;
async function open(page: Page, width: number, en: boolean) {
  await page.setViewportSize({ width, height: 950 });
  await page.goto("/");
  if (en) await button(page, "English").click();
  await button(page, en ? "University mathematics" : "Matematyka na studia").click();
  await button(page, en ? "Systems of equations" : "Układy równań").click();
}
for (const width of [375, 1280]) for (const en of [false, true])
  test(`MT-EDU-014 P2 ${width}px ${en ? "EN" : "PL"}: all rectangular coefficient forms and levels`, async ({ page }) => {
    await open(page, width, en);
    for (const shape of shapes) for (const expert of [false, true]) {
      const level = shape === "3x2" ? expert ? "advanced" : "hard" : expert ? "expert" : "advanced";
      const label = level === "hard" ? en ? "Hard" : "Trudny" : level === "expert" ? en ? "Expert" : "Ekspert" : en ? "Advanced" : "Zaawansowany";
      await button(page, label).click();
      await page.getByRole("button", { name: new RegExp(`Gauss ${shape.replace("x", "×")}:`) }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", id(shape));
      const table = page.locator(".linear-algebra-matrices .given-matrix");
      const augmented = await Promise.all((await table.locator("tbody tr").all()).map(async row =>
        (await row.locator("td").allTextContents()).map(shownFraction)));
      expect(augmented.length).toBe(Number(shape[0]));
      expect(augmented[0].length - 1).toBe(Number(shape[2]));
      const expected = parametricCoefficients(augmented);
      const fields = page.locator("form .coefficient-field input");
      await expect(fields).toHaveCount(Number(shape[2]) * (expected.free.length + 1));
      await button(page, en ? "Check" : "Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
      await fillParametricSystem(page);
      await page.locator("#answer").fill("987654");
      await button(page, en ? "Check" : "Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.locator("#answer").fill(fractionText(expected.values[0]));
      // Language changes preserve the same task, every coefficient and text-editor history.
      const questionId = await page.locator(".question").getAttribute("data-template-id");
      await button(page, en ? "Show scratchpad" : "Pokaż brudnopis").click();
      await button(page, en ? "Write" : "Pisz").click();
      const notes = page.locator("#scratchpad-text");
      await notes.pressSequentially("Ax=b");
      await button(page, en ? "Polski" : "English").click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", questionId!);
      await expect(page.locator("#answer")).toHaveValue(fractionText(expected.values[0]));
      await expect(notes).toHaveValue("Ax=b");
      await notes.focus(); await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("");
      await notes.press("ControlOrMeta+Shift+z"); await expect(notes).toHaveValue("Ax=b");
      await button(page, en ? "English" : "Polski").click();
      await button(page, en ? "Hide scratchpad" : "Schowaj brudnopis").click();
      await button(page, en ? "Check" : "Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
      await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
      await expect(page.locator(".solution-panel")).toContainText("RREF");
      await expect(page.locator(".solution-panel")).toContainText(en ? "constant terms satisfy Ax=b" : "wyrazy stałe spełniają Ax=b");
      if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
  });

// Fix only the session's seed, not its tasks or answers. Solve the first new
// exercise independently from the visible matrix; the remaining category-wide
// questions use the ordinary skip flow and remain unique.
const seeds = Object.fromEntries(shapes.map(shape => {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const seed = 1_000_000 + attempt * 7919;
    if (createGenerator(seed).next("systems", "advanced").exercise.templateId === id(shape)) return [shape, seed];
  }
  throw Error(`No deterministic session seed for ${shape}`);
}));
for (const width of [375, 1280]) for (const en of [false, true]) for (const shape of shapes)
  test(`MT-EDU-014 P2 session ${shape} ${width}px ${en ? "EN" : "PL"}: ten tasks and honest history`, async ({ page }) => {
    await open(page, width, en);
    await button(page, en ? "Advanced" : "Zaawansowany").click();
    await page.clock.setFixedTime(new Date(seeds[shape]));
    await button(page, en ? "Start a session (10 exercises)" : "Rozpocznij sesję (10 zadań)").click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", id(shape));
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await fillParametricSystem(page);
    await button(page, en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      await expect(page.locator(".session-progress")).toContainText(`${i + 1}`);
      const question = await page.locator(".question").innerText();
      expect(seen.has(question)).toBe(false); seen.add(question);
      await button(page, i === 9 ? en ? "Finish session" : "Zakończ sesję" : en ? "Next exercise" : "Następne zadanie").click();
    }
    await expect(page.getByRole("region", { name: en ? "Session complete!" : "Sesja zakończona!" })).toBeVisible();
    const history = JSON.parse((await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY))!);
    expect(history.sessions).toHaveLength(1);
    expect(history.sessions[0].correct).toBe(1);
    expect(history.sessions[0].skipped).toBe(9);
    expect(history.sessions[0].shown).toBe(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
