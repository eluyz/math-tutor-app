import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { addRational as add, rational as r } from "../src/rational";
import { formatRational as f } from "../src/answers";
import { polishLearningText } from "./helpers/localization";

const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const families=[
  {id:"derivative-trig-chain",pl:/Pochodne sin, cos, tg — reguła łańcuchowa/,en:/Sin, cos, tan derivatives — chain rule/},
  {id:"derivative-trig-special-point",pl:/Pochodna trygonometryczna w punkcie/,en:/Trigonometric derivative at a special angle/},
] as const;
async function check(page:Page,level:"easy"|"medium"|"hard",en:boolean,id:string) {
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",id);
  const question=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level)
    .filter(t=>t.templateId===id)
    .map(t=>localizeTask(t,en?"en":"pl"))
    .find(t=>t.question===question);
  expect(task,"rendered task must match public exercise pool").toBeDefined();
  const spec=getAnswerSpec(task!);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(spec.kind==="choice"){
    await expect(page.locator("#answer option")).toHaveCount(5);
    await page.locator("#answer").selectOption(spec.options.find(x=>x.value!==spec.value)!.value);
  }else if(spec.kind==="scalar"){
    await page.locator("#answer").fill(f(add(spec.value,r(1))));
  }else throw Error("Unexpected answer format "+spec.kind);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  if(spec.kind==="choice")await page.locator("#answer").selectOption(spec.value);
  else await page.locator("#answer").fill(f(spec.value));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
}
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLabel,enLabel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-016 P1 "+level+" "+width+"px "+(en?"EN":"PL")+" trig chain + exact special-angle value",async({page})=>{
  test.setTimeout(100_000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Derivatives":"Pochodne").click();
  await button(page,en?enLabel:plLabel).click();
  for(const family of families){
    await page.getByRole("button",{name:en?family.en:family.pl}).click();
    await check(page,level,en,family.id);
  }
  if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
