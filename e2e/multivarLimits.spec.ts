import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"multivar-path-limit",pl:"Granice funkcji dwóch zmiennych różnymi drogami",en:"Two-variable limits along different paths"},
 {id:"multivar-continuity-point",pl:"Ciągłość funkcji dwóch zmiennych w punkcie",en:"Continuity of a two-variable function at a point"},
] as const;
for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-021 P2C W03 "+width+"px "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Limits of functions":"Granice funkcji").click();
 await button(page,en?"Medium":"Średni").click();
 for(const family of families){
  await page.locator("button.exercise-item").filter({hasText:family[en?"en":"pl"]}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const rendered=await page.locator(".question").innerText();
  const task=taskPool("function-limits","medium")
   .filter(x=>x.templateId===family.id)
   .map(x=>localizeTask(x,en?"en":"pl"))
   .find(x=>x.question===rendered);
  expect(task,"Displayed problem must belong to the public generated pool").toBeDefined();
  const spec=getAnswerSpec(task!);
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="choice"){
   await page.locator("#answer").selectOption(spec.options.find(x=>x.value!==spec.value)!.value);
  }else if(spec.kind==="limit"){
   const wrong=spec.value.kind==="finite"?"does-not-exist":"finite";
   await page.locator("#answer").selectOption(wrong);
   if(wrong==="finite")await page.locator("#limit-value").fill("0");
  }else throw Error("Unsupported result format "+spec.kind);
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  if(spec.kind==="choice"){
   await page.locator("#answer").selectOption(spec.value);
  }else{
   await page.locator("#answer").selectOption(spec.value.kind);
   if(spec.value.kind==="finite")await page.locator("#limit-value").fill(formatRational(spec.value.value));
  }
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(errors).toEqual([]);
});
