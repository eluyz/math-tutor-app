import {test,expect} from "@playwright/test";
import {runPinnedAcceptance} from "./helpers/acceptance";
import {independentW01SourceShape} from "../src/qa/w01SourceShapes";
const pins=[0,1,2,3,12,13,14,15,20,21,22,23];
for(const width of [375,1280])for(const locale of ["pl","en"] as const)
 test(`W01 polynomial/log/root source shapes ${locale} ${width}`,async({page},info)=>{
  await runPinnedAcceptance(page,info,{
   family:"multivar-source-shape-partial",level:"hard",variants:pins
  },locale,width,independentW01SourceShape,answer=>{
   if(typeof answer==="string"||answer.kind!=="list")throw Error("Coefficient answer expected");
   return {...answer,values:["999999",...answer.values.slice(1)]};
  },{inspectPinned:async(page,task)=>{
   const p=task.university;
   if(p.kind!=="multivar-source-shape-partial")throw Error("Wrong pinned family");
   await expect(page.locator(".solution-panel")).toContainText("D(f)=");
   if(p.mode==="root-linear")await expect(page.locator(".solution-panel")).toContainText("D(C²)={u>0}");
   if(p.mode==="log-positive")await expect(page.locator(".solution-panel")).toContainText("D(C²)=ℝ²");
   if(p.mode==="poly-cubic"||p.mode==="poly-mixed")
    await expect(page.locator(".solution-panel")).toContainText("f_xy=f_yx");
  }});
 });
