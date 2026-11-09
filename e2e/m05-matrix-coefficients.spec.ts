import { expect, test, type Page } from "@playwright/test";
import { parseAnswer, rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, type Rational } from "../src/rational";
import { formatRational as format } from "../src/answers";

type Mat = Rational[][];
const plus = (a: Mat,b: Mat):Mat=>a.map((row,i)=>row.map((v,j)=>add(v,b[i][j])));
const minus = (a: Mat,b: Mat):Mat=>a.map((row,i)=>row.map((v,j)=>sub(v,b[i][j])));
const product = (a: Mat,b: Mat):Mat=>a.map(row=>b[0].map((_,j)=>
  row.reduce((sum,v,k)=>add(sum,mul(v,b[k][j])),r(0))));
const eq=(a: Rational,b: Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const same=(a:Mat,b:Mat)=>a.every((row,i)=>row.every((v,j)=>eq(v,b[i][j])));
const identity:Mat=[[r(1),r(0)],[r(0),r(1)]];

/** Read the mathematical coefficients from the public question, not task.answer. */
function visibleMatrices(text: string): Record<"A"|"B"|"C"|"D",Mat> {
  const entries = [...text.matchAll(/\b([ABCD])=(\[\[[^\]]+\];\s*\[[^\]]+\]\])/g)];
  expect(entries.map(m=>m[1])).toEqual(["A","B","C","D"]);
  const matrices = Object.fromEntries(entries.map(m=>[m[1],
    m[2].slice(2,-2).split(/\];\s*\[/).map(row=>row.split(",").map(cell=>{
      const parsed=parseAnswer(cell.trim());
      if(parsed.kind!=="valid")throw Error("Invalid displayed matrix cell "+cell);
      return parsed.value;
    }))])) as Record<"A"|"B"|"C"|"D",Mat>;
  for(const value of Object.values(matrices)){
    expect(value).toHaveLength(2);
    expect(value[0]).toHaveLength(2);
    expect(value[1]).toHaveLength(2);
  }
  return matrices;
}

/** Exact explicit 2x2 formula, independent of the app's Gaussian inverse. */
function inverse2(a:Mat):Mat {
  const d=sub(mul(a[0][0],a[1][1]),mul(a[0][1],a[1][0]));
  expect(d.numerator).not.toBe(0n);
  return [[div(a[1][1],d),div(mul(r(-1),a[0][1]),d)],
          [div(mul(r(-1),a[1][0]),d),div(a[0][0],d)]];
}
function expectedFromVisible(text:string):Rational[] {
  const {A,B,C,D}=visibleMatrices(text);
  expect(same(product(A,B),product(B,A))).toBe(false);
  const X=product(inverse2(minus(identity,product(A,B))),minus(C,product(A,D)));
  const Y=minus(D,product(B,X));
  expect(same(plus(X,product(A,Y)),C)).toBe(true);
  expect(same(plus(product(B,X),Y),D)).toBe(true);
  return [...X.flat(),...Y.flat()];
}

async function open(page:Page,en:boolean,width:number){
  await page.setViewportSize({width,height:950});
  await page.goto("/");
  if(en)await page.getByRole("button",{name:"English",exact:true}).click();
  await page.getByRole("button",{name:en?"University mathematics":"Matematyka na studia",exact:true}).click();
  await page.getByRole("button",{name:en?"Matrices":"Macierze",exact:true}).click();
  await page.getByRole("button",{name:en?"Medium":"Średni",exact:true}).click();
  const title=en?"Coupled equations with matrix coefficients":"Układ równań z macierzami przy X i Y";
  const item=page.locator(".exercise-list-items button.exercise-item").filter({hasText:title});
  await expect(item).toHaveCount(1);
  await item.click();
}
for(const width of [375,1280])for(const en of [false,true])
  test("M05 matrix coefficient visible oracle "+width+" "+(en?"EN":"PL"),async({page})=>{
    test.setTimeout(110000);
    const errors:string[]=[];page.on("pageerror",err=>errors.push(err.message));
    await open(page,en,width);
    await expect(page.locator(".question")).toHaveAttribute(
      "data-template-id","matrix-coefficient-coupled-equations");
    const expected=expectedFromVisible(await page.locator(".question").innerText());
    const inputs=page.locator("form .coefficient-field input");
    await expect(inputs).toHaveCount(8);
    const check=page.getByRole("button",{name:en?"Check":"Sprawdź",exact:true});
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    for(let i=0;i<8;i++)await inputs.nth(i).fill(format(expected[i]));
    await inputs.first().fill(format(add(expected[0],r(1))));
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await inputs.first().fill(format(expected[0]));
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await page.getByRole("button",{name:en?"Show solution":"Pokaż rozwiązanie",exact:true}).click();
    await page.getByRole("button",{name:en?"Show all steps":"Pokaż wszystkie kroki",exact:true}).click();
    await expect(page.locator(".solution-panel")).toContainText("I−AB");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
