import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational as fmt} from "../src/answers";
import {addRational as add,rational as r} from "../src/rational";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const cases=[
 {id:"integral-direct-product",pl:"Całka z iloczynu wielomianów",en:"Integral of a polynomial product"},
 {id:"integral-table-arctan",pl:"Całka tablicowa — arctan",en:"Table integral — arctangent"},
] as const;
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-024 P2F-A "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 for(const entry of cases){
   const item=page.locator("button.exercise-item").filter({
     has:page.locator("strong").getByText(en?entry.en:entry.pl,{exact:true}),
   });
   await expect(item).toHaveCount(1);
   await item.click();
   await expect(page.locator(".question")).toHaveAttribute("data-template-id",entry.id);
   const rendered=await page.locator(".question").innerText();
   const task=taskPool("integrals",level).filter(x=>x.templateId===entry.id)
     .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===rendered);
   expect(task).toBeDefined();
   const spec=getAnswerSpec(task!);
   if(spec.kind!=="primitive")throw Error("Expected primitive coefficient input");
   const check=button(page,en?"Check":"Sprawdź");
   await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
   for(let i=0;i<spec.terms.length;i++)await page.locator(i?"#answer-"+i:"#answer").fill(fmt(spec.terms[i].coefficient));
   await check.click();
   await expect(page.locator(".feedback")).toContainText(en?"+C is missing":"brakuje stałej całkowania +C");
   await page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/}).check();
   await page.locator("#answer").fill(fmt(add(spec.terms[0].coefficient,r(1))));
   await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
   await page.locator("#answer").fill(fmt(spec.terms[0].coefficient));
   await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
   await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
   await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
   await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
   await expect(page.locator(".solution-panel")).toContainText("+ C");
   if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});
