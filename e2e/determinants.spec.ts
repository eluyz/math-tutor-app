import { test, expect } from "@playwright/test";
import { q, a, s, m, d, eq } from "../src/university/audit";
import { shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { polishLearningText } from "./helpers/localization";
import { HISTORY_KEY, type History } from "../src/progress/model";
import { expectOnlyProgressStorage } from "./helpers/progress";

type Fraction = ReturnType<typeof q>;
function normalized(value: Fraction): Fraction {
  let x = value.numerator < 0n ? -value.numerator : value.numerator,
    y = value.denominator;
  while (y) [x, y] = [y, x % y];
  const factor = x || 1n;
  return q(value.numerator / factor, value.denominator / factor);
}
const shown = (value: Fraction) => {
  const v = normalized(value);
  return (v.denominator === 1n ? `${v.numerator}` : fractionText(v)).replaceAll(
    "-",
    "−",
  );
};
function independentGaussian(matrix: Fraction[][]): Fraction {
  const rows = matrix.map((row) => [...row]);
  let sign = q(1);
  for (let k = 0; k < rows.length; k++) {
    const pivot = rows.findIndex((row, i) => i >= k && row[k].numerator !== 0n);
    if (pivot < 0) return q(0);
    if (pivot !== k) {
      [rows[k], rows[pivot]] = [rows[pivot], rows[k]];
      sign = m(sign, q(-1));
    }
    for (let i = k + 1; i < rows.length; i++) {
      const ratio = d(rows[i][k], rows[k][k]);
      for (let j = k; j < rows.length; j++)
        rows[i][j] = s(rows[i][j], m(ratio, rows[k][j]));
    }
  }
  return rows.map((row, i) => row[i]).reduce(m, sign);
}
for (const width of [375, 768, 1280])
  for (const english of [false, true]) {
    test(`MT-EDU-006A ${width}px ${english ? "EN" : "PL"}: determinants, answers, solutions, scratchpad and session`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const button = (name: string) =>
        page.getByRole("button", { name, exact: true });
      await page.goto("/");
      if (english) await button("English").click();
      await button(
        english ? "University mathematics" : "Matematyka na studia",
      ).click();
      await button(english ? "Determinants" : "Wyznaczniki").click();
      for (const [title, level, size] of [
        [
          english ? "4×4 Laplace expansion with zeros" : "Laplace 4×4 z zerami",
          english ? "Hard" : "Trudny",
          4,
        ],
        [
          english
            ? "4×4 determinant: row operations"
            : "Wyznacznik 4×4: operacje wierszowe",
          english ? "Advanced" : "Zaawansowany",
          4,
        ],
        [
          english ? "5×5 Laplace and 4×4 minors" : "Laplace 5×5 i minory 4×4",
          english ? "Expert" : "Ekspert",
          5,
        ],
        [
          english ? "4×4 determinant properties" : "Własności wyznacznika 4×4",
          english ? "Medium" : "Średni",
          4,
        ],
      ] as const) {
        await button(level).click();
        await page.getByRole("button", { name: title }).click();
        const table = page.locator(".determinant-display");
        await expect(table).toBeVisible();
        const rows = await table.locator("tbody tr").all();
        expect(rows).toHaveLength(size);
        const matrix: Fraction[][] = [];
        for (const row of rows)
          matrix.push(
            (await row.locator("td").allTextContents()).map(shownFraction),
          );
        expect(matrix.every((row) => row.length === size)).toBe(true);
        const expected = independentGaussian(matrix);
        const check = button(english ? "Check" : "Sprawdź");
        await check.click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").fill("1/0");
        await check.click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page
          .locator("#answer")
          .fill(fractionText(normalized(a(expected, q(1)))));
        await check.click();
        await expect(page.locator(".feedback")).toHaveClass(
          "feedback incorrect",
        );
        await page.locator("#answer").fill(fractionText(normalized(expected)));
        await check.click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(english ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(
          english ? "Show all steps" : "Pokaż wszystkie kroki",
        ).click();
        const solution = await page.locator(".solution-panel").innerText();
        expect(solution).toContain(shown(expected));
        if (title.includes("5×5")) {
          expect(solution).toContain("4×4");
          expect(solution).toContain("3×3");
        }
        if (english)
          expect(await page.locator("main").innerText()).not.toMatch(
            polishLearningText,
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
      }
      await button(english ? "Show scratchpad" : "Pokaż brudnopis").click();
      await button(english ? "Write" : "Pisz").click();
      await page
        .getByLabel(
          english
            ? "Clear the scratchpad for a new exercise"
            : "Czyść brudnopis przy nowym zadaniu",
        )
        .uncheck();
      const notes = page.locator("#scratchpad-text"),
        editor = (await notes.elementHandle())!;
      await notes.pressSequentially("det A = -2");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("det A = -2");
      const run = await page
        .locator(".question")
        .getAttribute("data-exercise-run");
      const answer = await page.locator("#answer").inputValue();
      await button(english ? "Polski" : "English").click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-exercise-run",
        run!,
      );
      await expect(page.locator("#answer")).toHaveValue(answer);
      await expect(notes).toHaveValue("det A = -2");
      expect(await editor.evaluate((el) => el.isConnected)).toBe(true);
      await button(english ? "Schowaj brudnopis" : "Hide scratchpad").click();
      await button(english ? "Pokaż brudnopis" : "Show scratchpad").click();
      await expect(notes).toHaveValue("det A = -2");
      await button(english ? "Powiększ" : "Expand").click();
      await button(english ? "Zamknij" : "Close").click();
      await expect(button(english ? "Powiększ" : "Expand")).toBeFocused();
      if (!english) await button("Polski").click();
      await button("Ekspert").click();
      await button("Rozpocznij sesję (10 zadań)").click();
      for (let i = 0; i < 10; i++) {
        await button("Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        if (i % 2 === 0) await button("Pokaż rozwiązanie").click();
        await button(i === 9 ? "Zakończ sesję" : "Następne zadanie").click();
      }
      const history = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!) as History,
        HISTORY_KEY,
      );
      expect(history.sessions).toHaveLength(1);
      expect(history.sessions[0]).toMatchObject({
        category: "determinants",
        difficulty: "expert",
        shown: 10,
        solutionViewed: 5,
        skipped: 5,
      });
      await expectOnlyProgressStorage(page);
      expect(errors).toEqual([]);
    });
  }
