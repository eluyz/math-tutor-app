import { test, expect } from "@playwright/test";

for (const width of [375,1280]) for (const en of [false,true]) {
  test(`MT-EDU-010 matrix powers and compatibility ${width}px ${en?"EN":"PL"}`, async ({page})=>{
    test.setTimeout(90_000);
    const errors:string[]=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.setViewportSize({width,height:850});
    await page.goto("/");
    if(en)await page.getByRole("button",{name:"English",exact:true}).click();
    const button=(name:string)=>page.getByRole("button",{name,exact:true});
    await button(en?"University mathematics":"Matematyka na studia").click();
    await button(en?"Matrices":"Macierze").click();
    await button(en?"Medium":"Średni").click();
    await page.getByRole("button",{name:en?/Matrix powers A² and A³/:/Potęgi macierzy A² i A³/}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","matrix-powers");
    await expect(page.locator(".linear-algebra-matrices .given-matrix")).toHaveCount(1);
    await button(en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await button(en?"Show solution":"Pokaż rozwiązanie").click();
    await button(en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText("A");
    await button(en?"Easy":"Łatwy").click();
    await page.getByRole("button",{name:en?/Compatibility and dimensions of A\+B, AB, BA/:/Wykonalność i wymiar A\+B, AB, BA/}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","matrix-compatibility");
    await expect(page.locator(".linear-algebra-matrices .given-matrix")).toHaveCount(2);
    await page.locator("#answer").selectOption("not-possible");
    await button(en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toBeVisible();
    await button(en?"Show solution":"Pokaż rozwiązanie").click();
    await button(en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"dimensions":"wymiar");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
