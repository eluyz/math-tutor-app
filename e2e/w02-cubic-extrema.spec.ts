import {test,expect} from "@playwright/test";
import {runPinnedAcceptance} from "./helpers/acceptance";
import {independentW02Cubic} from "../src/qa/w02CubicExtremaOracle";
const pins=[0,1,2,3,4,5,6,7,12,13,22,23];
for(const width of [375,1280])for(const locale of ["pl","en"] as const)
 test(`W02 full cubic extrema ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,{
   family:"multivar-cubic-extrema-full",level:"hard",variants:pins,
  },locale,width,task=>{
   const d=independentW02Cubic(task);
   return {kind:"list",values:d.values};
  },answer=>{
   if(typeof answer==="string"||answer.kind!=="list")throw Error("Expected list");
   return {...answer,values:["999999",...answer.values.slice(1)]};
  },{inspectPinned:async(page,task)=>{
   if(task.university.kind!=="multivar-cubic-extrema-full")throw Error("Wrong pinned W02 task");
   await expect(page.locator(".solution-panel")).toContainText("H(0,0)");
   await expect(page.locator(".solution-panel")).toContainText("det=");
   await expect(page.locator(".solution-panel")).toContainText("∇f=0");
  }});
 });
