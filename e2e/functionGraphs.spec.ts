import { test, expect, type Page } from "@playwright/test";
import { polishLearningText } from "./helpers/localization";

const b=(page:Page,text:string)=>page.getByRole("button",{name:text,exact:true});
const normalized=(v:number)=>String(v).replace("-","−");
function readGraph(description:string) {
  const points=[...description.matchAll(/\(([-−]?\d+), ([-−]?\d+)\)/g)].map(a=>[
    Number(a[1].replace("−","-")),Number(a[2].replace("−","-"))
  ]);
  if(points.length!==3)throw Error("Expected three exact points in accessible description: "+description);
  const left=description.match(/(?:Lewy koniec|Left endpoint): ([^.]+)\./)?.[1];
  const right=description.match(/(?:Prawy koniec|Right endpoint): ([^.]+)\./)?.[1];
  if(!left||!right)throw Error("Open/closed endpoint descriptions missing");
  return {points, leftClosed:left==="zamknięty"||left==="closed",
    rightClosed:right==="zamknięty"||right==="closed"};
}
async function chooseExpected(page:Page,correct:string,pl:boolean) {
  const answers=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(node=>({
    value:(node as HTMLOptionElement).value,text:(node as HTMLOptionElement).textContent?.trim()
  })));
  const found=answers.filter(answer=>answer.text===correct);
  expect(found,"One and only one selectable answer matches the accessible graph").toHaveLength(1);
  await b(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  const other=answers.find(answer=>answer.value&&answer.value!==found[0].value);
  expect(other).toBeTruthy();
  await page.locator("#answer").selectOption(other!.value);
  await b(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(found[0].value);
  await b(page,pl?"Sprawdź":"Check").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await b(page,pl?"Pokaż rozwiązanie":"Show solution").click();
  await b(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
  await expect(page.locator(".solution-panel")).toBeVisible();
}
for(const width of [375,1280])for(const pl of [true,false])
  for(const [level,levelPl,levelEn] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
    test("P2B-1 "+level+" "+width+"px "+(pl?"PL":"EN")+" SVG graph reading",async({page})=>{
      test.setTimeout(90_000);
      const errors:string[]=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.setViewportSize({width,height:860});await page.goto("/");
      if(!pl)await b(page,"English").click();
      await b(page,pl?"Matematyka na studia":"University mathematics").click();
      await b(page,pl?"Funkcje":"Functions").click();
      await b(page,pl?levelPl:levelEn).click();
      await page.getByRole("button",{name:pl?/Dziedzina i zbiór wartości z wykresu/:/Domain and range from a graph/}).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-graph-domain-range");
      const graph=page.locator("figure.function-graph");
      await expect(graph.locator("svg[role=img]")).toBeVisible();
      await expect(graph.locator("svg title")).toHaveText(pl?/Wykres/:/graph/);
      const desc=await graph.locator("svg desc").textContent()||"";
      const data=readGraph(desc);
      const [first,middle,last]=data.points;
      expect(middle[0]).toBeGreaterThan(first[0]);expect(last[0]).toBeGreaterThan(middle[0]);
      await expect(graph.locator("[data-testid=graph-left]")).toHaveAttribute("fill",data.leftClosed?"#087f70":"#ffffff");
      await expect(graph.locator("[data-testid=graph-right]")).toHaveAttribute("fill",data.rightClosed?"#087f70":"#ffffff");
      const question=await page.locator(".question").innerText();
      const domain=pl?/dziedzinę/:/domain/;
      const targetDomain=domain.test(question);
      const allY=data.points.map(p=>p[1]);
      const lower=targetDomain?first[0]:Math.min(...allY);
      const upper=targetDomain?last[0]:Math.max(...allY);
      const lowerClosed=targetDomain?data.leftClosed:allY.some((y,i)=>y===lower&&(i===1||i===0&&data.leftClosed||i===2&&data.rightClosed));
      const upperClosed=targetDomain?data.rightClosed:allY.some((y,i)=>y===upper&&(i===1||i===0&&data.leftClosed||i===2&&data.rightClosed));
      const correct=(lowerClosed?"[":"(")+normalized(lower)+"; "+normalized(upper)+(upperClosed?"]":")");
      await chooseExpected(page,correct,pl);
      await graph.locator("summary").click();
      await expect(graph.locator(".function-graph-text p")).toContainText(pl?"Lewy koniec":"Left endpoint");

      await page.getByRole("button",{name:pl?/Miejsca zerowe z wykresu/:/Zeros from a graph/}).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-graph-zeros");
      const zerosGraph=page.locator("figure.function-graph");
      const zeroData=readGraph(await zerosGraph.locator("svg desc").textContent()||"");
      const xs=zeroData.points.map(p=>p[0]);
      const root1=(xs[0]+xs[1])/2, root2=(xs[1]+xs[2])/2;
      expect(root1).toBeLessThan(root2);
      await chooseExpected(page,"x = "+normalized(root1)+"; x = "+normalized(root2),pl);
      if(!pl)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
      expect(errors).toEqual([]);
    });
