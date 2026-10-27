import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"matrix-four-factor-dimensions",category:"matrices",plCat:"Macierze",enCat:"Matrices",
  pl:"Wykonalność łańcucha czterech macierzy",en:"Compatibility of a four-matrix product"},
 {id:"multivar-anisotropic-limit",category:"function-limits",plCat:"Granice funkcji",enCat:"Limits of functions",
  pl:"Granice 2D po nieliniowej drodze",en:"Two-variable limits along nonlinear paths"},
] as const;
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
for(const family of families)
test("MT-EDU-029 P3C "+family.id+" "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?family.enCat:family.plCat).click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 const entry=page.locator("button.exercise-item").filter({
  has:page.locator("strong").getByText(en?family.en:family.pl,{exact:true}),
 });
 await expect(entry).toHaveCount(1);await entry.click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
 const question=await page.locator(".question").innerText();
 const task=taskPool(family.category,level).filter(x=>x.templateId===family.id)
  .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===question);
 expect(task,"Displayed task must match deterministic generated pool").toBeDefined();
 const spec=getAnswerSpec(task!);
 expect(spec.kind).toBe("choice");if(spec.kind!=="choice")throw Error("Expected choice spec");
 const check=button(page,en?"Check":"Sprawdź");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(spec.options.find(x=>x.value!==spec.value)!.value);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(spec.value);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
