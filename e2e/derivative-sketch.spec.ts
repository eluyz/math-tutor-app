import { test, expect, type Page } from "@playwright/test";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});

for(const width of [375,1280])for(const english of [false,true])
for(const [level,plLevel,enLevel] of [
  ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"],
] as const)
test("MT-SYLLABUS-D09 sign-chart paper sketch "+level+" "+width+"px "+(english?"EN":"PL"), async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(english)await button(page,"English").click();
  await button(page,english?"University mathematics":"Matematyka na studia").click();
  await button(page,english?"Derivatives":"Pochodne").click();
  await button(page,english?enLevel:plLevel).click();
  const title=english?"Sketch from derivative sign charts — on paper"
    :"Szkic funkcji z tabeli znaków pochodnych — na kartce";
  await page.locator("button.exercise-item").filter({
    has:page.locator("strong").getByText(title,{exact:true}),
  }).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","derivative-sign-sketch");
  const sheet=page.locator("figure[data-sketch-kind=derivative-sign-sketch]");
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("table tbody tr")).toHaveCount(2);
  await expect(sheet.locator("table thead th")).toHaveCount(5);
  const a=Number(await sheet.getAttribute("data-pole"));
  const s=Number(await sheet.getAttribute("data-radius"));
  const y=Number(await sheet.getAttribute("data-shift"));
  const e=Number(await sheet.getAttribute("data-orientation"));
  expect(Number.isInteger(a)).toBe(true);
  expect([1,2,3]).toContain(s);
  expect([1,-1]).toContain(e);
  const first=await sheet.locator("tbody tr").first().locator("td").allTextContents();
  const second=await sheet.locator("tbody tr").nth(1).locator("td").allTextContents();
  const outer=e===1?"+":"−",inner=e===1?"−":"+";
  expect(first.map(x=>x.trim())).toEqual([outer,inner,inner,outer]);
  expect(second.map(x=>x.trim())).toEqual([inner,inner,outer,outer]);
  // The reference must be initially hidden: the student draws on paper first.
  const details=sheet.locator("details.sketch-reference");
  await expect(details).not.toHaveAttribute("open",/./);
  const expected=[a-s,y-2*e*s,a+s,y+2*e*s];
  await button(page,english?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  for(let i=0;i<4;i++)
    await page.locator(i===0?"#answer":"#answer-"+i).fill(String(expected[i]+(i===0?1:0)));
  await button(page,english?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  for(let i=0;i<4;i++)
    await page.locator(i===0?"#answer":"#answer-"+i).fill(String(expected[i]));
  await button(page,english?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,english?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,english?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText("f″");
  await sheet.locator("summary").click();
  await expect(details).toHaveAttribute("open","");
  await expect(details.locator("svg[role=img]")).toBeVisible();
  await expect(details.getByTestId("sketch-branch-left")).toBeVisible();
  await expect(details.getByTestId("sketch-branch-right")).toBeVisible();
  await expect(details.getByTestId("sketch-oblique")).toBeVisible();
  await expect(sheet).toContainText(english?"not the quality of your drawing":"nie jakość rysunku");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});