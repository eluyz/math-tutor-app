import {test,expect} from '@playwright/test';
import {runPinnedAcceptance} from './helpers/acceptance';
import {independentW02Source,sourceW02OracleInput} from '../src/qa/w02SourceStationarityOracle';
import {formatRational as f} from '../src/answers';

/** Browser witnesses for both advanced modes, PL/EN × 375/1280.
 * No access to the production answer key: all values come from independent polynomial calculus.
 */
const pins=[0,1,4,5];
for(const width of [375,1280])for(const locale of ['pl','en'] as const)
 test(`W02 source stationarity 3/4 points ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,
   {family:'multivar-quadratic-cubic-extrema',level:'advanced',variants:pins},locale,width,
   sourceW02OracleInput,
   input=>{
    if(typeof input==='string'||input.kind!=='multi-choice')throw Error('Expected multi-choice');
    return {kind:'multi-choice',values:{...input.values,'p1-kind':input.values['p1-kind']==='saddle'?'minimum':'saddle'}};
   },{
    fillInput:async(page,input)=>{
     if(typeof input==='string'||input.kind!=='multi-choice')throw Error('Expected multi-choice');
     for(const [id,value]of Object.entries(input.values))
      await page.locator(id==='p1-x'?'#answer':'#answer-'+id).selectOption(value);
    },
    inspectPinned:async(page,task)=>{
     const checked=independentW02Source(task),panel=page.locator('.solution-panel'),points=checked.points;
     expect(points.length).toBe(task.university.kind==='multivar-quadratic-cubic-extrema'&&task.university.mode==='three'?3:4);
     await expect(panel).toContainText('f_xy=f_yx');
     await expect(panel).toContainText('y=0');
     for(const [i,z]of points.entries()){
      const n=i+1;
      await expect(panel).toContainText(`(${f(z.x)},${f(z.y)})`);
      await expect(panel).toContainText(`D=${f(z.D)}`);
      await expect(page.locator('#answer-p'+n+'-kind')).toHaveValue(z.kind);
      await expect(page.locator(n===1?'#answer':'#answer-p'+n+'-x')).toHaveValue(f(z.x));
      await expect(page.locator('#answer-p'+n+'-fxx')).toHaveValue(f(z.xx));
     }
     await expect(page.locator('form select')).toHaveCount(6*points.length);
    }
   });
 });
