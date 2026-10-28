import { test, expect, type Page } from "@playwright/test";
import { polishLearningText } from "./helpers/localization";
const btn=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});

for(const width of [375,1280])for(const pl of [true,false])
for(const [level,levelPl,levelEn] of [
  ["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]
] as const)
test("F05 graphical one-to-one horizontal-line test "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:860});await page.goto("/");
  if(!pl)await btn(page,"English").click();
  await btn(page,pl?"Matematyka na studia":"University mathematics").click();
  await btn(page,pl?"Funkcje":"Functions").click();
  await btn(page,pl?levelPl:levelEn).click();
  await page.getByRole("button",{name:pl?/Różnowartościowość z wykresu/:/One-to-one graph test/}).click();
  const question=page.locator(".question");
  await expect(question).toHaveAttribute("data-template-id","function-graph-injectivity");
  const figure=page.locator("figure.function-graph");
  await expect(figure.locator("[data-testid=graph-path]")).toBeVisible();
  const desc=await figure.locator("svg desc").textContent()||"";
  const coords=[...desc.matchAll(/\(([-−]?\d+), ([-−]?\d+)\)/g)].map(m=>({
    x:Number(m[1].replace("−","-")),y:Number(m[2].replace("−","-"))
  }));
  expect(coords).toHaveLength(3);
  const slopes=[coords[1].y-coords[0].y,coords[2].y-coords[1].y];
  const expected=slopes[0]*slopes[1]>0?"injective":"not-injective";
  const options=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
    text:(n as HTMLOptionElement).textContent?.trim(),
    value:(n as HTMLOptionElement).value,
  })).filter(o=>o.value));
  expect(options).toHaveLength(2);
  const expectedLabel=expected==="injective"?
    pl?"Tak — każda prosta pozioma przecina wykres najwyżej raz.":"Yes — every horizontal line meets the graph at most once.":
    pl?"Nie — istnieje prosta pozioma przecinająca wykres co najmniej dwa razy.":"No — some horizontal line meets the graph at least twice.";
  const correct=options.find(o=>o.text===expectedLabel);
  expect(correct).toBeDefined();
  const wrong=options.find(o=>o.value!==correct?.value);
  expect(wrong).toBeDefined();
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption(wrong!.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(correct!.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,pl?"Pokaż rozwiązanie":"Show solution").click();
  await btn(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
  await expect(page.locator(".solution-panel")).toContainText(pl?"prostej":"horizontal");
  await figure.locator("summary").click();
  await expect(figure.locator(".function-graph-text p")).toContainText(pl?"Lewy koniec":"Left endpoint");
  if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});