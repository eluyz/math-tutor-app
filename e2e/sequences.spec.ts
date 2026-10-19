import { test, expect, type Page } from "@playwright/test";
import { shownPolynomial, shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { q, m, s, d, eq } from "../src/university/audit";
import { canonical, cmp } from "../src/university/functions-audit";
import type { LimitValue } from "../src/answers";
import { polishLearningText } from "./helpers/localization";
import { HISTORY_KEY } from "../src/progress/model";
async function fillLimit(page: Page, value: LimitValue) {
  await page.locator("#answer").selectOption(value.kind);
  if (value.kind === "finite")
    await page.locator("#limit-value").fill(fractionText(value.value));
}
function displayedGeometric(text: string): LimitValue {
  const terms = [...text.matchAll(/\(([^()]+)\)·\(([^()]+)\)ⁿ/g)];
  if (terms.length !== 1) throw new Error("Simple geometric term expected");
  const coefficient = shownFraction(terms[0][1]),
    base = shownFraction(terms[0][2]),
    magnitude =
      base.numerator < 0n ? { ...base, numerator: -base.numerator } : base;
  if (!coefficient.numerator || cmp(magnitude, q(1)) < 0)
    return { kind: "finite", value: q(0) };
  if (eq(base, q(1))) return { kind: "finite", value: coefficient };
  if (base.numerator < 0n) return { kind: "does-not-exist" };
  return {
    kind:
      coefficient.numerator > 0n ? "positive-infinity" : "negative-infinity",
  };
}
for (const width of [375, 768, 1280])
  test.describe(`Sequences ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.setTimeout(90_000);
    for (const en of [false, true]) {
      async function open(page: Page) {
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
            name: en ? "Limits of sequences" : "Granice ciągów",
            exact: true,
          })
          .click();
      }
      test(`P3 ${en ? "EN" : "PL"}: cztery rodzaje granicy, format, sprzężenie i zmiana języka`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await open(page);
        await page
          .getByRole("button", {
            name: en ? /Geometric sequences/ : /Ciągi geometryczne/,
          })
          .click();
        const seen = new Set<string>();
        for (let i = 0; i < 24 && seen.size < 4; i++) {
          const expected = displayedGeometric(
            await page.locator(".question").innerText(),
          );
          seen.add(expected.kind);
          const check = page.getByRole("button", {
            name: en ? "Check" : "Sprawdź",
            exact: true,
          });
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          await page.locator("#answer").selectOption("finite");
          await page.locator("#limit-value").fill("1/0");
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          await fillLimit(page, {
            kind:
              expected.kind === "does-not-exist"
                ? "positive-infinity"
                : "does-not-exist",
          });
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback incorrect",
          );
          await fillLimit(page, expected);
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
          await page
            .getByRole("button", {
              name: en ? "New example" : "Nowy przykład",
              exact: true,
            })
            .click();
        }
        expect(seen.size).toBe(4);
        await page
          .getByRole("button", { name: en ? "Hard" : "Trudny", exact: true })
          .click();
        await page
          .getByRole("button", {
            name: en ? /Polynomial ratios/ : /Ilorazy wielomianów/,
          })
          .click();
        const ratio = (await page.locator(".question").innerText())
            .split("\n")[1]
            .match(/^aₙ = \((.*)\)\/\((.*)\)$/)!,
          top = shownPolynomial(ratio[1]),
          bottom = shownPolynomial(ratio[2]),
          coefficient = canonical(d(top.at(-1)!, bottom.at(-1)!));
        const expected: LimitValue =
          top.length < bottom.length
            ? { kind: "finite", value: q(0) }
            : top.length === bottom.length
              ? { kind: "finite", value: coefficient }
              : {
                  kind:
                    coefficient.numerator > 0n
                      ? "positive-infinity"
                      : "negative-infinity",
                };
        await fillLimit(page, expected);
        await page
          .getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true })
          .click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await page
          .getByRole("button", { name: en ? "Expert" : "Ekspert", exact: true })
          .click();
        await page
          .getByRole("button", {
            name: en
              ? /Square roots and conjugates/
              : /Pierwiastki i wyrażenie sprzężone/,
          })
          .click();
        const radicand = (await page.locator(".question").innerText()).match(
            /√\(\(([^()]+)\)·n² \+ \(([^()]+)\)·n \+ \(([^()]+)\)\)/,
          )!,
          a = shownFraction(radicand[2]),
          b = shownFraction(radicand[3]);
        await fillLimit(page, {
          kind: "finite",
          value: d(s(m(q(4), b), m(a, a)), q(8)),
        });
        await page
          .getByRole("button", { name: en ? "Check" : "Sprawdź", exact: true })
          .click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await page
          .getByRole("button", {
            name: en ? "Show solution" : "Pokaż rozwiązanie",
            exact: true,
          })
          .click();
        const run = await page
            .locator(".question")
            .getAttribute("data-exercise-run"),
          value = await page.locator("#limit-value").inputValue();
        await page
          .getByRole("button", { name: en ? "Polski" : "English", exact: true })
          .click();
        await expect(page.locator(".question")).toHaveAttribute(
          "data-exercise-run",
          run!,
        );
        await expect(page.locator("#answer")).toHaveValue("finite");
        await expect(page.locator("#limit-value")).toHaveValue(value);
        await expect(page.locator(".solution-panel li")).toHaveCount(1);
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
        expect(errors).toEqual([]);
      });
      test(`P3 ${en ? "EN" : "PL"}: sesja expert zachowuje ocenę formatu i obejrzane rozwiązania`, async ({
        page,
      }) => {
        await open(page);
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
          await page
            .getByRole("button", {
              name: en ? "Check" : "Sprawdź",
              exact: true,
            })
            .click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          if (i < 3)
            await page
              .getByRole("button", {
                name: en ? "Show solution" : "Pokaż rozwiązanie",
                exact: true,
              })
              .click();
          else if (i < 6) {
            await fillLimit(page, { kind: "does-not-exist" });
            await page
              .getByRole("button", {
                name: en ? "Check" : "Sprawdź",
                exact: true,
              })
              .click();
            await expect(page.locator(".feedback")).toHaveClass(
              /feedback (correct|incorrect)/,
            );
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
          ),
          last = history.sessions.at(-1);
        expect(last).toMatchObject({
          category: "sequence-limits",
          difficulty: "expert",
          shown: 10,
          solutionViewed: 3,
          skipped: 4,
        });
        expect(last.correct + last.incorrect).toBe(3);
      });
    }
  });
