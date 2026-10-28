import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
type Pt={x:number;y:number;included:boolean};
function hasDuplicateAtY(p:Pt[],y:number):boolean {
  const points:number[]=[];
  for(const [u,v] of [[p[0],p[1]],[p[1],p[2]],[p[3],p[4]]] as const){
    if(y<Math.min(u.y,v.y)||y>Math.max(u.y,v.y))continue;
    if(u.y===v.y){points.push((2*u.x+v.x)/3,(u.x+2*v.x)/3);continue;}
    if((y===u.y&&!u.included)||(y===v.y&&!v.included))continue;
    points.push(u.x+(y-u.y)*(v.x-u.x)/(v.y-u.y));
  }
  return points.some((x,i)=>points.some((z,j)=>j>i&&Math.abs(x-z)>1e-8));
}
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,levelPl,levelEn] of [
  ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],
  ["expert","Ekspert","Expert"]
] as const)
test("F05 P0C disconnected injectivity "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(!pl)await btn(page,"English").click();
  await btn(page,pl?"Matematyka na studia":"University mathematics").click();
  await btn(page,pl?"Funkcje":"Functions").click();
  await btn(page,pl?levelPl:levelEn).click();
  await page.getByRole("button",{name:pl?/Różnowartościowość wykresu z rozłącznymi/:/One-to-one test on disconnected/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-disconnected-injectivity");
  const figure=page.locator("figure[data-graph-kind=function-disconnected-injectivity]");
  await expect(figure.locator("svg[role=img]")).toBeVisible();
  await expect(figure.getByTestId("graph-gap-segment")).toHaveCount(3);
  const markers=["graph-left","graph-hole","graph-first-right","graph-second-left","graph-right"];
  const p:Pt[]=[];
  for(const mark of markers){
    const n=figure.getByTestId(mark);
    p.push({x:Number(await n.getAttribute("data-x")),y:Number(await n.getAttribute("data-y")),
      included:(await n.getAttribute("data-included"))==="true"});
  }
  expect(p[1].included).toBe(false);
  const expected=[...Array(49)].every((_,i)=>!hasDuplicateAtY(p,(i-24)/4))?"injective":"not-injective";
  const expectedLabel=expected==="injective"?
    pl?"Tak — każda prosta pozioma przecina wykres najwyżej raz.":"Yes — every horizontal line meets the graph at most once.":
    pl?"Nie — istnieje prosta pozioma przecinająca wykres co najmniej dwa razy.":"No — some horizontal line meets the graph at least twice.";
  const options=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
    text:(n as HTMLOptionElement).textContent?.trim(),
    value:(n as HTMLOptionElement).value
  })).filter(o=>o.value));
  const right=options.find(o=>o.text===expectedLabel),wrong=options.find(o=>o.text!==expectedLabel);
  expect(right).toBeDefined();expect(wrong).toBeDefined();
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption(wrong!.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(right!.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,pl?"Pokaż rozwiązanie":"Show solution").click();
  await btn(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
  await expect(page.locator(".solution-panel")).toContainText(pl?"prostej":"horizontal");
  await figure.locator("summary").click();
  await expect(figure.locator(".function-graph-text p")).toContainText(pl?"Lewa gałąź":"Left branch");
  if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
