import { test, expect, type Page } from "@playwright/test";
import { fillSystem, readSystem, fractionText } from "./helpers/systems";
import { polishLearningText } from "./helpers/localization";
import { HISTORY_KEY } from "../src/progress/model";
import { parseAnswer } from "../src/rational";
import { laplace, m } from "../src/university/audit";

/** Sessions mix all systems families; newer Cramer drills require D and Dᵢ rather than xᵢ. */
async function fillAnySystem(page: Page) {
  const template = await page.locator(".question").getAttribute("data-template-id");
  if (!template?.startsWith("cramer-determinants-")) return fillSystem(page);
  const { values } = await readSystem(page);
  const rows = await page.locator(".linear-algebra-matrices .given-matrix").first().locator("tbody tr").all();
  const augmented = await Promise.all(rows.map(async row =>
    Promise.all((await row.locator("td").allTextContents()).map(text => {
      const parsed = parseAnswer(text.trim());
      if (parsed.kind !== "valid") throw Error("Invalid augmented matrix cell");
      return parsed.value;
    }))
  ));
  const n = augmented.length;
  if (values.length !== n) throw Error("Cramer task without unique solution");
  const D = laplace(augmented.map(row => row.slice(0,n)));
  const expectedFields = [fractionText(D), ...values.map(value => fractionText(m(value,D)))];
  // Commit each React-controlled field before filling the next one.
  // A rapid sequence of synthetic fills must not overwrite a previous answer.
  for (let i = 0; i < expectedFields.length; i++) {
    const field = page.locator(i === 0 ? "#answer" : `#answer-${i}`);
    await field.fill(expectedFields[i]);
    await field.blur();
    await expect(field).toHaveValue(expectedFields[i]);
  }
  const fields = page.locator("form .coefficient-field input");
  await expect.poll(() => fields.evaluateAll(nodes => nodes.map(node => (node as HTMLInputElement).value)), {
    message: "All Cramer determinant fields must retain the entered values",
  }).toEqual(expectedFields);
  return { classification:"system-one", values };
}

for (const width of [375, 768, 1280])
  test.describe(`University ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.setTimeout(90_000);
    const errors = new WeakMap<Page, string[]>(),
      external = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      errors.set(page, []);
      external.set(page, []);
      page.on("pageerror", (e) => errors.get(page)!.push(e.message));
      page.on("request", (r) => {
        if (!["127.0.0.1", "localhost"].includes(new URL(r.url()).hostname))
          external.get(page)!.push(r.url());
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
    for (const en of [false, true]) {
      async function systems(page: Page) {
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
            name: en ? "Systems of equations" : "Układy równań",
            exact: true,
          })
          .click();
      }
      test(`P1 ${en ? "EN" : "PL"}: 2×2, 3×3, wszystkie pola, błąd, kroki i zmiana języka`, async ({
        page,
      }) => {
        await systems(page);
        for (const [level, family] of [
          [en ? "Easy" : "Łatwy", /2×2.*substitution|2×2.*podstawianie/],
          [en ? "Hard" : "Trudny", en ? /Cramer\x27s rule — 3×3/ : /Reguła Cramera — 3×3/],
          [
            en ? "Advanced" : "Zaawansowany",
            /2×2.*elimination|2×2.*eliminacja/,
          ],
          [en ? "Expert" : "Ekspert", /Cramer.*2×2/],
        ] as const) {
          await page.getByRole("button", { name: level, exact: true }).click();
          await page.getByRole("button", { name: family }).click();
          const computed = await readSystem(page);
          await page.locator("#answer").fill(fractionText(computed.values[0]));
          await page
            .getByRole("button", {
              name: en ? "Check" : "Sprawdź",
              exact: true,
            })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          await fillSystem(page);
          await page.locator("#answer").fill("999999");
          await page
            .getByRole("button", {
              name: en ? "Check" : "Sprawdź",
              exact: true,
            })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback incorrect",
          );
          await fillSystem(page);
          await page
            .getByRole("button", {
              name: en ? "Check" : "Sprawdź",
              exact: true,
            })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback correct",
          );
          await page
            .getByRole("button", {
              name: en ? "Show solution" : "Pokaż rozwiązanie",
              exact: true,
            })
            .click();
          await expect(page.locator(".solution-panel li")).toHaveCount(1);
          await page
            .getByRole("button", {
              name: en ? "Show all steps" : "Pokaż wszystkie kroki",
              exact: true,
            })
            .click();
          await expect(page.locator(".solution-final dd")).toHaveCount(
            computed.values.length,
          );
          if (en)
            expect(await page.locator("main").innerText()).not.toMatch(
              polishLearningText,
            );
        }
        const run = await page
          .locator(".question")
          .getAttribute("data-exercise-run");
        const count = await page.locator(".solution-panel li").count();
        await page
          .getByRole("button", { name: en ? "Polski" : "English", exact: true })
          .click();
        await expect(page.locator(".question")).toHaveAttribute(
          "data-exercise-run",
          run!,
        );
        await expect(page.locator(".solution-panel li")).toHaveCount(count);
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      });
      test(`P1 ${en ? "EN" : "PL"}: klasyfikacja osobliwa i historia dziesięciu zadań expert`, async ({
        page,
      }) => {
        await systems(page);
        await page
          .getByRole("button", {
            name: en ? /How many solutions/ : /Ile rozwiązań/,
          })
          .click();
        const seen = new Set<string>();
        for (let i = 0; i < 24 && seen.size < 3; i++) {
          const computed = await readSystem(page);
          seen.add(computed.classification);
          await page.locator("#answer").selectOption(computed.classification);
          if (computed.values.length) {
            await page
              .getByRole("button", {
                name: en ? "Check" : "Sprawdź",
                exact: true,
              })
              .click();
            await expect(page.locator(".feedback")).toHaveClass(
              "feedback invalid",
            );
            await fillSystem(page);
            const run = await page
              .locator(".question")
              .getAttribute("data-exercise-run");
            const values = await page
              .locator("form .coefficient-field input")
              .evaluateAll((nodes) =>
                nodes.map((node) => (node as HTMLInputElement).value),
              );
            for (const language of [
              en ? "Polski" : "English",
              en ? "English" : "Polski",
            ]) {
              await page
                .getByRole("button", { name: language, exact: true })
                .click();
              await expect(page.locator(".question")).toHaveAttribute(
                "data-exercise-run",
                run!,
              );
              await expect(page.locator("#answer")).toHaveValue("system-one");
              for (let field = 0; field < values.length; field++)
                await expect(
                  page.locator(`#system-value-${field}`),
                ).toHaveValue(values[field]);
            }
          }
          await page
            .getByRole("button", {
              name: en ? "Check" : "Sprawdź",
              exact: true,
            })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback correct",
          );
          await expect(page.locator(".coefficient-field")).toHaveCount(
            computed.values.length,
          );
          await page
            .getByRole("button", {
              name: en ? "New example" : "Nowy przykład",
              exact: true,
            })
            .click();
        }
        expect(seen.size).toBe(3);
        await page
          .getByRole("button", { name: en ? "Expert" : "Ekspert", exact: true })
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
          if (i < 8) {
            await fillAnySystem(page);
            if (i === 1) {
              if (await page.locator("#answer").evaluate((element) => element.tagName === "SELECT")) {
                const selected = await page.locator("#answer").inputValue();
                await page.locator("#answer").selectOption(selected === "system-one" ? "system-none" : selected === "system-none" ? "system-many" : "system-none");
              } else await page.locator("#answer").fill("999999");
            }
            await page
              .getByRole("button", {
                name: en ? "Check" : "Sprawdź",
                exact: true,
              })
              .click();
            if (i === 1) {
              await fillAnySystem(page);
              await page
                .getByRole("button", {
                  name: en ? "Check" : "Sprawdź",
                  exact: true,
                })
                .click();
            }
            const templateId = await page.locator(".question").getAttribute("data-template-id");
            expect(await page.locator(".feedback").getAttribute("class"),
              `Session task ${i}, template=${templateId} should be assessed correctly`
            ).toBe("feedback correct");
          } else if (i === 8)
            await page
              .getByRole("button", {
                name: en ? "Show solution" : "Pokaż rozwiązanie",
                exact: true,
              })
              .click();
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
          category: "systems",
          difficulty: "expert",
          shown: 10,
          correct: 7,
          incorrect: 1,
          solutionViewed: 1,
          skipped: 1,
        });
      });
    }
  });
