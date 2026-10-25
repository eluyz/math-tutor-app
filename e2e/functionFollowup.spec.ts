
import {test,expect,type Page} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../src/rational";
import {formatRational as f} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
const cmp=(a:Rational,b:Rational)=>Number(a.numerator*b.denominator-b.numerator*a.denominator);
async function wrongChoice(page:Page,correctLabel:string){
 const all=await page.locator("#answer option").evaluateAll(options=>options.map(x=>({label:x.textContent?.trim()||"",value:(x as HTMLOptionElement).value})));
 const other=all.find(x=>x.value!==""&&x.label!==correctLabel);
 if(!other)throw Error("Missing wrong domain option");
 await page.locator("#answer").selectOption(other.value);
}
for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-020 P1B "+width+"px "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Functions":"Funkcje").click();
 await button(page,en?"Hard":"Trudny").click();
 const domainName=en?"Domain of a logarithm with three critical points":"Dziedzina logarytmu ilorazu trzech czynników";
 await page.locator("button.exercise-item").filter({hasText:domainName}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-log-rational-domain");
 const question=await page.locator(".question").innerText();
 const matches=[...question.matchAll(/x−\(([^()]+)\)/g)].map(z=>shownFraction(z[1]));
 expect(matches).toHaveLength(3);
 const sorted=[...matches].sort(cmp);
 const expectedLabel="("+f(sorted[0])+"; "+f(sorted[1])+") ∪ ("+f(sorted[2])+"; +∞)";
 const check=button(page,en?"Check":"Sprawdź");
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await wrongChoice(page,expectedLabel);await check.click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption({label:expectedLabel});await check.click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(expectedLabel);

 const inverseName=en?"Inverse of a linear-fractional function":"Funkcja odwrotna do ułamka liniowego";
 await page.locator("button.exercise-item").filter({hasText:inverseName}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-mobius-inverse-point");
 const txt=await page.locator(".question").innerText();
 const pattern=/f\(x\)=\(\(([^()]+)\)·x\+\(([^()]+)\)\)\/\(\(([^()]+)\)·x\+\(([^()]+)\)\)/;
 const m=txt.match(pattern),y=txt.match(/y=([^\n]+)/);
 if(!m||!y)throw Error("Cannot independently read inverse-function problem: "+txt);
 const A=shownFraction(m[1]),B=shownFraction(m[2]),C=shownFraction(m[3]),D=shownFraction(m[4]),Y=shownFraction(y[1]);
 const answer=div(sub(mul(D,Y),B),sub(A,mul(C,Y)));
 const fwd=div(add(mul(A,answer),B),add(mul(C,answer),D));
 expect(fwd).toEqual(Y);
 await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").fill(fractionText(add(answer,r(1))));await check.click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").fill(fractionText(answer));await check.click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
