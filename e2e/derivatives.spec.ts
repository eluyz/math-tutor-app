import { test, expect } from "@playwright/test";
import {
  shownFraction,
  shownPolynomial,
  shownFormula,
} from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import {
  convolution,
  referenceShift,
  directValue,
  referenceRoots,
  cmp,
  selectedSetContains,
  referenceSum,
} from "../src/university/functions-audit";
import { q, a, s, m, d } from "../src/university/audit";
import { polishLearningText } from "./helpers/localization";
for (const width of [375, 768, 1280])
  test.describe(`Derivatives ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const en of [false, true])
      test(`P1 ${en ? "EN" : "PL"}: wzór, iloczyn, styczna, ekstrema, znaki i ekonomia`, async ({
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
            name: en ? "Derivatives" : "Pochodne",
            exact: true,
          })
          .click();
        const cases = [
          [
            "formula",
            en ? "Easy" : "Łatwy",
            en ? /Derivative: formula/ : /Pochodna: wzór/,
          ],
          [
            "formula",
            en ? "Advanced" : "Zaawansowany",
            en ? /Derivative: formula/ : /Pochodna: wzór/,
          ],
          [
            "rational",
            en ? "Medium" : "Średni",
            en ? /Quotient derivative/ : /Pochodna ilorazu w punkcie/,
          ],
          [
            "maximum",
            en ? "Expert" : "Ekspert",
            en ? /Maximum profit with/ : /Maksymalny zysk z/,
          ],
          [
            "classification",
            en ? "Expert" : "Ekspert",
            en
              ? /Classifying stationary points/
              : /Klasyfikacja punktów stacjonarnych/,
          ],
          [
            "point",
            en ? "Hard" : "Trudny",
            en ? /Derivative at a point/ : /Pochodna w punkcie/,
          ],
          [
            "tangent",
            en ? "Hard" : "Trudny",
            en ? /Equation of the tangent/ : /Równanie stycznej/,
          ],
          [
            "stationary",
            en ? "Expert" : "Ekspert",
            en
              ? /Stationary points and extrema/
              : /Punkty stacjonarne i ekstrema/,
          ],
          [
            "positive",
            en ? "Expert" : "Ekspert",
            en
              ? /Derivative sign and monotonicity/
              : /Znak pochodnej i monotoniczność/,
          ],
          [
            "economics",
            en ? "Medium" : "Średni",
            en
              ? /Marginal cost, revenue and profit/
              : /Koszt, przychód i zysk krańcowy/,
          ],
        ] as const;
        for (const [target, level, title] of cases) {
          await page.getByRole("button", { name: level, exact: true }).click();
          await page.getByRole("button", { name: title }).click();
          const check = page.getByRole("button", {
            name: en ? "Check" : "Sprawdź",
            exact: true,
          });
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback invalid",
          );
          const text = await page.locator(".question").innerText(),
            lines = text.split("\n");
          let scalar: ReturnType<typeof q> | null = null,
            values: ReturnType<typeof q>[] | null = null,
            choice: string | null = null;
          if (target === "rational") {
            const ratio = lines[1].match(/^f\(x\) = \((.*)\)\/\((.*)\)$/)!,
              n = shownFormula(ratio[1]),
              denominator = shownFormula(ratio[2]),
              at = shownFraction(lines[0].match(/f′\(([^()]+)\)/)![1]),
              dv = directValue(denominator, at);
            scalar = d(
              s(
                m(referenceShift(n, at)[1] ?? q(0), dv),
                m(
                  directValue(n, at),
                  referenceShift(denominator, at)[1] ?? q(0),
                ),
              ),
              m(dv, dv),
            );
          } else if (target === "maximum") {
            const cost = shownFormula(lines[1].replace("C(q) = ", "")),
              revenue = shownFormula(
                lines[2].split("; ")[0].replace("R(q) = ", ""),
              ),
              profit = referenceSum(revenue, cost, true),
              cap = shownFraction(lines[0].match(/0≤q≤([^.]*)/)![1]),
              critical = d(s(q(0), profit[1]), m(q(2), profit[2])),
              optimum =
                cmp(critical, q(0)) < 0
                  ? q(0)
                  : cmp(critical, cap) > 0
                    ? cap
                    : critical;
            values = [optimum, directValue(profit, optimum)];
          } else if (target === "economics") {
            const cost = shownFormula(lines[1].replace("C(q) = ", "")),
              revenue = shownFormula(
                lines[2].split("; ")[0].replace("R(q) = ", ""),
              ),
              at = shownFraction(lines[0].match(/[CRP]′\(([^()]+)\)/)![1]),
              kind = lines[0].match(/([CRP])′/)![1];
            scalar =
              kind === "C"
                ? referenceShift(cost, at)[1]
                : kind === "R"
                  ? referenceShift(revenue, at)[1]
                  : s(
                      referenceShift(revenue, at)[1],
                      referenceShift(cost, at)[1],
                    );
          } else {
            const original = shownFormula(lines[1].replace("f(x) = ", ""));
            if (target === "formula")
              values = original
                .slice(1)
                .map((c, i) => m(c, q(i + 1)))
                .reverse();
            else if (target === "point" || target === "tangent") {
              const at =
                  target === "point"
                    ? shownFraction(lines[0].match(/f′\(([^()]+)\)/)![1])
                    : shownFraction(lines[0].split("a=")[1].replace(/\.$/, "")),
                slope = referenceShift(original, at)[1] ?? q(0);
              if (target === "point") scalar = slope;
              else values = [slope, s(directValue(original, at), m(slope, at))];
            } else {
              const derivative = original
                  .slice(1)
                  .map((c, i) => m(c, q(i + 1))),
                roots = referenceRoots(derivative).sort(cmp);
              if (target === "stationary")
                values = roots.flatMap((x) => [x, directValue(original, x)]);
              else if (target === "classification")
                choice = `ext:${roots
                  .map((root) => {
                    const sign = cmp(
                      referenceShift(original, root)[2] ?? q(0),
                      q(0),
                    );
                    return sign > 0 ? "min" : sign < 0 ? "max" : "none";
                  })
                  .join("-")}`;
              else {
                const points = [
                    ...roots,
                    s(roots[0], q(1)),
                    a(roots.at(-1)!, q(1)),
                    ...(roots.length > 1
                      ? [d(a(roots[0], roots[1]), q(2))]
                      : []),
                  ],
                  options = await page
                    .locator("#answer option")
                    .evaluateAll((nodes) =>
                      nodes
                        .map((n) => (n as HTMLOptionElement).value)
                        .filter(Boolean),
                    ),
                  candidates = options.filter((key) =>
                    points.every(
                      (x) =>
                        selectedSetContains(key, x) ===
                        (text.includes("f′(x)<0")
                          ? cmp(referenceShift(original, x)[1] ?? q(0), q(0)) <
                            0
                          : cmp(referenceShift(original, x)[1] ?? q(0), q(0)) >
                            0),
                    ),
                  );
                expect(candidates).toHaveLength(1);
                choice = candidates[0];
              }
            }
          }
          if (values && !values.length) values = [q(0)];
          if (values)
            for (const field of await page
              .locator("form .coefficient-field input")
              .all())
              await field.fill("99999999");
          else if (scalar) await page.locator("#answer").fill("99999999");
          else {
            const options = await page
              .locator("#answer option")
              .evaluateAll((nodes) =>
                nodes
                  .map((n) => (n as HTMLOptionElement).value)
                  .filter(Boolean),
              );
            await page
              .locator("#answer")
              .selectOption(options.find((v) => v !== choice)!);
          }
          await check.click();
          await expect(page.locator(".feedback")).toHaveClass(
            "feedback incorrect",
          );
          if (values) {
            if (!values.length) values = [q(0)];
            const fields = page.locator("form .coefficient-field input");
            await expect(fields).toHaveCount(values.length);
            for (let i = 0; i < values.length; i++)
              await fields.nth(i).fill(fractionText(values[i]));
          } else if (scalar)
            await page.locator("#answer").fill(fractionText(scalar));
          else await page.locator("#answer").selectOption(choice!);
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
          value = await page.locator("#answer").inputValue();
        await page
          .getByRole("button", { name: en ? "Polski" : "English", exact: true })
          .click();
        await expect(page.locator(".question")).toHaveAttribute(
          "data-exercise-run",
          run!,
        );
        await expect(page.locator("#answer")).toHaveValue(value);
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        expect(errors).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
      });
  });
