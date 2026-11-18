import { test, expect } from '@playwright/test';

// Never disable Chromium sandbox for sprint evidence.

for (const width of [320,375,390,768,1280,1440]) for (const english of [false,true]) {
  test(`MT-UI-003 task-first ${width}px ${english?'EN':'PL'}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    if(english) await page.getByRole('button',{name:'English',exact:true}).click();
    const start=page.getByRole('button',{name:english?'Start practice':'Rozpocznij ćwiczenie',exact:true});
    await expect(start).toBeVisible();
    const box=await start.boundingBox(); expect(box!.y+box!.height).toBeLessThan(900);
    await start.click();
    await expect(page.locator('#exercise-title')).toBeFocused();
    await expect(page.locator('.question')).toBeVisible();
    expect(await page.locator('.exercise-layout').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.catalog-config')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    for(const selector of ['.subject-navigation button','.view-navigation button','.practice-entry button']) {
      const heights=await page.locator(selector).evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().width).map(el=>el.getBoundingClientRect().height));
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    const config=page.locator('.catalog-config');
    await config.locator('summary').click();
    await expect(config).not.toHaveAttribute('open','');
    await config.locator('summary').click();
    await expect(page.locator('#catalog-search-input')).toBeVisible();
    if(process.env.MT_UI_CAPTURE) await page.screenshot({path:`test-results/night-exercise-${width}-${english?'en':'pl'}.png`,fullPage:true});
  });
}
