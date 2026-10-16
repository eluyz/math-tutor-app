import { expect, test } from '@playwright/test'

test('użytkownik rozwiązuje zadanie i dostaje wyjaśnienie', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Matematyka/ })).toBeVisible()
  await page.getByRole('button', { name: /Rozpocznij ćwiczenia/ }).click()
  await expect(page.getByText('3 + 4 × 2 = ?')).toBeVisible()
  await page.getByLabel('Twoja odpowiedź').fill('14')
  await page.getByRole('button', { name: /Sprawdź/ }).click()
  await expect(page.getByRole('status')).toContainText('Mnożenie ma pierwszeństwo')
  await page.getByLabel('Twoja odpowiedź').fill('11')
  await page.getByRole('button', { name: /Sprawdź/ }).click()
  await expect(page.getByRole('status')).toContainText('Najpierw 4 × 2 = 8')
})

test('układ i zadanie są dostępne na telefonie', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('button', { name: /Liczby ujemne/ }).click()
  await expect(page.getByText('−7 + 12 = ?')).toBeVisible()
  await expect(page.getByLabel('Twoja odpowiedź')).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(hasHorizontalOverflow).toBe(false)
})
