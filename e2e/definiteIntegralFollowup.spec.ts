import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"integral-substitution-definite",pl:"Całka oznaczona — podstawienie kwadratowe",en:"Definite integral with quadratic substitution"},
 {id:"integral-parts-definite",pl:"Całka oznaczona — całkowanie przez części",en:"Definite integral by integration by parts"},
] as const;
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-023 P2E-A "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const family of families){
  await page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(family[en?"en":"pl"],{exact:true})}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const shown=await page.locator(".question").innerText();
  const task=taskPool("integrals",level).filter(x=>x.templateId===family.id)
   .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===shown);
  expect(task,"The displayed exercise must be in the generated pool").toBeDefined();
  const spec=getAnswerSpec(task!);
  if(spec.kind!=="scalar")throw Error("Expected a rational scalar");
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(f(add(spec.value,r(1))));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(spec.value));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
