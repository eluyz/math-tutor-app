import { test, expect } from "@playwright/test";
import { runPinnedAcceptance } from "./helpers/acceptance";
import { independentTrig } from "../src/qa/w01Trig";
for(const width of [375,1280])for(const locale of ["pl","en"] as const)
  test(`W01 symbolic trig partials ${locale} ${width}`, async({page},info)=>{
    await runPinnedAcceptance(page,info,{
      family:"multivar-trig-partial",level:"hard",
      variants:Array.from({length:12},(_,v)=>v),
    },locale,width,independentTrig,answer=>{
      if(typeof answer==="string"||answer.kind!=="list")throw Error("Expected coefficients");
      return {...answer,values:[String(Number(answer.values[0])+1),...answer.values.slice(1)]};
    },{inspectPinned:async(page,task)=>{
      if(task.university.kind!=="multivar-trig-partial")throw Error("Incorrect pinned family");
      await expect(page.locator(".solution-panel")).toContainText("D(f)=ℝ²");
      await expect(page.locator(".solution-panel")).toContainText("f_ij=");
    }});
  });
