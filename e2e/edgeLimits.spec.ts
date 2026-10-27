import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
 {id:"derivative-vertical-cusp",category:"derivatives",plCategory:"Pochodne",enCategory:"Derivatives",pl:"Styczna pionowa czy ostry wierzchołek?",en:"Vertical tangent or cusp?"},
 {id:"limit-oscillatory-heine",category:"function-limits",plCategory:"Granice funkcji",enCategory:"Function limits",pl:"Granica oscylacyjna i kryterium Heinego",en:"Oscillatory limits and the Heine criterion"},
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const level of ["hard","expert"] as const)for(const fam of families)
test("MT-EDU-027 P3A "+fam.id+" "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?fam.enCategory:fam.plCategory).click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 const entry=page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(en?fam.en:fam.pl,{exact:true})});
 await expect(entry).toHaveCount(1);await entry.click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id",fam.id);
 const question=await page.locator(".question").innerText();
 const task=taskPool(fam.category,level).filter(t=>t.templateId===fam.id)
   .map(t=>localizeTask(t,en?"en":"pl")).find(t=>t.question===question);
 expect(task,"Must match displayed generated task").toBeDefined();
 const spec=getAnswerSpec(task!);
 expect(spec.kind).toBe("choice");
 if(spec.kind!=="choice")throw Error("Choice expected");
 const check=button(page,en?"Check":"Sprawdź");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(spec.options.find(o=>o.value!==spec.value)!.value);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(spec.value);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
