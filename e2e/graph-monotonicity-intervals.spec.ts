import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,text:string)=>page.getByRole("button",{name:text,exact:true});
const fmt=(n:number)=>String(n).replace("-","−");
type Pt={x:number;y:number;included:boolean};
function expected(p:Pt[],pl:boolean){
 const seg=[
  [p[0],{...p[1],included:false}],
  [{...p[1],included:false},p[2]],
  [p[3],p[4]],
 ] as const;
 const fmtGroup=(trend:"up"|"down"|"flat")=>{
  const s=seg.filter(([a,b])=>trend==="up"?b.y>a.y:trend==="down"?b.y<a.y:b.y===a.y);
  return s.map(([a,b])=>(a.included?"[":"(")+fmt(a.x)+"; "+fmt(b.x)+(b.included?"]":")")).join(" ∪ ")||"∅";
 };
 return (pl?"Rośnie: ":"Increasing: ")+fmtGroup("up")+"; "+
  (pl?"Maleje: ":"Decreasing: ")+fmtGroup("down")+"; "+
  (pl?"Stała: ":"Constant: ")+fmtGroup("flat");
}
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [
 ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]
] as const)
test("F05 P0D interval monotonicity "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
 test.setTimeout(90_000);const errors:string[]=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(!pl)await btn(page,"English").click();
 await btn(page,pl?"Matematyka na studia":"University mathematics").click();
 await btn(page,pl?"Funkcje":"Functions").click();
 await btn(page,pl?plLevel:enLevel).click();
 await page.getByRole("button",{name:pl?/Przedziały monotoniczności wykresu z dziurą/:/Monotonicity intervals of a graph with a hole/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-disconnected-monotonicity");
 const fig=page.locator("figure[data-graph-kind=function-disconnected-monotonicity]");
 await expect(fig.locator("svg[role=img]")).toBeVisible();
 await expect(fig.getByTestId("graph-gap-segment")).toHaveCount(3);
 const pts:Pt[]=[];
 for(const mark of ["graph-left","graph-hole","graph-first-right","graph-second-left","graph-right"]){
  const node=fig.getByTestId(mark);
  pts.push({x:Number(await node.getAttribute("data-x")),y:Number(await node.getAttribute("data-y")),
   included:(await node.getAttribute("data-included"))==="true"});
 }
 expect(pts[1].included).toBe(false);
 const answer=expected(pts,pl);
 const opts=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
  text:(n as HTMLOptionElement).textContent?.trim(),value:(n as HTMLOptionElement).value
 })).filter(o=>o.value));
 expect(opts).toHaveLength(4);
 const right=opts.find(o=>o.text===answer),wrong=opts.find(o=>o.text!==answer);
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
 await expect(page.locator(".solution-panel")).toContainText(answer);
 await fig.locator("summary").click();
 await expect(fig.locator(".function-graph-text p")).toContainText(pl?"Lewa gałąź":"Left branch");
 if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});