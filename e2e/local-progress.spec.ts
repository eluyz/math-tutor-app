import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { HISTORY_KEY, type History } from "../src/progress/model";
import { numeric } from "./helpers/arithmetic";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const dashboard = (page: Page) => page.locator(".progress-dashboard");
const stat = (page: Page, name: string) =>
  dashboard(page).locator(`.progress-totals [data-stat="${name}"]`);
async function stored(page: Page): Promise<History | null> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, HISTORY_KEY);
}
async function openProgress(page: Page, en = false) {
  await page
    .getByRole("navigation")
    .getByRole("button", {
      name: en ? "My progress" : "Moje postępy",
      exact: true,
    })
    .click();
  await expect(page.locator("#progress-title")).toBeFocused();
}
async function advance(page: Page, index: number, en = false) {
  await button(
    page,
    index === 9
      ? en
        ? "Finish session"
        : "Zakończ sesję"
      : en
        ? "Next exercise"
        : "Następne zadanie",
  ).click();
}
async function skips(page: Page, en = false) {
  await button(
    page,
    en ? "Start a session (10 exercises)" : "Rozpocznij sesję (10 zadań)",
  ).click();
  for (let i = 0; i < 10; i++) await advance(page, i, en);
}
async function exported(page: Page, en = false): Promise<History> {
  const download = page.waitForEvent("download");
  await button(
    page,
    en ? "Export history (.json)" : "Eksportuj historię (.json)",
  ).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("math-tutor-progress.json");
  return JSON.parse(await readFile((await file.path())!, "utf8"));
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
]) {
  test.describe(`MT-004A ${viewport.width}px`, () => {
    test.use({ viewport, hasTouch: viewport.width !== 1280 });
    test.setTimeout(90_000);
    const errors = new WeakMap<Page, string[]>(),
      external = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      errors.set(page, []);
      external.set(page, []);
      page.on("pageerror", (error) => errors.get(page)!.push(error.message));
      page.on("request", (request) => {
        if (
          !["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)
        )
          external.get(page)!.push(request.url());
      });
      await page.addInitScript(() => {
        Date.now = () => Date.parse("2026-10-18T12:00:00.000Z");
      });
      await page.goto("/");
    });
    test.afterEach(async ({ page }) => {
      expect(errors.get(page)).toEqual([]);
      expect(external.get(page)).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    });

    test("zapisuje raz uczciwy wynik 10 zadań, zachowuje po reload, tłumaczy, eksportuje i usuwa z potwierdzeniem", async ({
      page,
    }) => {
      await openProgress(page);
      await expect(dashboard(page)).toContainText(
        "Nie ma jeszcze ukończonych sesji",
      );
      await expect(stat(page, "accuracy")).toContainText(
        "Brak samodzielnych ocen",
      );
      await button(page, "Wróć do nauki").click();
      await expect(page.locator("#practice-title")).toBeFocused();
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      await button(page, "Pokaż brudnopis").click();
      await button(page, "Pisz").click();
      await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
      await page
        .getByLabel("Notatki tekstowe")
        .pressSequentially("PRIVATE NOTE");
      await button(page, "Rozpocznij sesję (10 zadań)").click();
      for (let i = 0; i < 10; i++) {
        const value = numeric(await page.locator(".question").innerText());
        const correct = `${value.numerator}/${value.denominator}`;
        const input = page.getByLabel("Twoja odpowiedź", { exact: true });
        if ([2, 7].includes(i)) await button(page, "Pokaż rozwiązanie").click();
        if ([1, 6].includes(i)) {
          await input.fill("999999");
          await button(page, "Sprawdź").click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback incorrect",
          );
        }
        if (i === 4) {
          await input.fill("abc");
          await button(page, "Sprawdź").click();
        } else if (i === 3)
          await input.fill(correct); // Unchecked writing is not assessment.
        else if (i !== 9) {
          await input.fill(correct);
          await button(page, "Sprawdź").click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback correct",
          );
        }
        if (i === 5) await button(page, "Pokaż rozwiązanie").click(); // Correct already recorded.
        expect(await stored(page)).toBeNull(); // Nothing persisted before completion.
        if (i === 3) {
          const run = await page
            .locator(".question")
            .getAttribute("data-exercise-run");
          await openProgress(page);
          await expect(stat(page, "sessions")).toHaveText("0");
          await button(page, "Wróć do nauki").click();
          await expect(page.locator(".question")).toHaveAttribute(
            "data-exercise-run",
            run!,
          );
          await expect(input).toHaveValue(correct);
          await expect(page.locator(".session-progress")).toHaveText(
            "Sesja: zadanie 4 z 10",
          );
          await expect(page.getByLabel("Notatki tekstowe")).toHaveValue(
            "PRIVATE NOTE",
          );
        }
        await advance(page, i);
      }
      const saved = (await stored(page))!;
      expect(saved.sessions).toHaveLength(1);
      expect(saved.sessions[0]).toMatchObject({
        shown: 10,
        correct: 3,
        incorrect: 2,
        solutionViewed: 2,
        skipped: 3,
      });
      expect(saved.sessions[0].entries).toHaveLength(10);
      expect(JSON.stringify(saved)).not.toMatch(
        /PRIVATE NOTE|answer|strokes|exerciseId|locale/,
      );
      await openProgress(page);
      await expect(stat(page, "sessions")).toHaveText("1");
      await expect(stat(page, "accuracy")).toHaveText("3 / 5 (60%)");
      await expect(stat(page, "incorrect")).toHaveText("2");
      await expect(stat(page, "solutionViewed")).toHaveText("2");
      await expect(stat(page, "skipped")).toHaveText("3");
      await button(page, "Wróć do nauki").click();
      await expect(page.locator("#session-complete")).toBeVisible();
      await openProgress(page);
      expect(await stored(page)).toEqual(saved);
      await button(page, "English").click();
      expect(await dashboard(page).innerText()).not.toMatch(polishLearningText);
      await expect(dashboard(page)).toContainText(
        "Data stays only on this device",
      );
      expect(await exported(page, true)).toEqual(saved);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");
      await expect(page.locator(".question")).toHaveCount(0);
      await openProgress(page);
      await expect(stat(page, "sessions")).toHaveText("1");
      await page.getByLabel("Kategoria historii").selectOption("fractions");
      await expect(dashboard(page)).toContainText(
        "Brak sesji pasujących do filtrów",
      );
      await page.getByLabel("Kategoria historii").selectOption("");
      await button(page, "Usuń historię").click();
      const dialog = page.getByRole("dialog", {
        name: "Usunąć całą historię?",
      });
      await expect(
        dialog.getByRole("button", { name: "Anuluj" }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(button(page, "Usuń historię")).toBeFocused();
      expect(await stored(page)).toEqual(saved);
      await button(page, "Usuń historię").click();
      await dialog
        .getByRole("button", { name: "Tak, usuń historię", exact: true })
        .click();
      await expect(page.locator("#progress-title")).toBeFocused();
      await expect(dashboard(page)).toContainText("Historia została usunięta");
      expect(await stored(page)).toBeNull();
      await page.reload();
      await openProgress(page);
      await expect(stat(page, "sessions")).toHaveText("0");
    });

    test("zwinięty brudnopis ma właściwą kolejność, zachowuje DOM, zaznaczenie, rysunek, natywne Undo i stan nauki", async ({
      page,
    }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      const notes = page.locator("#scratchpad-text");
      const editor = (await notes.elementHandle())!;
      await expect(notes).toBeHidden();
      const toggle = button(page, "Pokaż brudnopis");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toHaveAttribute(
        "aria-controls",
        "scratchpad-content",
      );
      const questionBox = (await page.locator(".question").boundingBox())!;
      const bar = (await page.locator(".scratchpad").boundingBox())!;
      const answerBox = (await page.locator("#answer").boundingBox())!;
      expect(bar.height).toBeLessThan(100);
      expect(bar.y).toBeGreaterThan(questionBox.y + questionBox.height);
      expect(answerBox.y).toBeGreaterThan(bar.y + bar.height);
      if (viewport.width !== 1280) await toggle.tap();
      else {
        await toggle.focus();
        await page.keyboard.press("Enter");
      }
      await button(page, "Pisz").click();
      await notes.pressSequentially("native history");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await button(page, "Schowaj brudnopis").click();
      await expect(button(page, "Pokaż brudnopis")).toBeFocused();
      await button(page, "English").click();
      await button(page, "Show scratchpad").click();
      expect(await editor.evaluate((element) => element.isConnected)).toBe(
        true,
      );
      await expect(button(page, "Write")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("native history");
      await notes.press("ControlOrMeta+Shift+z");
      await expect(notes).toHaveValue("");
      await notes.pressSequentially("alpha beta");
      await notes.evaluate((element: HTMLTextAreaElement) => {
        element.focus();
        element.setSelectionRange(6, 10);
        element.dispatchEvent(new Event("select", { bubbles: true }));
      });
      await button(page, "Hide scratchpad").click();
      await button(page, "Show scratchpad").click();
      expect(
        await notes.evaluate((element: HTMLTextAreaElement) => [
          element.selectionStart,
          element.selectionEnd,
        ]),
      ).toEqual([6, 10]);
      await button(page, "Insert Δ").click();
      await expect(notes).toHaveValue("alpha Δ");
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("alpha beta");
      await button(page, "Draw").click();
      const drawing = page.getByRole("img", { name: "Drawing area" });
      await drawing.scrollIntoViewIfNeeded();
      const box = (await drawing.boundingBox())!;
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.mouse.up();
      const points = await drawing
        .locator("[data-stroke]")
        .getAttribute("points");
      await button(page, "Write").click();
      const value = numeric(await page.locator(".question").innerText());
      await page
        .getByLabel("Your answer", { exact: true })
        .fill(`${value.numerator}/${value.denominator}`);
      await button(page, "Check").click();
      await button(page, "Show solution").click();
      const run = await page
        .locator(".question")
        .getAttribute("data-exercise-run");
      await openProgress(page, true);
      await expect(dashboard(page)).toContainText("No completed sessions yet");
      await button(page, "Return to learning").click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-exercise-run",
        run!,
      );
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await expect(page.locator(".solution-panel li")).toHaveCount(1);
      expect(await editor.evaluate((element) => element.isConnected)).toBe(
        true,
      );
      await expect(notes).toHaveValue("alpha beta");
      await button(page, "Draw").click();
      await expect(drawing.locator("[data-stroke]")).toHaveAttribute(
        "points",
        points!,
      );
      await button(page, "Undo").click();
      await expect(drawing.locator("[data-stroke]")).toHaveCount(0);
      await button(page, "Hide scratchpad").click();
      await button(page, "Show scratchpad").click();
      await button(page, "Redo").click();
      await expect(drawing.locator("[data-stroke]")).toHaveAttribute(
        "points",
        points!,
      );
      await button(page, "Write").click();
      // Start a fresh native edit after filling the answer: that separate edit
      // legitimately invalidates Chromium's earlier document-level Redo chain.
      await notes.press("ControlOrMeta+End");
      await notes.pressSequentially(" navigation");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await button(page, "Hide scratchpad").click();
      await openProgress(page, true);
      await button(page, "Return to learning").click();
      await button(page, "Show scratchpad").click();
      expect(await editor.evaluate((element) => element.isConnected)).toBe(
        true,
      );
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("alpha beta navigation");
      await notes.press("ControlOrMeta+Shift+z");
      await expect(notes).toHaveValue("");
      expect(await stored(page)).toBeNull();
    });

    test("auto-clear ON/OFF działa także po zwinięciu, a schowanie modala oddaje fokus i scroll", async ({
      page,
    }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      await button(page, "Pokaż brudnopis").click();
      await button(page, "Pisz").click();
      const notes = page.getByLabel("Notatki tekstowe");
      await notes.pressSequentially("old note");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await button(page, "Schowaj brudnopis").click();
      await button(page, "Nowy przykład").click();
      await button(page, "Pokaż brudnopis").click();
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("");
      await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
      await notes.pressSequentially("keep me");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      const editor = (await notes.elementHandle())!;
      await button(page, "Schowaj brudnopis").click();
      await button(page, "Nowy przykład").click();
      await button(page, "Pokaż brudnopis").click();
      expect(await editor.evaluate((element) => element.isConnected)).toBe(
        true,
      );
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("keep me");
      await notes.press("ControlOrMeta+Shift+z");
      await expect(notes).toHaveValue("");
      await notes.press("ControlOrMeta+z");
      await button(page, "Powiększ").click();
      await expect(
        page.getByRole("dialog", { name: "Brudnopis", exact: true }),
      ).toBeVisible();
      await button(page, "Schowaj brudnopis").click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(button(page, "Pokaż brudnopis")).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
        "hidden",
      );
      await button(page, "Pokaż brudnopis").click();
      await expect(notes).toHaveValue("keep me");
      await button(page, "Powiększ").click();
      // Exercise the application's visibility transition even from a modal state.
      await page
        .getByRole("navigation")
        .getByRole("button", { name: "Moje postępy", exact: true })
        .evaluate((element: HTMLButtonElement) => element.click());
      await expect(page.locator("#progress-title")).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
        "hidden",
      );
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await button(page, "Wróć do nauki").click();
      await expect(notes).toHaveValue("keep me");
    });

    test("agreguje różne kategorie, advanced i expert oraz sesję PL/EN; filtry nie ograniczają eksportu", async ({
      page,
    }) => {
      await button(page, "Zaawansowany").click();
      await skips(page);
      await button(page, "Ułamki").click();
      await button(page, "Ekspert").click();
      await button(page, "Rozpocznij sesję (10 zadań)").click();
      let en = false;
      for (let i = 0; i < 10; i++) {
        if (i === 5) {
          await button(page, "English").click();
          en = true;
        }
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await advance(page, i, en);
      }
      await openProgress(page, true);
      await expect(stat(page, "sessions")).toHaveText("2");
      await expect(stat(page, "skipped")).toHaveText("10");
      await expect(stat(page, "solutionViewed")).toHaveText("10");
      await expect(stat(page, "accuracy")).toContainText(
        "No independent assessments",
      );
      await expect(
        dashboard(page).locator(".progress-breakdown > li"),
      ).toHaveCount(2);
      await page.getByLabel("History difficulty").selectOption("expert");
      await expect(stat(page, "sessions")).toHaveText("1");
      expect((await exported(page, true)).sessions).toHaveLength(2);
      await page.getByLabel("History category").selectOption("matrices");
      await expect(dashboard(page)).toContainText(
        "No sessions match these filters",
      );
      await page.evaluate((key) => {
        const data = JSON.parse(localStorage.getItem(key)!);
        data.sessions[0].completedAt = "2026-08-01T00:00:00.000Z";
        data.sessions[1].completedAt = "2026-10-15T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(data));
      }, HISTORY_KEY);
      await page.reload();
      await openProgress(page);
      await page.getByLabel("Okres historii").selectOption("30");
      await expect(stat(page, "sessions")).toHaveText("1");
      await page.getByLabel("Okres historii").selectOption("all");
      await expect(stat(page, "sessions")).toHaveText("2");
    });

    for (const failure of ["denied", "quota"] as const)
      test(`ograniczenia Safari (${failure}): nauka i eksport działają w pamięci`, async ({
        page,
      }) => {
        await page.addInitScript((kind) => {
          if (kind === "denied")
            Object.defineProperty(window, "localStorage", {
              get() {
                throw new DOMException("Denied", "SecurityError");
              },
            });
          else
            Storage.prototype.setItem = () => {
              throw new DOMException("Full", "QuotaExceededError");
            };
        }, failure);
        await page.reload();
        if (failure === "denied")
          await expect(page.locator(".storage-notice")).toContainText(
            "Nie można zapisać postępów",
          );
        await button(page, "English").click();
        await skips(page, true);
        await expect(page.locator(".storage-notice")).toContainText(
          "Progress cannot be saved",
        );
        await openProgress(page, true);
        await expect(stat(page, "sessions")).toHaveText("1");
        await expect(stat(page, "skipped")).toHaveText("10");
        expect((await exported(page, true)).sessions).toHaveLength(1);
        await page.reload();
        await openProgress(page);
        await expect(stat(page, "sessions")).toHaveText("0");
      });

    test("błąd kasowania nie ogłasza sukcesu i zachowuje zapisane sesje", async ({
      page,
    }) => {
      await skips(page);
      const saved = await stored(page);
      await page.evaluate(() => {
        Storage.prototype.removeItem = () => {
          throw new DOMException("Denied", "SecurityError");
        };
      });
      await openProgress(page);
      await button(page, "Usuń historię").click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Tak, usuń historię", exact: true })
        .click();
      await expect(page.locator(".storage-notice")).toContainText(
        "Nie udało się usunąć historii",
      );
      await expect(stat(page, "sessions")).toHaveText("1");
      expect(await stored(page)).toEqual(saved);
      await expect(button(page, "Usuń historię")).toBeFocused();
      await expect(dashboard(page)).not.toContainText(
        "Historia została usunięta",
      );
      await page.reload();
      await openProgress(page);
      await expect(stat(page, "sessions")).toHaveText("1");
    });

    for (const raw of ["{broken", '{"version":99,"sessions":[]}'])
      test(`nie nadpisuje uszkodzonej lub przyszłej historii (${raw})`, async ({
        page,
      }) => {
        await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
          key: HISTORY_KEY,
          raw,
        });
        await page.reload();
        await expect(page.locator(".storage-notice")).toBeVisible();
        await skips(page);
        expect(
          await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY),
        ).toBe(raw);
        await openProgress(page);
        await expect(stat(page, "sessions")).toHaveText("1");
        await button(page, "English").click();
        expect(await page.locator(".storage-notice").innerText()).not.toMatch(
          polishLearningText,
        );
        await button(page, "Delete history").click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Yes, delete history", exact: true })
          .click();
        await expect(page.locator(".storage-notice")).toHaveCount(0);
        await button(page, "Return to learning").click(); // The old completed summary must not be saved again.
        await expect(page.locator("#session-complete")).toBeVisible();
        expect(await stored(page)).toBeNull();
        await page.reload();
        await openProgress(page);
        await expect(stat(page, "sessions")).toHaveText("0");
      });
  });
}
