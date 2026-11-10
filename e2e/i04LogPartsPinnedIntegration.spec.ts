import {expect,test,type Page} from "@playwright/test";
import type {AnswerInput} from "../src/answers";
import {formatRational as fmt} from "../src/answers";
import {rational as r,multiplyRational as mul,divideRational as div,subtractRational as sub} from "../src/rational";
import {makeUniversityTask} from "../src/university/catalog";
import {runPinnedAcceptance} from "./helpers/acceptance";

// Bounded synthetic tasks only. No original worksheets or answer keys.
type Task=ReturnType<typeof makeUniversityTask>;
function independent(task:Task):AnswerInput{
 const p=task.university;
 if(p.kind!=="integral-parts-log-i04-stage")throw Error("I04 kind required");
 const kb=mul(p.k,p.b);
 const values=[div(p.k,r(2)),sub(r(0),div(p.k,r(4))),sub(r(0),kb),kb];
 return {kind:"primitive",coefficients:values.map(fmt),hasConstant:true};
}
function wrong(input:AnswerInput):AnswerInput{
 if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
 return {...input,coefficients:input.coefficients.map((v,i)=>i===0?"999999":v)};
}
async function fill(page:Page,input:AnswerInput){
 if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
 const fields=page.locator("form .coefficient-field input");
 await expect(fields).toHaveCount(input.coefficients.length);
 for(let i=0;i<input.coefficients.length;i++)await fields.nth(i).fill(input.coefficients[i]);
 const constant=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
 if(input.hasConstant)await constant.check();else await constant.uncheck();
}
const row={family:"integral-parts-log-i04-stage",level:"hard",variants:[0,1,2,3,4,5,6,7]} as const;
for(const width of [375,1280])for(const locale of ["pl","en"] as const){
 test("I04 shifted-log parts browser "+width+"px "+locale,async({page},info)=>{
  await runPinnedAcceptance(page,info,row,locale,width,independent,wrong,{
   categoryLabels:["Całki","Integrals"],fillInput:fill,
   inspectPinned:async(page,task)=>{
    const p=task.university;
    if(p.kind!=="integral-parts-log-i04-stage")throw Error("I04 expected");
    const question=await page.locator(".question").innerText();
    expect(question).toContain("ln(");
    expect(question).toContain("x>");
    const checkbox=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
    await checkbox.uncheck();
    await page.getByRole("button",{name:locale==="en"?"Check":"Sprawdź",exact:true}).click();
    await expect(page.locator(".feedback")).toContainText(locale==="en"?"+C is missing":"brakuje stałej całkowania +C");
    await checkbox.check();
    await page.getByRole("button",{name:locale==="en"?"Check":"Sprawdź",exact:true}).click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
   },
  });
 });
}