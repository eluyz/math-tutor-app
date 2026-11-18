import { expect, test, type Page } from '@playwright/test';

const protectedOnUnload = (page: Page) => page.evaluate(() => {
  const event = new Event('beforeunload', {cancelable: true});
  window.dispatchEvent(event);
  return event.defaultPrevented;
});

async function replacement(page: Page, action: () => Promise<unknown>, accept: boolean) {
  await Promise.all([
    page.waitForEvent('dialog').then(async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toMatch(/Zmiana lekcji.*odpowiedź|Changing the lesson.*answer/);
      if (accept) await dialog.accept(); else await dialog.dismiss();
    }),
    action(),
  ]);
}

for (const width of [375,390,768,1280,1440]) for (const en of [false,true]) {
  test(`integrated median draft and deliberate replacement ${width}px ${en?'EN':'PL'}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    if(en) await page.getByRole('button',{name:'English',exact:true}).click();
    const subjects=page.locator('.subject-navigation');
    const statsButton=subjects.getByRole('button',{name:/Statistics & Probability|Statystyka i prawdopodobieństwo/});
    await statsButton.click();
    const panel=page.locator('.statistics-practice');
    const answer=panel.locator('#statistics-answer');
    const question=panel.locator('.question');
    await panel.locator('[data-topic=median]').focus();
    await page.keyboard.press('Enter');
    await expect(answer).toBeFocused();
    expect(await answer.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
    await answer.fill('7/3');
    await panel.getByRole('button',{name:en?'Show hint':'Pokaż podpowiedź',exact:true}).click();
    await panel.getByRole('button',{name:en?'Show solution':'Pokaż rozwiązanie',exact:true}).click();
    const original=await question.innerText();
    await subjects.getByRole('button').filter({has:page.getByText(en?'Mathematics':'Matematyka',{exact:true})}).click();
    await page.getByRole('button',{name:en?'My progress':'Moje postępy',exact:true}).click();
    await expect.poll(()=>protectedOnUnload(page)).toBe(true);
    await statsButton.click();
    await expect(answer).toHaveValue('7/3');
    await expect(question).toHaveText(original);
    await page.getByRole('button',{name:en?'Polski':'English',exact:true}).click();
    await expect(answer).toHaveValue('7/3');
    await expect(question).toHaveAttribute('data-lesson','median');
    await expect(panel.locator('.learning-hint')).toHaveCount(1);
    await expect(panel.locator('.solution-calculation')).toHaveCount(3);
    await page.getByRole('button',{name:en?'English':'Polski',exact:true}).click();

    for(const target of ['mean','university','medium','next'] as const) {
      // The first transition uses the draft preserved across subjects and PL/EN.
      if(target!=='mean') {
        await panel.locator('[data-track=fundamentals]').click();
        await panel.locator('[data-topic=mean]').click();
        await panel.locator('[data-topic=median]').click();
        await answer.fill('7/3');
        await panel.getByRole('button',{name:en?'Show hint':'Pokaż podpowiedź',exact:true}).click();
        await panel.getByRole('button',{name:en?'Show solution':'Pokaż rozwiązanie',exact:true}).click();
      }
      const before=await question.innerText();
      const seed=await question.getAttribute('data-seed');
      const action=()=> target==='next'
        ? panel.getByRole('button',{name:en?'Next exercise':'Następne zadanie',exact:true}).click()
        : panel.locator(target==='mean'?'[data-topic=mean]':target==='university'?'[data-track=university]':'[data-level=medium]').click();
      await replacement(page,action,false);
      await expect(answer).toHaveValue('7/3');
      await expect(question).toHaveText(before);
      await expect(question).toHaveAttribute('data-seed',seed!);
      await expect(question).toHaveAttribute('data-lesson','median');
      await expect(panel.locator('[data-track=fundamentals]')).toHaveAttribute('aria-pressed','true');
      await expect(panel.locator('.learning-hint')).toHaveCount(1);
      await expect(panel.locator('.solution-calculation')).toHaveCount(3);
      await expect.poll(()=>protectedOnUnload(page)).toBe(true);
      await replacement(page,action,true);
      if(target==='university') {
        await expect(panel.locator('form,.question')).toHaveCount(0);
        await expect(panel.locator('.category-picker button')).toHaveCount(9);
        await expect(panel.locator('.difficulty-picker button:enabled')).toHaveCount(0);
      } else {
        await expect(answer).toHaveValue('');
        await expect(answer).toBeFocused();
        await expect(panel.locator('.feedback,.learning-hint,.solution-calculation')).toHaveCount(0);
        await expect(question).toHaveAttribute(target==='mean'?'data-lesson':target==='medium'?'data-difficulty':'data-seed',target==='mean'?'mean':target==='medium'?'medium':String(Number(seed)+1));
      }
      await expect.poll(()=>protectedOnUnload(page)).toBe(false);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  });
}

for(const en of [false,true]) test(`median native reload cancellation preserves its document ${en?'EN':'PL'}`, async({page})=>{
  await page.setViewportSize({width:en?1280:375,height:900});
  await page.goto('/');
  if(en) await page.getByRole('button',{name:'English',exact:true}).click();
  await page.locator('.subject-navigation').getByRole('button',{name:/Statistics & Probability|Statystyka i prawdopodobieństwo/}).click();
  const panel=page.locator('.statistics-practice');
  await panel.locator('[data-topic=median]').click();
  await panel.locator('#statistics-answer').fill('7/3');
  const question=await panel.locator('.question').innerText();
  await expect.poll(()=>protectedOnUnload(page)).toBe(true);
  const marker=await page.evaluate(()=>{const value=crypto.randomUUID();document.documentElement.dataset.medianDocument=value;return value;});
  await Promise.all([
    page.waitForEvent('dialog').then(async dialog=>{expect(dialog.type()).toBe('beforeunload');await dialog.dismiss();}),
    page.evaluate(()=>window.location.reload()),
  ]);
  await expect(page.locator('html')).toHaveAttribute('data-median-document',marker);
  await expect(panel.locator('.question')).toHaveText(question);
  await expect(panel.locator('#statistics-answer')).toHaveValue('7/3');
});
