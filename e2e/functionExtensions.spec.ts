import { test, expect, type Page } from "@playwright/test";
import { shownPolynomial, shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { q, a, s, m, d } from "../src/university/audit";
import { polishLearningText } from "./helpers/localization";

const btn = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
for (const width of [375, 1280]) for (const en of [false, true])
  test(`MT-EDU-015B P1 ${width}px ${en ? "EN" : "PL"}: parity and inverse function`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.setViewportSize({width,height:920});
    await page.goto("/");
    if (en) await btn(page,"English").click();
    await btn(page,en ? "University mathematics" : "Matematyka na studia").click();
    await btn(page,en ? "Functions" : "Funkcje").click();
    await btn(page,en ? "Medium" : "Średni").click();

    await btn(page,en ? "Even and odd functions" : "Parzystość funkcji z wzoru").click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-parity");
    const polynomial = shownPolynomial((await page.locator(".question").innerText()).split("\n").find(line=>line.startsWith("f(x) = "))!.slice(7));
    const even = polynomial.every((x,i)=>i%2===0 || x.numerator===0n);
    const odd = polynomial.every((x,i)=>i%2!==0 || x.numerator===0n);
    const choice = even ? "even" : odd ? "odd" : "neither";
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await page.locator("#answer").selectOption(choice === "even" ? "odd" : "even");
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").selectOption(choice);
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await btn(page,en ? "Show solution" : "Pokaż rozwiązanie").click();
    await btn(page,en ? "Show all steps" : "Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText("f(−x)");

    await btn(page,en ? "Inverse of an affine function" : "Funkcja odwrotna do liniowej").click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-affine-inverse");
    const question = await page.locator(".question").innerText();
    const match = question.match(/f\(x\) = \(([^()]*)\)\(x − \(([^()]*)\)\) \+ \(([^()]*)\)/);
    if (!match) throw Error("Unrecognized displayed inverse function");
    const [coefficient,shift,offset] = match.slice(1).map(shownFraction);
    // f(x)=a(x-b)+c -> f⁻¹(x)=x/a+b-c/a.
    const slope = d(q(1),coefficient);
    const intercept = s(shift,d(offset,coefficient));
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await page.locator("#answer").fill("99999");
    await page.locator("#answer-1").fill("99999");
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(fractionText(slope));
    await page.locator("#answer-1").fill(fractionText(intercept));
    await btn(page,en ? "Check" : "Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await btn(page,en ? "Show solution" : "Pokaż rozwiązanie").click();
    await btn(page,en ? "Show all steps" : "Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText("f⁻¹");

    if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
