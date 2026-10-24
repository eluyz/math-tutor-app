import {test,expect,type Page} from "@playwright/test";
import {a,m,d,q,laplace} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import type {Rational} from "../src/rational";

type M=Rational[][];
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const product=(A:M,B:M):M=>A.map(row=>B[0].map((_,j)=>row.map((value,k)=>m(value,B[k][j])).reduce(a,q(0))));
const inverse=(A:M):M=>{
  const determinant=laplace(A);
  if(determinant.numerator===0n)throw Error("Generated matrix must be invertible");
  const minor=(i:number,j:number)=>laplace(A.filter((_,k)=>k!==i).map(row=>row.filter((_,k)=>k!==j)));
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),minor(j,i)),determinant)));
};
async function displayed(page:Page):Promise<M[]>{
  const matrices:M[]=[];
  for(const table of await page.locator(".linear-algebra-matrices .given-matrix").all()){
    const matrix:M=[];
    for(const row of await table.locator("tbody tr").all())
      matrix.push((await row.locator("td").allTextContents()).map(shownFraction));
    matrices.push(matrix);
  }
  return matrices;
}
async function fillMatrix(page:Page,X:M){
  for(let i=0;i<X.length;i++)for(let j=0;j<X[i].length;j++)
    await page.locator(i===0&&j===0?"#answer":`#answer-${i}-${j}`).fill(fractionText(X[i][j]));
}

for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0D 3x3 equations "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Hard":"Trudny").click();

  for(const family of [
    {id:"matrix-ax-shift-three",name:en?"Matrix equation AX = 4X + B (3×3)":"Równanie AX = 4X + B (3×3)"},
    {id:"matrix-axb-three",name:en?"Matrix equation AXB = C (3×3)":"Równanie AXB = C (3×3)"},
  ]){
    await page.locator("button.exercise-item").filter({hasText:family.name}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    await expect(page.locator("#answer-2-2")).toBeVisible();

    const matrices=await displayed(page);
    const A=matrices[0],B=matrices[1];
    const X=family.id==="matrix-ax-shift-three"
      ?product(inverse(A.map((row,i)=>row.map((value,j)=>i===j?a(value,q(-4)):value))),B)
      :product(product(inverse(A),matrices[2]),inverse(B));
    expect(X).toHaveLength(3);
    expect(X.every(row=>row.length===3)).toBe(true);

    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await fillMatrix(page,X);
    await page.locator("#answer").fill("999999");
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(fractionText(X[0][0]));
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");

    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
