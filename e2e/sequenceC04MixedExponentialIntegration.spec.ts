import {test,expect} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const id="sequence-mixed-exponential-source-shape";
for(const width of [375,1280])for(const locale of ["pl","en"] as const)
test("C04 mixed exponential "+width+"px "+locale+": catalog, grading, and solution",async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:950});await page.goto("/");
 await page.getByRole("button",{name:locale==="en"?"English":"Matematyka na studia",exact:true}).click();
 if(locale==="en")await page.getByRole("button",{name:"University mathematics",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Granice ciągów":"Limits of sequences",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Średni":"Medium",exact:true}).click();
 const title=locale==="pl"?"Granice: czynnik liniowy i iloraz potęg":"Limits: linear factor and exponential quotient";
 const family=page.locator(".exercise-list-items button").filter({has:page.locator("strong").getByText(title,{exact:true})});
 await expect(family).toHaveCount(1);await family.click();
 const question=page.locator(".question");
 await expect(question).toHaveAttribute("data-template-id",id);
 const displayed=await question.innerText();
 const selected=taskPool("sequence-limits","medium").filter(x=>x.templateId===id)
  .map(x=>localizeTask(x,locale)).find(x=>x.question===displayed);
 expect(selected).toBeDefined();
 const answer=getAnswerSpec(selected!);
 if(answer.kind!=="limit")throw Error("Expected a limit answer");
 const check=page.getByRole("button",{name:locale==="pl"?"Sprawdź":"Check",exact:true});
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption("negative-infinity");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 if(answer.value.kind==="finite"){
   await page.locator("#answer").selectOption("finite");
   await page.locator("#limit-value").fill(formatRational(answer.value.value));
 }else if(answer.value.kind==="positive-infinity"){
   await page.locator("#answer").selectOption("positive-infinity");
 }else throw Error("Unexpected C04 answer class");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await page.getByRole("button",{name:locale==="pl"?"Pokaż rozwiązanie":"Show solution",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Pokaż wszystkie kroki":"Show all steps",exact:true}).click();
 await expect(page.locator(".solution-panel")).toContainText(locale==="pl"?"Końcowa odpowiedź":"Final answer");
 if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
