import {test,expect,type Page} from "@playwright/test";
import {laplace,q,eq} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {formatRational as f} from "../src/answers";
import type {Rational} from "../src/rational";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const targets=[
 {id:"cramer-applicability",pl:/Cramer: czy można zastosować metodę/,en:/Cramer's rule: can you apply it/},
 {id:"cramer-four-singular-minors",pl:/Cramer 4×4: D i D₁–D₄/,en:/Cramer 4×4: D and D₁–D₄/},
] as const;
const choose=(n:number,k:number):number[][]=>
 k===0?[[]]:Array.from({length:n},(_,i)=>choose(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const rank=(A:Rational[][])=>{
 for(let k=Math.min(A.length,A[0].length);k>0;k--)
  for(const rows of choose(A.length,k))for(const cols of choose(A[0].length,k))
   if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;
 return 0;
};
for(const width of [375,1280])for(const en of [false,true])
for(const [level,pl,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-019 P0B "+width+" "+level+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",err=>errors.push(err.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Systems of equations":"Układy równań").click();
 await button(page,en?enLevel:pl).click();
 for(const item of targets){
  await page.getByRole("button",{name:en?item.en:item.pl}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",item.id);
  const table=page.locator(".linear-algebra-matrices .given-matrix");
  await expect(table).toBeVisible();
  const augmented=[];
  for(const row of await table.locator("tbody tr").all())
    augmented.push((await row.locator("td").allTextContents()).map(shownFraction));
  const n=augmented.length;
  expect(n).toBe(item.id==="cramer-four-singular-minors"?4:level==="easy"?2:level==="medium"?3:4);
  const A=augmented.map(row=>row.slice(0,n)),b=augmented.map(row=>row[n]);
  expect(augmented.every(row=>row.length===n+1)).toBe(true);
  const D=laplace(A),Ds=Array.from({length:n},(_,j)=>laplace(A.map((row,i)=>row.map((c,k)=>k===j?b[i]:c))));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(item.id==="cramer-applicability"){
   const ra=rank(A),rb=rank(augmented);
   const classification=ra<rb?"system-none":ra===n?"system-one":"system-many";
   await page.locator("#answer").selectOption(classification==="system-one"?"system-none":"system-one");
   await button(page,en?"Check":"Sprawdź").click();
   await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
   await page.locator("#answer").selectOption(classification);
  }else{
   const values=[D,...Ds].map(f);
   for(let i=0;i<values.length;i++)await page.locator(i===0?"#answer":"#answer-"+i).fill(i===0?"999999":values[i]);
   await button(page,en?"Check":"Sprawdź").click();
   await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
   await page.locator("#answer").fill(values[0]);
   if(D.numerator!==0n)expect(Ds.some(z=>z.numerator!==0n)).toBe(true);
   if(D.numerator===0n && Ds.every(z=>eq(z,q(0))))expect(rank(A)).toBeLessThan(n);
  }
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
