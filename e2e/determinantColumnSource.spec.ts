import { test, expect, type Page } from "@playwright/test";
import { makeUniversityTask } from "../src/university/catalog";
import { q,m,s,d,eq } from "../src/university/audit";
import { formatRational as f } from "../src/answers";
import { shownFraction } from "./helpers/functions";
import type { Rational } from "../src/rational";
type M=Rational[][];
function gaussian(input:M):Rational{
  const a=input.map(row=>[...row]);let sign=q(1);
  for(let k=0;k<a.length;k++){
    const pivot=a.findIndex((row,i)=>i>=k&&row[k].numerator!==0n);
    if(pivot<0)return q(0);
    if(pivot!==k){[a[k],a[pivot]]=[a[pivot],a[k]];sign=m(sign,q(-1));}
    for(let i=k+1;i<a.length;i++){const f=d(a[i][k],a[k][k]);
      for(let j=k;j<a.length;j++)a[i][j]=s(a[i][j],m(f,a[k][j]));}
  }
  return a.reduce((product,row,i)=>m(product,row[i]),sign);
}
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
for(const width of [375,1280])for(const en of [false,true])
test("#156 M08 source column UI "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width,height:900});
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Determinants":"Wyznaczniki").click();
  await button(page,en?"Hard":"Trudny").click();
  await page.getByRole("button",{name:en?/Laplace 4×4 — zeros in the third column/:/Laplace 4×4 — zera w trzeciej kolumnie/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","determinant-laplace-column-three");
  const matrix:M=[];
  for(const row of await page.locator(".determinant-display tbody tr").all())
    matrix.push((await row.locator("td").allTextContents()).map(shownFraction));
  expect(matrix).toHaveLength(4);
  expect(matrix.every(row=>row.length===4)).toBe(true);
  expect(matrix.slice(0,3).every(row=>row[2].numerator===0n)).toBe(true);
  expect(matrix[3][2].numerator).not.toBe(0n);
  // Identify the exact generated variant from displayed cells, not random assumptions.
  const matches=Array.from({length:24},(_,v)=>v).filter(v=>{
    const task=makeUniversityTask("determinant-laplace-column-three",v,"hard");
    if(task.university.kind!=="determinant")return false;
    return task.university.matrix.every((row,i)=>row.every((x,j)=>eq(x,matrix[i][j])));
  });
  expect(matches).toHaveLength(1);
  const value=gaussian(matrix);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(f(s(value,q(1))));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(value));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  const solution=await page.locator(".solution-panel").innerText();
  expect(solution).toContain("C43");
  expect(solution).toMatch(en?/column 3/:/kolumna 3/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
