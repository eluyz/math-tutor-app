import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const cases=[
 {id:"integral-improper-infinity",pl:"Całka niewłaściwa na przedziale nieskończonym",en:"Improper integral over an infinite interval"},
 {id:"integral-improper-endpoint",pl:"Całka niewłaściwa z osobliwością na końcu",en:"Improper integral with an endpoint singularity"},
] as const;
for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-021 P2B "+width+"px "+(en?"EN":"PL")+": improper integrals",async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,en?"Hard":"Trudny").click();
 for(const item of cases){
  await page.locator("button.exercise-item").filter({hasText:item[en?"en":"pl"]}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",item.id);
  const question=await page.locator(".question").innerText();
  const task=taskPool("integrals","hard")
    .filter(x=>x.templateId===item.id)
    .map(x=>localizeTask(x,en?"en":"pl"))
    .find(x=>x.question===question);
  expect(task,"Displayed task must exist among generated cases").toBeDefined();
  const spec=getAnswerSpec(task!);expect(spec.kind).toBe("limit");
  if(spec.kind!=="limit")throw Error("Unexpected answer kind");
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  const wrong=spec.value.kind==="finite"?"positive-infinity":"finite";
  await page.locator("#answer").selectOption(wrong);
  if(wrong==="finite")await page.locator("#limit-value").fill("0");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(spec.value.kind);
  if(spec.value.kind==="finite")await page.locator("#limit-value").fill(formatRational(spec.value.value));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(errors).toEqual([]);
});
