import {test,expect} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {formatRational} from "../src/answers";
import {polishLearningText} from "./helpers/localization";
const families=[
 {id:"sequence-negative-root-linear",pl:"Granice: ujemny pierwiastek przez wyrażenie liniowe",en:"Limits: negative radical over a linear term"},
 {id:"sequence-euler-quadratic",pl:"Granica Eulera z n² w wykładniku",en:"Euler limits with n² exponents"}
] as const;
for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const family of families)
test(`C02/C05 ${family.id} ${width}px ${locale}: answers, solutions, layout`,async({page})=>{
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
 const displayed=await question.innerText();expect(displayed).toContain("n²");
 const found=taskPool("sequence-limits","medium").filter(x=>x.templateId===family.id)
  .map(x=>localizeTask(x,locale)).find(x=>x.question===displayed);
 expect(found).toBeDefined();
 const answer=getAnswerSpec(found!);
 const checkButton=page.getByRole("button",{name:locale==="pl"?"Sprawdź":"Check",exact:true});
 await checkButton.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 if(answer.kind==="limit")await page.locator("#answer").selectOption("positive-infinity");
 else if(answer.kind==="choice")await page.locator("#answer").selectOption(answer.options.find(x=>x.value!==answer.value)!.value);
 else throw Error("Unexpected answer type");
 await checkButton.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 if(answer.kind==="limit"){
  if(answer.value.kind!=="finite")throw Error("Expected finite limit");
  await page.locator("#answer").selectOption("finite");
  await page.locator("#limit-value").fill(formatRational(answer.value.value));
 }else if(answer.kind==="choice")await page.locator("#answer").selectOption(answer.value);
 await checkButton.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await page.getByRole("button",{name:locale==="pl"?"Pokaż rozwiązanie":"Show solution",exact:true}).click();
 await page.getByRole("button",{name:locale==="pl"?"Pokaż wszystkie kroki":"Show all steps",exact:true}).click();
 await expect(page.locator(".solution-panel")).toContainText(family.id==="sequence-euler-quadratic"?"ln(1+tₙ)/tₙ":"√(n²)");
 if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});