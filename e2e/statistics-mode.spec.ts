import { expect, test, type Locator, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";
import { numeric } from "./helpers/arithmetic";

const labels = {
  pl: {
    title: "ST-105 — Dominanta", status: "W rozwoju", switchLocale: "English",
    group: "Wybierz jedną odpowiedź", check: "Sprawdź", next: "Następne zadanie",
    firstHint: "Pokaż podpowiedź", secondHint: "Pokaż drugą podpowiedź",
    show: "Pokaż rozwiązanie", hide: "Ukryj rozwiązanie",
    noMode: "Brak dominanty", caption: "Tabela liczebności", columns: ["Wartość", "Liczebność"],
    empty: "Wybierz odpowiedź, aby ją sprawdzić.", invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    correct: "Poprawna odpowiedź.", incorrect: "Odpowiedź jest inna.",
    progress: "Moje postępy", finish: "Zakończ sesję", session: "Rozpocznij sesję (10 zadań)",
    exam: "Sprawdzian", startExam: "Rozpocznij sprawdzian",
  },
  en: {
    title: "ST-105 — Mode", status: "Work in progress", switchLocale: "Polski",
    group: "Choose one answer", check: "Check", next: "Next exercise",
    firstHint: "Show hint", secondHint: "Show second hint",
    show: "Show solution", hide: "Hide solution",
    noMode: "No mode", caption: "Frequency table", columns: ["Value", "Frequency"],
    empty: "Choose an answer before checking it.", invalid: "Choose one of the answers offered for this question.",
    correct: "Correct answer.", incorrect: "The answer differs.",
    progress: "My progress", finish: "Finish session", session: "Start a session (10 exercises)",
    exam: "Exam", startExam: "Start exam",
  },
} as const;

const statisticsButton = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Statystyka i prawdopodobieństwo|Statistics & Probability/ });
const mathButton = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Matematyka Dostępne|Mathematics Available/ });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const question = (panel: Locator) => panel.locator(".statistics-task-panel .question");
const radioValues = (radios: Locator) => radios.evaluateAll(elements => elements.map(element => (element as HTMLInputElement).value));

async function enterMode(page: Page, locale: keyof typeof labels) {
  await statisticsButton(page).click();
  const panel = page.locator(".statistics-practice");
  await expect(panel.getByText(labels[locale].status, { exact: true })).toBeVisible();
  await panel.locator("[data-topic=mode]").focus();
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("heading", { name: labels[locale].title, exact: true })).toBeVisible();
  await expect(panel.getByRole("radio").first()).toBeFocused();
  return panel;
}

// Read and count the displayed observations. No production Mode module supplies expectations.
async function visibleOracle(panel: Locator) {
  const match = (await question(panel).innerText()).match(/\[(-?\d+(?:, -?\d+)*)\]/);
  expect(match).not.toBeNull();
  const values = match![1].split(", ").map(Number);
  const order = [...new Set(values)].sort((a, b) => a - b);
  const frequencies = order.map(value => values.filter(entry => entry === value).length);
  const maximum = Math.max(...frequencies);
  const modes = order.filter((_, index) => maximum >= 2 && frequencies[index] === maximum);
  return { values, order, frequencies, maximum, modes };
}

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function confirmReplacement(page: Page, target: Locator, accept: boolean) {
  await Promise.all([
    page.waitForEvent("dialog").then(async dialog => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toMatch(/Changing the lesson.*answer|Zmiana lekcji.*odpowiedź/);
      if (accept) await dialog.accept();
      else await dialog.dismiss();
    }),
    target.click(),
  ]);
}

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  const c = labels[locale];
  const other = labels[locale === "pl" ? "en" : "pl"];
  test.describe(`ST-105 ${locale.toUpperCase()} ${width}px`, () => {
    test.use({ viewport: { width, height: 850 } });
    const errors = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      const seen: string[] = [];
      errors.set(page, seen);
      page.on("pageerror", error => seen.push(error.message));
      page.on("console", message => {
        if (message.type() === "error") seen.push(message.text());
      });
      page.on("response", response => {
        if (response.status() >= 400) seen.push(`HTTP ${response.status()} ${response.url()}`);
      });
      await page.goto("/");
      if (locale === "en") await button(page, "English").click();
    });
    test.afterEach(async ({ page }) => {
      await expectNoOverflow(page);
      expect(errors.get(page)).toEqual([]);
    });

    test("grades each family on each level and renders the verified frequency table", async ({ page }) => {
      const panel = await enterMode(page, locale);
      const group = panel.getByRole("radiogroup", { name: c.group });
      const radios = group.getByRole("radio");
      const levels = panel.locator(".difficulty-picker");
      await expect(levels.getByRole("button")).toHaveCount(5);
      expect(await levels.locator("button:enabled").evaluateAll(elements => elements.map(element => element.getAttribute("data-level"))))
        .toEqual(["easy", "medium", "hard"]);
      expect(await levels.locator("button:disabled").evaluateAll(elements => elements.map(element => element.getAttribute("data-level"))))
        .toEqual(["advanced", "expert"]);
      const cardBox = await panel.locator(".statistics-task-panel").boundingBox();
      const selectorBox = await panel.locator(".statistics-catalog").boundingBox();
      expect(cardBox).not.toBeNull();
      expect(selectorBox).not.toBeNull();
      expect(selectorBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height - 1);
      expect(Math.abs(cardBox!.x - selectorBox!.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(cardBox!.width - selectorBox!.width)).toBeLessThanOrEqual(2);

      for (const level of ["easy", "medium", "hard"]) {
        await levels.locator(`[data-level=${level}]`).click();
        let firstText = "";
        let firstOptions: string[] = [];
        for (const seed of [0, 1, 2]) {
          await expect(question(panel)).toHaveAttribute("data-exercise-id", `st105-${level}-${seed}`);
          await expect(question(panel)).toHaveAttribute("data-difficulty", level);
          await expect(question(panel)).toHaveAttribute("data-seed", String(seed));
          await expect(question(panel)).toContainText(locale === "pl" ? "co najmniej 2" : "at least 2");
          await expect(radios).toHaveCount(3);
          await expect(group.getByRole("radio", { checked: true })).toHaveCount(0);
          const ids = await radioValues(radios);
          expect(new Set(ids).size).toBe(3);
          const expected = await visibleOracle(panel);
          expect(Math.min(expected.modes.length, 2)).toBe([1, 2, 0][seed]);
          const answer = expected.modes.length ? `{${expected.modes.join(", ")}}` : c.noMode;
          const correctId = expected.modes.length ? `mode:${expected.modes.join(",")}` : "no-mode";
          const correct = group.getByRole("radio", { name: answer, exact: true });
          await expect(correct).toHaveValue(correctId);
          await radios.nth(ids.findIndex(id => id !== correctId)).check();
          await button(panel, c.check).click();
          await expect(panel.locator(".feedback")).toHaveClass(/\bincorrect\b/);
          await expect(panel.getByRole("status").filter({ hasText: c.incorrect })).toBeVisible();
          await correct.check();
          await button(panel, c.check).click();
          await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
          await expect(panel.getByRole("status").filter({ hasText: c.correct })).toBeVisible();

          await button(panel, c.show).click();
          const table = panel.getByRole("table", { name: c.caption });
          await expect(table).toBeVisible();
          await expect(table.getByRole("columnheader")).toHaveText([...c.columns]);
          await expect(table.getByRole("rowheader")).toHaveText(expected.order.map(String));
          await expect(table.getByRole("cell")).toHaveText(expected.frequencies.map(String));
          await expect(panel.locator(".solution-calculation")).toHaveText([
            `n = ${expected.values.length}`,
            `fₘₐₓ = ${expected.maximum}`,
            expected.modes.length ? answer : "∅",
          ]);
          await expect(panel.locator(".solution-answer")).toContainText(answer);
          await expectNoOverflow(page);
          if (seed === 0) {
            firstText = await question(panel).innerText();
            firstOptions = ids;
          }
          if (seed < 2) {
            await button(panel, c.next).click();
            await expect(radios.first()).toBeFocused();
            await expect(panel.locator(".feedback,.learning-hint,.solution-panel")).toHaveCount(0);
          }
        }
        // Leaving and returning to the lesson replays seed zero, including shuffled option order.
        await panel.locator("[data-topic=mean]").click();
        await panel.locator("[data-topic=mode]").click();
        await levels.locator(`[data-level=${level}]`).click();
        await expect(question(panel)).toHaveText(firstText);
        expect(await radioValues(radios)).toEqual(firstOptions);
      }
    });

    test("preserves a draft and then its result, supports native keyboard and confirms discard", async ({ page }) => {
      const panel = await enterMode(page, locale);
      const radios = panel.getByRole("radio");
      const group = panel.getByRole("radiogroup");
      const first = radios.first();
      const check = button(panel, c.check);
      await check.click();
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await expect(group).toHaveAccessibleDescription(new RegExp(c.empty));
      await expect(panel.locator(".feedback")).toContainText(c.empty);
      await expect(first).toBeFocused();
      await page.keyboard.press("Space");
      await expect(first).toBeChecked();
      expect(await first.evaluate(element => element.matches(":focus-visible") && (getComputedStyle(element).outlineStyle !== "none" ||
        getComputedStyle(element.closest("label")!).outlineStyle !== "none"))).toBe(true);
      await page.keyboard.press("ArrowRight");
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(check).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(radios.nth(1)).toBeFocused();

      const picked = await radios.nth(1).inputValue();
      const ids = await radioValues(radios);
      const { values: observations, modes: modeSet } = await visibleOracle(panel);
      const correctId = `mode:${modeSet.join(",")}`;
      await button(panel, c.firstHint).click();
      await expect(panel.locator(".learning-hint")).toHaveCount(1);
      await button(panel, c.secondHint).click();
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      await button(panel, c.show).click();
      const steps = await panel.locator(".solution-calculation").allTextContents();
      const noMode = panel.getByRole("radio", { name: c.noMode, exact: true });
      await expect(noMode).toHaveValue("no-mode");
      await button(page, c.switchLocale).click();
      await expect(button(page, c.switchLocale)).toBeFocused();
      await expect(panel.getByRole("heading", { name: other.title, exact: true })).toBeVisible();
      await expect(group).toHaveAccessibleName(other.group);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-easy-0");
      expect((await visibleOracle(panel)).values).toEqual(observations);
      expect(await radioValues(radios)).toEqual(ids);
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toHaveValue(picked);
      await expect(panel.getByRole("radio", { name: other.noMode, exact: true })).toHaveValue("no-mode");
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      await expect(panel.getByRole("table", { name: other.caption })).toBeVisible();
      await expect(panel.locator(".solution-calculation")).toHaveText(steps);

      for (const target of [
        button(panel, other.next), panel.locator("[data-level=medium]"),
        panel.locator("[data-topic=median]"), panel.locator("[data-track=university]"),
      ]) {
        await confirmReplacement(page, target, false);
        await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-easy-0");
        await expect(radios.nth(1)).toBeChecked();
        await expect(panel.locator(".learning-hint")).toHaveCount(2);
        await expect(panel.getByRole("table")).toBeVisible();
      }
      await button(panel, other.check).click();
      const resultKey = picked === correctId ? "correct" : "incorrect";
      await expect(panel.locator(".feedback")).toContainText(other[resultKey]);
      await button(page, other.switchLocale).click();
      await expect(panel.locator(".feedback")).toContainText(c[resultKey]);
      await expect(panel.getByRole("table", { name: c.caption })).toBeVisible();
      await button(panel, c.hide).click();
      await expect(panel.getByRole("table")).toHaveCount(0);

      const different = radios.nth(ids.findIndex(id => id !== picked));
      await different.check();
      await confirmReplacement(page, button(panel, c.next), true);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-easy-1");
      await expect(panel.getByRole("radio", { checked: true })).toHaveCount(0);
      await expect(panel.locator(".learning-hint,.solution-panel,.feedback")).toHaveCount(0);
      await expect(first).toBeFocused();

      // A forged DOM value exercises the otherwise unreachable invalid-response path.
      await first.evaluate(element => { (element as HTMLInputElement).value = "invalid-choice"; });
      await first.click();
      await check.click();
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await expect(panel.locator(".feedback")).toContainText(c.invalid);
      await expect(first).toBeFocused();
      await radios.nth(1).check();
      await confirmReplacement(page, panel.locator("[data-level=hard]"), true);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-hard-0");
      await expect(first).toBeFocused();
      await expect(panel.getByRole("radio", { checked: true })).toHaveCount(0);

      await button(panel, c.show).click();
      const university = panel.locator("[data-track=university]");
      await university.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => scrollY);
      const target = await university.boundingBox();
      expect(target).not.toBeNull();
      await page.mouse.click(target!.x + target!.width / 2, target!.y + target!.height / 2);
      await expect(university).toHaveAttribute("aria-pressed", "true");
      await expect(university).toBeFocused();
      await expect(question(panel)).toHaveCount(0);
      const scrollDeltas = await page.evaluate(async previous => {
        const deviations: number[] = [];
        for (let frame = 0; frame < 6; frame++) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
          deviations.push(Math.abs(scrollY - Math.min(previous, maximum)));
        }
        return deviations;
      }, before);
      expect(Math.max(...scrollDeltas)).toBeLessThanOrEqual(2);
    });

    test("keeps existing Statistics lessons, Mathematics history and exam navigation working", async ({ page }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie|Multiplication first/ }).click();
      await button(page, c.session).click();
      const answer = numeric(await page.locator(".practice .question").innerText());
      await page.locator("#answer").fill(`${answer.numerator}/${answer.denominator}`);
      await button(page, c.check).click();
      await expect(page.locator(".practice .feedback")).toHaveClass(/\bcorrect\b/);
      for (let index = 0; index < 10; index++) await button(page, index === 9 ? c.finish : c.next).click();
      const history = () => page.evaluate(key => localStorage.getItem(key), HISTORY_KEY);
      const saved = await history();
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!).sessions[0]).toMatchObject({ correct: 1, skipped: 9 });

      const panel = await enterMode(page, locale);
      await panel.getByRole("radio").first().check();
      await button(panel, c.check).click();
      for (const [topic, lesson, response] of [
        ["mean", "mean", "2"], ["median", "median", "2"], ["dispersion", "variance", "2/5"],
      ]) {
        await panel.locator(`[data-topic=${topic}]`).click();
        await expect(question(panel)).toHaveAttribute("data-lesson", lesson);
        await panel.locator("#statistics-answer").fill(response);
        await button(panel, c.check).click();
        await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
      }
      await panel.locator("[data-topic=interpretation]").click();
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st104-easy-0");
      await panel.locator('input[value="mean-equals-median"]').check();
      await button(panel, c.check).click();
      await expect(panel.locator(".feedback")).toHaveClass(/\bcorrect\b/);
      await mathButton(page).click();
      expect(await history()).toBe(saved);
      await button(page, c.progress).click();
      await expect(page.locator('#progress-title')).toBeFocused();
      await expect(page.locator('[data-stat="sessions"]')).toHaveText("1");
      await button(page, c.exam).click();
      await button(page, c.startExam).click();
      await expect(statisticsButton(page)).toBeDisabled();
      await expect(page.locator(".exam-work .question")).toBeVisible();
      await expect(panel).toBeHidden();
      expect(await history()).toBe(saved);
    });
  });
}

for (const locale of ["pl", "en"] as const) {
  test(`ST-105 ${locale.toUpperCase()} 320px safe-integer smoke`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto("/");
    if (locale === "en") await button(page, "English").click();
    const panel = await enterMode(page, locale);
    await panel.locator("[data-level=hard]").click();
    await expect(question(panel)).toHaveAttribute("data-exercise-id", "st105-hard-0");
    await expect(question(panel)).toContainText(String(Number.MIN_SAFE_INTEGER));
    await expect(question(panel)).toContainText(String(Number.MAX_SAFE_INTEGER));
    await button(panel, labels[locale].show).click();
    const table = panel.getByRole("table", { name: labels[locale].caption });
    await expect(table.getByRole("rowheader", { name: String(Number.MIN_SAFE_INTEGER), exact: true })).toBeVisible();
    await expect(table.getByRole("rowheader", { name: String(Number.MAX_SAFE_INTEGER), exact: true })).toBeVisible();
    expect(await table.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expectNoOverflow(page);
  });
}
