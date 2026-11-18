import { expect, test } from '@playwright/test';
for(const width of [320,375,390,768,1280,1440]) for(const en of [false,true]) {
  test(`shared practice surfaces ${width} ${en?'EN':'PL'}`,async({page})=>{
    await page.setViewportSize({width,height:900}); await page.goto('/');
    if(en) await page.getByRole('button',{name:'English',exact:true}).click();
    await page.getByRole('button',{name:en?'Start practice':'Rozpocznij ćwiczenie',exact:true}).click();
    const math=await page.locator('.learning-workspace .check-button:visible').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,h:el.getBoundingClientRect().height}));
    await page.getByRole('navigation',{name:en?'Math Tutor subjects':'Działy Math Tutor'}).getByRole('button',{name:en?/Statistics & Probability/:/Statystyka i prawdopodobieństwo/}).click();
    const stats=page.locator('.statistics-practice'); await expect(stats).toBeVisible();
    await expect(stats.locator('label[for="statistics-answer"]')).toBeVisible();
    expect(await stats.locator('.check-button').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(math.bg);
    for(const h of await stats.locator('button').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().width).map(el=>el.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(44);
    await stats.locator('#statistics-answer').fill('abc'); await stats.locator('button[type="submit"]').click();
    await expect(stats.locator('#statistics-answer')).toHaveAttribute('aria-invalid','true');
    await expect(stats.locator('#statistics-feedback')).not.toBeEmpty();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    if(process.env.MT_UI_CAPTURE) await page.screenshot({path:`test-results/night-statistics-${width}-${en?'en':'pl'}.png`,fullPage:true});
  });
}
