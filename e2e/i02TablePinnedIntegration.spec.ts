import {expect,test,type Page} from "@playwright/test";
import type {AnswerInput} from "../src/answers";
import {formatRational as fmt} from "../src/answers";
import {rational as r,divideRational as div,multiplyRational as mul,subtractRational as sub} from "../src/rational";
import {makeUniversityTask} from "../src/university/catalog";
import {runPinnedAcceptance} from "./helpers/acceptance";

// Public synthetic variants only. No private original question/key or source→variant map.
type Task=ReturnType<typeof makeUniversityTask>;
function independent(task:Task):AnswerInput{
 const p=task.university;
 if(p.kind!=="integral-table-i02-stage")throw Error("I02 table problem expected");
 const q=div(p.k,p.a);
 const coefficients=p.mode==="tan-square"?[q,sub(r(0),p.k)]:
  p.mode==="cot-square"?[sub(r(0),q),sub(r(0),p.k)]:
  p.mode==="arcsin"?[q]:[div(sub(r(0),p.k),mul(p.a,p.a))];
 return {kind:"primitive",coefficients:coefficients.map(fmt),hasConstant:true};
}
function wrong(input:AnswerInput):AnswerInput{
 if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
 return {...input,coefficients:input.coefficients.map((c,i)=>i===0?"999999":c)};
}
async function fill(page:Page,input:AnswerInput){
 if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
 const fields=page.locator("form .coefficient-field input");
 await expect(fields).toHaveCount(input.coefficients.length);
 for(let i=0;i<input.coefficients.length;i++)await fields.nth(i).fill(input.coefficients[i]);
 const constant=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
 if(input.hasConstant)await constant.check();else await constant.uncheck();
}
const row={family:"integral-table-i02-stage",level:"hard",variants:[0,1,2,3,4,5,6,7]} as const;
for(const width of [375,1280])for(const locale of ["pl","en"] as const){
 test("I02 table source-shaped synthetic browser "+width+"px "+locale,async({page},info)=>{
  await runPinnedAcceptance(page,info,row,locale,width,independent,wrong,{
   categoryLabels:["Całki","Integrals"],fillInput:fill,
   inspectPinned:async(page,task)=>{
    const expectInput=independent(task);
    if(typeof expectInput==="string"||expectInput.kind!=="primitive")throw Error("Wrong oracle");
    expect(task.answer.kind).toBe("primitive");
    if(task.answer.kind!=="primitive")throw Error("Unexpected answer kind");
    expect(task.answer.terms.map(t=>fmt(t.coefficient))).toEqual(expectInput.coefficients);
    const p=task.university;
    if(p.kind!=="integral-table-i02-stage")throw Error("Unexpected task");
    const shown=await page.locator(".question").innerText();
    if(p.mode==="tan-square")expect(shown).toContain(locale==="pl"?"tg²":"tan²");
    else if(p.mode==="cot-square")expect(shown).toContain(locale==="pl"?"ctg²":"cot²");
    else if(p.mode==="arcsin")expect(shown).toContain("√(1−");
    else expect(shown).toContain("x/√(1−");
    const box=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
    await box.uncheck();
    await page.getByRole("button",{name:locale==="en"?"Check":"Sprawdź",exact:true}).click();
    await expect(page.locator(".feedback")).toContainText(locale==="en"?"+C is missing":"brakuje stałej całkowania +C");
    await box.check();
    await page.getByRole("button",{name:locale==="en"?"Check":"Sprawdź",exact:true}).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
   },
  });
 });
}
