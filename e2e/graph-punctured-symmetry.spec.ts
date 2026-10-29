import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,levelPl,levelEn] of [
  ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]
] as const)
test("F05 P0E punctured even odd "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
 test.setTimeout(90_000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(!pl)await btn(page,"English").click();
 await btn(page,pl?"Matematyka na studia":"University mathematics").click();
 await btn(page,pl?"Funkcje":"Functions").click();
 await btn(page,pl?levelPl:levelEn).click();
 await page.getByRole("button",{name:pl?/Parzystość i nieparzystość z wykresu z dziurami/:/Even and odd symmetry of a graph with holes/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-punctured-symmetry");
 const fig=page.locator("figure[data-graph-kind=function-punctured-symmetry]");
 await expect(fig.locator("svg[role=img]")).toBeVisible();
 await expect(fig.getByTestId("punctured-segment")).toHaveCount(4);
 const pts:{x:number;y:number;inc:boolean}[]=[];
 for(let i=0;i<5;i++){const n=fig.getByTestId("punctured-node-"+i);
  pts.push({x:Number(await n.getAttribute("data-x")),y:Number(await n.getAttribute("data-y")),
    inc:(await n.getAttribute("data-included"))==="true"});}
 expect(pts[0].x).toBe(-pts[4].x);
 expect(pts[1].x).toBe(-pts[3].x);
 const domain=pts[0].inc===pts[4].inc&&pts[1].inc===pts[3].inc;
 const even=domain&&pts[0].y===pts[4].y&&pts[1].y===pts[3].y;
 const odd=domain&&pts[0].y===-pts[4].y&&pts[1].y===-pts[3].y&&pts[2].y===0;
 const verdict=even?"even":odd?"odd":"neither";
 const choices=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
  value:(n as HTMLOptionElement).value,text:(n as HTMLOptionElement).textContent?.trim()
 })).filter(n=>n.value));
 expect(choices).toHaveLength(3);
 const expected=choices.find(c=>c.value===verdict),wrong=choices.find(c=>c.value!==verdict);
 expect(expected).toBeDefined();expect(wrong).toBeDefined();
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
 await expect(page.locator(".solution-panel")).toContainText(pl?"Klasyfikacja":"Classification");
 await fig.locator("summary").click();
 await expect(fig.locator(".function-graph-text p")).toContainText(pl?"Puste punkty":"Hollow points");
 if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
