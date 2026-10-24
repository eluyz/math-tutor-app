import {test,expect,type Page} from "@playwright/test";
import {laplace,m,d,q} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import type {Rational} from "../src/rational";

type M=Rational[][];
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
async function shownMatrix(page:Page,index=0):Promise<M>{
  const table=page.locator(".linear-algebra-matrices .given-matrix").nth(index);
  return Promise.all((await table.locator("tbody tr").all()).map(async row=>
    (await row.locator("td").allTextContents()).map(shownFraction)));
}
const cofactor=(A:M):M=>{
  const determinant=laplace(A);
  if(determinant.numerator===0n)throw Error("Matrix singular");
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),
    laplace(A.filter((_,row)=>row!==j).map(row=>row.filter((_,col)=>col!==i)))),determinant)));
};
const multiply=(A:M,B:M):M=>A.map(row=>B[0].map((_,j)=>row.map((x,k)=>m(x,B[k][j])).reduce((s,v)=>
  ({numerator:s.numerator*v.denominator+v.numerator*s.denominator,denominator:s.denominator*v.denominator}),q(0))));
async function fill(page:Page,M:M){
  for(let i=0;i<M.length;i++)for(let j=0;j<M[i].length;j++)
    await page.locator(i===0&&j===0?"#answer":`#answer-${i}-${j}`).fill(fractionText(M[i][j]));
}

for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0F1 inverse 4×4 "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Hard":"Trudny").click();
  const cases=[
    {id:"inverse-four-gauss-jordan",name:en?"4×4 inverse by Gauss–Jordan":"Macierz odwrotna 4×4 metodą Gaussa–Jordana"},
    {id:"inverse-four-ax-equation",name:en?"Matrix equation AX = B with 4×4 A":"Równanie AX = B z macierzą 4×4"},
  ];
  for(const family of cases){
    await page.locator("button.exercise-item").filter({hasText:family.name}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    const A=await shownMatrix(page);
    expect(A).toHaveLength(4);expect(A.every(row=>row.length===4)).toBe(true);
    const determinant=laplace(A);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    if(family.id==="inverse-four-gauss-jordan"&&determinant.numerator===0n){
      await page.locator("#answer").selectOption("inverse-yes");
      await button(page,en?"Check":"Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.locator("#answer").selectOption("inverse-no");
    }else{
      const inv=cofactor(A);
      const X=family.id==="inverse-four-gauss-jordan"?inv:multiply(inv,await shownMatrix(page,1));
      await fill(page,X);
      await page.locator("#answer").fill("999999");
      await button(page,en?"Check":"Sprawdź").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
      await page.locator("#answer").fill(fractionText(X[0][0]));
    }
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(
      family.id==="inverse-four-gauss-jordan"&&determinant.numerator===0n
        ? en?"No inverse":"Brak odwrotności"
        : "A⁻¹");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
