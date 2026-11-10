import {expect,test,type Page} from "@playwright/test";
import type {AnswerInput} from "../src/answers";
import {formatRational as fmt} from "../src/answers";
import {rational as r,divideRational as div} from "../src/rational";
import {makeUniversityTask} from "../src/university/catalog";
import {runPinnedAcceptance} from "./helpers/acceptance";

// Synthetic I03 examples only; no private university tasks or keys.
type Task=ReturnType<typeof makeUniversityTask>;
function oracle(task:Task):AnswerInput{
  const p=task.university;
  if(p.kind!=="integral-log-power-i03-stage")throw Error("I03 required");
  return {kind:"primitive",coefficients:[fmt(div(p.k,r(p.exponent+1)))],hasConstant:true};
}
function wrong(input:AnswerInput):AnswerInput{
  if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
  return {...input,coefficients:["999999"]};
}
async function fill(page:Page,input:AnswerInput){
  if(typeof input==="string"||input.kind!=="primitive")throw Error("Primitive required");
  const fields=page.locator("form .coefficient-field input");
  await expect(fields).toHaveCount(1);
  await fields.first().fill(input.coefficients[0]);
  const constant=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
  if(input.hasConstant)await constant.check();else await constant.uncheck();
}
const row={family:"integral-log-power-i03-stage",level:"hard",variants:[0,1,2,3,4,5,6,7]} as const;
for(const width of [375,1280])for(const locale of ["pl","en"] as const){
  test("I03 log-power pinned browser "+width+"px "+locale,async({page},info)=>{
    await runPinnedAcceptance(page,info,row,locale,width,oracle,wrong,{
      categoryLabels:["Całki","Integrals"],fillInput:fill,
      inspectPinned:async(page,task)=>{
        const p=task.university;
        if(p.kind!=="integral-log-power-i03-stage")throw Error("Expected I03");
        const shown=await page.locator(".question").innerText();
        expect(shown).toContain("ln(");
        expect(shown).toContain(p.a.numerator>0n?"x>":"x<");
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
