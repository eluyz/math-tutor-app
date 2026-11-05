import {test,expect,type Page} from "@playwright/test";
import {batchF,batchFOracle,batchFCertificate,wrongBatchF} from "../src/qa/batchF";
import {runPinnedAcceptance} from "./helpers/acceptance";
import type {makeUniversityTask} from "../src/university/catalog";
const clean=(s:string)=>s.replace(/\s/g,"").replaceAll("-","−");
async function inspect(page:Page,task:ReturnType<typeof makeUniversityTask>){
 const cert=batchFCertificate(task),panel=clean(await page.locator(".solution-panel").innerText());
 for(const anchors of cert.anchors)for(const anchor of anchors)expect(panel).toContain(clean(anchor));
 const p=task.university;
 if(p.kind!=="derivative-sign-sketch")return;
 const chart=page.locator(".sketch-sign-chart"),a=p.pole,s=p.radius,v=p.verticalShift,e=p.orientation;
 const first=cert.firstSigns!.map(x=>x>0?"+":"−"),second=cert.secondSigns!.map(x=>x>0?"+":"−");
 const table=chart.locator("table");
 expect(await table.locator("tbody tr").nth(0).locator("td").allTextContents()).toEqual(first);
 expect(await table.locator("tbody tr").nth(1).locator("td").allTextContents()).toEqual([second[0],second[0],second[1],second[1]]);
 const headers=await table.locator("thead th").allTextContents();
 expect(headers.map(clean)).toEqual(["x",`(−∞;${a-s})`,`(${a-s};${a})`,`(${a};${a+s})`,`(${a+s};+∞)`].map(clean));
 if(!(await chart.locator("details").evaluate(node=>node.hasAttribute("open"))))await chart.locator("summary").click();
 await expect(chart.locator("svg")).toBeVisible();
 const expected=cert.input;if(typeof expected==="string"||expected.kind!=="list")throw Error("Coordinates expected");
 // Independent inverse viewport map: two branches, both extrema and oblique
 // line. Pixel tolerance only covers SVG two-decimal rendering, never calculus.
 const px=(x:number)=>26+(x-(a-4*s))*440/(8*s),py=(y:number)=>260-(y-(v-5*s))*240/(10*s);
 for(const [id,x,y] of [["left",a-s,v-2*e*s],["right",a+s,v+2*e*s]] as const){
  const dot=chart.getByTestId(`sketch-${id}-extremum`);
  expect(Number(await dot.getAttribute("cx"))).toBeCloseTo(px(x),8);
  expect(Number(await dot.getAttribute("cy"))).toBeCloseTo(py(y),8);
 }
 for(const [branch,left] of [["left",true],["right",false]] as const){
  const points=(await chart.getByTestId(`sketch-branch-${branch}`).getAttribute("points"))!.trim().split(/\s+/).map(x=>x.split(",").map(Number));
  expect(points).toHaveLength(45);
  for(const [cx,cy] of points){
   const x=a-4*s+(cx-26)*(8*s)/440,t=x-a;
   expect(left?t<0:t>0).toBe(true);
   expect(Math.abs(cy-py(e*(t+s*s/t)+v))).toBeLessThan(0.05);
  }
 }
 const oblique=chart.getByTestId("sketch-oblique");
 for(const [side,x] of [["1",a-4*s],["2",a+4*s]] as const){
  expect(Number(await oblique.getAttribute("x"+side))).toBeCloseTo(px(x),8);
  expect(Number(await oblique.getAttribute("y"+side))).toBeCloseTo(py(e*(x-a)+v),8);
 }
 await expect(chart.locator("figcaption")).toContainText(/jakość rysunku|quality of your drawing/);
 // Exposes the exact independent numerical values in CI's witness attachment.
 await test.info().attach("independent-sketch",{body:JSON.stringify({id:task.id,first:cert.firstSigns,second:cert.secondSigns,coordinates:expected.values}),contentType:"application/json"});
}
for(const width of [375,1280])for(const locale of ["pl","en"] as const)for(const row of batchF){
 test(`${row.skills.join("/")} ${row.family}/${row.level} ${locale} ${width}px`,async({page},info)=>{
  await runPinnedAcceptance(page,info,row,locale,width,batchFOracle,wrongBatchF,{inspectPinned:inspect});
  if(locale==="en")expect(await page.locator("main").innerText()).not.toMatch(/\b(gdy|lub)\b/iu);
 });
}
