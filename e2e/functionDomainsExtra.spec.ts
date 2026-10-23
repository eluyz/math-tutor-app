import { test, expect, type Page } from "@playwright/test";
import { shownFraction } from "./helpers/functions";
import type { Rational } from "../src/rational";
import { q, a, s, d } from "../src/university/audit";
import { canonical, cmp, selectedSetContains } from "../src/university/functions-audit";
import { formatRational as f } from "../src/answers";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const levels = ["easy", "medium", "hard"] as const;

function domainFromPublicQuestion(text: string, level: typeof levels[number]) {
  const terms = [...text.matchAll(/x−\(([^()]*)\)/g)].map(match => shownFraction(match[1]));
  expect(terms.length).toBe(level === "easy" ? 2 : 3);
  const baseMatch = text.match(/log_(?:\(([^()]*)\)|(\d+))\(x−/);
  if (!baseMatch) throw Error("Cannot parse the displayed logarithm base");
  const base = shownFraction(baseMatch[1] ?? baseMatch[2]);
  const [p, qBoundary, third] = terms;
  const boundary = level === "easy" ? qBoundary : third;
  const excluded = a(boundary, q(1));
  const rootValid = (x: Rational) => level === "easy"
    ? cmp(x, p) >= 0
    : cmp(x, p) <= 0 || cmp(x, qBoundary) >= 0;
  const allowed = (x: Rational) => rootValid(x) &&
    (level === "hard"
      ? cmp(base, q(1)) > 0 ? cmp(x, excluded) > 0 : cmp(x, boundary) > 0 && cmp(x, excluded) < 0
      : cmp(x, boundary) > 0 && cmp(x, excluded) !== 0);
  const critical = level === "easy"
    ? [p, boundary, excluded]
    : [p, qBoundary, boundary, excluded];
  const points = [q(-100), q(100), ...critical.flatMap(x => [
    x, s(x, q(1, 4)), a(x, q(1, 4))
  ])];
  const ordered = [...critical].sort(cmp);
  for (let index = 1; index < ordered.length; index++)
    points.push(d(a(ordered[index - 1], ordered[index]), q(2)));
  return { allowed, points, base };
}

for (const width of [375, 1280])
  for (const en of [false, true])
    for (const level of levels)
      test("MT-EDU-015B P2A " + level + " " + width + "px " + (en ? "EN" : "PL") +
        ": tangent and radical-log domains", async ({ page }) => {
        test.setTimeout(90_000);
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.setViewportSize({ width, height: 920 });
        await page.goto("/");
        if (en) await button(page, "English").click();
        await button(page, en ? "University mathematics" : "Matematyka na studia").click();
        await button(page, en ? "Functions" : "Funkcje").click();
        const levelLabel = {
          easy: en ? "Easy" : "Łatwy",
          medium: en ? "Medium" : "Średni",
          hard: en ? "Hard" : "Trudny",
        }[level];
        await button(page, levelLabel).click();

        await page.getByRole("button", { name: en
          ? /Tangent domain and periodic exclusions/
          : /Dziedzina tangensa i wykluczenia okresowe/ }).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-tangent-domain");
        const tangentQuestion = await page.locator(".question").innerText();
        const tangentParts = tangentQuestion.match(/tan\(\((\d+)\)x \+ \(([^()]*)\)π\)/);
        if (!tangentParts) throw Error("Cannot parse the displayed tangent argument");
        const origin = f(canonical(s(q(1, 2), shownFraction(tangentParts[2]))));
        await expect(page.locator("#answer option[value='tan:correct']")).toContainText(
          "(" + origin + " + k)π)/" + tangentParts[1]);
        if (level === "hard") {
          const pole = tangentQuestion.match(/\/\(x − \(([^()]*)\)\)/);
          if (!pole) throw Error("Hard tangent task is missing its denominator");
          await expect(page.locator("#answer option[value='tan:correct']")).toContainText(
            "∖ {" + f(shownFraction(pole[1])) + "}");
        }
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").selectOption("tan:zeros");
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").selectOption("tan:correct");
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-panel")).toContainText("k∈ℤ");

        await page.getByRole("button", { name: en
          ? /Domain: radicals and logarithms/
          : /Dziedzina: pierwiastek i logarytm/ }).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-mixed-domain");
        const domainQuestion = await page.locator(".question").innerText();
        const reference = domainFromPublicQuestion(domainQuestion, level);
        if (level === "hard") {
          expect(domainQuestion).toContain("√(log_");
          if (domainQuestion.includes("log_(1/2)"))
            expect(reference.base).toEqual(q(1, 2));
        }
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        const options = await page.locator("#answer option").evaluateAll(nodes => nodes
          .map(node => (node as HTMLOptionElement).value).filter(value => value.startsWith("set:")));
        const matching = options.filter(key =>
          reference.points.every(x => selectedSetContains(key, x) === reference.allowed(x)));
        expect(matching, "Exactly one option matches the independently solved domain").toHaveLength(1);
        const wrong = options.find(key => key !== matching[0]);
        if (!wrong) throw Error("Expected at least one incorrect domain");
        await page.locator("#answer").selectOption(wrong);
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").selectOption(matching[0]);
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-panel")).toContainText(en ? "Domain" : "Dziedzina");

        if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        expect(errors).toEqual([]);
      });
