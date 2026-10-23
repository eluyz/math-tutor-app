import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const families=[
 {id:"multivar-partial-point",pl:/Pochodne cząstkowe pierwszego i drugiego rzędu/,en:/First and second partial derivatives/},
 {id:"multivar-gradient-point",pl:/Gradient funkcji dwóch zmiennych/,en:/Gradient of a two-variable function/}
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-018 P1 "+width+" "+level+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(100000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Derivatives":"Pochodne").click();
 await button(page,en?enLevel:plLevel).click();
 for(const family of families){
  await page.getByRole("button",{name:en?family.en:family.pl}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const rendered=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level).filter(t=>t.templateId===family.id).map(t=>localizeTask(t,en?"en":"pl")).find(t=>t.question===rendered);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="scalar"){
    await page.locator("#answer").fill(f(add(spec.value,r(1))));
  }else if(spec.kind==="list"){
    await page.locator("#answer").fill(f(add(spec.values[0],r(1))));
    await page.locator("#answer-1").fill(f(spec.values[1]));
  }else throw Error("Unexpected answer shape");
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  if(spec.kind==="scalar")await page.locator("#answer").fill(f(spec.value));
  else await page.locator("#answer").fill(f(spec.values[0]));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});