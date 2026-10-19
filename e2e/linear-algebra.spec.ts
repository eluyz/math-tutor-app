import { test, expect, type Page } from "@playwright/test";
import { a,m,d,eq,laplace,q } from "../src/university/audit";
import { shownFraction } from "./helpers/functions";
import { fractionText } from "./helpers/systems";
import { polishLearningText } from "./helpers/localization";
import type { Rational } from "../src/rational";
const combinations=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>combinations(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const rank=(A:Rational[][])=>{for(let k=Math.min(A.length,A[0].length);k>0;k--)for(const rows of combinations(A.length,k))for(const cols of combinations(A[0].length,k))if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;return 0;};
async function shownMatrix(page:Page,index=0){
  const table=page.locator(".linear-algebra-matrices .given-matrix").nth(index);
  return Promise.all((await table.locator("tbody tr").all()).map(async row=>(await row.locator("td").allTextContents()).map(shownFraction)));
}
const inverse=(A:Rational[][])=>{
  const D=laplace(A);if(D.numerator===0n)throw Error("Expected invertible matrix");
  const minor=(i:number,j:number)=>laplace(A.filter((_,r)=>r!==i).map(row=>row.filter((_,c)=>c!==j)));
  return A.map((_,i)=>A.map((_,j)=>d(m(q((i+j)%2?-1:1),minor(j,i)),D)));
};
async function fillMatrix(page:Page,A:Rational[][]){
  for(let i=0;i<A.length;i++)for(let j=0;j<A[i].length;j++)await page.locator(i===0&&j===0?"#answer":`#answer-${i}-${j}`).fill(fractionText(A[i][j]));
}
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
for(const width of [375,768,1280])for(const en of [false,true])test(`MT-EDU-006B ${width}px ${en?"EN":"PL"}: inverse, rank, Gaussian answer and responsive bilingual UI`,async({page})=>{
  test.setTimeout(120_000);
  await page.setViewportSize({width,height:900});
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Easy":"Łatwy").click();
  await page.getByRole("button",{name:/Inverse matrix 2×2|Macierz odwrotna 2×2/}).click();
  let A=await shownMatrix(page);
  const inv=inverse(A);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await fillMatrix(page,inv.map(row=>row.map(()=>q(999))));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await fillMatrix(page,inv);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("A⁻¹");
  await button(page,en?"Medium":"Średni").click();
  await page.getByRole("button",{name:/Matrix rank|Rząd macierzy/}).click();
  A=await shownMatrix(page);
  expect(A).toHaveLength(2);expect(A[0]).toHaveLength(3);
  await page.locator("#answer").fill(String(rank(A)));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Systems of equations":"Układy równań").click();
  await button(page,en?"Advanced":"Zaawansowany").click();
  await page.getByRole("button",{name:/Gaussian elimination: find the unknowns|Eliminacja Gaussa: wyznacz niewiadome/}).click();
  const augmented=await shownMatrix(page),n=4;
  expect(augmented).toHaveLength(n);expect(augmented[0]).toHaveLength(n+1);
  const coefficients=augmented.map(row=>row.slice(0,n)),rhs=augmented.map(row=>row[n]);
  const D=laplace(coefficients);expect(D.numerator).not.toBe(0n);
  const xs=Array.from({length:n},(_,j)=>d(laplace(coefficients.map((row,i)=>row.map((c,k)=>k===j?rhs[i]:c))),D));
  for(let i=0;i<n;i++)expect(eq(coefficients[i].map((c,j)=>m(c,xs[j])).reduce(a,q(0)),rhs[i])).toBe(true);
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption("system-one");
  for(let i=0;i<n;i++)await page.locator(`#system-value-${i}`).fill(i===0?"999":fractionText(xs[i]));
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#system-value-0").fill(fractionText(xs[0]));
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("rank(A)");
  if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

const multiply=(A:Rational[][],B:Rational[][])=>A.map(row=>B[0].map((_,j)=>row.map((c,k)=>m(c,B[k][j])).reduce(a,q(0))));
for(const width of [375,768,1280])for(const en of [false,true])test(`MT-EDU-006B P3 ${width}px ${en?"EN":"PL"}: XA=B and four-variable Cramer`,async({page})=>{
  test.setTimeout(60_000);
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Matrices":"Macierze").click();
  await button(page,en?"Advanced":"Zaawansowany").click();
  await page.getByRole("button",{name:/Matrix equation XA = B|Równanie macierzowe XA = B/}).click();
  const A=await shownMatrix(page),B=await shownMatrix(page,1),X=multiply(B,inverse(A));
  await fillMatrix(page,X);await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("BA⁻¹");
  await button(page,en?"Systems of equations":"Układy równań").click();
  await page.getByRole("button",{name:/Cramer's rule: four unknowns|Reguła Cramera: cztery niewiadome/}).click();
  let augmented=await shownMatrix(page),coefficients=augmented.map(row=>row.slice(0,4)),D=laplace(coefficients);
  for(let attempts=0;D.numerator===0n&&attempts<24;attempts++){
    await button(page,en?"New example":"Nowy przykład").click();
    augmented=await shownMatrix(page);coefficients=augmented.map(row=>row.slice(0,4));D=laplace(coefficients);
  }
  expect(D.numerator).not.toBe(0n);
  const rhs=augmented.map(row=>row[4]);
  const values=Array.from({length:4},(_,j)=>d(laplace(coefficients.map((row,i)=>row.map((c,k)=>k===j?rhs[i]:c))),D));
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption("system-one");
  for(let i=0;i<4;i++)await page.locator(`#system-value-${i}`).fill(i===0?"999":fractionText(values[i]));
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#system-value-0").fill(fractionText(values[0]));
  await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("D4");
  if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

for(const en of [false,true])test(`MT-EDU-006B ${en?"EN":"PL"}: all rank classifications, language switch and scratchpad Undo`,async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:375,height:900});await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Systems of equations":"Układy równań").click();
  await button(page,en?"Advanced":"Zaawansowany").click();
  await page.getByRole("button",{name:/Gaussian elimination: classify|Eliminacja Gaussa: klasyfikacja/}).click();
  const seen=new Set<string>();
  for(let i=0;i<24&&seen.size<3;i++){
    const aug=await shownMatrix(page),n=aug[0].length-1;
    const A=aug.map(row=>row.slice(0,n)),ra=rank(A),rab=rank(aug);
    const expected=ra<rab?"system-none":ra===n?"system-one":"system-many";
    seen.add(expected);
    if(i===0){
      await button(page,en?"Show scratchpad":"Pokaż brudnopis").click();
      await button(page,en?"Write":"Pisz").click();
      const notes=page.locator("#scratchpad-text");
      await notes.pressSequentially("rank A = 2");
      await notes.press("ControlOrMeta+a");await notes.press("Backspace");await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("rank A = 2");
      const run=await page.locator(".question").getAttribute("data-exercise-run");
      await page.locator("#answer").selectOption(expected);
      await button(page,en?"Polski":"English").click();
      await expect(page.locator(".question")).toHaveAttribute("data-exercise-run",run!);
      await expect(page.locator("#answer")).toHaveValue(expected);
      await expect(notes).toHaveValue("rank A = 2");
      await button(page,en?"English":"Polski").click();
      await button(page,en?"Hide scratchpad":"Schowaj brudnopis").click();
    }
    await page.locator("#answer").selectOption(expected==="system-one"?"system-none":"system-one");
    await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").selectOption(expected);
    await button(page,en?"Check":"Sprawdź").click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    const solution=await page.locator(".solution-panel").innerText();
    if(expected==="system-none")expect(solution).toContain("0 =");
    if(expected==="system-many")expect(solution).toContain("t1");
    await button(page,en?"New example":"Nowy przykład").click();
  }
  expect(seen).toEqual(new Set(["system-one","system-none","system-many"]));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
