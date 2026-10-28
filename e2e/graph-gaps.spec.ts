import {test,expect,type Page} from "@playwright/test";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const fmt=(n:number)=>String(n).replace("-","−");
const interval=(a:number,b:number,l:boolean,r:boolean)=>
  (l?"[":"(")+fmt(a)+"; "+fmt(b)+(r?"]":")");
for(const width of [375,1280]) for(const pl of [true,false])
for(const [level,plLevel,enLevel] of [["hard","Trudny","Hard"],["advanced","Zaawansowany","Advanced"],["expert","Ekspert","Expert"]] as const)
test("MT-EDU-033 disconnected domain "+level+" "+width+"px "+(pl?"PL":"EN"),async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width,height:920});await page.goto("/");
  if(!pl)await button(page,"English").click();
  await button(page,pl?"Matematyka na studia":"University mathematics").click();
  await button(page,pl?"Funkcje":"Functions").click();
  await button(page,pl?plLevel:enLevel).click();
  await page.getByRole("button",{name:pl?/Dziedzina wykresu z luką i dziurą/:/Domain of a disconnected graph with a hole/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-disconnected-domain");
  const fig=page.locator("figure[data-graph-kind=function-disconnected-domain]");
  await expect(fig.locator("svg[role=img]")).toBeVisible();
  await expect(fig.locator('[data-testid="graph-gap-segment"]')).toHaveCount(3);
  await expect(fig.locator('[data-testid="graph-path"]')).toHaveCount(0);
  const ids=["graph-left","graph-hole","graph-first-right","graph-second-left","graph-right"];
  const p=[] as {x:number;y:number;included:boolean}[];
  for(const id of ids){
    const mark=fig.getByTestId(id);
    const x=Number(await mark.getAttribute("data-x")),y=Number(await mark.getAttribute("data-y"));
    const included=(await mark.getAttribute("data-included"))==="true";
    expect(await mark.getAttribute("fill")).toBe(included?"#087f70":"#ffffff");
    p.push({x,y,included});
  }
  expect(p[1].included).toBe(false);
  expect(p[0].x<p[1].x&&p[1].x<p[2].x&&p[2].x<p[3].x&&p[3].x<p[4].x).toBe(true);
  expect(p[1].y*2).toBe(p[0].y+p[2].y);
  const answer=[
    interval(p[0].x,p[1].x,p[0].included,false),
    interval(p[1].x,p[2].x,false,p[2].included),
    interval(p[3].x,p[4].x,p[3].included,p[4].included)
  ].join(" ∪ ");
  const opts=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(n=>({
    text:(n as HTMLOptionElement).textContent?.trim(),value:(n as HTMLOptionElement).value
  })));
  const correct=opts.filter(o=>o.text===answer);
  expect(correct).toHaveLength(1);
  await button(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  const wrong=opts.find(o=>o.value&&o.value!==correct[0].value);
  expect(wrong).toBeTruthy();
  await page.locator("#answer").selectOption(wrong!.value);
  await button(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(correct[0].value);
  await button(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,pl?"Pokaż rozwiązanie":"Show solution").click();
  await button(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
  await expect(page.locator(".solution-panel")).toContainText(answer);
  await fig.locator("summary").click();
  await expect(fig.locator(".function-graph-text p")).toContainText(pl?"dziura":"hole");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});