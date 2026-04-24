import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const viewport = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 },
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    
    { name: 'chrome-laptop', use: { ...devices['Desktop Chrome'], viewport: viewport.laptop } },
    { name: 'chrome-desktop', use: { ...devices['Desktop Chrome'], viewport: viewport.desktop } },
    { name: 'firefox-laptop', use: { browserName: 'firefox', viewport: viewport.laptop } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: viewport.desktop } },
    { name: 'edge-laptop', use: { channel: 'msedge', viewport: viewport.laptop } },
    { name: 'edge-desktop', use: { channel: 'msedge', viewport: viewport.desktop } },
    
    /**
      Exclude mobile testing due to the inconsistency in the website's menu structure, 
      which hinders reliable automation across different viewports. 
      The mobile version uses a different parent element for the menu, making it difficult to create reusable locators and maintain test stability. 
      Given the time constraints and the focus on desktop testing, mobile automation has been deprioritized for this exercise.
    **/
    // { name: 'chrome-mobile', use: { ...devices['Desktop Chrome'], viewport: viewport.mobile } },
    // { name: 'webkit-mobile', use: { browserName: 'webkit', viewport: viewport.mobile } },
    // { name: 'chrome-tablet', use: { ...devices['Desktop Chrome'], viewport: viewport.tablet } },
    // { name: 'firefox-mobile', use: { browserName: 'firefox', viewport: viewport.mobile } },
    // { name: 'mobile-pixel5-firefox', use: { ...devices['Pixel 5'], browserName: 'firefox' } },
    // { name: 'mobile-iphone12-webkit', use: { ...devices['iPhone 12'], browserName: 'webkit'} },

    /** TODO:
      • Reporting: Generate a detailed test report that includes pass/fail status, screenshotson failure, and logs.
      • Parallel Execution: Configure the tests for parallel execution to improve efficiency.
      • Visual Testing: Implement visual testing to compare the current state of the
      website with a baseline image.
      • OpenAPI/Swagger codegen: Generate API connector with OpenAPI/Swagger
      codegen.
      • Responsive Design Check: Validate that the MoroSystems website and "Kariéra" page display correctly on different screen resolutions.
    **/

  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
