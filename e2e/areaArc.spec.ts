import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const families=[
 {id:"integral-area-between",pl:"Pole między dwiema krzywymi",en:"Area between two curves"},
 {id:"integral-arc-length",pl:"Długość łuku krzywej",en:"Arc length of a curve"}
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-017 "+width+" "+level+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(100000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,en?enLevel:plLevel).click();
 for(const family of families){
  const choice=page.locator("button.exercise-item").filter({
   has:page.locator("strong").getByText(en?family.en:family.pl,{exact:true}),
  });
  await expect(choice).toHaveCount(1);
  await choice.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const rendered=await page.locator(".question").innerText();
  const task=taskPool("integrals",level).filter(t=>t.templateId===family.id).map(t=>localizeTask(t,en?"en":"pl")).find(t=>t.question===rendered);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!);
  if(spec.kind!=="scalar")throw Error("Expected scalar");
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
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});