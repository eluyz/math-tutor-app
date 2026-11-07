import {test,expect} from '@playwright/test';
import {runPinnedAcceptance} from './helpers/acceptance';
import {w02Batch2Oracle,w02Batch2Certificate} from '../src/qa/w02Batch2';
for(const width of [375,1280])for(const locale of ['pl','en'] as const)for(const family of ['multivar-bilinear-extrema','multivar-stationary-point'])test(`W02 Batch2 ${family} ${locale} ${width}`,async({page},info)=>{
 await runPinnedAcceptance(page,info,{family,level:family==='multivar-stationary-point'?'advanced':'hard',variants:family==='multivar-bilinear-extrema'?[0,1,7,16]:[0,3]},locale,width,w02Batch2Oracle,(input,task)=>{
  if(typeof input==='string')throw Error('input');if(input.kind==='list')return {...input,values:['99999',...input.values.slice(1)]};
  if(input.kind!=='multi-choice'||task.answer.kind!=='multi-choice')throw Error('fields');return {...input,values:{...input.values,conclusion:'minimum'}};
 },{fillInput:async(page,input)=>{
  if(typeof input==='string')throw Error('input');
  if(input.kind==='multi-choice')for(const [id,value]of Object.entries(input.values))await page.locator(id==='x_*'?'#answer':'[id="answer-'+id+'"]').selectOption(value);
  else if(input.kind==='list')for(let i=0;i<input.values.length;i++)await page.locator(i===0?'#answer':'#answer-'+i).fill(input.values[i]);
 },inspectPinned:async(page,task)=>{
  const c=w02Batch2Certificate(task);if(task.university.kind==='multivar-stationary-point')await expect(page.locator('.solution-panel')).toContainText(c.classification);
  if(task.university.kind==='multivar-bilinear-extrema')await expect(page.locator('.solution-panel')).toContainText(locale==='pl'?'brak ekstremów lokalnych':'no local extrema');
 }});
});
