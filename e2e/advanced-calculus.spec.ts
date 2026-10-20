import { test, expect, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { formatRational, type AnswerSpec } from "../src/answers";
import { rational as r, addRational as add } from "../src/rational";
import { polishLearningText } from "./helpers/localization";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const cases=[
  {id:"analysis-lhospital",category:"function-limits",level:"expert",pl:"Reguła de l’Hospitala",en:"L’Hôpital’s rule"},
  {id:"analysis-lhospital-infinity",category:"function-limits",level:"expert",pl:"Reguła de l’Hospitala przy nieskończoności",en:"L’Hôpital’s rule at infinity"},
  {id:"analysis-log-exp-derivative",category:"derivatives",level:"advanced",pl:"Pochodne logarytmu i funkcji wykładniczej",en:"Logarithmic and exponential derivatives"},
  {id:"analysis-concavity",category:"derivatives",level:"expert",pl:"Druga pochodna i przegięcia",en:"Second derivative and inflection points"},
] as const;
async function fill(page:Page,spec:AnswerSpec,wrong:boolean) {
  if(spec.kind==="scalar") await page.locator("#answer").fill(formatRational(wrong?add(spec.value,r(1)):spec.value));
  else if(spec.kind==="choice") await page.locator("#answer").selectOption(wrong?spec.options.find(option=>option.value!==spec.value)!.value:spec.value);
  else if(spec.kind==="roots") {
    await page.locator("#answer").selectOption(wrong?"none":"two");
    if(!wrong) for(let i=0;i<spec.values.length;i++) await page.locator(`#root-${i}`).fill(formatRational(spec.values[i]));
  } else throw Error(`Unexpected answer kind ${spec.kind}`);
}
for(const width of [375,768,1280]) for(const en of [false,true]) test(`MT-EDU-007 P2 ${width}px ${en?"EN":"PL"}: L’Hôpital and derivatives`,async({page})=>{
  test.setTimeout(120_000);
  await page.setViewportSize({width,height:900});
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  if(en) await button(page,"English").click();
  for(const item of cases){
    await button(page,en?"University mathematics":"Matematyka na studia").click();
    await button(page,item.category==="derivatives"?en?"Derivatives":"Pochodne":en?"Limits of functions":"Granice funkcji").click();
    await button(page,item.level==="expert"?en?"Expert":"Ekspert":en?"Advanced":"Zaawansowany").click();
    await page.locator(".exercise-item").filter({has:page.getByText(item[en?"en":"pl"],{exact:true})}).click();
    const question=await page.locator(".question").innerText();
    const task=taskPool(item.category,item.level).filter(candidate=>candidate.templateId===item.id).map(candidate=>localizeTask(candidate,en?"en":"pl")).find(candidate=>candidate.question===question);
    expect(task,`${item.id}: question from declared pool`).toBeDefined();
    const spec=getAnswerSpec(task!);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await fill(page,spec,true);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await fill(page,spec,false);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
    if(en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
  expect(errors).toEqual([]);
});
