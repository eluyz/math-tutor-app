import {test,expect,type Page} from "@playwright/test";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});

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
    await button(page,family.name).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
    await expect(page.locator("#answer-2-2")).toBeVisible();
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
    await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
    await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
