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
  // Cover a nonzero offset even when the track is already visible near the top.
  await page.evaluate(()=>window.scrollTo({top:Math.max(64,scrollY),behavior:"instant"}));
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
      await expect(button).toBeFocused();
      console.log('TRACK_SCROLL_TRACE '+JSON.stringify({subject,width,en,direction,...observation}));
      await info.attach(direction,{body:JSON.stringify(observation),contentType:'application/json'});
      // A shorter document can clamp an old offset to its new physical maximum;
      // no other application-induced movement is allowed.
      const expected=Math.min(observation.before.y,observation.after.maxY);
      expect.soft(Math.abs(observation.after.y-expected),JSON.stringify({subject,width,en,direction,...observation})).toBeLessThanOrEqual(2);
    }
  });
}

async function expectVisibleFocus(page: Page, element: Locator) {
  await expect(element).toBeFocused();
  const rect=await element.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(720);
  expect(await element.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
}

for(const width of [375,390,768,1280]) for(const en of [false,true]) {
  test(`keyboard track navigation and deliberate exercise focus ${width}px ${en?'EN':'PL'}`,async({page})=>{
    await page.setViewportSize({width,height:720});
    await open(page,'mathematics',en);
    const math=trackButtons(page,'mathematics',en);
    await math.basics.focus();
    await page.keyboard.press('Tab');
    await expectVisibleFocus(page,math.university);
    await page.keyboard.press('Enter');
    await expect(math.university).toHaveAttribute('aria-pressed','true');
    await expectVisibleFocus(page,math.university);
    // Keyboard activation may scroll if layout moves the focused selector;
    // its focus must stay visible rather than being trapped offscreen.
    await page.keyboard.press('Tab');
    await expectVisibleFocus(page,page.locator('.practice .category-picker button').first());

    // Explicitly generating another exercise must still bring its answer into
    // view. The track fix must not become a global preventScroll policy.
    const nextMath=page.getByRole('button',{name:en?'New example':'Nowy przykład',exact:true});
    await nextMath.focus();
    const configurationY=await page.evaluate(()=>scrollY);
    await page.keyboard.press('Enter');
    await expectVisibleFocus(page,page.locator('#answer'));
    expect(await page.evaluate(()=>scrollY)).toBeLessThan(configurationY-20);

    await open(page,'statistics',en);
    const stats=trackButtons(page,'statistics',en);
    await stats.basics.focus();
    await page.keyboard.press('Tab');
    await expectVisibleFocus(page,stats.university);
    const statsBefore=await settle(page);
    await page.keyboard.press('Enter');
    await expect(stats.university).toHaveAttribute('aria-pressed','true');
    await expectVisibleFocus(page,stats.university);
    const university=await settle(page);
    expect(Math.abs(university.y-Math.min(statsBefore.y,university.maxY))).toBeLessThanOrEqual(2);
    await page.keyboard.press('Shift+Tab');
    await expectVisibleFocus(page,stats.basics);
    const returnBefore=await settle(page);
    await page.keyboard.press('Enter');
    await expect(stats.basics).toHaveAttribute('aria-pressed','true');
    await expectVisibleFocus(page,stats.basics);
    const fundamentals=await settle(page);
    expect(Math.abs(fundamentals.y-Math.min(returnBefore.y,fundamentals.maxY))).toBeLessThanOrEqual(2);
    await page.keyboard.press('Tab');
    await expectVisibleFocus(page,page.locator('[data-topic=mean]'));

    const nextStats=page.locator('.statistics-practice').getByRole('button',{name:en?'Next exercise':'Następne zadanie',exact:true});
    await nextStats.focus();
    // A user can scroll away from a focused action, then activate it with Enter.
    // Arrange an offscreen answer so this proves actual intentional scrolling.
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    expect((await page.locator('#statistics-answer').boundingBox())!.y).toBeGreaterThan(720);
    await page.keyboard.press('Enter');
    await expectVisibleFocus(page,page.locator('#statistics-answer'));
    expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  });
}
