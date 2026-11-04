import { test, expect } from "@playwright/test";
import { shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { q, a, m } from "../src/university/audit";
import { polishLearningText } from "./helpers/localization";

const button=(p:import("@playwright/test").Page,name:string)=>p.getByRole("button",{name,exact:true});
const powers=[
  [q(1,2),q(-1),q(2)],
  [q(3,2),q(-1,2),q(1)],
  [q(-2),q(3,2),q(2)],
  [q(-3,2),q(-3),q(1,2)],
];

for(const width of [375,1280])for(const en of [false,true]){
  test("#151 D01 rational powers UI witness "+width+"px "+(en?"EN":"PL"),async({page})=>{
    test.setTimeout(90_000);
    const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
    await page.setViewportSize({width,height:900});await page.goto("/");
    if(en)await button(page,"English").click();
    await button(page,en?"University mathematics":"Matematyka na studia").click();
    await button(page,en?"Derivatives":"Pochodne").click();
    await button(page,en?"Medium":"Średni").click();
    await page.getByRole("button",{name:en?/Derivatives of radicals and negative powers after simplification/:/Pochodne pierwiastków i ujemnych potęg po uproszczeniu/}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","derivative-fractional-powers");
    const raw=await page.locator(".question").innerText();
    const form=raw.split("\n")[1];
    const numbers=[...form.matchAll(/\(([-−]?\d+(?:\/\d+)?)\)/g)].map(x=>shownFraction(x[1]));
    expect(numbers).toHaveLength(3);
    const mode=form.includes("/√(x³)")?3:form.includes("√(x³)")?2:form.includes("·x·√x")?1:0;
    const result=numbers.map((c,i)=>m(c,powers[mode][i]));
    const inputs=page.locator("form .coefficient-field input");
    await expect(inputs).toHaveCount(3);
    const check=button(page,en?"Check":"Sprawdź");
    await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    for(let i=0;i<3;i++)await inputs.nth(i).fill(fractionText(i===0?a(result[i],q(1)):result[i]));
    await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await inputs.first().fill(fractionText(result[0]));
    await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-final")).toBeVisible();
    if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
