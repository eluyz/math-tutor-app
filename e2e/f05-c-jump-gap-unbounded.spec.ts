import { test, expect, type Page } from "@playwright/test";

/** Public F05/c synthetic browser witness; NOT original source figure acceptance. */
const fields=["domain","range","increasing","decreasing","injective","parity"] as const;
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});

for(const width of [375,1280]) for(const locale of ["pl","en"] as const){
  test("F05/c separate-gap jump six fields hard:2 "+locale+" "+width+"px",async({page},info)=>{
    test.setTimeout(120_000);
    const pl=locale==="pl",errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    page.on("response",x=>{if(x.status()>=400)errors.push(x.status()+" "+x.url());});
    page.on("requestfailed",x=>errors.push(x.url()));
    await page.setViewportSize({width,height:900});
    await page.addInitScript(()=>{Date.now=()=>151169;});
    await page.goto("/");
    if(!pl)await button(page,"English").click();
    await button(page,pl?"Matematyka na studia":"University mathematics").click();
    await button(page,pl?"Funkcje":"Functions").click();
    await button(page,pl?"Trudny":"Hard").click();
    const title=pl
      ?"Sześć własności: skok, przerwa i nieograniczone gałęzie"
      :"Six properties: jump, missing interval and unbounded branches";
    await page.locator("button.exercise-item")
      .filter({has:page.getByText(title,{exact:true})}).click();
    const figure=page.locator('figure[data-graph-kind="function-jump-gap-unbounded"]');
    const expectedHollow=[[-6,-2],[-4,2],[-2,-3]];
    const expectedFilled=[[-6,-4],[2,-7]];
    let found=false;
    for(let i=0;i<24;i++){
      const hollow=await figure.getByTestId("jump-gap-hollow").evaluateAll(nodes=>
        nodes.map(n=>[Number(n.getAttribute("data-x")),Number(n.getAttribute("data-y"))]));
      const filled=await figure.getByTestId("jump-gap-filled").evaluateAll(nodes=>
        nodes.map(n=>[Number(n.getAttribute("data-x")),Number(n.getAttribute("data-y"))]));
      if(JSON.stringify(hollow)===JSON.stringify(expectedHollow)&&
         JSON.stringify(filled)===JSON.stringify(expectedFilled)){found=true;break;}
      await button(page,pl?"Nowy przykład":"New example").click();
    }
    expect(found,"bounded task cycle contains hard:2").toBe(true);
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-jump-gap-unbounded");
    await expect(figure.locator('svg[role="img"]')).toBeVisible();
    await expect(figure.getByTestId("jump-gap-hollow")).toHaveCount(3);
    await expect(figure.getByTestId("jump-gap-filled")).toHaveCount(2);
    await expect(figure.getByTestId("jump-gap-left-arrow")).toHaveCount(1);
    await expect(figure.getByTestId("jump-gap-right-arrow")).toHaveCount(1);
    await expect(figure.getByTestId("jump-gap-x-label")).toHaveCount(4);
    for(const id of ["left","middle","down","right"])
      await expect(figure.getByTestId("jump-gap-segment-"+id)).toHaveCount(1);
    for(const node of await figure.getByTestId("jump-gap-hollow").all())
      await expect(node).toHaveAttribute("fill","var(--color-bg, white)");
    for(const node of await figure.getByTestId("jump-gap-filled").all())
      await expect(node).toHaveAttribute("fill","#087f70");
    const expected:Record<typeof fields[number],string>={
      domain:"(−∞; −4) ∪ (−2; +∞)",
      range:"ℝ",
      increasing:"(−∞; −6) ∪ [−6; −4) ∪ [2; +∞)",
      decreasing:"(−2; 2]",
      injective:pl?"Nie":"No",
      parity:pl?"Ani parzysta, ani nieparzysta":"Neither",
    };
    const select=(id:string)=>page.locator(id==="domain"?"#answer":"#answer-"+id);
    const check=async (result:string)=>{
      await button(page,pl?"Sprawdź":"Check").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback "+result);
    };
    await check("invalid");
    await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
    for(const id of fields)await select(id).selectOption({label:expected[id]});
    await check("correct");
    await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
    for(const id of fields){
      await select(id).selectOption("");
      await check("invalid");
      await expect(page.locator('[data-field-result="missing"]')).toHaveCount(1);
      await select(id).selectOption({label:expected[id]});
      const wrong=await select(id).locator("option").evaluateAll((nodes,label)=>
        nodes.map(n=>({value:(n as HTMLOptionElement).value,label:n.textContent}))
          .find(x=>x.value&&x.label!==label)!.value,expected[id]);
      await select(id).selectOption(wrong);
      await check("incorrect");
      await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);
      await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
      await select(id).selectOption({label:expected[id]});
    }
    await check("correct");
    await button(page,pl?"Pokaż rozwiązanie":"Show solution").click();
    await button(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
    const panel=page.locator(".solution-panel");
    for(const id of fields.slice(0,4))await expect(panel).toContainText(expected[id]);
    await expect(panel).toContainText(pl?"Różnowartościowość: nie":"Injectivity: no");
    await expect(panel).toContainText(pl?"Parzystość: żadna":"Parity: neither");
    await expect(panel).toContainText("f(");
    await expect(page.locator(".solution-final")).toBeVisible();
    await figure.locator("summary").click();
    await expect(figure.locator(".function-graph-text")).toContainText(pl?"pustego":"hollow");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
    await info.attach("F05c-synthetic-six-field-witness",{
      body:JSON.stringify({locale,width,holes:expectedHollow,filled:expectedFilled,
        answers:expected,errors}),contentType:"application/json"});
    await info.attach("F05c-completed-screen",{body:await page.screenshot({fullPage:true}),
      contentType:"image/png"});
  });
}
