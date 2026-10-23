import {test,expect,type Page} from "@playwright/test";
import {laplace,a,q} from "../src/university/audit";
import {shownFraction} from "./helpers/functions";
import {formatRational as f} from "../src/answers";
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const families=[
 {id:"determinant-strategy-four",pl:/Wyznacznik 4×4: planowana redukcja/,en:/4×4 determinant: planned reduction/,size:4},
 {id:"determinant-strategy-five",pl:/Wyznacznik 5×5: planowana redukcja/,en:/5×5 determinant: planned reduction/,size:5},
] as const;
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-019 P0A "+width+" "+level+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Determinants":"Wyznaczniki").click();
 await button(page,en?enLevel:plLevel).click();
 for(const family of families){
  await page.getByRole("button",{name:en?family.en:family.pl}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const table=page.locator(".determinant-display");
  await expect(table).toBeVisible();
  const rows=await table.locator("tbody tr").all();
  expect(rows).toHaveLength(family.size);
  const matrix=[];
  for(const row of rows)matrix.push(
    (await row.locator("td").allTextContents()).map(shownFraction));
  expect(matrix.every(row=>row.length===family.size)).toBe(true);
  // Derive the answer from the displayed matrix, not from a random pool item.
  const actual=laplace(matrix);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").fill(f(a(actual,q(1))));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").fill(f(actual));
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
