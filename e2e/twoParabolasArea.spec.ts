import {test,expect,type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {rational as r,addRational as add} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
for(const width of [375,1280])for(const en of [false,true])for(const level of ["hard","expert"] as const)
test("MT-EDU-023 P2E-B1 two parabolas "+width+"px "+(en?"EN":"PL")+" "+level,async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Integrals":"Całki").click();
 await button(page,level==="hard"?(en?"Hard":"Trudny"):(en?"Expert":"Ekspert")).click();
 const name=en?"Area between two parabolas":"Pole między dwiema parabolami";
 await page.locator("button.exercise-item").filter({has:page.locator("strong").getByText(name,{exact:true})}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","integral-area-parabolas");
 const shown=await page.locator(".question").innerText();
 const task=taskPool("integrals",level).filter(x=>x.templateId==="integral-area-parabolas")
  .map(x=>localizeTask(x,en?"en":"pl")).find(x=>x.question===shown);
 expect(task).toBeDefined();
 const spec=getAnswerSpec(task!);if(spec.kind!=="scalar")throw Error("Expected scalar");
 const check=button(page,en?"Check":"Sprawdź");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").fill(f(add(spec.value,r(1))));
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").fill(f(spec.value));
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 if(en)expect(await page.locator(".solution-panel").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
