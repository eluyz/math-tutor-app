import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
const cases=[
 {id:"integral-improper-interior-power",pl:"Całka niewłaściwa z osobliwością wewnątrz przedziału",en:"Improper integral with an interior singularity"},
 {id:"integral-improper-interior-pv",pl:"Wartość główna Cauchy’ego a rozbieżność całki",en:"Cauchy principal value versus improper divergence"},
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const level of ["hard","expert"] as const)
test("MT-EDU-028 P3B "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const item of cases){
  const entry=page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(en?item.en:item.pl,{exact:true})});
  await expect(entry).toHaveCount(1);await entry.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",item.id);
  const question=await page.locator(".question").innerText();
  const task=taskPool("integrals",level).filter(x=>x.templateId===item.id)
    .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===question);
  expect(task,"Rendered task should match the deterministic generator").toBeDefined();
  const spec=getAnswerSpec(task!);
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="limit"){
   const wrong=spec.value.kind==="finite"?"positive-infinity":"finite";
   await page.locator("#answer").selectOption(wrong);
   if(wrong==="finite")await page.locator("#limit-value").fill("0");
   await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
   await page.locator("#answer").selectOption(spec.value.kind);
   if(spec.value.kind==="finite")await page.locator("#limit-value").fill(f(spec.value.value));
  }else if(spec.kind==="choice"){
   await page.locator("#answer").selectOption(spec.options.find(z=>z.value!==spec.value)!.value);
   await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
   await page.locator("#answer").selectOption(spec.value);
  }else throw Error("Unexpected answer format");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
