import { test, expect } from "@playwright/test";
import { HISTORY_KEY, type History } from "../src/progress/model";
import { expectOnlyProgressStorage } from "./helpers/progress";
import { polishLearningText } from "./helpers/localization";
for (const width of [375, 768, 1280])
  for (const limits of [true, false]) {
    test(`MT-EDU-005 ${limits ? "limits" : "derivatives"} ${width}px: PL/EN, notes, native Undo/Redo, session and history`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const button = (name: string) =>
        page.getByRole("button", { name, exact: true });
      await button("Matematyka na studia").click();
      await button(limits ? "Granice funkcji" : "Pochodne").click();
      await button(limits ? "Średni" : "Łatwy").click();
      await page
        .getByRole("button", {
          name: limits ? /Granice z pierwiastkami/ : /Pochodna: wzór/,
        })
        .click();
      const question = page.locator(".question"),
        run = await question.getAttribute("data-exercise-run");
      await button("Pokaż brudnopis").click();
      await button("Pisz").click();
      await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
      const notes = page.locator("#scratchpad-text"),
        editor = (await notes.elementHandle())!;
      await notes.pressSequentially("x + 1");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("x + 1");
      await notes.press("ControlOrMeta+Shift+z");
      await expect(notes).toHaveValue("");
      await notes.press("ControlOrMeta+z");
      await button("Rysuj").click();
      const area = (await page.locator(".scratchpad-drawing").boundingBox())!;
      await page.mouse.move(area.x + 20, area.y + 25);
      await page.mouse.down();
      await page.mouse.move(area.x + 110, area.y + 65, { steps: 5 });
      await page.mouse.up();
      await expect(page.locator("[data-stroke]")).toHaveCount(1);
      await button("Pisz").click();
      if (limits) await page.locator("#answer").selectOption("finite");
      const input = page.locator("form input").first();
      await input.fill("3/7");
      await button("Pokaż rozwiązanie").click();
      const steps = await page.locator(".solution-panel li").count();
      await button("English").click();
      await expect(question).toHaveAttribute("data-exercise-run", run!);
      await expect(input).toHaveValue("3/7");
      await expect(notes).toHaveValue("x + 1");
      await expect(page.locator(".solution-panel li")).toHaveCount(steps);
      await expect(page.locator("[data-stroke]")).toHaveCount(1);
      expect(await page.locator("main").innerText()).not.toMatch(
        polishLearningText,
      );
      await button("Hide scratchpad").click();
      await button("Show scratchpad").click();
      expect(await editor.evaluate((el) => el.isConnected)).toBe(true);
      await button("Expand").click();
      await button("Close").click();
      await expect(button("Expand")).toBeFocused();
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("x + 1");
      await button("Hide scratchpad").click();
      await button("Expert").click();
      await button("Start a session (10 exercises)").click();
      for (let i = 0; i < 10; i++) {
        await button("Check").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        if (i % 2 === 0) await button("Show solution").click();
        if (i === 4) {
          const current = await question.getAttribute("data-exercise-run");
          await button("Polski").click();
          await expect(question).toHaveAttribute("data-exercise-run", current!);
          await button("English").click();
        }
        await button(i === 9 ? "Finish session" : "Next exercise").click();
      }
      const history = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!) as History,
        HISTORY_KEY,
      );
      expect(history.sessions).toHaveLength(1);
      expect(history.sessions[0]).toMatchObject({
        category: limits ? "function-limits" : "derivatives",
        difficulty: "expert",
        shown: 10,
        correct: 0,
        incorrect: 0,
        solutionViewed: 5,
        skipped: 5,
      });
      await expect(
        page.getByText("Not enough data to suggest a level", { exact: true }),
      ).toBeVisible();
      await button("My progress").click();
      await expect(page.locator(".progress-dashboard")).toBeVisible();
      expect(await page.locator("main").innerText()).not.toMatch(
        polishLearningText,
      );
      await expectOnlyProgressStorage(page);
      await page.reload();
      await button("Moje postępy").click();
      await expect(
        page.locator('.progress-totals [data-stat="sessions"]'),
      ).toHaveText("1");
      const persisted = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!) as History,
        HISTORY_KEY,
      );
      expect(persisted).toEqual(history);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    });
  }
