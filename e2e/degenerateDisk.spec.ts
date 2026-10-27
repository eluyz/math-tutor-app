import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"multivar-degenerate-quartic",pl:"Ekstrema czwartego stopnia — nierozstrzygający Hessian",en:"Fourth-order extrema with inconclusive Hessian"},
 {id:"multivar-diagonal-quadratic-disk",pl:"Ekstrema funkcji kwadratowej na kole",en:"Quadratic extrema on a disk"}
] as const;

for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-025 P2G-D "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Derivatives":"Pochodne").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const family of families){
  const entry=page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(en?family.en:family.pl,{exact:true})});
  await expect(entry).toHaveCount(1);
  await entry.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const text=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level).filter(z=>z.templateId===family.id)
    .map(z=>localizeTask(z,en?"en":"pl")).find(z=>z.question===text);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!),check=button(page,en?"Check":"Sprawdź");
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="choice"){
   await page.locator("#answer").selectOption(spec.options.find(z=>z.value!==spec.value)!.value);
  }else if(spec.kind==="list"){
   expect(spec.values).toHaveLength(6);
   for(let i=0;i<6;i++){
    await page.locator(i===0?"#answer":"#answer-"+i).fill(f(i===0?add(spec.values[0],r(1)):spec.values[i]));
   }
  }else throw Error("Unexpected answer format");
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  if(spec.kind==="choice")await page.locator("#answer").selectOption(spec.value);
  else await page.locator("#answer").fill(f(spec.values[0]));
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
