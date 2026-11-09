import {test,expect} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const families=[
 {id:"sequence-polynomial-source-shapes",pl:"Granice: wielomiany, iloczyny i szósty stopień",en:"Limits: polynomials, factored ratios and sextics"},
 {id:"sequence-conjugate-source-shapes",pl:"Granice: nietypowe różnice i sumy pierwiastków",en:"Limits: radical differences and sums"}
] as const;
for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const family of families)
test("C01/C03 "+family.id+" "+width+"px "+locale+": catalog, feedback, mobile solution",async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:950});await page.goto("/");
 await page.getByRole("button",{name:locale==="en"?"English":"Matematyka na studia",exact:true}).click();
 if(locale==="en")await page.getByRole("button",{name:"University mathematics",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Granice ciągów":"Limits of sequences",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Średni":"Medium",exact:true}).click();
 const title=locale==="pl"?family.pl:family.en;
 const button=page.locator(".exercise-list-items button").filter({has:page.locator("strong").getByText(title,{exact:true})});
 await expect(button).toHaveCount(1);await button.click();
 const question=page.locator(".question");
 await expect(question).toHaveAttribute("data-template-id",family.id);
 const display=await question.innerText();
 const item=taskPool("sequence-limits","medium").filter(x=>x.templateId===family.id)
  .map(x=>localizeTask(x,locale)).find(x=>x.question===display);
 expect(item).toBeDefined();
 const answer=getAnswerSpec(item!);
 if(answer.kind!=="limit")throw Error("Unexpected answer type");
 const check=page.getByRole("button",{name:locale==="pl"?"Sprawdź":"Check",exact:true});
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 const wrong=answer.value.kind==="positive-infinity"?"negative-infinity":"positive-infinity";
 await page.locator("#answer").selectOption(wrong);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 if(answer.value.kind==="finite"){
  await page.locator("#answer").selectOption("finite");
  await page.locator("#limit-value").fill(formatRational(answer.value.value));
 }else if(answer.value.kind==="positive-infinity"||answer.value.kind==="negative-infinity")
  await page.locator("#answer").selectOption(answer.value.kind);
 else throw Error("Unexpected limit class");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await page.getByRole("button",{name:locale==="pl"?"Pokaż rozwiązanie":"Show solution",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Pokaż wszystkie kroki":"Show all steps",exact:true}).click();
 await expect(page.locator(".solution-panel")).toContainText(locale==="pl"?"Końcowa odpowiedź":"Final answer");
 if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});