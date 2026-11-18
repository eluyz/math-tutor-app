import { expect, test } from '@playwright/test';

for (const width of [375, 390, 1280, 1440]) {
  test(`MT-UI-001: reflow, aligned controls and keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.brand')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    for (const selector of ['.subject-navigation button', '.view-navigation button', '.category-picker button']) {
      const heights = await page.locator(selector).evaluateAll(elements => elements.map(el => el.getBoundingClientRect().height));
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
    }
    await page.getByRole('button', { name: 'Nowy przykład', exact: true }).click();
    await expect(page.getByLabel('Twoja odpowiedź', { exact: true })).toBeFocused();
    await expect(page.locator('.question')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: /Choose a topic/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
