import {test,expect,type Page} from "@playwright/test";
import {polishLearningText} from "./helpers/localization";
const btn=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
const fmt=(n:number)=>String(n).replace("-","−");
const interval=(l:number,r:number,lc:boolean,rc:boolean)=>(lc?"[":"(")+fmt(l)+"; "+fmt(r)+(rc?"]":")");
for(const width of [375,1280])for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [
 ["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"],
] as const)
test("F05 P0H integrated properties "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
 test.setTimeout(90_000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto("/");
 if(!pl)await btn(page,"English").click();
 await btn(page,pl?"Matematyka na studia":"University mathematics").click();
 await btn(page,pl?"Funkcje":"Functions").click();
 await btn(page,pl?plLevel:enLevel).click();
 await page.getByRole("button",{name:pl?/Pięć własności jednego wykresu/:/Five properties of one graph/}).click();
 await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-integrated-properties");
 const fig=page.locator('figure[data-graph-kind="function-integrated-properties"]');
 await expect(fig.locator("svg[role=img]")).toBeVisible();
 await expect(fig.getByTestId("integrated-path")).toBeVisible();
 const pts=[] as {x:number;y:number;inc:boolean}[];
 for(let i=0;i<3;i++){const n=fig.getByTestId("integrated-node-"+i);
  pts.push({x:Number(await n.getAttribute("data-x")),y:Number(await n.getAttribute("data-y")),
   inc:(await n.getAttribute("data-included"))==="true"});}
 const [a,b,c]=pts;expect(a.x).toBe(-c.x);expect(b.x).toBe(0);
 const directions=[Math.sign(b.y-a.y),Math.sign(c.y-b.y)];
 const dom=b.inc?interval(a.x,c.x,a.inc,c.inc):
   interval(a.x,0,a.inc,false)+" ∪ "+interval(0,c.x,false,c.inc);
 const seg=[{lo:Math.min(a.y,b.y),hi:Math.max(a.y,b.y),left:a.y<b.y?a.inc:b.inc,right:a.y<b.y?b.inc:a.inc},
            {lo:Math.min(b.y,c.y),hi:Math.max(b.y,c.y),left:b.y<c.y?b.inc:c.inc,right:b.y<c.y?c.inc:b.inc}]
   .sort((p,q)=>p.lo-q.lo||p.hi-q.hi);
 const r0=seg[0],r1=seg[1],overlaps=r1.lo<r0.hi||
   r1.lo===r0.hi&&(r1.left||r0.right);
 const range=overlaps?interval(r0.lo,Math.max(r0.hi,r1.hi),r0.left||(r1.lo===r0.lo&&r1.left),
   r1.hi>r0.hi?r1.right:r1.hi===r0.hi?r0.right||r1.right:r0.right):
   interval(r0.lo,r0.hi,r0.left,r0.right)+" ∪ "+interval(r1.lo,r1.hi,r1.left,r1.right);
 const trend=(direction:number)=>{
   if(directions[0]===directions[1]&&b.inc&&directions[0]===direction)
     return interval(a.x,c.x,a.inc,c.inc);
   const out:string[]=[];
   if(directions[0]===direction)out.push(interval(a.x,0,a.inc,b.inc));
   if(directions[1]===direction)out.push(interval(0,c.x,b.inc,c.inc));
   return out.join(" ∪ ")||"∅";
 };
 const parity=a.inc!==c.inc?"Neither":a.y===c.y?"Even":
   a.y===-c.y&&b.y===0?"Odd":"Neither";
 const needed={
  domain:dom,range,increasing:trend(1),decreasing:trend(-1),
  injective:directions[0]===directions[1]?(pl?"Tak":"Yes"):(pl?"Nie":"No"),
  parity:pl?({Even:"Parzysta",Odd:"Nieparzysta",Neither:"Ani parzysta, ani nieparzysta"} as const)[parity]:parity,
 };
 const keys=["domain","range","increasing","decreasing","injective","parity"] as const;
 const ids=(key:string)=>page.locator(key==="domain"?"#answer":"#answer-"+key);
 for(const key of keys)await expect(ids(key)).toBeVisible();
 await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
 await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
 for(const key of keys){
  const options=await ids(key).locator("option").evaluateAll(nodes=>nodes.map(n=>({
   value:(n as HTMLOptionElement).value,label:(n as HTMLOptionElement).textContent?.trim()
  })).filter(n=>n.value));
  const right=options.find(o=>o.label===needed[key]);
  expect(right,"Missing correct "+key).toBeDefined();
  await ids(key).selectOption(right!.value);
 }
 const sel=ids("range"),values=await sel.locator("option").evaluateAll(nodes=>nodes
   .map(n=>(n as HTMLOptionElement).value).filter(Boolean));
 const right=await sel.inputValue();await sel.selectOption(values.find(v=>v!==right)!);
 await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
 await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);
 await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
 await sel.selectOption(right);await btn(page,pl?"Sprawdź":"Check").click();
 await expect(page.locator(".feedback")).toHaveClass("feedback correct");
 await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
 await btn(page,pl?"Pokaż rozwiązanie":"Show solution").click();
 await btn(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
 await expect(page.locator(".solution-panel")).toContainText(pl?"Parzystość":"Parity");
 await fig.locator("summary").click();
 await expect(fig.locator(".function-graph-text p")).toContainText(pl?"Łamana":"Piecewise-linear");
 if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
