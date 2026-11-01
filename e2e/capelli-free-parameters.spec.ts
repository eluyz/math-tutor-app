import { test, expect, type Page } from "@playwright/test";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});

for(const width of [375,1280])for(const en of [false,true])
test("SYLLABUS U05 Capelli: solution classification and independently derived free parameters "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  await button(page,en?"Systems of equations":"Układy równań").click();
  await button(page,en?"Easy":"Łatwy").click();
  await page.getByRole("button",{name:en?/Kronecker–Capelli: number of free parameters/:/Kronecker–Capelli: liczba parametrów/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","capelli-free-parameters");

  const question=await page.locator(".question").innerText();
  const n=Number(question.match(en?/(\d+) unknowns/:/(\d+) niewiadomych/)?.[1]);
  const ra=Number(question.match(/rank\(A\)\s*=\s*(\d+)/)?.[1]);
  const rab=Number(question.match(/rank\(\[A\|b\]\)\s*=\s*(\d+)/)?.[1]);
  expect(n).toBeGreaterThan(1);
  expect(ra).toBeGreaterThanOrEqual(0);
  expect(rab).toBeGreaterThanOrEqual(ra);
  const kind=ra<rab?"system-none":ra===n?"system-one":"system-many";
  const parameters=kind==="system-none"?"not-applicable":String(n-ra);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");

  await page.locator("#answer").selectOption(kind);
  await page.locator("#answer-parameters").selectOption(parameters==="1"?"2":"1");
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");

  await page.locator("#answer-parameters").selectOption(parameters);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");

  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
