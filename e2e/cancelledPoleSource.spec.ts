import { test, expect } from "@playwright/test";
import { shownFraction, shownPolynomial } from "./helpers/functions";
import { referencePointLimit } from "../src/university/functions-audit";
import { polishLearningText } from "./helpers/localization";

const button = (page: import("@playwright/test").Page, name: string) => page.getByRole("button", {name,exact:true});
for(const width of [375,1280]) for(const en of [false,true]) {
  test("G03 cancelled 0/0 pole browser witness " + width + "px " + (en?"EN":"PL"), async ({page}) => {
    test.setTimeout(90_000);
    const errors: string[] = []; page.on("pageerror",err=>errors.push(err.message));
    await page.setViewportSize({width,height:900}); await page.goto("/");
    if(en) await button(page,"English").click();
    await button(page,en?"University mathematics":"Matematyka na studia").click();
    await button(page,en?"Limits of functions":"Granice funkcji").click();
    await button(page,en?"Hard":"Trudny").click();
    await page.getByRole("button",{name:en?/Cancel 0\/0 and compare one-sided pole limits/:/Skracanie 0\/0 i granice jednostronne przy biegunie/}).click();
    const question=page.locator(".question");
    await expect(question).toHaveAttribute("data-template-id","limit-cancelled-pole");
    const text=await question.innerText();
    const at=shownFraction(text.match(/x→\(([^()]+)\)/)![1]);
    const formula=text.split("\n")[1].match(/^f\(x\) = \((.*)\)\/\((.*)\)$/)!;
    const n=shownPolynomial(formula[1]), d=shownPolynomial(formula[2]);
    const left=referencePointLimit(n,d,at,"left");
    const right=referencePointLimit(n,d,at,"right");
    expect(new Set([left.kind,right.kind])).toEqual(new Set(["positive-infinity","negative-infinity"]));
    expect(referencePointLimit(n,d,at,"both").kind).toBe("does-not-exist");
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await page.locator("#answer").selectOption("finite");
    await page.locator("#limit-value").fill("1");
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").selectOption("does-not-exist");
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-final")).toBeVisible();
    await expect(page.locator(".solution-panel")).toContainText("lim");
    if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
