import { test, expect, Page, Locator } from '@playwright/test';

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
  await openCareerPage(page);
  await selectCity(page, 'Praha');

  await expectVisiblePositionsToContainCity(page, 'Praha');
  await expectHiddedPositionsToNotContainCity(page, 'Praha');
});


const POSITIONS_SECTION = '#pozice';
const POSITION_ITEM = 'li.c-positions__item';

function getPositionItems(
  page: Page,
  visibility: 'visible' | 'hidden',
): Locator {
  switch (visibility) {
    case 'visible':
      return page.locator(`${POSITIONS_SECTION} ${POSITION_ITEM}:not(.is-hidden)`);
    case 'hidden':
      return page.locator(`${POSITIONS_SECTION} ${POSITION_ITEM}.is-hidden`);
  }
}

async function openCareerPage(page: Page) {
  await page.goto('https://www.morosystems.cz/');

  const menu = page.locator('#menu-hlavni-menu');
  await expect(menu).toBeVisible();

  await menu.getByRole('link', { name: 'O nás' }).hover();

  const careerLink = menu.getByRole('link', { name: 'Kariéra' });
  await expect(careerLink).toBeVisible();
  await careerLink.click();

  await expect(page).toHaveURL('https://www.morosystems.cz/kariera/');
}

async function selectCity(page: Page, city: string) {
  await page.getByRole('link', { name: 'Všechna města' }).click();
  const positionsSection  = page.locator(`${POSITIONS_SECTION}`);

  const citySelect = positionsSection.locator('.c-positions__tools .inp-custom-select').first();
  const cityTrigger = citySelect.locator('.inp-custom-select__select');
  const cityDropdown = citySelect.locator('.inp-custom-select__wrapper');

  const classes = await citySelect.getAttribute('class');
  if (!classes?.includes('is-open')) {
    await cityTrigger.click();
  }

  await expect(citySelect).toContainClass('is-open');
  await expect(cityDropdown).toBeVisible();

  const cityOption = cityDropdown.locator(`label[data-filter="${city}"]`);
  await expect(cityOption).toBeVisible();
  await cityOption.click();
}

async function expectVisiblePositionsToContainCity(page: Page, city: string): Promise<void> {
  const visibleItems = getPositionItems(page, 'visible');
  const count = await visibleItems.count();

  for (let i = 0; i < count; i++) {
    const item = visibleItems.nth(i);
    const filter = await item.getAttribute('data-filter');
    const filterValue = filter != null ? filter : '';
    expect(filterValue).toContain(city);
  }
}

async function expectHiddedPositionsToNotContainCity(page: Page, city: string) {
  const hiddenItems = getPositionItems(page, 'hidden');
  const count = await hiddenItems.count();

  for (let i = 0; i < count; i++) {
    const item = hiddenItems.nth(i);
    const filter = await item.getAttribute('data-filter');
    const filterValue = filter != null ? filter : '';
    expect(filterValue).not.toContain(city);
  }
}
