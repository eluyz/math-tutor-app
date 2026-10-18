import { test, expect } from "@playwright/test";
import { fillFunction } from "./helpers/functions";
import { polishLearningText } from "./helpers/localization";
import { HISTORY_KEY } from "../src/progress/model";

for (const width of [375, 768, 1280])
  test.describe(`Functions ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.setTimeout(90_000);
    for (const en of [false, true]) {
      test(`P2 ${en ? "EN" : "PL"}: dziedzina, zera, wartości, współczynniki, wierzchołek i złożenie`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto("/");
        if (en)
          await page
            .getByRole("button", { name: "English", exact: true })
            .click();
        await page
          .getByRole("button", {
            name: en ? "University mathematics" : "Matematyka na studia",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: en ? "Functions" : "Funkcje",
            exact: true,
          })
          .click();
        const cases = [
          [
            "function-value",
            en ? "Hard" : "Trudny",
            en
              ? "Function values and substitution"
              : "Wartość funkcji i podstawianie",
          ],
          [
            "function-zeros",
            en ? "Hard" : "Trudny",
            en ? "Zeros and domain restrictions" : "Miejsca zerowe i dziedzina",
          ],
          [
            "function-linear",
            en ? "Expert" : "Ekspert",
            en
              ? "Coefficients of a linear function"
              : "Współczynniki funkcji liniowej",
          ],
          [
            "function-vertex",
            en ? "Hard" : "Trudny",
            en ? "Vertex and axis of symmetry" : "Wierzchołek i oś symetrii",
          ],
          [
            "function-range",
            en ? "Hard" : "Trudny",
            en
              ? "Range of a quadratic function"
              : "Zbiór wartości funkcji kwadratowej",
          ],
          [
            "function-composition",
            en ? "Advanced" : "Zaawansowany",
            en ? "Composition of functions" : "Złożenia funkcji",
          ],
          [
            "function-domain",
            en ? "Expert" : "Ekspert",
            en ? "Domain of a function" : "Dziedzina funkcji",
          ],
        ];
        for (const [family, level, title] of cases) {
          await page.getByRole("button", { name: level, exact: true }).click();
          await page.getByRole("button", { name: new RegExp(title) }).click();
          const check = page.getByRole("button", {
            name: en ? "Check" : "Sprawdź",
            exact: true,
          });
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          if (
            (await page.locator("#answer").evaluate((e) => e.tagName)) ===
            "INPUT"
          ) {
            const fields = page.locator("form input");
            for (let i = 0; i < (await fields.count()); i++)
              await fields.nth(i).fill("99999999");
            await check.click();
            await expect(page.locator(".feedback")).toHaveClass(
              "feedback incorrect",
            );
          }
          await fillFunction(page, family);
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback correct",
          );
          await page
            .getByRole("button", {
              name: en ? "Show solution" : "Pokaż rozwiązanie",
              exact: true,
            })
            .click();
          await page
            .getByRole("button", {
              name: en ? "Show all steps" : "Pokaż wszystkie kroki",
              exact: true,
            })
            .click();
          await expect(page.locator(".solution-final")).toBeVisible();
          if (en)
            expect(await page.locator("main").innerText()).not.toMatch(
              polishLearningText,
            );
        }
        const run = await page
            .locator(".question")
            .getAttribute("data-exercise-run"),
          value = await page.locator("#answer").inputValue(),
          count = await page.locator(".solution-panel li").count();
        await page
          .getByRole("button", { name: en ? "Polski" : "English", exact: true })
          .click();
        await expect(page.locator(".question")).toHaveAttribute(
          "data-exercise-run",
          run!,
        );
        await expect(page.locator("#answer")).toHaveValue(value);
        await expect(page.locator(".solution-panel li")).toHaveCount(count);
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
        expect(errors).toEqual([]);
      });
      test(`P2 ${en ? "EN" : "PL"}: sesja advanced/expert, język i uczciwa historia`, async ({
        page,
      }) => {
        await page.goto("/");
        if (en)
          await page
            .getByRole("button", { name: "English", exact: true })
            .click();
        await page
          .getByRole("button", {
            name: en ? "University mathematics" : "Matematyka na studia",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: en ? "Functions" : "Funkcje",
            exact: true,
          })
          .click();
        const level = width === 768 ? "advanced" : "expert";
        await page
          .getByRole("button", {
            name:
              level === "advanced"
                ? en
                  ? "Advanced"
                  : "Zaawansowany"
                : en
                  ? "Expert"
                  : "Ekspert",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: en
              ? "Start a session (10 exercises)"
              : "Rozpocznij sesję (10 zadań)",
            exact: true,
          })
          .click();
        for (let i = 0; i < 10; i++) {
          if (i % 2 === 0)
            await page
              .getByRole("button", {
                name: en ? "Show solution" : "Pokaż rozwiązanie",
                exact: true,
              })
              .click();
          if (i === 4) {
            const run = await page
              .locator(".question")
              .getAttribute("data-exercise-run");
            await page
              .getByRole("button", {
                name: en ? "Polski" : "English",
                exact: true,
              })
              .click();
            await expect(page.locator(".question")).toHaveAttribute(
              "data-exercise-run",
              run!,
            );
            await page
              .getByRole("button", {
                name: en ? "English" : "Polski",
                exact: true,
              })
              .click();
          }
          await page
            .getByRole("button", {
              name:
                i === 9
                  ? en
                    ? "Finish session"
                    : "Zakończ sesję"
                  : en
                    ? "Next exercise"
                    : "Następne zadanie",
              exact: true,
            })
            .click();
        }
        const history = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          HISTORY_KEY,
        );
        expect(history.sessions.at(-1)).toMatchObject({
          category: "functions",
          difficulty: level,
          shown: 10,
          correct: 0,
          incorrect: 0,
          solutionViewed: 5,
          skipped: 5,
        });
        await expect(
          page.getByText(
            en
              ? "Not enough data to suggest a level"
              : "Za mało danych do sugestii poziomu",
            { exact: true },
          ),
        ).toBeVisible();
      });
    }
  });
