import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const button=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
const fmt=(n:number)=>String(n).replace("-","−");
const inter=(a:number,b:number,left:boolean,right:boolean)=>(left?"[":"(")+fmt(a)+"; "+fmt(b)+(right?"]":")");

for(const width of [375,1280])for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [
 ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"],
] as const)
test("F05 P0I integrated jump graph "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
 test.setTimeout(90_000);
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(!pl)await button(page,"English").click();
 await button(page,pl?"Matematyka na studia":"University mathematics").click();
 await button(page,pl?"Funkcje":"Functions").click();
 await button(page,pl?plLevel:enLevel).click();
 await page.getByRole("button",{name:pl?/Pięć własności wykresu ze skokiem/:/Five properties of a jump-discontinuous graph/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-integrated-jump");
 const figure=page.locator('figure[data-graph-kind="function-integrated-jump"]');
 await expect(figure.locator("svg[role=img]")).toBeVisible();
 await expect(figure.getByTestId("jump-left-path")).toBeVisible();
 await expect(figure.getByTestId("jump-right-path")).toBeVisible();
 const nodes=[] as {x:number;y:number;filled:boolean}[];
 for(let i=0;i<4;i++){
  const n=figure.getByTestId("jump-node-"+i);
  nodes.push({x:Number(await n.getAttribute("data-x")),y:Number(await n.getAttribute("data-y")),
   filled:(await n.getAttribute("data-included"))==="true"});
 }
 const [a,b,c,d]=nodes;
 expect(a.x).toBe(-d.x);expect(b.x).toBe(0);expect(c.x).toBe(0);expect(b.y).not.toBe(c.y);
 expect(nodes.map(n=>n.filled)).toEqual([true,false,true,true]);
 const mode=await figure.getAttribute("data-jump-topology");
 expect(["separated","overlap"]).toContain(mode);
 const domain=inter(a.x,d.x,true,true),left=inter(a.x,0,true,false),right=inter(0,d.x,true,true);
 let range:string,increasing:string,decreasing:string,injective:string;
 if(mode==="separated"){
  const lMin=Math.min(a.y,b.y),lMax=Math.max(a.y,b.y),rMin=Math.min(c.y,d.y),rMax=Math.max(c.y,d.y);
  range=inter(lMin,lMax,true,false)+" ∪ "+inter(rMin,rMax,true,true);
  increasing=left;decreasing=right;injective=pl?"Tak":"Yes";
 }else{
  const upper=Math.max(b.y,d.y);
  range=inter(Math.min(a.y,c.y),upper,true,d.y>=b.y);
  increasing=left+" ∪ "+right;decreasing="∅";injective=pl?"Nie":"No";
 }
 const expected={domain,range,increasing,decreasing,injective,
  parity:pl?"Ani parzysta, ani nieparzysta":"Neither"};
 const fields=["domain","range","increasing","decreasing","injective","parity"] as const;
 const select=(key:string)=>page.locator(key==="domain"?"#answer":"#answer-"+key);
 for(const key of fields)await expect(select(key)).toBeVisible();
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
 for(const key of fields){
  const opts=await select(key).locator("option").evaluateAll(nodes=>nodes
   .map(node=>({value:(node as HTMLOptionElement).value,label:node.textContent?.trim()})).filter(o=>o.value));
  const match=opts.find(opt=>opt.label===expected[key]);
  expect(match,"No exact correct answer in "+key).toBeDefined();
  await select(key).selectOption(match!.value);
 }
 const r=select("range"),correct=await r.inputValue();
 const values=await r.locator("option").evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value).filter(Boolean));
 await r.selectOption(values.find(v=>v!==correct)!);
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);
 await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
 await r.selectOption(correct);
 await button(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
 await button(page,pl?"Pokaż rozwiązanie":"Show solution").click();
 await button(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
 await expect(page.locator(".solution-panel")).toContainText(pl?"Parzystość":"Parity");
 await figure.locator("summary").click();
 await expect(figure.locator(".function-graph-text p")).toContainText(pl?"Węzły":"Nodes");
 if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
