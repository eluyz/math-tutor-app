import {test,expect,type Page} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import {a,d,m,q,eq} from "../src/university/audit";
import {polishLearningText} from "./helpers/localization";
import type {Rational} from "../src/rational";
import type {LimitValue} from "../src/answers";

const btn=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
async function checkLimit(page:Page,answer:LimitValue){
 await page.getByRole("button",{name:/^(Check|Sprawdź)$/}).click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(answer.kind);
 if(answer.kind==="finite")await page.locator("#limit-value").fill(fractionText(answer.value));
 await page.getByRole("button",{name:/^(Check|Sprawdź)$/}).click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
}
function leading(terms:readonly {coefficient:Rational;base:Rational}[]){
 const grouped:typeof terms[number][]=[];
 for(const z of [...terms].sort((x,y)=>
  Number(x.base.numerator*y.base.denominator-y.base.numerator*x.base.denominator))){
  const old=grouped.at(-1);
  if(old&&eq(old.base,z.base))grouped[grouped.length-1]={base:z.base,coefficient:a(old.coefficient,z.coefficient)};
  else grouped.push(z);
 }
 return grouped.filter(z=>z.coefficient.numerator!==0n).at(-1);
}
function rootExpected(text:string):LimitValue{
 const roots=[...text.matchAll(/√\(\(([^()]+)·n \+ ([^()]+)\)² \+ ([^()]+)\)/g)];
 const tails=[...text.matchAll(/\+ \(([^()]+)\)·n\)/g)];
 if(roots.length!==2||tails.length!==2)throw Error("Cannot read both displayed radicals");
 const result=d(a(shownFraction(roots[0][1]),shownFraction(tails[0][1])),
  a(shownFraction(roots[1][1]),shownFraction(tails[1][1])));
 return {kind:"finite",value:result};
}
function exponentialExpected(text:string):LimitValue{
 const terms=[...text.matchAll(/\(([^()]+)\)·\(([^()]+)\)ⁿ/g)].map(x=>({
  coefficient:shownFraction(x[1]),base:shownFraction(x[2])}));
 if(terms.length!==4&&terms.length!==5)throw Error("Unexpected number of exponential terms");
 const top=leading(terms.slice(0,-2)),bottom=leading(terms.slice(-2));
 if(!bottom)throw Error("No denominator term");
 if(!top||top.base.numerator*bottom.base.denominator<bottom.base.numerator*top.base.denominator)
  return {kind:"finite",value:q(0)};
 if(eq(top.base,bottom.base))
  return {kind:"finite",value:d(top.coefficient,bottom.coefficient)};
 return {kind:top.coefficient.numerator>0n?"positive-infinity":"negative-infinity"};
}
function eulerExponent(text:string):Rational {
 const terms=[...text.matchAll(/\(1\+\(([^()]+)\)\/\(n\+([^()]+)\)\)\^\(\(([^()]+)\)·n\+([^()]+)\)/g)];
 if(!terms.length||terms.length>2)throw Error("Unrecognized shifted Euler expressions");
 return terms.map(z=>m(shownFraction(z[1]),shownFraction(z[3]))).reduce(a,q(0));
}
for(const width of [375,1280])for(const en of [false,true])
 test(`MT-EDU-015A ${width}px ${en?"EN":"PL"}: radicals, exponentials, Euler`,async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:950});await page.goto("/");
  if(en)await btn(page,"English").click();
  await btn(page,en?"University mathematics":"Matematyka na studia").click();
  await btn(page,en?"Limits of sequences":"Granice ciągów").click();

  await btn(page,en?"Medium":"Średni").click();
  await page.getByRole("button",{name:en?/Radical ratios and dominant powers/:/Ilorazy pierwiastków i najwyższe potęgi/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","sequence-radical-ratio");
  await checkLimit(page,rootExpected(await page.locator(".question").innerText()));
  await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("√");

  await page.getByRole("button",{name:en?/Exponential ratios and growth comparison/:/Ilorazy potęg i porównanie wzrostu/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","sequence-exponential-ratio");
  await checkLimit(page,exponentialExpected(await page.locator(".question").innerText()));

  await page.getByRole("button",{name:en?/Euler limits — shifts and products/:/Granica Eulera — przesunięcia i iloczyny/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","sequence-euler-product");
  const exponent=eulerExponent(await page.locator(".question").innerText());
  if(exponent.numerator===0n)await page.locator("#answer").fill("1");
  else await page.locator("#answer").selectOption(`exp:${fractionText(exponent).includes("/")?fractionText(exponent):fractionText(exponent)+"/1"}`);
  await btn(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("ln L");

  if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
 });
