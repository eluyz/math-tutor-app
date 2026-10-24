import {test,expect,type Page} from "@playwright/test";
import {laplace} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import type {Rational} from "../src/rational";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const choose=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>choose(n-i-1,k-1).map(other=>[i,...other.map(j=>i+j+1)])).flat();
function rankByMinors(matrix:Rational[][]):number{
  for(let k=Math.min(matrix.length,matrix[0].length);k>0;k--)
    for(const rows of choose(matrix.length,k))
      for(const columns of choose(matrix[0].length,k))
        if(laplace(rows.map(i=>columns.map(j=>matrix[i][j]))).numerator!==0n)return k;
  return 0;
}
const cases=[
  {id:"matrix-rank-four-square",n:4,pl:"Rząd macierzy 4×4: pivoty i zależne wiersze",en:"4×4 matrix rank: pivots and dependent rows"},
  {id:"matrix-rank-four-rectangular",n:5,pl:"Rząd macierzy 4×5: pivoty i kolumny swobodne",en:"4×5 matrix rank: pivots and free columns"},
] as const;

for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0E2 "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Hard":"Trudny").click();
  for(const item of cases){
    await page.locator("button.exercise-item").filter({hasText:en?item.en:item.pl}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",item.id);
    const table=page.locator(".linear-algebra-matrices .given-matrix").first();
    const matrix=await Promise.all((await table.locator("tbody tr").all())
      .map(async row=>(await row.locator("td").allTextContents()).map(shownFraction)));
    expect(matrix).toHaveLength(4);
    expect(matrix.every(row=>row.length===item.n)).toBe(true);
    const answer=rankByMinors(matrix);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await page.locator("#answer").fill(String((answer+1)%5));
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(String(answer));
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText("rank(A)");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});