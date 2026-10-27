import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"matrix-negative-square-three",pl:"Potęga A⁻² macierzy trójkątnej 3×3",en:"Negative power A⁻² of a triangular 3×3 matrix"},
 {id:"matrix-conjugation-three",pl:"Wyrażenie P A P⁻¹ dla macierzy 3×3",en:"Similarity P A P⁻¹ of 3×3 matrices"},
] as const;
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-026 P2H-B "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await btn(page,"English").click();
 await btn(page,en?"University mathematics":"Matematyka na studia").click();
 await btn(page,en?"Matrices":"Macierze").click();
 await btn(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const fam of families){
  const item=page.locator("button.exercise-item").filter({hasText:en?fam.en:fam.pl});
  await expect(item).toHaveCount(1);await item.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",fam.id);
  const q=await page.locator(".question").innerText();
  const task=taskPool("matrices",level).filter(x=>x.templateId===fam.id)
    .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===q);
  expect(task).toBeDefined();
  const spec=getAnswerSpec(task!);expect(spec.kind).toBe("matrix");
  if(spec.kind!=="matrix")throw Error("Expected matrix answer");
  expect(spec.values).toHaveLength(3);
  const check=btn(page,en?"Check":"Sprawdź");
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
   const field=page.locator(i===0&&j===0?"#answer":"#answer-"+i+"-"+j);
   await field.fill(i===0&&j===0?"999999":f(spec.values[i][j]));
  }
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(spec.values[0][0]));
  await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
