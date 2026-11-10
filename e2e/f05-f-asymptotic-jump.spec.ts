import { test, expect, type Page } from "@playwright/test";
/** PUBLIC synthetic F05/f browser witness, never an original private-source acceptance. */
const fields=["domain","range","increasing","decreasing","injective","parity"] as const;
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
for(const width of [375,1280])for(const locale of ["pl","en"] as const){
  test("F05/f asymptotic injective jump hard:2 "+locale+" "+width+"px",async({page},info)=>{
    test.setTimeout(120_000);
    const pl=locale==="pl",errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
    page.on("requestfailed",r=>errors.push(r.url()));
    await page.setViewportSize({width,height:900});
    await page.addInitScript(()=>{Date.now=()=>151169;});
    await page.goto("/");
    if(!pl)await button(page,"English").click();
    await button(page,pl?"Matematyka na studia":"University mathematics").click();
    await button(page,pl?"Funkcje":"Functions").click();
    await button(page,pl?"Trudny":"Hard").click();
    const title=pl
      ?"Sześć własności: różnowartościowy skok i poziome asymptoty"
      :"Six properties: injective jump and horizontal asymptotes";
    await page.locator("button.exercise-item")
      .filter({has:page.getByText(title,{exact:true})}).click();
    const graph=page.locator('figure[data-graph-kind="function-asymptotic-jump-injective"]');
    let found=false;
    for(let i=0;i<24;i++){
      const hole=await graph.getByTestId("asymptotic-jump-hollow").getAttribute("data-y");
      const filled=await graph.getByTestId("asymptotic-jump-filled").getAttribute("data-y");
      const asym=await graph.getByTestId("asymptotic-jump-asymptote")
        .evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute("data-y"))));
      if(hole==="-8"&&filled==="0"&&JSON.stringify(asym)===JSON.stringify([-5,2])){
        found=true;break;
      }
      await button(page,pl?"Nowy przykład":"New example").click();
    }
    expect(found,"bounded cycle must expose hard:2 synthetic profile").toBe(true);
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","function-asymptotic-jump-injective");
    await expect(graph.locator('svg[role="img"]')).toBeVisible();
    await expect(graph.getByTestId("asymptotic-jump-left")).toHaveCount(1);
    await expect(graph.getByTestId("asymptotic-jump-right")).toHaveCount(1);
    await expect(graph.getByTestId("asymptotic-jump-left-arrow")).toHaveCount(1);
    await expect(graph.getByTestId("asymptotic-jump-right-arrow")).toHaveCount(1);
    await expect(graph.getByTestId("asymptotic-jump-asymptote")).toHaveCount(2);
    await expect(graph.getByTestId("asymptotic-jump-hollow")).toHaveAttribute("fill","var(--color-bg, white)");
    await expect(graph.getByTestId("asymptotic-jump-filled")).toHaveAttribute("fill","#087f70");
    const answers:Record<typeof fields[number],string>={
      domain:"ℝ",
      range:"(−8; −5) ∪ [0; 2)",
      increasing:"[0; +∞)",
      decreasing:"(−∞; 0)",
      injective:pl?"Tak":"Yes",
      parity:pl?"Ani parzysta, ani nieparzysta":"Neither",
    };
    const select=(id:string)=>page.locator(id==="domain"?"#answer":"#answer-"+id);
    const check=async (status:string)=>{
      await button(page,pl?"Sprawdź":"Check").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback "+status);
    };
    await check("invalid");
    await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
    for(const field of fields)await select(field).selectOption({label:answers[field]});
    await check("correct");
    await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
    for(const field of fields){
      await select(field).selectOption("");
      await check("invalid");
      await expect(page.locator('[data-field-result="missing"]')).toHaveCount(1);
      await select(field).selectOption({label:answers[field]});
      const bad=await select(field).locator("option").evaluateAll((nodes,label)=>
        nodes.map(n=>({value:(n as HTMLOptionElement).value,label:n.textContent}))
          .find(n=>n.value&&n.label!==label)!.value,answers[field]);
      await select(field).selectOption(bad);
      await check("incorrect");
      await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);
      await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
      await select(field).selectOption({label:answers[field]});
    }
    await check("correct");
    await button(page,pl?"Pokaż rozwiązanie":"Show solution").click();
    await button(page,pl?"Pokaż wszystkie kroki":"Show all steps").click();
    const solution=page.locator(".solution-panel");
    for(const field of fields.slice(0,4))await expect(solution).toContainText(answers[field]);
    await expect(solution).toContainText(pl?"Różnowartościowość: tak":"Injectivity: yes");
    await expect(solution).toContainText(pl?"Parzystość: żadna":"Parity: neither");
    await expect(page.locator(".solution-final")).toBeVisible();
    await graph.locator("summary").click();
    await expect(graph.locator(".function-graph-text")).toContainText(pl?"asymptoty":"asymptote");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
    await info.attach("F05f-synthetic-browser-evidence",{
      body:JSON.stringify({locale,width,answer:answers,errors}),contentType:"application/json"});
    await info.attach("F05f-completed-screen",{
      body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  });
}
