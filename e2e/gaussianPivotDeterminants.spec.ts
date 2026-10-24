import {test,expect,type Page} from "@playwright/test";
import {laplace,a,q} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {formatRational as f} from "../src/answers";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const families=[
  {id:"determinant-gaussian-pivot-four",pl:"Wyznacznik 4×4: dobór pivota w eliminacji",en:"4×4 determinant: Gaussian pivot selection",n:4},
  {id:"determinant-gaussian-pivot-five",pl:"Wyznacznik 5×5: dobór pivota w eliminacji",en:"5×5 determinant: Gaussian pivot selection",n:5},
] as const;

for(const width of [375,1280])for(const en of [false,true])
test("MT-EDU-019 P0E1 "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Determinants":"Wyznaczniki").click();
  await button(page,en?"Hard":"Trudny").click();

  for(const family of families){
    await page.locator("button.exercise-item").filter({hasText:en?family.en:family.pl}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    const rows=await page.locator(".determinant-display tbody tr").all();
    expect(rows).toHaveLength(family.n);
    const matrix=[];
    for(const row of rows)matrix.push((await row.locator("td").allTextContents()).map(shownFraction));
    expect(matrix.every(row=>row.length===family.n)).toBe(true);
    const result=laplace(matrix);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await page.locator("#answer").fill(f(a(result,q(1))));
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(f(result));
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
