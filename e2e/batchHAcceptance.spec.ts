import {test,expect} from '@playwright/test';
import {batchH,batchHOracle,batchHCertificate,wrongBatchH} from '../src/qa/batchH';
import {runPinnedAcceptance} from './helpers/acceptance';
const clean=(s:string)=>s.replace(/\s/g,'').replaceAll('-','−');
// Included in the existing base browser suite; no workflow/config mutation.
for(const width of [375,1280])for(const locale of ['pl','en'] as const)for(const row of batchH){
 test(`${row.skill} ${row.family}/${row.level} ${locale} ${width}px`,async({page},info)=>{
  await runPinnedAcceptance(page,info,row,locale,width,batchHOracle,wrongBatchH,{
   inspectPinned:async(page,task)=>{
    const cert=batchHCertificate(task,locale),text=clean(await page.locator('.solution-panel').innerText());
    for(const anchors of cert.anchors)for(const a of anchors)expect(text).toContain(clean(a));
   },
  });
 });
}
