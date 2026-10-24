import {test,expect,type Page} from "@playwright/test";
import {laplace,a,m,d,q,eq} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import type {Rational} from "../src/rational";

type Matrix=Rational[][];
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const subsets=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>subsets(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const rank=(A:Matrix)=>{
  for(let k=Math.min(A.length,A[0].length);k>=1;k--)
    for(const rows of subsets(A.length,k))for(const cols of subsets(A[0].length,k))
      if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;
  return 0;
};
async function augmented(page:Page):Promise<Matrix>{
  const table=page.locator(".linear-algebra-matrices .given-matrix").first();
  return Promise.all((await table.locator("tbody tr").all()).map(async row=>
    (await row.locator("td").allTextContents()).map(shownFraction)));
}
const families=[
  {id:"cramer-four-forced-pivot",pl:"Cramer 4×4: niezerowy wyznacznik mimo A₁₁=0",en:"Cramer 4×4: nonzero determinant despite A₁₁=0"},
  {id:"gauss-four-forced-pivot",pl:"Gauss 4×4: obowiązkowa zamiana wierszy",en:"Gauss 4×4: required row swap"},
  {id:"gauss-four-dependent-diagnostic",pl:"Gauss 4×4: rozwiązanie jedno, brak lub nieskończenie wiele",en:"Gauss 4×4: one, none or infinitely many solutions"},
];
for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0G "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Systems of equations":"Układy równań").click();
  await button(page,en?"Hard":"Trudny").click();

  for(const family of families){
    await page.locator("button.exercise-item").filter({hasText:en?family.en:family.pl}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    const data=await augmented(page),A=data.map(row=>row.slice(0,4)),B=data.map(row=>row[4]);
    expect(A).toHaveLength(4);
    expect(data.every(row=>row.length===5)).toBe(true);
    expect(A[0][0].numerator).toBe(0n);
    const ra=rank(A),rab=rank(data);
    const kind=ra<rab?"system-none":ra===4?"system-one":"system-many";
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    if(kind==="system-one"){
      const D=laplace(A);
      expect(D.numerator).not.toBe(0n);
      const values=Array.from({length:4},(_,j)=>
        d(laplace(A.map((row,i)=>row.map((c,k)=>j===k?B[i]:c))),D));
      for(let i=0;i<4;i++)
        expect(eq(A[i].map((v,j)=>m(v,values[j])).reduce(a,q(0)),B[i])).toBe(true);
      await page.locator("#answer").selectOption("system-one");
      for(let j=0;j<4;j++)await page.locator("#system-value-"+j).fill(j===0?"99999":fractionText(values[j]));
      await button(page,en?"Check":"Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.locator("#system-value-0").fill(fractionText(values[0]));
    }else{
      await page.locator("#answer").selectOption("system-one");
      await button(page,en?"Check":"Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.locator("#answer").selectOption(kind);
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
