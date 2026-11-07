import {test,expect,type Page} from '@playwright/test';
const expectedGeometry=[[-3,-3],[-1,-1],[3,2],[5,4]];
const fields=['domain','range','increasing','decreasing','injective','parity'] as const;
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
for(const width of [375,1280])for(const locale of ['pl','en'] as const)test(`F05-d hard:2 exact six fields ${locale} ${width}px`,async({page},info)=>{
 const pl=locale==='pl',errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('requestfailed',r=>errors.push(r.url()));
 await page.setViewportSize({width,height:900});await page.addInitScript(()=>{Date.now=()=>151169;});await page.goto('/');
 if(!pl)await button(page,'English').click();
 await button(page,pl?'Matematyka na studia':'University mathematics').click();await button(page,pl?'Funkcje':'Functions').click();await button(page,pl?'Trudny':'Hard').click();
 const title=pl?'Sześć własności wykresu z dwiema asymptotami i ukośnymi odcinkami':'Six properties of a graph with two asymptotes and sloping outer segments';
 await page.locator('button.exercise-item').filter({has:page.getByText(title,{exact:true})}).click();
 const fig=page.locator('figure[data-graph-kind="function-integrated-asymptotes"]');
 let found=false;
 for(let attempt=0;attempt<24;attempt++){
  const points=await fig.getByTestId('integrated-outer-point').evaluateAll(nodes=>nodes.map(n=>[Number(n.getAttribute('data-x')),Number(n.getAttribute('data-y'))]));
  if(JSON.stringify(points)===JSON.stringify(expectedGeometry)){found=true;break;}
  await button(page,pl?'Nowy przykład':'New example').click();
 }
 expect(found,'must visit the exact authored hard:2 geometry').toBe(true);
 await expect(page.locator('.question')).toHaveAttribute('data-difficulty','hard');
 expect(await fig.locator('[data-testid^="integrated-pole-"]').evaluateAll(ns=>ns.map(n=>Number(n.getAttribute('data-x'))))).toEqual([-1,3]);
 expect(await fig.getByTestId('integrated-sloping-segment').evaluateAll(ns=>ns.map(n=>Number(n.getAttribute('data-slope'))))).toEqual([1,1]);
 expect(await fig.getByTestId('integrated-outer-point').evaluateAll(ns=>ns.map(n=>n.getAttribute('data-open')))).toEqual(['false','true','true','false']);
 const hollow=fig.locator('[data-testid="integrated-outer-point"][data-open="true"]');await expect(hollow).toHaveCount(2);
 for(const circle of await hollow.all()){expect(await circle.getAttribute('fill')).toBe('var(--color-bg, white)');expect(await circle.getAttribute('stroke-width')).toBe('2.3');}
 // Independent function/viewport calculation checks all 199 rendered samples.
 const path=(await fig.getByTestId('integrated-asymptote-middle').getAttribute('d'))!;
 const samples=Array.from(path.matchAll(/[ML]\s+([\d.e+-]+)\s+([\d.e+-]+)/g),m=>[Number(m[1]),Number(m[2])]);expect(samples).toHaveLength(199);
 samples.forEach(([X,Y],i)=>{
  const x=-1+4*(i+1)/200,t=x-1,y=1+2*t/(t*t-4);
  expect(X).toBeCloseTo(30+352*(x+4)/10,8);expect(Y).toBeCloseTo(125-100*Math.max(-6,Math.min(6,y))/6,8);
 });
 const labels:Record<typeof fields[number],string>={domain:'[−3; −1) ∪ (−1; 3) ∪ (3; 5]',range:'ℝ',increasing:'[−3; −1) ∪ (3; 5]',decreasing:'(−1; 3)',injective:pl?'Nie':'No',parity:pl?'Ani parzysta, ani nieparzysta':'Neither'};
 const select=(id:string)=>page.locator(id==='domain'?'#answer':'#answer-'+id);
 const check=async(state:string)=>{await button(page,pl?'Sprawdź':'Check').click();await expect(page.locator('.feedback')).toHaveClass('feedback '+state);};
 await check('invalid');await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
 for(const id of fields)await select(id).selectOption({label:labels[id]});
 await check('correct');await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
 for(const id of fields){
  await select(id).selectOption('');await check('invalid');await expect(page.locator('[data-field-result="missing"]')).toHaveCount(1);
  await select(id).selectOption({label:labels[id]});
  const wrong=await select(id).locator('option').evaluateAll((nodes,label)=>nodes.map(n=>({value:(n as HTMLOptionElement).value,label:n.textContent})).find(n=>n.value&&n.label!==label)!.value,labels[id]);
  await select(id).selectOption(wrong);await check('incorrect');await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
  if(id!=='parity')await select(id).selectOption({label:labels[id]});
 }
 await expect(page.locator('.learning-hint')).toHaveCount(1);await expect(page.locator('.learning-hint').first()).toContainText(pl?'Zacznij od asymptot i oddzielnych trzech części dziedziny.':'Start with the poles and the three separate domain components.');
 await button(page,pl?'Pokaż kolejną podpowiedź':'Show another hint').click();await expect(page.locator('.learning-hint')).toHaveCount(2);await expect(page.locator('.learning-hint').nth(1)).toContainText(pl?'Porównaj granice, nachylenia wszystkich odcinków oraz przecięcia z jedną poziomą prostą.':'Compare pole limits, all segment slopes and intersections with a single horizontal line.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await select('parity').selectOption({label:labels.parity});await check('correct');await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
 await button(page,pl?'Pokaż rozwiązanie':'Show solution').click();await button(page,pl?'Pokaż wszystkie kroki':'Show all steps').click();
 const panel=page.locator('.solution-panel');for(const id of fields.slice(0,4))await expect(panel).toContainText(labels[id]);
 await expect(panel).toContainText(pl?'Różnowartościowość: nie':'Injectivity: no');await expect(panel).toContainText(pl?'Parzystość: żadna':'Parity: neither');await expect(page.locator('.solution-final')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
 await info.attach('exact-six-field-witness',{body:JSON.stringify({id:'function-integrated-asymptotes:hard:2',locale,width,geometry:expectedGeometry,labels,errors}),contentType:'application/json'});
 await info.attach('solution',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
