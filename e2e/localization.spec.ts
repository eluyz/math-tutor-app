import { numeric } from "./helpers/arithmetic";
import { test, expect, type Page } from "@playwright/test";
const polish =
  /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(Oblicz|Rozwiąż|Wybierz|Podaj|Współczynnik|Macierz|Wyznacznik|Brudnopis|Pokaż|Sprawdź|Poprawna|Iloczyn|Zadanie|Odpowiedź)\b/u;
async function english(page: Page) {
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
}
async function noPolish(page: Page) {
  expect(await page.locator("main").innerText()).not.toMatch(polish);
  expect(
    await page
      .locator("main")
      .evaluate((el) =>
        [...el.querySelectorAll("[aria-label],[title],[placeholder]")]
          .map((n) =>
            [
              n.getAttribute("aria-label"),
              n.getAttribute("title"),
              n.getAttribute("placeholder"),
            ].join(" "),
          )
          .join(" "),
      ),
  ).not.toMatch(polish);
}
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
])
  test.describe(`PL/EN ${viewport.width}px`, () => {
    test.use({ viewport });
    test.setTimeout(90_000);
    const external = new WeakMap<Page, string[]>(),
      errors = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      external.set(page, []);
      errors.set(page, []);
      page.on("request", (r) => {
        if (!["127.0.0.1", "localhost"].includes(new URL(r.url()).hostname))
          external.get(page)!.push(r.url());
      });
      page.on("pageerror", (e) => errors.get(page)!.push(e.message));
      await page.addInitScript(() => {
        Date.now = () => 42;
      });
      await page.goto("/");
    });
    test.afterEach(async ({ page }) => {
      expect(external.get(page)).toEqual([]);
      expect(errors.get(page)).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      expect(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
      ).toBe(0);
    });
    test("zmiana języka zachowuje odpowiedź, diagnozę, częściowe kroki i natywne Undo brudnopisu", async ({
      page,
    }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      const id = await page
        .locator(".question")
        .getAttribute("data-exercise-id");
      const drawing = page.getByRole("img", { name: "Pole rysowania" });
      await drawing.scrollIntoViewIfNeeded();
      const box = (await drawing.boundingBox())!;
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.mouse.up();
      const points = await page.locator("[data-stroke]").getAttribute("points");
      const q = await page.locator(".question").innerText(),
        [a, b, c] = q.match(/\d+/g)!.map(Number);
      await page
        .getByLabel("Twoja odpowiedź", { exact: true })
        .fill(String((a + b) * c));
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await page
        .getByRole("button", { name: "Pokaż kolejną podpowiedź" })
        .click();
      await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
      await page.locator("#step-answer").fill(String(b * c));
      await page
        .getByRole("button", { name: "Sprawdź krok", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Pokaż rozwiązanie", exact: true })
        .click();
      await expect(page.locator(".solution-panel li")).toHaveCount(1);
      await page.getByRole("button", { name: "Pisz", exact: true }).click();
      const notes = page.getByLabel("Notatki tekstowe");
      await notes.pressSequentially("x squared");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await page.getByRole("button", { name: "English", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("button", { name: "English", exact: true }),
      ).toBeFocused();
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator(".question")).toHaveAttribute(
        "data-exercise-id",
        id!,
      );
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        String((a + b) * c),
      );
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await expect(page.locator(".feedback")).toContainText("One possibility");
      await expect(page.locator(".learning-hint")).toHaveCount(2);
      await expect(page.locator("#step-answer")).toHaveValue(String(b * c));
      await expect(page.locator(".step-feedback")).toContainText(
        "This step is correct",
      );
      await expect(page.locator(".solution-panel li")).toHaveCount(1);
      await expect(page.locator("[data-stroke]")).toHaveAttribute(
        "points",
        points!,
      );
      await noPolish(page);
      const enNotes = page.getByLabel("Text notes");
      await enNotes.press("ControlOrMeta+z");
      await expect(enNotes).toHaveValue("x squared");
      await enNotes.press("ControlOrMeta+Shift+z");
      await expect(enNotes).toHaveValue("");
      await page.getByRole("button", { name: "Polski", exact: true }).click();
      await expect(page.locator(".question")).toHaveText(q);
      await expect(page.locator(".solution-panel li")).toHaveCount(1);
      await expect(page.locator(".step-feedback")).toContainText(
        "Ten krok jest poprawny",
      );
    });
    test("pełne angielskie ułamki, delta, pierwiastki, Sarrus i nowe rodziny expert", async ({
      page,
    }) => {
      await english(page);
      await page
        .getByRole("button", { name: "Fractions", exact: true })
        .click();
      await page.getByRole("button", { name: /Adding fractions/ }).click();
      const id = await page
        .locator(".question")
        .getAttribute("data-exercise-id");
      await page
        .getByRole("button", { name: "Show solution", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show all steps", exact: true })
        .click();
      await expect(page.locator(".solution-final")).toBeVisible();
      await noPolish(page);
      await page.getByRole("button", { name: "Polski", exact: true }).click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-exercise-id",
        id!,
      );
      await page.getByRole("button", { name: "English", exact: true }).click();
      await expect(page.locator(".solution-final")).toBeVisible();
      await page
        .getByRole("button", { name: "University mathematics", exact: true })
        .click();
      for (const family of [
        /Calculating the discriminant/,
        /Solving a quadratic equation/,
      ]) {
        await page.getByRole("button", { name: family }).click();
        await page
          .getByRole("button", { name: "Show solution", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Show all steps", exact: true })
          .click();
        await expect(page.locator(".solution-panel")).toContainText("b² − 4ac");
        await noPolish(page);
      }
      await page
        .getByRole("button", { name: "Determinants", exact: true })
        .click();
      await page
        .getByRole("button", { name: /3×3 determinant — Sarrus/ })
        .click();
      await page.getByRole("button", { name: "Expert", exact: true }).click();
      await page
        .getByRole("button", { name: "Show solution", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show all steps", exact: true })
        .click();
      await expect(
        page
          .locator(".solution-panel li")
          .filter({ hasText: /Product [1-6]:/ }),
      ).toHaveCount(6);
      await noPolish(page);
      await page.getByRole("button", { name: "Matrices", exact: true }).click();
      await page
        .getByRole("button", { name: /Matrix multiplication AB/ })
        .click();
      await page
        .getByRole("button", { name: "Show solution", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show all steps", exact: true })
        .click();
      await expect(
        page.getByRole("table", { name: "Matrix result", exact: true }),
      ).toBeVisible();
      await noPolish(page);
    });
    test("angielska sesja advanced z oceną, podglądem i rekomendacją expert", async ({
      page,
    }) => {
      await english(page);
      await page.getByRole("button", { name: /Multiplication first/ }).click();
      await page.getByRole("button", { name: "Advanced", exact: true }).click();
      await page
        .getByRole("button", {
          name: "Start a session (10 exercises)",
          exact: true,
        })
        .click();
      for (let i = 0; i < 10; i++) {
        if (i < 8) {
          const answer = numeric(await page.locator(".question").innerText());
          await page
            .getByLabel("Your answer", { exact: true })
            .fill(`${answer.numerator}/${answer.denominator}`);
          await page
            .getByRole("button", { name: "Check", exact: true })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback correct",
          );
        } else if (i === 8)
          await page
            .getByRole("button", { name: "Show solution", exact: true })
            .click();
        await page
          .getByRole("button", {
            name: i === 9 ? "Finish session" : "Next exercise",
            exact: true,
          })
          .click();
      }
      await expect(page.getByRole("status")).toHaveText(
        "Suggested level: Expert",
      );
      await noPolish(page);
      await page.getByRole("button", { name: "Polski", exact: true }).click();
      await expect(page.getByRole("status")).toHaveText(
        "Sugerowany poziom: Ekspert",
      );
      await page.getByRole("button", { name: "English", exact: true }).click();
      await page
        .getByRole("button", {
          name: "Start the next session at the suggested level",
          exact: true,
        })
        .click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-difficulty",
        "expert",
      );
    });
    test("język w trakcie sesji zachowuje pierwszą ocenę, podgląd i podsumowanie", async ({
      page,
    }) => {
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      await page
        .getByRole("button", {
          name: "Rozpocznij sesję (10 zadań)",
          exact: true,
        })
        .click();
      await page.getByLabel("Twoja odpowiedź", { exact: true }).fill("99999");
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await page.getByRole("button", { name: "Pisz", exact: true }).click();
      await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
      await page.getByLabel("Notatki tekstowe").pressSequentially("my notes");
      const id = await page
        .locator(".question")
        .getAttribute("data-exercise-id");
      await english(page);
      await expect(page.locator(".question")).toHaveAttribute(
        "data-exercise-id",
        id!,
      );
      await expect(page.locator(".session-progress")).toHaveText(
        "Session: exercise 1 of 10",
      );
      await expect(page.getByLabel("Text notes")).toHaveValue("my notes");
      await page
        .getByRole("button", { name: "Next exercise", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show solution", exact: true })
        .click();
      await page.getByRole("button", { name: "Polski", exact: true }).click();
      await expect(page.locator(".solution-panel li")).toHaveCount(1);
      await page.getByRole("button", { name: "English", exact: true }).click();
      for (let i = 1; i < 10; i++)
        await page
          .getByRole("button", {
            name: i === 9 ? "Finish session" : "Next exercise",
            exact: true,
          })
          .click();
      const summary = page.getByRole("region", { name: "Session complete!" });
      await expect(summary).toBeVisible();
      for (const [label, value] of [
        ["Correct on the first valid attempt", "0/10"],
        ["Needed correction after the first valid attempt", "1"],
        ["Solution viewed before the first valid assessment", "1"],
        ["Skipped without a valid assessment", "8"],
      ])
        await expect(
          summary.getByText(label, { exact: true }).locator("..").locator("dd"),
        ).toHaveText(value);
      await noPolish(page);
      await page.getByRole("button", { name: "Polski", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Sesja zakończona!" }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: "Rozpocznij sesję na obecnym poziomie",
          exact: true,
        })
        .click();
      await expect(page.getByLabel("Notatki tekstowe")).toHaveValue("my notes");
    });
  });
