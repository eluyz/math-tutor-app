import {expect,test,type Page} from "@playwright/test";
import type {AnswerInput} from "../src/answers";
import {formatRational as fmt} from "../src/answers";
import {rational as r,multiplyRational as mul,divideRational as div} from "../src/rational";
import {makeUniversityTask} from "../src/university/catalog";
import {runPinnedAcceptance} from "./helpers/acceptance";

// Public synthetic QA only: no private source tasks, keys or source-to-variant mapping.
// Coefficients are independently derived from the generator's inputs.
type Task=ReturnType<typeof makeUniversityTask>;
const double=(x:ReturnType<typeof r>)=>mul(r(2),x);
const square=(x:ReturnType<typeof r>)=>mul(x,x);

function independentPrimitive(task:Task):AnswerInput{
  const p=task.university;
  if(p.kind==="integral-parts-trig-quadratic"){
    const ratio=div(p.k,p.a);
    const squared=div(double(p.k),square(p.a));
    const cubed=div(double(p.k),mul(square(p.a),p.a));
    const coefficients=p.mode==="sin"
      ? [mul(r(-1),ratio),squared,cubed]
      : [ratio,squared,mul(r(-1),cubed)];
    return {kind:"primitive",coefficients:coefficients.map(fmt),hasConstant:true};
  }
  if(p.kind==="integral"&&p.method==="parts"&&p.n===2){
    const coefficients=[
      div(p.k,p.a),
      div(mul(r(-2),p.k),square(p.a)),
      div(double(p.k),mul(square(p.a),p.a)),
    ];
    return {kind:"primitive",coefficients:coefficients.map(fmt),hasConstant:true};
  }
  throw Error("Not a two-pass integration-by-parts task");
}

function incorrectCoefficient(input:AnswerInput):AnswerInput{
  if(typeof input==="string"||input.kind!=="primitive")throw Error("Expected primitive input");
  return {...input,coefficients:input.coefficients.map((value,i)=>i===0?"999999":value)};
}

async function fillPrimitive(page:Page,input:AnswerInput){
  if(typeof input==="string"||input.kind!=="primitive")throw Error("Expected primitive input");
  const fields=page.locator("form .coefficient-field input");
  await expect(fields).toHaveCount(input.coefficients.length);
  for(let i=0;i<input.coefficients.length;i++)await fields.nth(i).fill(input.coefficients[i]);
  const box=page.getByRole("checkbox",{name:/(?:Dodaj stałą całkowania|Include integration constant)/});
  if(input.hasConstant)await box.check();else await box.uncheck();
}

// Representative pinned variants, rather than source-labeled fixture IDs.
// Multiple variants per family avoid disclosing the private source mapping.
const cases=[
  {family:"integral-parts-trig-quadratic",level:"expert",variants:[0,2,6,10,14,18]},
  {family:"integral-parts",level:"advanced",variants:[0,1,2,6,10,14]},
] as const;

for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const row of cases){
  test("I04 pinned UI "+row.family+" "+row.level+" "+width+"px "+locale,async({page},info)=>{
    await runPinnedAcceptance(page,info,row,locale,width,independentPrimitive,incorrectCoefficient,{
      categoryLabels:["Całki","Integrals"],
      fillInput:fillPrimitive,
      inspectPinned:async(page,task)=>{
        const independent=independentPrimitive(task);
        if(typeof independent==="string"||independent.kind!=="primitive")throw Error("Expected primitive");
        expect(task.answer.kind).toBe("primitive");
        if(task.answer.kind!=="primitive")throw Error("Unexpected answer kind");
        expect(task.answer.terms.map(term=>fmt(term.coefficient))).toEqual(independent.coefficients);
        await expect(page.locator(".solution-panel")).toContainText("+ C");
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
