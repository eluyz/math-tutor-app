import { mkdir } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";
import { numeric } from "./helpers/arithmetic";

const labels = {
  en: {
    title: "ST-107 — Charts & interpretation", status: "Work in progress", other: "Polski",
    chart: "Bar chart of visits by room", description: "Bars start at zero. Exact visit counts appear above each bar and in the table.",
    table: "Visit counts by room", axes: ["Room", "Number of visits"], group: "Choose one answer",
    check: "Check", next: "Next exercise", hint: "Show hint", second: "Show second hint", show: "Show solution",
    empty: "Choose an answer before checking it.", invalid: "Choose one of the answers offered for this question.",
    correct: "Correct answer.", incorrect: "The answer differs.",
  },
  pl: {
    title: "ST-107 — Wykresy i interpretacja", status: "W rozwoju", other: "English",
    chart: "Wykres słupkowy wizyt według sali", description: "Słupki zaczynają się od zera. Dokładne liczby wizyt są nad słupkami i w tabeli.",
    table: "Liczba wizyt w każdej sali", axes: ["Sala", "Liczba wizyt"], group: "Wybierz jedną odpowiedź",
    check: "Sprawdź", next: "Następne zadanie", hint: "Pokaż podpowiedź", second: "Pokaż drugą podpowiedź", show: "Pokaż rozwiązanie",
    empty: "Wybierz odpowiedź, aby ją sprawdzić.", invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    correct: "Poprawna odpowiedź.", incorrect: "Odpowiedź jest inna.",
  },
} as const;

type Locale = keyof typeof labels;
type Counts = Record<string, number>;

const button = (scope: Locator | Page, name: string) => scope.getByRole("button", { name, exact: true });
const statistics = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Statistics & Probability|Statystyka i prawdopodobieństwo/ });
const math = (page: Page) => page.locator(".subject-navigation").getByRole("button", { name: /Mathematics Available|Matematyka Dostępne/ });
const question = (panel: Locator) => panel.locator("#statistics-question");
const topic = (panel: Locator, id: string) => panel.locator(`[data-topic=${id}]`);
const level = (panel: Locator, id: string) => panel.locator(`[data-level=${id}]`);
const choices = (panel: Locator) => panel.getByRole("radio");
const choiceIds = (panel: Locator) => choices(panel).evaluateAll(radios => radios.map(radio => (radio as HTMLInputElement).value));

async function enterCharts(page: Page, locale: Locale) {
  await page.goto("/");
  if (locale === "en") await button(page, "English").click();
  await statistics(page).click();
  const panel = page.locator(".statistics-practice");
  await expect(question(panel)).toHaveAttribute("data-lesson", "mean");
  await topic(panel, "charts").click();
  await expect(panel.getByRole("heading", { name: labels[locale].title, exact: true })).toBeVisible();
  await expect(panel.locator(".statistics-heading .subject-status")).toHaveText(labels[locale].status);
  return panel;
}

async function readCounts(table: Locator): Promise<Counts> {
  return Object.fromEntries(await table.locator("tbody tr").evaluateAll(rows =>
    rows.map(row => [row.querySelector('th[scope="row"]')!.textContent!, Number(row.querySelector("td")!.textContent)])));
}

function roomsOf(text: string) {
  return text.match(/\b[A-E]\b/g) ?? [];
}

function countOf(counts: Counts, room: string | undefined) {
  if (room === undefined || !Object.hasOwn(counts, room)) throw new Error(`No plotted count for room ${room}`);
  return counts[room];
}

// Evaluate the displayed language, including the observation scope, independently of the task generator.
function statementTruth(text: string, counts: Counts) {
  if (/poster|plakat|Tuesday|We wtorek|all room visits|wszystkie wizyty/i.test(text)) return "underdetermined";
  const [first, second] = roomsOf(text);
  const left = countOf(counts, first);
  const reported = Number(text.match(/\b\d+\b/)?.[0]);
  if (second === undefined) {
    expect(Number.isInteger(reported), text).toBe(true);
    return left === reported ? "supported" : "contradicted";
  }
  const right = countOf(counts, second);
  let matches: boolean;
  if (/same number|tyle samo/i.test(text)) matches = left === right;
  else if (/fewer visits|mniej wizyt/i.test(text)) matches = left < right;
  else if (/more visits|więcej wizyt/i.test(text)) matches = left > right;
  else if (/in total|łączna liczba/i.test(text)) matches = left + right === reported;
  else if (/absolute difference|wartość bezwzględna różnicy/i.test(text)) matches = Math.max(left, right) - Math.min(left, right) === reported;
  else throw new Error(`Unrecognized two-room statement: ${text}`);
  return matches ? "supported" : "contradicted";
}

async function visibleAnswer(panel: Locator, counts: Counts, difficulty: string) {
  const prompt = await question(panel).innerText();
  const options = await panel.locator(".statistics-choice span").allTextContents();
  expect(options).toHaveLength(3);
  expect(new Set(options).size).toBe(3);
  const [first, second] = roomsOf(prompt);
  let correct: string[];
  if (difficulty === "hard") {
    const missingEvidence = /cannot be determined|nie da się ustalić/.test(prompt);
    const truths = options.map(text => statementTruth(text, counts));
    expect([...truths].sort()).toEqual(missingEvidence
      ? ["supported", "supported", "underdetermined"] : ["contradicted", "contradicted", "supported"]);
    correct = options.filter((_, index) => truths[index] === (missingEvidence ? "underdetermined" : "supported"));
  } else if (/fewest visits|najmniej wizyt|most visits|najwięcej wizyt/.test(prompt)) {
    const pick = /fewest visits|najmniej wizyt/.test(prompt) ? Math.min : Math.max;
    const value = pick(...Object.values(counts));
    const categories = Object.keys(counts).filter(category => counts[category] === value);
    expect(categories).toHaveLength(1);
    correct = options.filter(label => label === categories[0]);
  } else if (/compare with|Jak porównać/.test(prompt)) {
    correct = options.filter(label => statementTruth(label, counts) === "supported");
  } else {
    const left = countOf(counts, first);
    let value = left;
    if (/absolute difference|wartość bezwzględna/.test(prompt)) {
      const right = countOf(counts, second);
      value = Math.max(left, right) - Math.min(left, right);
    }
    if (/in total|łącznie/.test(prompt)) {
      expect(first).not.toBe(second);
      value = left + countOf(counts, second);
    }
    expect(Number.isInteger(value), prompt).toBe(true);
    correct = options.filter(label => label === String(value));
  }
  expect(correct).toHaveLength(1);
  return options.indexOf(correct[0]);
}

async function inspectChart(page: Page, panel: Locator, locale: Locale) {
  const c = labels[locale];
  const svg = panel.getByRole("img", { name: c.chart, exact: true });
  const table = panel.getByRole("table", { name: c.table, exact: true });
  await expect(svg).toBeVisible();
  await expect(svg).toHaveAccessibleDescription(c.description);
  await expect(svg).toHaveAttribute("aria-details", "statistics-question-table");
  await expect(panel.getByRole("radiogroup", { name: c.group })).toHaveAttribute("aria-details", "statistics-question-table");
  await expect(table).toHaveAttribute("aria-describedby", "statistics-question");
  await expect(panel.locator("figure")).toHaveAttribute("aria-describedby", "statistics-question");
  await expect(table.locator('th[scope="col"]')).toHaveText([...c.axes]);
  const counts = await readCounts(table);
  expect(Object.keys(counts).length).toBeGreaterThanOrEqual(3);
  expect(Object.keys(counts).length).toBeLessThanOrEqual(5);
  await expect(table.locator("tbody tr")).toHaveCount(Object.keys(counts).length);

  const geometry = await svg.evaluate(chart => {
    const box = (element: Element) => {
      const { left, right, top, bottom, height } = element.getBoundingClientRect();
      return { left, right, top, bottom, height };
    };
    const barGroups = [...chart.querySelectorAll("[data-category]")];
    return {
      chart: box(chart),
      baseline: box(chart.querySelector('[data-axis="baseline"]')!).top,
      countAxis: box(chart.querySelector('[data-axis="count"]')!),
      axes: [...chart.querySelectorAll(".statistics-chart-axis-label")].map(element => element.textContent),
      ticks: [...chart.querySelectorAll("[data-tick]")].map(tick => ({
        count: Number(tick.getAttribute("data-tick")),
        text: tick.querySelector("text")!.textContent,
        y: box(tick.querySelector("line")!).top,
      })),
      bars: barGroups.map(group => ({
        key: group.getAttribute("data-category"),
        category: group.querySelector("[data-category-label]")!.textContent,
        value: group.querySelector("[data-value-label]")!.textContent,
        label: box(group.querySelector("[data-value-label]")!),
        rect: box(group.querySelector("rect")!),
      })),
      labels: [...chart.querySelectorAll("text")].map(element => ({ ...box(element), text: element.textContent })),
    };
  });
  expect(geometry.axes).toEqual([c.axes[1], c.axes[0]]);
  expect(geometry.bars.map(({ key }) => key)).toEqual(Object.keys(counts));
  expect(geometry.ticks.length).toBeGreaterThan(1);
  expect(geometry.ticks[0]).toMatchObject({ count: 0, text: "0" });
  expect(geometry.ticks[0].y).toBeCloseTo(geometry.baseline, 1);
  const top = geometry.ticks.at(-1)!;
  expect(top.count).toBeGreaterThanOrEqual(Math.max(...Object.values(counts)));
  expect(top.y).toBeCloseTo(geometry.countAxis.top, 1);
  expect(geometry.countAxis.bottom).toBeCloseTo(geometry.baseline, 1);
  const interval = geometry.ticks[1].count;
  expect([1, 2, 5, 10, 20]).toContain(interval);
  const pixelsPerVisit = (geometry.baseline - top.y) / top.count;
  expect(pixelsPerVisit).toBeGreaterThan(0);
  for (const [index, tick] of geometry.ticks.entries()) {
    expect(tick.count).toBe(index * interval);
    expect(tick.text).toBe(String(tick.count));
    expect(tick.y).toBeCloseTo(geometry.baseline - tick.count * pixelsPerVisit, 1);
  }
  for (const bar of geometry.bars) {
    expect(bar.category).toBe(bar.key);
    expect(bar.value).toBe(String(counts[bar.key!]));
    expect(bar.rect.bottom).toBeCloseTo(geometry.baseline, 1);
    expect(bar.rect.height).toBeCloseTo(counts[bar.key!] * pixelsPerVisit, 1);
    expect(bar.label.bottom).toBeLessThan(bar.rect.top);
  }
  for (const [index, label] of geometry.labels.entries()) {
    expect(label.height, `reading ${label.text}`).toBeGreaterThanOrEqual(12);
    expect(label.left).toBeGreaterThanOrEqual(geometry.chart.left);
    expect(label.right).toBeLessThanOrEqual(geometry.chart.right);
    expect(label.top).toBeGreaterThanOrEqual(geometry.chart.top);
    expect(label.bottom).toBeLessThanOrEqual(geometry.chart.bottom);
    for (const other of geometry.labels.slice(index + 1)) {
      const overlap = label.left < other.right && label.right > other.left && label.top < other.bottom && label.bottom > other.top;
      expect(overlap, `${label.text} and ${other.text} overlap`).toBe(false);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  return counts;
}

async function confirmDiscard(page: Page, click: () => Promise<void>, accepted: boolean) {
  const opened = page.waitForEvent("dialog");
  const clicking = click();
  const dialog = await opened;
  expect(dialog.type()).toBe("confirm");
  if (accepted) await dialog.accept();
  else await dialog.dismiss();
  await clicking;
}

async function settleScroll(page: Page) {
  return page.evaluate(async () => {
    for (let frame = 0; frame < 6; frame++) await new Promise(requestAnimationFrame);
    return { y: scrollY, max: document.documentElement.scrollHeight - innerHeight };
  });
}

for (const width of [375, 1280]) for (const locale of ["en", "pl"] as const) {
  const c = labels[locale];
  test.describe(`ST-107 ${locale.toUpperCase()} ${width}px`, () => {
    test.use({ viewport: { width, height: 850 } });

    test("grades each family against the visible table and draws a zero-based linear chart", async ({ page }) => {
      const panel = await enterCharts(page, locale);
      const heading = (await panel.locator(".statistics-heading").boundingBox())!;
      const task = (await panel.locator(".statistics-task-panel").boundingBox())!;
      const selector = (await panel.locator(".statistics-catalog").boundingBox())!;
      expect(heading.y + heading.height).toBeLessThanOrEqual(task.y);
      expect(task.y + task.height).toBeLessThanOrEqual(selector.y);
      expect(task.width).toBeCloseTo(selector.width, 0);
      for (const [difficulty, seeds] of [["easy", 3], ["medium", 3], ["hard", 6]] as const) {
        if (difficulty !== "easy") await level(panel, difficulty).click();
        for (let seed = 0; seed < seeds; seed++) {
          await expect(question(panel)).toHaveAttribute("data-seed", String(seed));
          await expect(question(panel)).toHaveAttribute("data-exercise-id", `st107-${difficulty}-${seed}`);
          const counts = await inspectChart(page, panel, locale);
          if (difficulty === "easy" && seed === 0) expect(Object.values(counts)).toEqual([0, 0, 0]);
          const right = await visibleAnswer(panel, counts, difficulty);
          await expect(choices(panel)).toHaveCount(3);
          await expect(panel.getByRole("radio", { checked: true })).toHaveCount(0);
          await choices(panel).nth((right + 1) % 3).check();
          await button(panel, c.check).click();
          await expect(panel.locator(".feedback")).toContainText(c.incorrect);
          await choices(panel).nth(right).check();
          await button(panel, c.check).click();
          await expect(panel.locator(".feedback")).toContainText(c.correct);
          if (difficulty === "hard") {
            await button(panel, c.show).click();
            await expect(panel.locator(".solution-calculation")).toHaveCount(4);
            if (seed % 2 === 1) {
              const limit = locale === "en"
                ? { 1: /why people visited/, 3: /no observations from Tuesday/, 5: /other rooms in the building/ }
                : { 1: /powodach wizyt/, 3: /brak danych z wtorku/, 5: /pozostałych salach w budynku/ };
              const evidence = limit[seed as 1 | 3 | 5];
              await expect(panel.locator(".solution-panel")).toContainText(evidence);
            }
            if (seed === 0) {
              await mkdir("test-results/ui-evidence", { recursive: true });
              await panel.locator(".statistics-chart-data").screenshot({ path: `test-results/ui-evidence/st107-${locale}-${width}.png` });
            }
          }
          if (seed < seeds - 1) await button(panel, c.next).click();
        }
      }
    });

    test("preserves native keyboard, language, replay, draft and pointer-track behavior", async ({ page }) => {
      const panel = await enterCharts(page, locale);
      const radios = choices(panel);
      const group = panel.getByRole("radiogroup");
      const initialPrompt = await question(panel).innerText();
      const initialIds = await choiceIds(panel);
      const counts = await readCounts(panel.getByRole("table"));
      const right = await visibleAnswer(panel, counts, "easy");
      const wrong = (right + 1) % 3;
      await button(panel, c.check).click();
      await expect(panel.locator(".feedback")).toHaveText(c.empty);
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await expect(radios.first()).toBeFocused();
      await page.keyboard.press("Space");
      await expect(radios.first()).toBeChecked();
      expect(await radios.first().evaluate(element => element.matches(":focus-visible") &&
        getComputedStyle(element.closest("label")!).outlineStyle !== "none")).toBe(true);
      await page.keyboard.press("ArrowRight");
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(button(panel, c.check)).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(radios.nth(1)).toBeFocused();

      await choices(panel).nth(right).check();
      await button(panel, c.hint).click();
      await button(panel, c.second).click();
      await button(panel, c.show).click();
      const calculations = await panel.locator(".solution-calculation").allTextContents();
      expect(calculations).toEqual([`${roomsOf(initialPrompt)[0]} = 0`]);
      const otherLocale = locale === "en" ? "pl" : "en";
      const translated = labels[otherLocale];
      await button(page, c.other).click();
      await expect(panel.getByRole("heading", { name: translated.title, exact: true })).toBeVisible();
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st107-easy-0");
      await expect(question(panel)).not.toHaveText(initialPrompt);
      expect(await readCounts(panel.getByRole("table", { name: translated.table }))).toEqual(counts);
      expect(await choiceIds(panel)).toEqual(initialIds);
      await expect(radios.nth(right)).toBeChecked();
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      await expect(panel.locator(".solution-calculation")).toHaveText(calculations);
      await expect(panel.locator(".feedback")).toHaveCount(0);
      await button(panel, translated.check).click();
      await expect(panel.locator(".feedback")).toContainText(translated.correct);
      await button(page, translated.other).click();
      await expect(question(panel)).toHaveText(initialPrompt);
      await expect(radios.nth(right)).toBeChecked();
      await expect(panel.locator(".feedback")).toContainText(c.correct);
      await expect(panel.locator(".learning-hint")).toHaveCount(2);
      await expect(panel.locator(".solution-calculation")).toHaveText(calculations);

      await radios.nth(wrong).check();
      const university = panel.locator("[data-track=university]");
      for (const destination of [button(panel, c.next), level(panel, "hard"), topic(panel, "mode"), university]) {
        await confirmDiscard(page, () => destination.click(), false);
        await expect(question(panel)).toHaveText(initialPrompt);
        await expect(radios.nth(wrong)).toBeChecked();
        await expect(panel.locator(".learning-hint")).toHaveCount(2);
        await expect(panel.locator(".solution-calculation")).toHaveText(calculations);
      }
      await confirmDiscard(page, () => button(panel, c.next).click(), true);
      await expect(question(panel)).toHaveAttribute("data-exercise-id", "st107-easy-1");
      await expect(radios.first()).toBeFocused();
      await expect(panel.locator(".learning-hint,.solution-panel,.feedback")).toHaveCount(0);
      const nextPrompt = await question(panel).innerText();
      const nextIds = await choiceIds(panel);

      await radios.first().evaluate((input, stale) => { (input as HTMLInputElement).value = stale; }, initialIds[0]);
      await radios.first().click();
      await button(panel, c.check).click();
      await expect(panel.locator(".feedback")).toHaveText(c.invalid);
      await expect(group).toHaveAttribute("aria-invalid", "true");
      await expect(radios.first()).toBeFocused();

      await topic(panel, "mode").click();
      await topic(panel, "charts").click();
      await expect(question(panel)).toHaveText(initialPrompt);
      expect(await choiceIds(panel)).toEqual(initialIds);
      await button(panel, c.next).click();
      await expect(question(panel)).toHaveText(nextPrompt);
      expect(await choiceIds(panel)).toEqual(nextIds);

      await university.scrollIntoViewIfNeeded();
      const before = await settleScroll(page);
      expect(before.y).toBeGreaterThan(0);
      const rect = (await university.boundingBox())!;
      await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await expect(university).toHaveAttribute("aria-pressed", "true");
      await expect(university).toBeFocused();
      const after = await settleScroll(page);
      expect(Math.abs(after.y - Math.min(before.y, after.max))).toBeLessThanOrEqual(2);
      await expect(question(panel)).toHaveCount(0);
      await expect(panel.locator(".category-picker button")).toHaveCount(9);
      await expect(panel.locator(".category-picker button:enabled")).toHaveCount(0);
    });
  });
}

for (const locale of ["en", "pl"] as const) {
  test(`ST-107 ${locale.toUpperCase()} 320px shows zero and tallest labels without clipping`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    const panel = await enterCharts(page, locale);
    expect(Object.values(await inspectChart(page, panel, locale))).toEqual([0, 0, 0]);
    await button(panel, labels[locale].next).click();
    const counts = await inspectChart(page, panel, locale);
    expect(Math.max(...Object.values(counts))).toBe(20);
    await mkdir("test-results/ui-evidence", { recursive: true });
    await panel.locator(".statistics-chart-data").screenshot({ path: `test-results/ui-evidence/st107-${locale}-320.png` });
    await choices(panel).nth(await visibleAnswer(panel, counts, "easy")).check();
    await button(panel, labels[locale].check).click();
    await expect(panel.locator(".feedback")).toContainText(labels[locale].correct);
  });
}

test("ST-107 practice preserves Mathematics session progress and exam lock", async ({ page }) => {
  await page.goto("/");
  await button(page, "English").click();
  await page.locator(".exercise-list-items").getByRole("button", { name: /Multiplication first/ }).click();
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
  await topic(panel, "charts").click();
  const counts = await readCounts(panel.getByRole("table"));
  await choices(panel).nth(await visibleAnswer(panel, counts, "easy")).check();
  await button(panel, "Check").click();
  await expect(panel.locator(".feedback")).toContainText(labels.en.correct);
  await topic(panel, "data-tables").click();
  await expect(question(panel)).toHaveAttribute("data-lesson", "frequency-tables");
  await expect(panel.getByRole("table", { name: "Frequency table" })).toBeVisible();
  await expect(panel.getByRole("img")).toHaveCount(0);

  await math(page).click();
  expect(await history()).toBe(saved);
  await button(page, "My progress").click();
  await expect(page.locator('.progress-totals [data-stat="sessions"]')).toHaveText("1");
  await button(page, "Exam").click();
  await button(page, "Start exam").click();
  await expect(statistics(page)).toBeDisabled();
  await expect(page.locator(".exam-work .question")).toBeVisible();
  await expect(panel).toBeHidden();
  expect(await history()).toBe(saved);
});
