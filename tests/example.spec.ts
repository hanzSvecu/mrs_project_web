import { test, expect } from '@playwright/test';
import { skip } from 'node:test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

// problem with Google CAPTCHA - cannot proceed further; another test continues without Google search part in order to perform the task
test.skip('original task with Google search', async ({ page }) => {
  await page.goto('https://www.google.com');
  
  const rejectButton = page.getByRole('button', { name: /Don't use Chrome|Stay in browser/i });
  if (await rejectButton.isVisible().catch(() => false)) {
    await rejectButton.click();
  }

  await page.getByRole('combobox', { name: 'Search' }).fill('MoroSystems');

  await Promise.all([
    page.waitForURL(/google\.com\/search/),
    page.locator('input[name="btnK"]:visible').click(),
  ]);
});


test('workaround without Google search', async ({ page }) => {
  await page.goto('https://www.morosystems.cz/');

  const menu = page.locator('#menu-hlavni-menu');
  await expect(menu).toBeVisible();

  await menu.getByRole('link', { name: 'O nás' }).hover();

  const kariera = menu.getByRole('link', { name: 'Kariéra' });
  await expect(kariera).toBeVisible();
  await kariera.click();

  await expect(page).toHaveURL('https://www.morosystems.cz/kariera/')
  await page.getByRole('link', { name: 'Všechna města' }).click();

  const positionsSection  = page.locator('#pozice');

  const citySelect = positionsSection.locator('.c-positions__tools .inp-custom-select').first();
  const cityTrigger = citySelect.locator('.inp-custom-select__select');
  const cityDropdown = citySelect.locator('.inp-custom-select__wrapper');

  const classes = await citySelect.getAttribute('class');
  if (!classes?.includes('is-open')) {
    await cityTrigger.click();
  }

  await expect(citySelect).toContainClass('is-open');
  await expect(cityDropdown).toBeVisible();

  const prahaOption = cityDropdown.locator('label[data-filter="Praha"]');
  await expect(prahaOption).toBeVisible();
  await prahaOption.click();

  const hiddenTexts = await page
    .locator('#pozice li.c-positions__item.is-hidden')
    .allTextContents();

  for (const text of hiddenTexts) {
    expect(text.trim()).not.toContain('Praha');
  }

  const visibleTexts = await page
    .locator('#pozice li.c-positions__item:not(.is-hidden)')
    .allTextContents();

  for (const text of visibleTexts) {
    expect(text.trim()).toContain('Praha');
  }
});
