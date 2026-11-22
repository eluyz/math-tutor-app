import { expect, test, type Locator, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";
import { numeric } from "./helpers/arithmetic";

const labels = {
  pl: {
    title: "ST-106 — Tabele liczebności", status: "W rozwoju", switchLocale: "English",
    caption: "Tabela liczebności", columns: ["Wartość", "Liczebność"],
    group: "Wybierz jedną odpowiedź", check: "Sprawdź", next: "Następne zadanie",
    hint1: "Pokaż podpowiedź", hint2: "Pokaż drugą podpowiedź", show: "Pokaż rozwiązanie",
    empty: "Wybierz odpowiedź, aby ją sprawdzić.", invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    correct: "Poprawna odpowiedź.", incorrect: "Odpowiedź jest inna.",
  },
  en: {
    title: "ST-106 — Frequency tables", status: "Work in progress", switchLocale: "Polski",
    caption: "Frequency table", columns: ["Value", "Frequency"],
    group: "Choose one answer", check: "Check", next: "Next exercise",
    hint1: "Show hint", hint2: "Show second hint", show: "Show solution",
    empty: "Choose an answer before checking it.", invalid: "Choose one of the answers offered for this question.",
    correct: "Correct answer.", incorrect: "The answer differs.",
  },
} as const;
type Locale = keyof typeof labels;
type Unit = "count" | "relative" | "percentage";

const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const statistics = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Statystyka i prawdopodobieństwo|Statistics & Probability/ });
const mathematics = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Matematyka Dostępne|Mathematics Available/ });
const question = (panel: Locator) => panel.locator("#statistics-question");
const tableFor = (panel: Locator) => panel.locator("#statistics-question-table");
const choiceOrder = (radios: Locator) => radios.evaluateAll(elements => elements.map(element => (element as HTMLInputElement).value));

async function openFrequencyLesson(page: Page, locale: Locale) {
  await page.goto("/");
  if (locale === "en") await button(page, "English").click();
  await statistics(page).click();
  const panel = page.locator(".statistics-practice");
  await expect(panel.getByText(labels[locale].status, { exact: true })).toBeVisible();
  await panel.locator("[data-topic=data-tables]").focus();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("heading", { name: labels[locale].title, exact: true })).toBeVisible();
  await expect(panel.getByRole("radio").first()).toBeFocused();
  return panel;
}

function selectionFromPrompt(prompt: string): { unit: Unit; family: string; includes: (value: number) => boolean } {
  const targets = (prompt.match(/-?\d+/g) ?? []).map(Number);
  if (/łącznie|in total/.test(prompt)) return { unit: "count", family: "total", includes: () => true };
  if (/co najwyżej|at most/.test(prompt)) {
    expect(targets).toHaveLength(1);
    return { unit: "count", family: "cumulative", includes: value => value <= targets[0] };
  }
  if (/inną niż|other than/.test(prompt)) {
    expect(targets).toHaveLength(1);
    return { unit: "percentage", family: "complement", includes: value => value !== targets[0] };
  }
  if (/ lub | or /.test(prompt)) {
    expect(targets).toHaveLength(2);
    return { unit: "relative", family: "subset", includes: value => targets.includes(value) };
  }
  expect(targets).toHaveLength(1);
  const unit = /procent|percentage/i.test(prompt) ? "percentage"
    : /częstość względna|relative frequency/i.test(prompt) ? "relative" : "count";
  return { unit, family: unit, includes: value => value === targets[0] };
}

function readOption(label: string, unit: Unit): [bigint, bigint] {
  const pattern = unit === "percentage" ? /^(?:(\d+)|\((\d+)\/(\d+)\))%$/
    : unit === "relative" ? /^(\d+)(?:\/(\d+))?$/ : /^(\d+)$/;
  const match = pattern.exec(label);
  expect(match, `${label} must use the question's ${unit} notation`).not.toBeNull();
  const [, whole, first, second] = match!;
  return unit === "percentage" ? [BigInt(whole ?? first), BigInt(second ?? 1)] : [BigInt(whole), BigInt(first ?? 1)];
}

// Calculate from the visible prompt, row headers and counts. No production answer code is used.
async function visibleOracle(panel: Locator) {
  const table = tableFor(panel);
  const prompt = await question(panel).innerText();
  const { unit, family, includes } = selectionFromPrompt(prompt);
  const values = (await table.getByRole("rowheader").allTextContents()).map(Number);
  const frequencies = (await table.getByRole("cell").allTextContents()).map(Number);
  expect(values.length).toBeGreaterThanOrEqual(3);
  expect(new Set(values).size).toBe(values.length);
  expect(values).toContain(0);
  expect(values.some(value => value < 0)).toBe(true);
  expect(values.every(Number.isSafeInteger)).toBe(true);
  expect(frequencies).toHaveLength(values.length);
  expect(frequencies.every(count => Number.isSafeInteger(count) && count >= 0)).toBe(true);
  const total = frequencies.reduce((sum, count) => sum + count, 0);
  const selected = frequencies.reduce((sum, count, index) => sum + (includes(values[index]) ? count : 0), 0);
  expect(total).toBeGreaterThan(0);
  const denominator = unit === "count" ? 1n : BigInt(total);
  const numerator = BigInt(selected) * (unit === "percentage" ? 100n : 1n);
  const choices = await panel.locator(".statistics-choice span").allTextContents();
  expect(new Set(choices).size).toBe(3);
  const exact = choices.map(choice => readOption(choice, unit));
  for (const [index, [n, d]] of exact.entries()) {
    expect(d).toBeGreaterThan(0n);
    for (const [previousN, previousD] of exact.slice(0, index)) expect(n * previousD).not.toBe(previousN * d);
  }
  const correct = exact.flatMap(([n, d], index) => n * denominator === numerator * d ? [index] : []);
  expect(correct).toHaveLength(1);
  return { values, frequencies, total, selected, family, index: correct[0], answer: choices[correct[0]] };
}

async function expectNoOverflow(page: Page, table?: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (table) expect(await table.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
}

async function confirmDiscard(page: Page, action: () => Promise<void>, accept: boolean) {
  await Promise.all([
    page.waitForEvent("dialog").then(async dialog => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toMatch(/Changing the lesson.*answer|Zmiana lekcji.*odpowiedź/);
      if (accept) await dialog.accept();
      else await dialog.dismiss();
    }),
    action(),
  ]);
}

const levels = [
  { level: "easy", families: ["count", "total"] },
  { level: "medium", families: ["percentage", "relative", "percentage", "relative", "percentage"] },
  { level: "hard", families: ["subset", "cumulative", "complement"] },
] as const;

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  const c = labels[locale];
  const other = labels[locale === "pl" ? "en" : "pl"];
  test.describe(`ST-106 ${locale.toUpperCase()} ${width}px`, () => {
    test.use({ viewport: { width, height: 850 } });

    test("reads each table family and grades exact counts, fractions and percentages", async ({ page }) => {
      const panel = await openFrequencyLesson(page, locale);
      const table = tableFor(panel);
      const radios = panel.getByRole("radio");
      const group = panel.getByRole("radiogroup", { name: c.group });
      await expect(group).toHaveAttribute("aria-details", "statistics-question-table");
      await expect(table).toHaveAccessibleName(c.caption);
      await expect(table.getByRole("columnheader")).toHaveText([...c.columns]);
      await expect(table.locator("thead th[scope=col]")).toHaveCount(2);
      await expect(table.locator("tbody th:not([scope=row])")).toHaveCount(0);

      const cardBox = (await panel.locator(".statistics-task-panel").boundingBox())!;
      const selectorBox = (await panel.locator(".statistics-catalog").boundingBox())!;
      expect(selectorBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height - 1);
      expect(Math.abs(cardBox.x - selectorBox.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(cardBox.width - selectorBox.width)).toBeLessThanOrEqual(2);

      for (const { level, families } of levels) {
        await panel.locator(`[data-level=${level}]`).click();
        for (const [seed, family] of families.entries()) {
          await expect(question(panel)).toHaveAttribute("data-exercise-id", `st106-${level}-${seed}`);
          await expect(table).toBeVisible();
          await expect(table).toHaveAccessibleDescription(await question(panel).innerText());
          await expect(radios).toHaveCount(3);
          const ids = await choiceOrder(radios);
          expect(new Set(ids).size).toBe(3);
          const result = await visibleOracle(panel);
          expect(result.family).toBe(family);
          if (level === "medium" && seed < 5 && seed !== 3) {
            expect(result.answer).toBe(["(100/3)%", "1/2", "0%", "", "100%"][seed]);
          }
          if (level === "easy" && seed === 0) {
            expect(result.answer).toBe("0");
            await button(panel, c.check).click();
            await expect(panel.locator(".feedback")).toHaveText(c.empty);
            await radios.nth((result.index + 1) % 3).check();
            await button(panel, c.check).click();
            await expect(panel.locator(".feedback")).toHaveClass(/\bincorrect\b/);
            await expect(panel.locator(".feedback")).toContainText(c.incorrect);
          }
          await radios.nth(result.index).check();
          await button(panel, c.check).click();
          await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
          await expect(panel.locator(".feedback")).toContainText(c.correct);
          await button(panel, c.show).click();
          await expect(panel.locator(".solution-calculation").first())
            .toHaveText(`N = ${result.frequencies.join(" + ")} = ${result.total}`);
          await expect(panel.locator(".solution-calculation").nth(1)).toHaveText(new RegExp(`(?:^| = )${result.selected}$`));
          await expect(panel.locator(".solution-answer")).toContainText(`${result.answer}.`);
          await expectNoOverflow(page, table);
          if (seed + 1 < families.length) {
            await button(panel, c.next).click();
            await expect(radios.first()).toBeFocused();
            await expect(group.getByRole("radio", { checked: true })).toHaveCount(0);
            await expect(panel.locator(".feedback,.solution-panel")).toHaveCount(0);
          }
        }
      }
    });

    test("preserves bilingual draft and assessment, handles native keys and confirms task replacement", async ({ page }) => {
      const panel = await openFrequencyLesson(page, locale);
      const radios = panel.getByRole("radio");
      const first = radios.first();
      const group = panel.getByRole("radiogroup");
      await button(panel, c.check).click();
      await expect(first).toBeFocused();
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await page.keyboard.press("Space");
      await expect(first).toBeChecked();
      expect(await first.evaluate(element => element.matches(":focus-visible") &&
        getComputedStyle(element.closest("label")!).outlineStyle !== "none")).toBe(true);
      await page.keyboard.press("ArrowRight");
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(button(panel, c.check)).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(radios.nth(1)).toBeFocused();

      const initialPrompt = await question(panel).innerText();
      const initialChoices = await choiceOrder(radios);
      const source = await visibleOracle(panel);
      await button(panel, c.hint1).click();
      await expect(panel.locator(".learning-hint")).toHaveCount(1);
      await button(panel, c.hint2).click();
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      const firstHints = await panel.locator(".learning-hint").allTextContents();
      await button(panel, c.show).click();
      const calculations = await panel.locator(".solution-calculation").allTextContents();
      await button(page, c.switchLocale).click();
      await expect(panel.getByRole("heading", { name: other.title, exact: true })).toBeVisible();
      await expect(tableFor(panel)).toHaveAccessibleName(other.caption);
      await expect(group).toHaveAccessibleName(other.group);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st106-easy-0");
      expect(await visibleOracle(panel)).toEqual(source);
      expect(await choiceOrder(radios)).toEqual(initialChoices);
      await expect(radios.nth(1)).toBeChecked();
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      expect(await panel.locator(".learning-hint").allTextContents()).not.toEqual(firstHints);
      await expect(panel.locator(".solution-calculation")).toHaveText(calculations);

      for (const target of [
        button(panel, other.next), panel.locator("[data-level=medium]"),
        panel.locator("[data-topic=median]"), panel.locator("[data-track=university]"),
      ]) {
        await confirmDiscard(page, () => target.click(), false);
        await expect(question(panel)).toHaveAttribute("data-exercise-id", "st106-easy-0");
        await expect(radios.nth(1)).toBeChecked();
        await expect(panel.locator(".learning-hint")).toHaveCount(2);
        await expect(panel.locator(".solution-panel")).toBeVisible();
      }

      await button(panel, other.check).click();
      const state = source.index === 1 ? "correct" : "incorrect";
      await expect(panel.locator(".feedback")).toContainText(other[state]);
      await button(page, other.switchLocale).click();
      await expect(panel.locator(".feedback")).toContainText(c[state]);
      await mathematics(page).click();
      await expect(panel).toBeHidden();
      await statistics(page).click();
      await expect(radios.nth(1)).toBeChecked();
      await expect(panel.locator(".feedback")).toContainText(c[state]);
      await expect(panel.locator(".solution-calculation")).toHaveText(calculations);

      await first.check();
      await confirmDiscard(page, () => button(panel, c.next).click(), true);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st106-easy-1");
      await expect(first).toBeFocused();
      await expect(group.getByRole("radio", { checked: true })).toHaveCount(0);
      await expect(panel.locator(".learning-hint,.solution-panel,.feedback")).toHaveCount(0);
      const nextPrompt = await question(panel).innerText();
      const nextChoices = await choiceOrder(radios);

      // Inject a stale ID through the real radio to exercise the invalid UI path.
      await first.evaluate((element, stale) => { (element as HTMLInputElement).value = stale; }, initialChoices[0]);
      await first.click();
      await button(panel, c.check).click();
      await expect(panel.locator(".feedback")).toHaveText(c.invalid);
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await expect(first).toBeFocused();
      await panel.locator("[data-topic=mean]").click();
      await panel.locator("[data-topic=data-tables]").click();
      await expect(question(panel)).toHaveText(initialPrompt);
      expect(await choiceOrder(radios)).toEqual(initialChoices);
      await button(panel, c.next).click();
      await expect(question(panel)).toHaveText(nextPrompt);
      expect(await choiceOrder(radios)).toEqual(nextChoices);

      await button(panel, c.show).click();
      await radios.nth(1).check();
      const university = panel.locator("[data-track=university]");
      await university.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => scrollY);
      const target = (await university.boundingBox())!;
      await confirmDiscard(page, () => page.mouse.click(target.x + target.width / 2, target.y + target.height / 2), true);
      await expect(university).toHaveAttribute("aria-pressed", "true");
      await expect(university).toBeFocused();
      await expect(question(panel)).toHaveCount(0);
      await expect(panel.locator(".category-picker button:enabled")).toHaveCount(0);
      const deviations = await page.evaluate(async previous => {
        const samples: number[] = [];
        for (let frame = 0; frame < 6; frame++) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
          samples.push(Math.abs(scrollY - Math.min(previous, maximum)));
        }
        return samples;
      }, before);
      expect(Math.max(...deviations)).toBeLessThanOrEqual(2);
      await expectNoOverflow(page);
    });
  });
}

for (const locale of ["pl", "en"] as const) {
  test(`ST-106 ${locale.toUpperCase()} 320px shows the table and exact fractional percentage`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    const panel = await openFrequencyLesson(page, locale);
    await panel.locator("[data-level=medium]").click();
    const { answer, index } = await visibleOracle(panel);
    expect(answer).toBe("(100/3)%");
    await panel.getByRole("radio").nth(index).check();
    await button(panel, labels[locale].check).click();
    await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
    await button(panel, labels[locale].show).click();
    await expect(panel.locator(".solution-calculation").last()).toHaveText("(100 × 1/3)% = (100/3)%");
    await expectNoOverflow(page, tableFor(panel));
  });
}

test("ST-106 preserves ST-101–105, Mathematics progress and exam lock", async ({ page }) => {
  await page.goto("/");
  await button(page, "English").click();
  await button(page, "Multiplication first").click();
  await button(page, "Start a session (10 exercises)").click();
  const result = numeric(await page.locator(".practice .question").innerText());
  await page.locator("#answer").fill(`${result.numerator}/${result.denominator}`);
  await button(page, "Check").click();
  await expect(page.locator(".practice .feedback")).toHaveClass(/\bcorrect\b/);
  for (let index = 0; index < 10; index++) await button(page, index === 9 ? "Finish session" : "Next exercise").click();
  const history = () => page.evaluate(key => localStorage.getItem(key), HISTORY_KEY);
  const saved = await history();
  expect(saved).not.toBeNull();
  expect(JSON.parse(saved!).sessions[0]).toMatchObject({ correct: 1, skipped: 9 });

  await statistics(page).click();
  const panel = page.locator(".statistics-practice");
  await panel.locator("[data-topic=data-tables]").click();
  const frequency = await visibleOracle(panel);
  await panel.getByRole("radio").nth(frequency.index).check();
  await button(panel, "Check").click();
  await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);

  for (const [topic, lesson, answer] of [["mean", "mean", "2"], ["median", "median", "2"], ["dispersion", "variance", "2/5"]]) {
    await panel.locator(`[data-topic=${topic}]`).click();
    await expect(question(panel)).toHaveAttribute("data-lesson", lesson);
    await panel.locator("#statistics-answer").fill(answer);
    await button(panel, "Check").click();
    await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
  }
  await panel.locator("[data-topic=interpretation]").click();
  await expect(question(panel)).toHaveAttribute("data-exercise-id", "st104-easy-0");
  await panel.locator('input[value="mean-equals-median"]').check();
  await button(panel, "Check").click();
  await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);

  await panel.locator("[data-topic=mode]").click();
  await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-easy-0");
  const displayed = (await question(panel).innerText()).match(/\[(-?\d+(?:, -?\d+)*)\]/);
  expect(displayed).not.toBeNull();
  const observations = displayed![1].split(", ").map(Number);
  const frequencies = [...new Set(observations)].map(value => ({ value, count: observations.filter(item => item === value).length }));
  const maximum = Math.max(...frequencies.map(row => row.count));
  const modes = frequencies.filter(row => row.count === maximum).map(row => row.value).sort((a, b) => a - b);
  await panel.getByRole("radio", { name: `{${modes.join(", ")}}`, exact: true }).check();
  await button(panel, "Check").click();
  await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);

  await mathematics(page).click();
  expect(await history()).toBe(saved);
  await button(page, "My progress").click();
  await expect(page.locator("#progress-title")).toBeFocused();
  await expect(page.locator('.progress-totals [data-stat="sessions"]')).toHaveText("1");
  await button(page, "Exam").click();
  await button(page, "Start exam").click();
  await expect(statistics(page)).toBeDisabled();
  await expect(page.locator(".exam-work .question")).toBeVisible();
  await expect(panel).toBeHidden();
  expect(await history()).toBe(saved);
});
