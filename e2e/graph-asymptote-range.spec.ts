import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [
 ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]
] as const)
test("F05 P0F two-pole exact range "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
 test.setTimeout(90_000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(!pl)await btn(page,"English").click();
 await btn(page,pl?"Matematyka na studia":"University mathematics").click();
 await btn(page,pl?"Funkcje":"Functions").click();
 await btn(page,pl?plLevel:enLevel).click();
 await page.getByRole("button",{name:pl?/Zbiór wartości wykresu z dwiema asymptotami/:/Range of a graph with two vertical asymptotes/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-asymptote-range");
 const fig=page.locator("figure[data-graph-kind=function-asymptote-range]");
 await expect(fig.locator("svg[role=img]")).toBeVisible();
 await expect(fig.getByTestId("asymptote-left")).toBeVisible();
 await expect(fig.getByTestId("asymptote-right")).toBeVisible();
 await expect(fig.getByTestId("asymptote-middle-path")).toBeVisible();
 await expect(fig.getByTestId("asymptote-outer-segment")).toHaveCount(2);
 const a=Number(await fig.getByTestId("asymptote-left").getAttribute("data-x"));
 const b=Number(await fig.getByTestId("asymptote-right").getAttribute("data-x"));
 expect(a).toBeLessThan(b);
 const options=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
  text:(n as HTMLOptionElement).textContent?.trim(),value:(n as HTMLOptionElement).value
 })).filter(n=>n.value));
 expect(options).toHaveLength(4);
 const expected=options.find(o=>o.value==="asymptote-range:0");
 expect(expected).toBeDefined(); // first sampled variant in UI uses "cross" mode
 const wrong=options.find(o=>o.value!==expected!.value);
 expect(wrong).toBeDefined();
 await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await page.locator("#answer").selectOption(wrong!.value);
 await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(expected!.value);
 await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await btn(page,pl?"Pokaż rozwiązanie":"Show solution").click();
 await btn(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
 await expect(page.locator(".solution-panel")).toContainText(pl?"Zbiór wartości całego wykresu":"Range of the whole graph");
 await fig.locator("summary").click();
 await expect(fig.locator(".function-graph-text p")).toContainText(pl?"Pionowe asymptoty":"Vertical asymptotes");
 if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
