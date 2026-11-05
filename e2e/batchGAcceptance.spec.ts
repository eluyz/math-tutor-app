import {test,expect} from "@playwright/test";
import {batchG,batchGOracle,batchGCertificate,wrongBatchG} from "../src/qa/batchG";
import {runPinnedAcceptance} from "./helpers/acceptance";
const clean=(s:string)=>s.replace(/\s/g,"").replaceAll("-","−");
for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const row of batchG){
 test(`${row.skills.join("/")} ${row.family}/${row.level} ${locale} ${width}px`,async({page},info)=>{
  const basics=row.family==="analysis-power-law"||row.family==="analysis-elementary-equation"||row.family==="analysis-log-inequality";
  await runPinnedAcceptance(page,info,row,locale,width,batchGOracle,wrongBatchG,{
   ...(basics?{group:"basics" as const,categoryLabels:["Podstawy algebry","Algebra basics"] as const}:{}),
   inspectPinned:async(page,task)=>{
    const cert=batchGCertificate(task,locale),panel=clean(await page.locator(".solution-panel").innerText());
    for(const anchors of cert.anchors)for(const anchor of anchors)expect(panel).toContain(clean(anchor));
    if(cert.choiceLabel)expect(clean(await page.locator("#answer option:checked").innerText())).toBe(clean(cert.choiceLabel));
    if(task.university.kind==="function-composition"){
     const input=cert.input;if(typeof input==="string"||input.kind!=="list")throw Error("Expected coefficients");
     const labels=Array.from({length:input.values.length},(_,i)=>{
      const degree=input.values.length-i-1;return degree===0?"1":degree===1?"x":"x"+(["","","²","³","⁴","⁵","⁶"][degree]??`^${degree}`);
     });
     expect((await page.locator("form .coefficient-field label").allTextContents()).map(x=>x.trim())).toEqual(labels);
    }
    if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(/\b(gdy|lub|Dla)\b/iu);
   },
  });
 });
}
