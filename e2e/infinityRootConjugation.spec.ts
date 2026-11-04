import {test,expect} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import {q,s,m,d,type Rational} from "../src/university/audit";
import {polishLearningText} from "./helpers/localization";
const button=(p:import("@playwright/test").Page,name:string)=>p.getByRole("button",{name,exact:true});
const asNum=(z:Rational)=>Number(z.numerator)/Number(z.denominator);
for(const width of [375,1280])for(const en of [false,true])
test("#151 G05 double-radical infinity UI witness "+width+"px "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(90_000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Limits of functions":"Granice funkcji").click();
 await button(page,en?"Advanced":"Zaawansowany").click();
 await page.getByRole("button",{name:en?/Conjugating radical limits at/:/Sprzężenie pierwiastków przy/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","limit-root-infinity-conjugates");
 const text=await page.locator(".question").innerText();
 const expression=text.split("\n")[1];
 const n=[...expression.matchAll(/\(([-−]?\d+(?:\/\d+)?)\)/g)].map(x=>shownFraction(x[1]));
 const direction=text.includes("x→−∞")?-1:1;
 const sx=q(Math.sqrt(asNum(n[0])));
 let value:Rational;
 if(expression.includes("·√(x +")){
   expect(n).toHaveLength(4);
   value=q(0);
 }else if(expression.includes(" − √(")){
   expect(n).toHaveLength(6);
   value=d(s(n[1],n[4]),m(q(2),sx));
   if(direction<0)value=m(q(-1),value);
 }else{
   expect(n).toHaveLength(4);
   value=d(n[1],m(q(2),sx));
   if(direction<0)value=m(q(-1),value);
 }
 const check=button(page,en?"Check":"Sprawdź");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption("positive-infinity");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption("finite");
 await page.locator("#limit-value").fill(fractionText(value));
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-final")).toBeVisible();
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
