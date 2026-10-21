import { expect, test } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";
import { EXAM_HISTORY_KEY } from "../src/exam/history";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { formatRational } from "../src/answers";
import { getAnswerSpec } from "../src/exercises";

for (const width of [375, 768, 1280]) for (const en of [false, true])
  test(`MT-EXAM-001 ${width}px ${en ? "EN" : "PL"}: private answers, navigation, submission and review`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (en) await page.getByRole("button", { name: "English", exact: true }).click();
    await page.getByRole("button", { name: en ? "Exam" : "Sprawdzian", exact: true }).click();
    await expect(page.getByRole("heading", { name: en ? "Exam" : "Sprawdzian", exact: true })).toBeFocused();
    await expect(page.getByText(en ? "Refreshing the page resets" : "Odświeżenie strony w trakcie", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: en ? "Start exam" : "Rozpocznij sprawdzian" }).click();
    await expect(page.getByRole("button", { name: en ? "Exercises" : "Ćwiczenia", exact: true })).toBeDisabled();
    await expect(page.locator(".exam-work .learning-hint, .exam-work .feedback, .exam-work .solution-panel")).toHaveCount(0);
    await expect(page.getByText(en ? "Hints, scoring and solutions" : "Podpowiedzi, ocena i rozwiązania", { exact: false })).toBeVisible();
    const first = page.locator(".exam-work .question");
    const question = await first.innerText();
    const selected = taskPool("order", "easy").map((task) => localizeTask(task, en ? "en" : "pl"))
      .find((task) => task.question === question);
    expect(selected).toBeDefined();
    const spec = getAnswerSpec(selected!);
    expect(spec.kind).toBe("scalar");
    if (spec.kind !== "scalar") return;
    await page.locator(".exam-work #exam-answer").fill("99999");
    await page.getByRole("button", { name: en ? "Next question" : "Następne zadanie" }).click();
    await page.locator(".exam-work #exam-answer").fill("1/0");
    await page.getByRole("button", { name: en ? "Previous question" : "Poprzednie zadanie" }).click();
    await expect(page.locator(".exam-work #exam-answer")).toHaveValue("99999");
    await page.locator(".exam-work #exam-answer").fill(formatRational(spec.value));
    await expect(page.locator(".exam-work .question")).toHaveText(question);
    await page.getByRole("button", { name: en ? "Question 3 of 5" : "Zadanie 3 z 5" }).click();
    await page.locator(".exam-work #exam-answer").fill("99999");
    await page.getByRole("button", { name: en ? "Submit exam" : "Oddaj sprawdzian" }).click();
    await expect(page.locator(".exam-confirm")).toContainText(en ? "Unanswered questions: 2" : "Niewypełnione zadania: 2");
    await page.getByRole("button", { name: en ? "Confirm submission" : "Potwierdź oddanie" }).click();
    await expect(page.locator(".exam-score")).toContainText("1 / 5");
    await expect(page.locator(".exam-totals")).toContainText(en ? "Invalid format" : "Nieprawidłowy zapis");
    await expect(page.locator(".exam-totals")).toContainText(en ? "Incorrect" : "Błędne");
    await expect(page.locator(".exam-review > li")).toHaveCount(5);
    await expect(page.locator(".exam-review > li").first()).toContainText(en ? "Correct answer" : "Poprawny wynik");
    await expect(page.locator(".exam-review > li").nth(1)).toContainText("1/0");
    await page.locator(".exam-review > li").first().getByRole("button", { name: en ? "Show solution" : "Pokaż rozwiązanie" }).click();
    await expect(page.locator(".exam-score")).toContainText("1 / 5");
    expect(await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY)).toBeNull();
    expect(await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY)).not.toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });

test("MT-EXAM-001: deadline submits latest answer once after the tab clock jumps", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await page.getByRole("radio", { name: "15 minut" }).check();
  await page.getByRole("button", { name: "Rozpocznij sprawdzian" }).click();
  await page.locator(".exam-work #exam-answer").fill("7");
  await page.clock.fastForward("15:01");
  await expect(page.getByRole("heading", { name: "Wynik sprawdzianu" })).toBeVisible();
  await expect(page.getByText("Czas minął. Sprawdzian został oddany automatycznie", { exact: false })).toBeVisible();
  await expect(page.locator(".exam-review > li").first()).toContainText("7");
  const raw = await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY);
  expect(JSON.parse(raw!).reports).toHaveLength(1);
  await page.clock.fastForward("00:30");
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY))!).reports).toHaveLength(1);
});

test("MT-EXAM-001: invalid scope blocks start and only confirmed deletion clears exam history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await page.getByRole("checkbox", { name: /Kolejność działań/ }).uncheck();
  await expect(page.getByText("Wybierz co najmniej jedną kategorię.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Rozpocznij sprawdzian" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Kolejność działań/ }).check();
  await page.getByRole("button", { name: "Rozpocznij sprawdzian" }).click();
  await page.getByRole("button", { name: "Oddaj sprawdzian" }).click();
  await page.getByRole("button", { name: "Potwierdź oddanie" }).click();
  await page.getByRole("button", { name: "Nowy sprawdzian" }).click();
  await expect(page.locator(".exam-history li")).toHaveCount(1);
  await page.getByRole("button", { name: "Usuń historię sprawdzianów" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY)).not.toBeNull();
  await page.getByRole("button", { name: "Potwierdź usunięcie historii sprawdzianów" }).click();
  await expect(page.locator(".exam-history li")).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY)).toBeNull();
});

test("MT-EXAM-001: changing language preserves an integral answer and scratchpad; exam history survives refresh", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await page.getByRole("checkbox", { name: /Kolejność działań/ }).uncheck();
  await page.getByRole("checkbox", { name: /Całki/ }).check();
  await page.getByRole("button", { name: "Rozpocznij sprawdzian" }).click();
  await expect(page.locator(".exam-work .question")).toHaveAttribute("data-difficulty", "easy");
  await page.locator(".exam-work #exam-answer").fill("2/3");
  await page.getByRole("button", { name: "Pokaż brudnopis" }).click();
  await page.getByRole("button", { name: "Pisz", exact: true }).click();
  await page.locator(".exam-work").getByLabel("Notatki tekstowe").fill("∫ x dx");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".exam-work #exam-answer")).toHaveValue("2/3");
  await expect(page.locator(".exam-work").getByLabel("Text notes")).toHaveValue("∫ x dx");
  await page.getByRole("button", { name: "Submit exam" }).click();
  await page.getByRole("button", { name: "Confirm submission" }).click();
  await page.getByRole("button", { name: "New exam" }).click();
  await expect(page.locator(".exam-history li")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await expect(page.locator(".exam-history li")).toHaveCount(1);
  expect(await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY)).toBeNull();
});

test("MT-EXAM-001: structured antiderivative fields and +C survive back/forward navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await page.getByRole("checkbox", { name: /Kolejność działań/ }).uncheck();
  await page.getByRole("checkbox", { name: /Całki/ }).check();
  await page.getByRole("button", { name: "Rozpocznij sprawdzian" }).click();
  for (let index = 0; index < 5; index++) {
    if (await page.locator(".exam-work .question").getAttribute("data-template-id") === "integral-direct") break;
    await page.getByRole("button", { name: "Następne zadanie" }).click();
  }
  await expect(page.locator(".exam-work .question")).toHaveAttribute("data-template-id", "integral-direct");
  const position = Number((await page.locator(".exam-status strong").innerText()).match(/\d+/)![0]);
  await page.locator("#exam-answer").fill("2/3");
  await page.locator("#exam-answer-1").fill("-4");
  await page.getByRole("checkbox", { name: "Dodaj stałą całkowania +C" }).check();
  await page.getByRole("button", { name: position === 5 ? "Poprzednie zadanie" : "Następne zadanie" }).click();
  await page.getByRole("button", { name: position === 5 ? "Następne zadanie" : "Poprzednie zadanie" }).click();
  await expect(page.locator("#exam-answer")).toHaveValue("2/3");
  await expect(page.locator("#exam-answer-1")).toHaveValue("-4");
  await expect(page.getByRole("checkbox", { name: "Dodaj stałą całkowania +C" })).toBeChecked();
  await expect(page.locator(".exam-work .solution-panel, .exam-work .feedback")).toHaveCount(0);
});

test("MT-EXAM-001: returning to learning preserves exercise and search without touching progress", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Szukaj rodziny zadań" });
  await search.fill("mnozenie przez nawias");
  await page.locator(".catalog-search-list button").click();
  await page.locator("#answer").fill("17");
  const question = await page.locator(".practice .question").innerText();
  await search.fill("calki");
  await page.getByRole("button", { name: "Sprawdzian", exact: true }).click();
  await page.getByRole("button", { name: "Rozpocznij sprawdzian" }).click();
  await expect(page.getByRole("button", { name: "Ćwiczenia", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Oddaj sprawdzian" }).click();
  await page.getByRole("button", { name: "Potwierdź oddanie" }).click();
  await page.getByRole("link", { name: "Math Tutor — strona startowa" }).click();
  await expect(page.locator(".practice .question")).toHaveText(question);
  await expect(page.locator("#answer")).toHaveValue("17");
  await expect(search).toHaveValue("calki");
  expect(await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY)).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXAM_HISTORY_KEY)).not.toBeNull();
});
