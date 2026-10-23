import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";

const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const fmt=(value:number)=>String(value).replace("-","−");
function readGraph(text:string) {
 const nodes=[...text.matchAll(/\(([-−]?\d+), ([-−]?\d+)\)/g)].map(v=>({
   x:Number(v[1].replace("−","-")),y:Number(v[2].replace("−","-"))
 }));
 expect(nodes).toHaveLength(3);
 const left=text.match(/(?:Lewy koniec|Left endpoint): ([^.]+)\./)?.[1];
 const right=text.match(/(?:Prawy koniec|Right endpoint): ([^.]+)\./)?.[1];
 if(!left||!right)throw Error("Missing endpoint semantics");
 return {nodes,leftClosed:["closed","zamknięty"].includes(left),rightClosed:["closed","zamknięty"].includes(right)};
}
async function checkChoice(page:Page,expected:string,pl:boolean) {
 const options=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
   text:(n as HTMLOptionElement).textContent?.trim(),
   value:(n as HTMLOptionElement).value
 })));
 const correct=options.filter(o=>o.text===expected);
 expect(correct,"Exactly one answer should match independently read graph").toHaveLength(1);
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 const wrong=options.find(o=>o.value&&o.value!==correct[0].value);
 expect(wrong).toBeTruthy();
 await page.locator("#answer").selectOption(wrong!.value);
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await page.locator("#answer").selectOption(correct[0].value);
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await button(page,pl?"Pokaż rozwiązanie":"Show solution").click();
 await button(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
 await expect(page.locator(".solution-panel")).toBeVisible();
}
async function open(page:Page,pl:boolean,labelPl:RegExp,labelEn:RegExp,kind:string) {
 await page.getByRole("button",{name:pl?labelPl:labelEn}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id",kind);
 const figure=page.locator("figure.function-graph");
 await expect(figure.locator("svg[role=img]")).toBeVisible();
 await expect(figure.locator("svg title")).toContainText(pl?"Wykres":"graph");
 await expect(figure.locator("[data-testid=graph-path]")).toBeVisible();
 return {figure,data:readGraph(await figure.locator("svg desc").textContent()||"")};
}
for(const width of [375,1280])for(const pl of [true,false])
 for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
 test("P2B-2 "+level+" "+width+"px "+(pl?"PL":"EN")+": monotonicity, extrema and symmetry",async({page})=>{
   test.setTimeout(90_000);
   const errors:string[]=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.setViewportSize({width,height:860});await page.goto("/");
   if(!pl)await button(page,"English").click();
   await button(page,pl?"Matematyka na studia":"University mathematics").click();
   await button(page,pl?"Funkcje":"Functions").click();
   await button(page,pl?plLevel:enLevel).click();

   const monotonic=await open(page,pl,/Monotoniczność z wykresu/,/Monotonicity from a graph/,"function-graph-monotonicity");
   const [a,m,b]=monotonic.data.nodes;
   const slope=(left:number,right:number)=>left<right?(pl?"rośnie":"increases"):
     left>right?(pl?"maleje":"decreases"):(pl?"jest stała":"is constant");
   const trend=slope(a.y,m.y)+", "+(pl?"potem":"then")+" "+slope(m.y,b.y);
   await checkChoice(page,trend,pl);

   const extreme=await open(page,pl,/Ekstrema z wykresu/,/Extrema from a graph/,"function-graph-extrema");
   const extMiddle=extreme.data.nodes[1];
   const caption=await page.locator(".question").innerText();
   const maximum=pl?caption.includes("maksimum"):caption.includes("maximum");
   const ys=extreme.data.nodes.map(n=>n.y);
   expect(extMiddle.y).toBe(maximum?Math.max(...ys):Math.min(...ys));
   await checkChoice(page,"("+fmt(extMiddle.x)+"; "+fmt(extMiddle.y)+")",pl);

   const symmetric=await open(page,pl,/Symetria wykresu funkcji/,/Graph symmetry/,"function-graph-symmetry");
   const [l,mid,r]=symmetric.data.nodes;
   const inSymDomain=symmetric.data.leftClosed===symmetric.data.rightClosed&&l.x===-r.x&&mid.x===0;
   const category=inSymDomain&&l.y===r.y?"even":
     inSymDomain&&mid.y===0&&l.y===-r.y?"odd":"neither";
   const correct=category==="even"?(pl?"parzysta":"even"):
     category==="odd"?(pl?"nieparzysta":"odd"):(pl?"ani parzysta, ani nieparzysta":"neither even nor odd");
   await checkChoice(page,correct,pl);
   await expect(symmetric.figure.locator("[data-testid=graph-left]")).toHaveAttribute("fill",symmetric.data.leftClosed?"#087f70":"#ffffff");
   await expect(symmetric.figure.locator("[data-testid=graph-right]")).toHaveAttribute("fill",symmetric.data.rightClosed?"#087f70":"#ffffff");
   await symmetric.figure.locator("summary").click();
   await expect(symmetric.figure.locator(".function-graph-text p")).toContainText(pl?"Lewy koniec":"Left endpoint");
   if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
   expect(errors).toEqual([]);
 });
