import { expect, test } from '@playwright/test';
const contrast=(a:number[],b:number[])=>{
  const l=(v:number[])=>v.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const x=l(a),y=l(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
for(const width of [320,375,390,768,1280,1440]) test(`keyboard, contrast and reflow ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900}); await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
  const skip=page.getByRole('link',{name:'Przejdź do treści'});
  // Keyboard APIs do not auto-wait for React's asynchronous initial render.
  await expect(skip).toBeVisible();
  await page.keyboard.press('Tab');
  console.log('INITIAL_TAB_FOCUS',JSON.stringify(await page.evaluate(()=>({
    tag:document.activeElement?.tagName,id:document.activeElement?.id,
    href:document.activeElement?.getAttribute('href'),hasFocus:document.hasFocus(),
  }))));
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('main')).toBeFocused();
  const colors=await page.locator('footer p').evaluate(el=>({fg:getComputedStyle(el).color.match(/[\d.]+/g)!.map(Number),bg:getComputedStyle(document.documentElement).backgroundColor.match(/[\d.]+/g)!.map(Number)}));
  expect(contrast(colors.fg,colors.bg)).toBeGreaterThanOrEqual(4.5);
  await page.getByRole('button',{name:'Rozpocznij ćwiczenie',exact:true}).click();
  await expect(page.locator('#exercise-title')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>getComputedStyle(document.activeElement!).outlineStyle)).not.toBe('none');
  // Root text enlargement supplements, but does not replace, manual 200% browser zoom.
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.evaluate(()=>{(window as unknown as {lastScroll?:ScrollToOptions}).lastScroll=undefined;window.scrollTo=((opts:ScrollToOptions)=>{(window as unknown as {lastScroll?:ScrollToOptions}).lastScroll=opts;}) as typeof window.scrollTo;});
  await page.locator('.brand').click();
  expect(await page.evaluate(()=>(window as unknown as {lastScroll?:ScrollToOptions}).lastScroll?.behavior)).toBe('auto');
});
