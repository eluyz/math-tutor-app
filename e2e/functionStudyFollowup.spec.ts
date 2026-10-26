import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const families=[
 {id:"analysis-study-quartic",pl:"Pełne badanie funkcji czwartego stopnia",en:"Complete study of a quartic function"},
 {id:"analysis-study-rational-shift",pl:"Badanie funkcji wymiernej z biegunem i asymptotą",en:"Study of a rational function with a pole and asymptote"},
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const level of ["hard","expert"] as const)
test("MT-EDU-022 P2D "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(150000);
 const errors:string[]=[];page.on("pageerror",err=>errors.push(err.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Derivatives":"Pochodne").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const family of families){
  await page.locator("button.exercise-item").filter({hasText:family[en?"en":"pl"]}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const rendered=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level).filter(x=>x.templateId===family.id)
   .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===rendered);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!);
  if(spec.kind!=="list")throw Error("Expected multivalue answer");
  expect(spec.values.length).toBe(level==="expert"?2:family.id==="analysis-study-quartic"?6:4);
  const check=button(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  for(let i=0;i<spec.values.length;i++)
   await page.locator(i===0?"#answer":"#answer-"+i).fill(f(i===0?add(spec.values[i],r(1)):spec.values[i]));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(spec.values[0]));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await expect(page.locator("[data-study-plot]")).toHaveCount(0);
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  const graph=page.locator('[data-study-plot="'+family.id+'"]');
  await expect(graph).toHaveCount(1);
  await expect(graph.locator("svg[role=img]")).toHaveCount(1);
  await expect(graph.getByTestId("study-curve")).toHaveCount(family.id==="analysis-study-quartic"?1:2);
  await expect(graph.getByTestId("study-critical")).toHaveCount(family.id==="analysis-study-quartic"?3:2);
  await expect(graph.getByTestId("study-oblique-asymptote")).toHaveCount(family.id==="analysis-study-quartic"?0:1);
  await graph.locator("summary").click();
  await expect(graph.locator("details")).toContainText(en?"Stationary points":"Punkty stacjonarne");
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
