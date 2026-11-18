import { expect, test, type Locator, type Page } from '@playwright/test';

type Subject = 'mathematics' | 'statistics';

async function open(page: Page, subject: Subject, en: boolean) {
  await page.goto('/');
  if (en) await page.getByRole('button', {name:'English',exact:true}).click();
  if (subject === 'statistics') await page.locator('.subject-navigation').getByRole('button', {
    name: en ? /Statistics & Probability/ : /Statystyka i prawdopodobieństwo/,
  }).click();
}

function trackButtons(page: Page, subject: Subject, en: boolean) {
  const panel = page.locator(subject === 'statistics' ? '.statistics-practice' : '.learning-workspace:not(.statistics-practice)');
  return {
    university: panel.locator('.study-groups').getByRole('button', {name:subject === 'statistics'
      ? (en?'University statistics':'Statystyka na studia') : (en?'University mathematics':'Matematyka na studia'),exact:true}),
    basics: panel.locator('.study-groups').getByRole('button', {name:subject === 'statistics'
      ? (en?'Statistics fundamentals':'Podstawy statystyki') : (en?'Review the basics':'Powtórka podstaw'),exact:true}),
  };
}

async function settle(page: Page) {
  return page.evaluate(async () => {
    const samples:number[]=[];
    for (let frame=0;frame<6;frame++) {
      await new Promise(requestAnimationFrame);
      samples.push(scrollY);
    }
    return {y:scrollY,maxY:Math.max(0,document.documentElement.scrollHeight-innerHeight),
      height:document.documentElement.scrollHeight,focus:(document.activeElement as HTMLElement)?.id || document.activeElement?.textContent?.trim().slice(0,80),samples};
  });
}

async function observeSwitch(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  await settle(page);
  const before=await settle(page);
  const box=await button.boundingBox();
  expect(box).not.toBeNull();
  // Native pointer coordinates avoid Playwright's own pre-click scrolling being
  // confused with scrolling caused by the application after the click.
  await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);
  await expect(button).toHaveAttribute('aria-pressed','true');
  return {before,after:await settle(page)};
}

for (const width of [375,390,768,1280]) for (const en of [false,true]) for (const subject of ['mathematics','statistics'] as const) {
  test(`track switch preserves viewport ${subject} ${width}px ${en?'EN':'PL'}`,async({page},info)=>{
    await page.setViewportSize({width,height:720});
    await open(page,subject,en);
    const buttons=trackButtons(page,subject,en);
    for (const [direction,button] of [['university',buttons.university],['basics',buttons.basics],['university-again',buttons.university]] as const) {
      const observation=await observeSwitch(page,button);
      console.log('TRACK_SCROLL_TRACE '+JSON.stringify({subject,width,en,direction,...observation}));
      await info.attach(direction,{body:JSON.stringify(observation),contentType:'application/json'});
      // A shorter document can clamp an old offset to its new physical maximum;
      // no other application-induced movement is allowed.
      const expected=Math.min(observation.before.y,observation.after.maxY);
      expect.soft(Math.abs(observation.after.y-expected),JSON.stringify({subject,width,en,direction,...observation})).toBeLessThanOrEqual(2);
    }
  });
}

// Temporary, read-only causal experiment. Each arm loads a fresh real page and
// forwards focus to the native implementation; no application source changes.
for(const subject of ['mathematics','statistics'] as const) test(`diagnose focus versus anchoring ${subject}`,async({page})=>{
  await page.setViewportSize({width:390,height:720});
  for(const mode of ['native','focus-without-scroll','no-anchoring','both'] as const) {
    await open(page,subject,false);
    await page.evaluate(mode=>{
      const state={calls:[] as unknown[]};
      (window as unknown as {trackTrace:typeof state}).trackTrace=state;
      const native=HTMLElement.prototype.focus;
      HTMLElement.prototype.focus=function(options){
        state.calls.push({id:this.id,tag:this.tagName,y:scrollY,options});
        return native.call(this,mode==='focus-without-scroll'||mode==='both'?{...options,preventScroll:true}:options);
      };
      if(mode==='no-anchoring'||mode==='both') document.documentElement.style.overflowAnchor='none';
    },mode);
    const buttons=trackButtons(page,subject,false);
    for(const [direction,button] of [['university',buttons.university],['basics',buttons.basics]] as const){
      const observation=await observeSwitch(page,button);
      const calls=await page.evaluate(()=>(window as unknown as {trackTrace:{calls:unknown[]}}).trackTrace.calls.splice(0));
      console.log('TRACK_SCROLL_CAUSE '+JSON.stringify({subject,mode,direction,...observation,calls}));
    }
  }
});
