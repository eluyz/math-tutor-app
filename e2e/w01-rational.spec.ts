import {test,expect} from "@playwright/test";
import {runPinnedAcceptance} from "./helpers/acceptance";
import {independentRational} from "../src/qa/w01Rational";
const pins=[0,1,2,3,12,13,14,15,20,21,22,23];
for(const width of [375,1280])for(const locale of ["pl","en"] as const)
 test(`W01 rational partials ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,{
   family:"multivar-rational-partial",level:"hard",variants:pins,
  },locale,width,independentRational,answer=>{
   if(typeof answer==="string"||answer.kind!=="list")throw Error("Expected coefficients");
   return {...answer,values:["999999",...answer.values.slice(1)]};
  },{inspectPinned:async(page,task)=>{
   if(task.university.kind!=="multivar-rational-partial")throw Error("Wrong pinned task");
   await expect(page.locator(".solution-panel")).toContainText("D(f)={v≠0}");
   await expect(page.locator(".solution-panel")).toContainText("f_xy=f_yx");
  }});
 });
