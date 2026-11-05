import {test,expect,type Page} from "@playwright/test";
import {batchE,batchEOracle,wrongBatchE} from "../src/qa/batchE";
import type {AnswerInput} from "../src/answers";
import {runPinnedAcceptance} from "./helpers/acceptance";

/** Only the integral input adapter is new; traversal, hints, full working,
 * HTTP/console/pageerror checks and viewport evidence reuse Batch B/C. */
async function fillIntegral(page:Page,input:AnswerInput){
  if(typeof input==="string"){await page.locator("#answer").fill(input);return;}
  if(input.kind==="primitive"){
    const fields=page.locator("form .coefficient-field input");
    await expect(fields).toHaveCount(input.coefficients.length);
    for(let i=0;i<input.coefficients.length;i++)await fields.nth(i).fill(input.coefficients[i]);
    await page.locator("form .primitive-constant input").setChecked(input.hasConstant);
    return;
  }
  if(input.kind==="limit"){
    await page.locator("#answer").selectOption(input.classification);
    if(input.classification==="finite")await page.locator("#limit-value").fill(input.value);
    return;
  }
  if(input.kind==="choice"){await page.locator("#answer").selectOption(input.value);return;}
  throw Error("Unexpected Batch E input");
}
for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const row of batchE){
  test(`${row.skill} ${row.family}/${row.level} ${locale} ${width}px`,async({page},info)=>{
    await runPinnedAcceptance(page,info,row,locale,width,batchEOracle,wrongBatchE,{
      categoryLabels:["Całki","Integrals"],fillInput:fillIntegral,
    });
    // The common detector deliberately avoids ambiguous short words. These
    // are known integral-template regressions and are safe to check here.
    if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(/\blub\b|\bod .+ do /iu);
  });
}
