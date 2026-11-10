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
      for(const cols of choose(matrix[0].length,k))
        if(laplace(rows.map(i=>cols.map(j=>matrix[i][j]))).numerator!==0n)return k;
  return 0;
}
const cases=[
  {id:"matrix-rank-four-two",n:2,pl:"Rząd macierzy 4×2",en:"Rank of a 4×2 matrix"},
  {id:"matrix-rank-four-three",n:3,pl:"Rząd macierzy 4×3",en:"Rank of a 4×3 matrix"},
] as const;

for(const width of [375,1280])for(const en of [false,true])
  test("M14 original rank shapes 4x2/4x3 "+width+" "+(en?"EN":"PL"),async({page})=>{
    test.setTimeout(120000);
    const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
    await page.setViewportSize({width,height:950});
    await page.goto("/");
    if(en)await button(page,"English").click();
    await button(page,en?"University mathematics":"Matematyka na studia").click();
    await button(page,en?"Matrices":"Macierze").click();
    await button(page,en?"Hard":"Trudny").click();
    for(const item of cases){
      await page.locator(".exercise-list-items button.exercise-item")
        .filter({hasText:en?item.en:item.pl}).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id",item.id);
      const shown=page.locator(".linear-algebra-matrices .given-matrix").first();
      const matrix=await Promise.all((await shown.locator("tbody tr").all())
        .map(async row=>(await row.locator("td").allTextContents()).map(shownFraction)));
      expect(matrix).toHaveLength(4);
      expect(matrix.every(row=>row.length===item.n)).toBe(true);
      const answer=rankByMinors(matrix);
      await button(page,en?"Check":"Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
      await page.locator("#answer").fill(String((answer+1)%(item.n+1)));
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