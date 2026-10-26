import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const cases=[
 {id:"multivar-cubic-partial",pl:"Pochodne cząstkowe wielomianu trzeciego stopnia",en:"Partial derivatives of a cubic polynomial"},
 {id:"multivar-chain-gradient",pl:"Gradient z regułą łańcuchową",en:"Gradient using the chain rule"}
] as const;
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-025 P2G-A "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Derivatives":"Pochodne").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const entry of cases){
  const choice=page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(en?entry.en:entry.pl,{exact:true})});
  await expect(choice).toHaveCount(1);await choice.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",entry.id);
  const shown=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level).filter(t=>t.templateId===entry.id)
    .map(t=>localizeTask(t,en?"en":"pl")).find(t=>t.question===shown);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!);
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="scalar")await page.locator("#answer").fill(f(add(spec.value,r(1))));
  else if(spec.kind==="list"){
   await page.locator("#answer").fill(f(add(spec.values[0],r(1))));
   await page.locator("#answer-1").fill(f(spec.values[1]));
  }else throw Error("Expected scalar or gradient list");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(spec.kind==="scalar"?spec.value:spec.values[0]));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
