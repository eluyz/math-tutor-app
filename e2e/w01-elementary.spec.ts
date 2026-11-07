import {test,expect} from '@playwright/test';
import {runPinnedAcceptance} from './helpers/acceptance';
import {independentElementary} from '../src/qa/w01Elementary';
for(const width of [375,1280])for(const locale of ['pl','en'] as const)test(`W01 symbolic log/root ${locale} ${width}`,async({page},info)=>{
 await runPinnedAcceptance(page,info,{family:'multivar-elementary-partial',level:'hard',variants:Array.from({length:12},(_,v)=>v)},locale,width,independentElementary,(a)=>{
  if(typeof a==='string'||a.kind!=='list')throw Error('coefficients');return {...a,values:['999999',...a.values.slice(1)]};
 },{inspectPinned:async(page,task)=>{
  const p=task.university;if(p.kind!=='multivar-elementary-partial')throw Error('scope');
  await expect(page.locator('.solution-panel')).toContainText(p.mode==='log'?'D(f)={u>0}':'D(f)={u≥0}');
  await expect(page.locator('.solution-panel')).toContainText('f_ij=F″(u)u_i u_j+F′(u)u_ij');
  const input=independentElementary(task);expect(await page.locator('form .coefficient-field input').count()).toBe(input.values.length);
 }});
});
