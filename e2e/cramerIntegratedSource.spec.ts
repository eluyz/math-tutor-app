import { test, expect, type Page } from "@playwright/test";
import { shownFraction } from "./helpers/functions";
import { makeUniversityTask } from "../src/university/catalog";
import { laplace, q, a, m, d, eq } from "../src/university/audit";
import { formatRational as f } from "../src/answers";
import type { Rational } from "../src/rational";
type M=Rational[][];
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
function rank(input:M){
 const mat=input.map(row=>[...row]);let pivot=0;
 for(let j=0;j<mat[0].length&&pivot<mat.length;j++){
  const r=mat.findIndex((row,i)=>i>=pivot&&row[j].numerator!==0n);
  if(r<0)continue;
  [mat[pivot],mat[r]]=[mat[r],mat[pivot]];
  const divisor=mat[pivot][j];
  mat[pivot]=mat[pivot].map(x=>d(x,divisor));
  for(let i=0;i<mat.length;i++)if(i!==pivot){
   const scale=mat[i][j];
   mat[i]=mat[i].map((x,k)=>a(x,m(q(-1),m(scale,mat[pivot][k]))));
  }
  pivot++;
 }
 return pivot;
}
for(const width of [375,1280])for(const en of [false,true])
test("#157 U02 integrated Cramer check+solve "+width+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Systems of equations":"Układy równań").click();
 await button(page,en?"Medium":"Średni").click();
 await page.getByRole("button",{name:en?/Cramer 3×3: decide and solve/:/Cramer 3×3: sprawdź metodę i rozwiąż/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","cramer-eligibility-solve-three");
 const rows:M=[];
 for(const row of await page.locator(".linear-algebra-matrices .given-matrix tbody tr").all())
   rows.push((await row.locator("td").allTextContents()).map(shownFraction));
 expect(rows).toHaveLength(3);
 expect(rows.every(row=>row.length===4)).toBe(true);
 const A=rows.map(row=>row.slice(0,3)),b=rows.map(row=>row[3]);
 const ids=Array.from({length:24},(_,v)=>v).filter(v=>{
   const t=makeUniversityTask("cramer-eligibility-solve-three",v,"medium");
   if(t.university.kind!=="linear-cramer-diagnostic")return false;
   return t.university.matrix.every((row,i)=>row.every((x,j)=>eq(x,A[i][j]))) &&
      t.university.rhs.every((x,i)=>eq(x,b[i]));
 });
 expect(ids).toHaveLength(1);
 const D=laplace(A),ra=rank(A),rab=rank(rows);
 const kind=ra<rab?"system-none":ra===3?"system-one":"system-many";
 expect(D.numerator!==0n).toBe(kind==="system-one");
 await button(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 if(kind==="system-one"){
   await page.locator("#answer").selectOption(kind);
   for(let j=0;j<3;j++)await page.locator("#system-value-"+j).fill("999999");
 }else{
   await page.locator("#answer").selectOption("system-one");
   for(let j=0;j<3;j++)await page.locator("#system-value-"+j).fill("0");
 }
 await button(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 if(kind==="system-one"){
   const values=Array.from({length:3},(_,j)=>d(laplace(A.map((row,i)=>row.map((x,k)=>j===k?b[i]:x))),D));
   for(let j=0;j<3;j++)await page.locator("#system-value-"+j).fill(f(values[j]));
 }else await page.locator("#answer").selectOption(kind);
 await button(page,en?"Check":"Sprawdź").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
 await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
 const result=await page.locator(".solution-panel").innerText();
 expect(result).toContain("D =");
 if(kind==="system-one")expect(result).toContain("D3");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
