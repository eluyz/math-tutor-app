import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {rational as r,addRational as add} from "../src/rational";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const cases=[
  {id:"analysis-study-polynomial",level:"advanced",pl:"Badanie wielomianu",en:"Polynomial function study"},
  {id:"analysis-study-rational",level:"expert",pl:"Badanie funkcji wymiernej",en:"Rational function study"},
] as const;
for(const width of [375,768,1280]) for(const en of [false,true]) test(`MT-EDU-007 P3 ${width}px ${en?"EN":"PL"}: integrated studies`,async({page})=>{
  test.setTimeout(120_000);await page.setViewportSize({width,height:900});
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");if(en)await button(page,"English").click();
  for(const item of cases){
    await button(page,en?"University mathematics":"Matematyka na studia").click();
    await button(page,en?"Derivatives":"Pochodne").click();
    await button(page,item.level==="expert"?en?"Expert":"Ekspert":en?"Advanced":"Zaawansowany").click();
    await page.getByRole("button",{name:item[en?"en":"pl"],exact:false}).click();
    const question=await page.locator(".question").innerText();
    const task=taskPool("derivatives",item.level).filter(candidate=>candidate.templateId===item.id).map(candidate=>localizeTask(candidate,en?"en":"pl")).find(candidate=>candidate.question===question);
    expect(task).toBeDefined();const spec=getAnswerSpec(task!);expect(spec.kind).toBe("list");if(spec.kind!=="list")throw Error("List expected");
    await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    for(let i=0;i<spec.values.length;i++)await page.locator(i===0?"#answer":`#answer-${i}`).fill(formatRational(i===0?add(spec.values[i],r(1)):spec.values[i]));
    await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(formatRational(spec.values[0]));
    await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
    if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
  expect(errors).toEqual([]);
});
