import {test,expect} from '@playwright/test';
import {runPinnedAcceptance} from './helpers/acceptance';
import {qa003VisibleCertificate,qa003Wrong} from '../src/qa/qa003MultivariableOracle';
const rows=[
 {family:'multivar-path-limit',variants:[0,1]},
 {family:'multivar-continuity-point',variants:[0,1,2]},
 {family:'multivar-polar-homogeneous-limit',variants:[0,1,2,3]},
 {family:'multivar-angular-continuity',variants:[0,1,2]},
 {family:'multivar-angular-continuity',level:'advanced' as const,variants:[1]},
 {family:'multivar-angular-continuity',level:'expert' as const,variants:[5]},
];
for(const row of rows)for(const width of [375,1280])for(const locale of ['pl','en']as const)
 test(`QA003 ${row.family} ${row.level??'hard'} ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,{...row,level:row.level??'hard'},locale,width,t=>qa003VisibleCertificate(t.question).input,qa003Wrong,{inspectPinned:async(page,task)=>{
   const c=qa003VisibleCertificate(task.question);
   if(c.asksContinuity)await expect(page.locator('.question')).toContainText('f(x,y)=g(x,y)');
   if(row.family==='multivar-angular-continuity')await expect(page.locator('.solution-panel')).not.toContainText(/Klasyfikacja: (?:continuous|removable|nonremovable)\b/);
   if(typeof c.input!=='string'&&c.input.kind==='limit'&&c.input.classification==='finite'){
    for(const bad of ['1/0','not-a-number']){
     await page.locator('#limit-value').fill(bad);await page.getByRole('button',{name:locale==='pl'?'Sprawdź':'Check',exact:true}).click();
     await expect(page.locator('.feedback')).toHaveClass('feedback invalid');
    }
    await page.locator('#limit-value').fill(c.input.value);await page.getByRole('button',{name:locale==='pl'?'Sprawdź':'Check',exact:true}).click();
    await expect(page.locator('.feedback')).toHaveClass('feedback correct');
   }
  }});
 });
