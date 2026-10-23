import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,text:string)=>page.getByRole("button",{name:text,exact:true});
const families=[
 {id:"derivative-product-point",pl:/Pochodna iloczynu w punkcie/,en:/Derivative of a product at a point/},
 {id:"derivative-quotient-point",pl:/Pochodna ilorazu w punkcie/,en:/Derivative of a quotient at a point/},
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-016 P1B "+level+" "+width+"px "+(en?"EN":"PL")+" exact product/quotient derivatives",async({page})=>{
 test.setTimeout(100_000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Derivatives":"Pochodne").click();
 await button(page,en?enLevel:plLevel).click();
 for(const family of families){
  await page.getByRole("button",{name:en?family.en:family.pl}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const question=await page.locator(".question").innerText();
  const task=taskPool("derivatives",level).filter(t=>t.templateId===family.id)
   .map(t=>localizeTask(t,en?"en":"pl"))
   .find(t=>t.question===question);
  expect(task,"Displayed question must be a declared exercise variant").toBeDefined();
  const spec=getAnswerSpec(task!);
  expect(spec.kind).toBe("scalar");
  if(spec.kind!=="scalar")throw Error("Unexpected answer format");
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(f(add(spec.value,r(1))));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(spec.value));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 }
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
