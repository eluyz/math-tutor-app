import {test,expect,type Page} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import {d,q} from "../src/university/audit";
import {polishLearningText} from "./helpers/localization";
import type {LimitValue} from "../src/answers";

const btn=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const limitFromDisplay=(text:string):LimitValue=>{
 const match=text.match(/aₙ = \(\(([^()]+)\)·n\^(\d+)·\(([^()]+)\)ⁿ\)\/\(\(([^()]+)\)·n\^(\d+)·\(([^()]+)\)ⁿ\)/);
 if(!match)throw Error("Cannot read polynomial-exponential expression from UI: "+text);
 const c=shownFraction(match[1]),p=Number(match[2]),a=shownFraction(match[3]);
 const den=shownFraction(match[4]),r=Number(match[5]),b=shownFraction(match[6]);
 const compare=a.numerator*b.denominator-b.numerator*a.denominator;
 if(compare<0 || compare===0&&p<r)return {kind:"finite",value:q(0)};
 if(compare===0&&p===r)return {kind:"finite",value:d(c,den)};
 return {kind:c.numerator>0n?"positive-infinity":"negative-infinity"};
};
const behaviourFromDisplay=(text:string)=>{
 const match=text.match(/aₙ = ([^\n]+) \+ \(([^()]+)\)/);
 if(!match)throw Error("Cannot read monotonicity expression: "+text);
 const s=shownFraction(match[2]);
 if(text.includes("·(−1)ⁿ"))return "neither-bounded";
 if(text.includes("·n"))return s.numerator>0n?"increasing-unbounded":"decreasing-unbounded";
 return s.numerator>0n?"decreasing-bounded":"increasing-bounded";
};
for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-020 P1A "+width+"px "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",err=>errors.push(err.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await btn(page,"English").click();
 await btn(page,en?"University mathematics":"Matematyka na studia").click();
 await btn(page,en?"Limits of sequences":"Granice ciągów").click();
 await btn(page,en?"Hard":"Trudny").click();
 const powerName=en?"Limit: polynomial times exponential":"Granica: wielomian razy potęga wykładnicza";
 await page.locator("button.exercise-item").filter({hasText:powerName}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","sequence-power-exponential");
 const answer=limitFromDisplay(await page.locator(".question").innerText());
 await btn(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(answer.kind==="finite"?"positive-infinity":"finite");
 if(answer.kind!=="finite")await page.locator("#limit-value").fill("0");
 await btn(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(answer.kind);
 if(answer.kind==="finite")await page.locator("#limit-value").fill(fractionText(answer.value));
 await btn(page,en?"Check":"Sprawdź").click();
 if(await page.locator(".feedback").getAttribute("class")!=="feedback correct"){
   const actualQuestion=await page.locator(".question").innerText();
   const feedback=await page.locator(".feedback").innerText();
   const inputClass=await page.locator("#answer").inputValue();
   const inputValue=inputClass==="finite"?await page.locator("#limit-value").inputValue():"";
   await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
   await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
   const solution=await page.locator(".solution-panel").innerText();
   throw Error(JSON.stringify({actualQuestion,expected:answer,inputClass,inputValue,feedback,solution}));
 }
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");

 const monoName=en?"Sequence monotonicity and boundedness":"Monotoniczność i ograniczoność ciągu";
 await page.locator("button.exercise-item").filter({hasText:monoName}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","sequence-monotonic-bounded");
 const kind=behaviourFromDisplay(await page.locator(".question").innerText());
 await btn(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(kind==="neither-bounded"?"increasing-bounded":"neither-bounded");
 await btn(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(kind);
 await btn(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
