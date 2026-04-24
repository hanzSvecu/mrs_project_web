import { test, expect, Page, Locator } from '@playwright/test';

function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) < 1000; // Define mobile as width less than 1000px (got from empirical observation of the tested page)
}

type ScenarioName =
  | 'direct'
  | 'google'
  | 'directWithConsent'
  | 'googleWithConsent';


/* Input type for adding cookies to the browser context */
type CookieInput = {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
};

/* Define test scenarios with different referer and cookie states */
type Scenario = {
  name: string;
  referer?: string;
  cookies?: CookieInput[];
};

/* Specific cookie for the page, representing user consent for cookies */
const consentCookie: CookieInput = {
  name: 'CookieScriptConsent',
  value: JSON.stringify({
    googleconsentmap: {
      ad_storage: 'targeting',
      analytics_storage: 'performance',
      ad_user_data: 'targeting',
      ad_personalization: 'targeting',
      functionality_storage: 'functionality',
      personalization_storage: 'functionality',
      security_storage: 'functionality',
    },
    bannershown: 0, // Uncomment if the banner visibility state needs to be explicitly set; default value is 1
  }),
  domain: '.morosystems.cz',
  path: '/',
  secure: true,
  httpOnly: false,
  sameSite: 'Lax',
};

const scenarioName = (process.env.PW_SCENARIO ?? 'direct') as ScenarioName;

const scenarios: Record<ScenarioName, Scenario> = {
  direct: {
    name: 'direct without cookie',
  },
  google: {
    name: 'google referer without cookie',
    referer: 'https://www.google.com/',
  },
  directWithConsent: {
    name: 'direct with consent cookie',
    cookies: [consentCookie],
  },
  googleWithConsent: {
    name: 'google referer with consent cookie',
    referer: 'https://www.google.com/',
    cookies: [consentCookie],
  },
};

const selectedScenario = scenarios[scenarioName];

// for (const scenario of scenarios) {
  test(`workaround without Google search - ${selectedScenario.name}`, async ({ context, page }) => {
  if (selectedScenario.cookies?.length) {
    await context.addCookies(selectedScenario.cookies);
  }
    await openCareerPage(page, selectedScenario.referer);
    await selectCity(page, 'Praha');

    await expectVisiblePositionsToContainCity(page, 'Praha');
    await expectHiddedPositionsToNotContainCity(page, 'Praha');
  });
// }

/* Locator helper functions */
const BASE_URL = 'https://www.morosystems.cz/';
const CAREER_URL = `${BASE_URL}kariera/`;
const POSITIONS_SECTION = '#pozice';
const POSITION_ITEM = 'li.c-positions__item';

// for localization support
const NAV_LINKS = {
  about: 'O nás',
  career: 'Kariéra',
  allCities: 'Všechna města',
};

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

function getHeaderLocators(page: Page) {
    const menu = isMobile(page)
    ? page.locator('#menu-main')
    : page.locator('#menu-hlavni-menu');
    /**
      Oh my god, why there is this inconsistency? On mobile and tablet, the parent element is #menu-hlavni-menu,
      for consistency and reusability I would expect #menu-main so it is inconsistent;
      giving up mobile automation for this exercise.
    **/
    const careerLink = isMobile(page)
    ? page.locator('#menu-hlavni-menu').getByRole('link', { name: NAV_LINKS.career })
    : menu.getByRole('link', { name: NAV_LINKS.career });

  return {
    menu,
    aboutLink: menu.getByRole('link', { name: NAV_LINKS.about }),
    careerLink: menu.getByRole('link', { name: NAV_LINKS.career }),
  };
}

function getCareerPageLocators(page: Page) {
  const positionsSection = page.locator(POSITIONS_SECTION);
  const citySelect = positionsSection.locator('.c-positions__tools .inp-custom-select').first();

  return {
    positionsSection,
    citySelect,
    cityTrigger: citySelect.locator('.inp-custom-select__select'),
    cityDropdown: citySelect.locator('.inp-custom-select__wrapper'),
    allPositionItems: positionsSection.locator(POSITION_ITEM),
    visiblePositionItems: positionsSection.locator(`${POSITION_ITEM}:not(.is-hidden)`),
    hiddenPositionItems: positionsSection.locator(`${POSITION_ITEM}.is-hidden`),
  };
}


/* Specific helper functions for the test case */
async function openCareerPage(page: Page, referer?: string) {
  const header = getHeaderLocators(page);
  await page.goto(BASE_URL, { referer : referer });

  const menu = header.menu;
  await expect(menu).toBeVisible();

  if (!isMobile(page)) await header.aboutLink.hover();

  const careerLink = header.careerLink;
  await expect(careerLink).toBeVisible();
  await careerLink.click();

  // expected fail for mobile and tablet due to the inconsistency in the menu structure
  await expect(page).toHaveURL(CAREER_URL);
}

async function selectCity(page: Page, city: string) {
  await page.getByRole('link', { name: NAV_LINKS.allCities }).click();
  const careerPage = getCareerPageLocators(page);

  const citySelect = careerPage.citySelect;
  const cityTrigger = careerPage.cityTrigger;
  const cityDropdown = careerPage.cityDropdown;

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
