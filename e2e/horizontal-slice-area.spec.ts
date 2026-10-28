import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {addRational as add,rational as r} from "../src/rational";
import {formatRational as fmt} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const b=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
for(const width of [375,1280])for(const en of [false,true])
for(const [level,pl,enName] of [
  ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]
] as const)
test("MT-EDU-034 horizontal area dy "+level+" "+width+"px "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(en)await b(page,"English").click();
  await b(page,en?"University mathematics":"Matematyka na studia").click();
  await b(page,en?"Integrals":"Całki").click();
  await b(page,en?enName:pl).click();
  const title=en?"Area using horizontal slices (dy)":"Pole obszaru — całkowanie względem y";
  const selection=page.locator("button.exercise-item").filter({
    has:page.locator("strong").getByText(title,{exact:true}),
  });
  await expect(selection).toHaveCount(1);await selection.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","integral-area-horizontal-slices");
  const rendered=await page.locator(".question").innerText();
  expect(rendered).toContain("√");
  expect(rendered).toContain("x_left(y)");
  expect(rendered).toContain("x_right(y)");
  const task=taskPool("integrals",level).filter(t=>t.templateId==="integral-area-horizontal-slices")
    .map(x=>localizeTask(x,en?"en":"pl")).find(t=>t.question===rendered);
  expect(task).toBeDefined();
  const answer=getAnswerSpec(task!);
  if(answer.kind!=="scalar")throw Error("Expected scalar");
  const check=b(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill("1/0");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(fmt(add(answer.value,r(1))));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(fmt(answer.value));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await b(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await b(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("dy");
  await expect(page.locator(".solution-panel")).toContainText("u^(3/2)");
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});