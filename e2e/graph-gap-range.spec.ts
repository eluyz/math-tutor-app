import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const fmt=(n:number)=>String(n).replace("-","−");
type Point={x:number;y:number;included:boolean};
type Interval={lo:number;hi:number;lc:boolean;rc:boolean};
function image(u:Point,v:Point):Interval{
  if(u.y===v.y)return{lo:u.y,hi:u.y,lc:true,rc:true};
  return u.y<v.y?{lo:u.y,hi:v.y,lc:u.included,rc:v.included}:
    {lo:v.y,hi:u.y,lc:v.included,rc:u.included};
}
function expectedRange(p:Point[]){
  const h={...p[1],included:false};
  const ranges=[image(p[0],h),image(h,p[2]),image(p[3],p[4])];
  const ys=[...new Set(ranges.flatMap(v=>[v.lo,v.hi]))].sort((a,b)=>a-b);
  const active=(y:number)=>ranges.some(r=>(y>r.lo||y===r.lo&&r.lc)&&(y<r.hi||y===r.hi&&r.rc));
  const result:Interval[]=[];
  // Sweep intervals by finite endpoints and included/absent endpoint semantics,
  // separately from the generator's merge routine.
  for(let j=0;j<ys.length;j++){
    const y=ys[j];
    if(active(y)&&!result.some(r=>r.hi===y&&r.rc))result.push({lo:y,hi:y,lc:true,rc:true});
    if(j===ys.length-1)break;
    const next=ys[j+1],middle=(y+next)/2;
    if(!active(middle))continue;
    const leftClosed=active(y),rightClosed=active(next);
    const current=result.at(-1);
    if(current&&current.hi===y&&current.rc&&leftClosed){
      current.hi=next;current.rc=rightClosed;
    }else{
      result.push({lo:y,hi:next,lc:leftClosed,rc:rightClosed});
    }
  }
  return result.map(r=>r.lo===r.hi?"{"+fmt(r.lo)+"}":
    (r.lc?"[":"(")+fmt(r.lo)+"; "+fmt(r.hi)+(r.rc?"]":")")).join(" ∪ ");
}
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [
  ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]
] as const)
test("F05 P0B disconnected holey range "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
  test.setTimeout(90_000);const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(!pl)await btn(page,"English").click();
  await btn(page,pl?"Matematyka na studia":"University mathematics").click();
  await btn(page,pl?"Funkcje":"Functions").click();
  await btn(page,pl?plLevel:enLevel).click();
  await page.getByRole("button",{name:pl?/Zbiór wartości wykresu z dziurą/:/Range of a disconnected graph with a hole/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-disconnected-range");
  const fig=page.locator("figure[data-graph-kind=function-disconnected-range]");
  await expect(fig.locator("svg[role=img]")).toBeVisible();
  await expect(fig.getByTestId("graph-gap-segment")).toHaveCount(3);
  const marks=["graph-left","graph-hole","graph-first-right","graph-second-left","graph-right"];
  const p:Point[]=[];
  for(const id of marks){
    const m=fig.getByTestId(id);
    p.push({x:Number(await m.getAttribute("data-x")),y:Number(await m.getAttribute("data-y")),
      included:(await m.getAttribute("data-included"))==="true"});
  }
  expect(p[1].included).toBe(false);
  expect(p.every((pt,i)=>i===0||pt.x>p[i-1].x)).toBe(true);
  const correctText=expectedRange(p);
  const options=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
    text:(n as HTMLOptionElement).textContent?.trim(),
    value:(n as HTMLOptionElement).value,
  })).filter(x=>x.value));
  expect(options.filter(o=>o.text===correctText)).toHaveLength(1);
  const right=options.find(o=>o.text===correctText)!;
  const wrong=options.find(o=>o.value!==right.value)!;
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption(wrong.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(right.value);
  await btn(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,pl?"Pokaż rozwiązanie":"Show solution").click();
  await btn(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
  await expect(page.locator(".solution-panel")).toContainText(correctText);
  await fig.locator("summary").click();
  await expect(fig.locator(".function-graph-text p")).toContainText(pl?"dziura":"hole");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(errors).toEqual([]);
});
