import {test,expect,type Page} from "@playwright/test";
import {a,m,d,q,s,laplace} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import type {Rational} from "../src/rational";

type M=Rational[][];
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const multiply=(A:M,B:M):M=>A.map(row=>B[0].map((_,j)=>
  row.map((value,k)=>m(value,B[k][j])).reduce(a,q(0))));
const cofactorInverse=(A:M):M=>{
  const determinant=laplace(A);
  if(determinant.numerator===0n)throw Error("Generated coefficient matrix singular");
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),
    laplace(A.filter((_,row)=>row!==j).map(row=>row.filter((_,col)=>col!==i)))),determinant)));
};
async function given(page:Page,index:number):Promise<M>{
  const table=page.locator(".linear-algebra-matrices .given-matrix").nth(index);
  return Promise.all((await table.locator("tbody tr").all()).map(async row=>
    (await row.locator("td").allTextContents()).map(shownFraction)));
}
async function fill(page:Page,X:M){
  for(let i=0;i<X.length;i++)for(let j=0;j<X[i].length;j++)
    await page.locator(i===0&&j===0?"#answer":"#answer-"+i+"-"+j).fill(fractionText(X[i][j]));
}

for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0F2 4×4 matrix equations "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Hard":"Trudny").click();

  const families=[
    {id:"inverse-four-xa-equation",name:en?"Matrix equation XA = B with 4×4 A":"Równanie XA = B z macierzą 4×4"},
    {id:"matrix-ax-shift-four",name:en?"Matrix equation AX = 4X + B (4×4)":"Równanie AX = 4X + B (4×4)"},
  ];
  for(const family of families){
    await page.locator("button.exercise-item").filter({hasText:family.name}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    const A=await given(page,0),B=await given(page,1);
    expect(A).toHaveLength(4);
    expect(A.every(row=>row.length===4)).toBe(true);
    expect(B).toHaveLength(family.id==="inverse-four-xa-equation"?2:4);
    const X=family.id==="inverse-four-xa-equation"
      ?multiply(B,cofactorInverse(A))
      :multiply(cofactorInverse(A.map((row,i)=>row.map((value,j)=>i===j?s(value,q(4)):value))),B);
    expect(X).toHaveLength(family.id==="inverse-four-xa-equation"?2:4);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await fill(page,X);
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
