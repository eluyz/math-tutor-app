import { test, expect } from "@playwright/test";
import { shownFraction, shownPolynomial } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import {
  referencePointLimit,
  referencePolynomialLimit,
} from "../src/university/functions-audit";
import { q, m, d, s } from "../src/university/audit";
import { polishLearningText } from "./helpers/localization";
for (const width of [375, 768, 1280])
  test.describe(`Function limits ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.setTimeout(90_000);
    for (const en of [false, true])
      test(`P0 ${en ? "EN" : "PL"}: 0/0, f(a), znaki jednostronne i ±∞`, async ({
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
            name: en ? "Limits of functions" : "Granice funkcji",
            exact: true,
          })
          .click();
        for (const level of [
          en ? "Easy" : "Łatwy",
          en ? "Medium" : "Średni",
          en ? "Hard" : "Trudny",
        ]) {
          await page.getByRole("button", { name: level, exact: true }).click();
          await page
            .getByRole("button", {
              name: en
                ? /Point limits and one-sided/
                : /Granica w punkcie i granice jednostronne/,
            })
            .click();
          for (let i = 0; i < 4; i++) {
            const text = await page.locator(".question").innerText(),
              approach = text.match(/x→\(([^()]+)\)([⁻⁺]?)/)!,
              formula = text
                .split("\n")[1]
                .split(/ (?:dla|for) x≠/)[0]
                .match(/^f\(x\) = \((.*)\)\/\((.*)\)$/)!;
            const expected = referencePointLimit(
              shownPolynomial(formula[1]),
              shownPolynomial(formula[2]),
              shownFraction(approach[1]),
              approach[2] === "⁻"
                ? "left"
                : approach[2] === "⁺"
                  ? "right"
                  : "both",
            );
            await page.locator("#answer").selectOption(expected.kind);
            if (expected.kind === "finite")
              await page
                .locator("#limit-value")
                .fill(fractionText(expected.value));
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
        }
        await page
          .getByRole("button", {
            name: en
              ? /Function limits at infinity/
              : /Granice funkcji w nieskończoności/,
          })
          .click();
        const directions = new Set<string>();
        for (let i = 0; i < 24 && directions.size < 2; i++) {
          const text = await page.locator(".question").innerText(),
            negative = text.includes("x→−∞");
          directions.add(negative ? "negative" : "positive");
          const formula = text
              .split("\n")[1]
              .match(/^f\(x\) = \((.*)\)\/\((.*)\)$/)!,
            flip = (values: ReturnType<typeof shownPolynomial>) =>
              values.map((v, i) => (negative ? m(v, q(i % 2 ? -1 : 1)) : v)),
            expected = referencePolynomialLimit(
              flip(shownPolynomial(formula[1])),
              flip(shownPolynomial(formula[2])),
            );
          await page.locator("#answer").selectOption(expected.kind);
          if (expected.kind === "finite")
            await page
              .locator("#limit-value")
              .fill(fractionText(expected.value));
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
              name: en ? "New example" : "Nowy przykład",
              exact: true,
            })
            .click();
        }
        expect(directions.size).toBe(2);
        for (const [index, level] of (en ? ["Medium", "Hard", "Advanced", "Expert"] : ["Średni", "Trudny", "Zaawansowany", "Ekspert"]).entries()) {
          await page.getByRole("button", {name:level,exact:true}).click();
          await page.getByRole("button", {name: en ? /Limits with square roots/ : /Granice z pierwiastkami/}).click();
          const text=await page.locator(".question").innerText();
          const radicands=[...text.matchAll(/√\(\(([^()]+)\) \+ \(([^()]+)\)·h \+ \(([^()]+)\)·h²\)/g)];
          const [squared,k,b]=radicands[0].slice(1).map(shownFraction);
          // s is a small positive integer; exact integer search, never sqrt(float).
          let root=1n;
          while(root*root*squared.denominator < squared.numerator) root++;
          expect(root*root*squared.denominator).toBe(squared.numerator);
          const twice=q(2n*root), tangent=d(k,twice);
          const expected=index===3 ? d(s(b,shownFraction(radicands[1][3])),twice) : index===2 ? d(s(b,m(tangent,tangent)),twice) : tangent;
          await page.locator("#answer").selectOption("finite");
          await page.locator("#limit-value").fill("1/0");
          await page.getByRole("button", {name:en?"Check":"Sprawdź",exact:true}).click();
          await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
          await page.locator("#limit-value").fill(fractionText(expected));
          await page.getByRole("button", {name:en?"Check":"Sprawdź",exact:true}).click();
          await expect(page.locator(".feedback")).toHaveClass("feedback correct");
          await page.getByRole("button", {name:en?"Show solution":"Pokaż rozwiązanie",exact:true}).click();
          await page.getByRole("button", {name:en?"Show all steps":"Pokaż wszystkie kroki",exact:true}).click();
          await expect(page.locator(".solution-final")).toBeVisible();
          if(en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        }
        expect(errors).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
      });
  });
