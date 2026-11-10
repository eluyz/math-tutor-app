import {test,expect,type Page} from "@playwright/test";
import {a,m,d,laplace,q} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import type {Rational} from "../src/rational";
type Matrix=Rational[][];
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
async function visibleMatrix(page:Page,index=0):Promise<Matrix>{
  const matrix=page.locator(".linear-algebra-matrices .given-matrix").nth(index);
  return Promise.all((await matrix.locator("tbody tr").all()).map(async row=>
    (await row.locator("td").allTextContents()).map(shownFraction)));
}
/** Cofactor oracle from rendered public coefficients, not task.answer or solver. */
function inverse(A:Matrix):Matrix{
  const D=laplace(A);expect(D.numerator).not.toBe(0n);
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),
    laplace(A.filter((_,row)=>row!==j)
      .map(row=>row.filter((_,col)=>col!==i)))),D)));
}
const mul=(A:Matrix,B:Matrix):Matrix=>
  A.map(row=>B[0].map((_,j)=>row.map((v,k)=>m(v,B[k][j])).reduce(a,q(0))));
async function fillMatrix(page:Page,A:Matrix){
  for(let i=0;i<A.length;i++)
    for(let j=0;j<A[i].length;j++)
      await page.locator(i===0&&j===0?"#answer":`#answer-${i}-${j}`).fill(fractionText(A[i][j]));
}
async function verify(page:Page,en:boolean,ans:Matrix,step:string){
  const check=button(page,en?"Check":"Sprawdź");
  await expect(page.locator(".matrix-grid input")).toHaveCount(9);
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await fillMatrix(page,ans);
  await page.locator("#answer").fill(fractionText(a(ans[0][0],q(1))));
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await button(page,en?"Show another hint":"Pokaż kolejną podpowiedź").click();
  await expect(page.locator(".learning-hint").last()).not.toBeEmpty();
  await page.locator("#answer").fill("1/0");
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(fractionText(ans[0][0]));
  await check.click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(step);
}
for(const width of [375,1280])for(const en of [false,true])
test("M12+M13 source-shaped 3x3 inverse and XA=B "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(125000);
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:950});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Hard":"Trudny").click();

  // M12 P05/1b–h — 3×3 inverse shape, verified by independent cofactors.
  const inverseFamily=page.locator(".exercise-list-items button.exercise-item")
    .filter({hasText:en?"Inverse matrix 3×3":"Macierz odwrotna 3×3"});
  await expect(inverseFamily).toHaveCount(1);
  await inverseFamily.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","inverse-three");
  const inverseA=await visibleMatrix(page);
  expect(inverseA).toHaveLength(3);
  expect(inverseA.every(row=>row.length===3)).toBe(true);
  await verify(page,en,inverse(inverseA),"A⁻¹");

  // M13 P05/2b — full 3×3 XA=B, not legacy 2×3 X.
  const xaFamily=page.locator(".exercise-list-items button.exercise-item")
    .filter({hasText:en?"Matrix equation XA = B: full 3×3 matrices":
      "Równanie XA = B: pełne macierze 3×3"});
  await expect(xaFamily).toHaveCount(1);
  await xaFamily.click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","inverse-right-source-three");
  const A=await visibleMatrix(page),B=await visibleMatrix(page,1);
  expect(A).toHaveLength(3);expect(B).toHaveLength(3);
  expect(A.every(row=>row.length===3)&&B.every(row=>row.length===3)).toBe(true);
  const X=mul(B,inverse(A));
  expect(X).toHaveLength(3);expect(X.every(row=>row.length===3)).toBe(true);
  await verify(page,en,X,"BA⁻¹");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});