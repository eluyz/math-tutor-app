import {test,expect} from '@playwright/test';
import {runPinnedAcceptance} from './helpers/acceptance';
import {independentNonlinear,nonlinearOracleInput} from '../src/qa/w02NonlinearOracle';
const pins=[0,1,4,5,8,9,12,13];
for(const width of [375,1280])for(const locale of ['pl','en'] as const)
 test(`W02 nonlinear complete points ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,{family:'multivar-quadratic-cubic-extrema',level:'hard',variants:pins},locale,width,nonlinearOracleInput,
   input=>{if(typeof input==='string'||input.kind!=='multi-choice')throw Error('fields');return {kind:'multi-choice',values:{...input.values,'p1-kind':input.values['p1-kind']==='saddle'?'minimum':'saddle'}};},
   {fillInput:async(page,input)=>{
    if(typeof input==='string'||input.kind!=='multi-choice')throw Error('fields');
    for(const [id,value]of Object.entries(input.values))await page.locator(id==='p1-x'?'#answer':'#answer-'+id).selectOption(value);
   },inspectPinned:async(page,task)=>{
    const z=independentNonlinear(task),panel=page.locator('.solution-panel');
    await expect(panel).toContainText('y₁<y₂');await expect(panel).toContainText('f_xy=f_yx');
    for(const [i,p]of z.points.entries()){
     await expect(panel).toContainText(i===0?'H(P₁)':'H(P₂)');
     await expect(page.locator('#answer-p'+(i+1)+'-kind option:checked')).toHaveAttribute('value',p.kind);
    }
   }});
 });
