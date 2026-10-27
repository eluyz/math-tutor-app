import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"multivar-polar-homogeneous-limit",pl:"Granice dwóch zmiennych — współrzędne biegunowe",en:"Two-variable limits with polar coordinates"},
 {id:"multivar-angular-continuity",pl:"Ciągłość dwóch zmiennych — zależność od kierunku",en:"Directional continuity of two-variable functions"},
] as const;

for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-025 P2G-C "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Limits of functions":"Granice funkcji").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const family of families){
  await page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(en?family.en:family.pl,{exact:true})}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const shown=await page.locator(".question").innerText();
  const task=taskPool("function-limits",level).filter(z=>z.templateId===family.id)
    .map(z=>localizeTask(z,en?"en":"pl")).find(z=>z.question===shown);
  expect(task,"Rendered problem must belong to the generated pool").toBeDefined();
  const spec=getAnswerSpec(task!);
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="choice"){
   await page.locator("#answer").selectOption(spec.options.find(o=>o.value!==spec.value)!.value);
  }else if(spec.kind==="limit"){
   const wrong=spec.value.kind==="finite"?"does-not-exist":"finite";
   await page.locator("#answer").selectOption(wrong);
   if(wrong==="finite")await page.locator("#limit-value").fill("0");
  }else throw Error("Unexpected spec: "+spec.kind);
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  if(spec.kind==="choice")await page.locator("#answer").selectOption(spec.value);
  else{
   await page.locator("#answer").selectOption(spec.value.kind);
   if(spec.value.kind==="finite")await page.locator("#limit-value").fill(f(spec.value.value));
  }
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
