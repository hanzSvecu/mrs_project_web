
# MRSProject WEB

## Overview

MRSProject_WEB is an automated testing project created as part of an interview assignment.
It validates a user journey on the MoroSystems website, simulating realistic access patterns and ensuring correct behavior across different environments.

### Purpose
The goal of this project is to test the following user flow:
Google Search → MoroSystems Homepage → Kariéra Page → Filter Jobs by City
Since direct automation of Google Search is unreliable (CAPTCHA, bot detection), the entry is simulated using:
- referer (e.g. https://www.google.com/)
- CookieInput (to mimic consent/marketing state)

This approach provides stable and reproducible test conditions.

## Tech Stack
- TypeScript
- Playwright
- GitHub
- GitHub Actions

## Key Features

### Cross-browser testing:
- Chrome
- Edge
- Firefox
- WebKit (Safari-like)

### Responsive testing across devices:
- mobile (width: 390, height: 844)
- tablet (width: 768, height: 1024)
- laptop (width: 1366, height: 768)
- desktop (width: 1920, height: 1080)

### Scenario-based testing:
- Direct access
- Google referer simulation
- Consent cookie variations

### Job filtering validation:
- Verifies visibility of job positions based on selected city

### CI/CD integration:
- Triggered on push and pull request
- Nightly scheduled runs
- Manual execution via GitHub Actions (workflow_dispatch)

### Configurable execution modes:
- pr – lightweight checks for PRs
- nightly – extended scheduled testing
- full – complete cross-browser and resolution matrix
- incomplete – failing tests for resolution widht < 1000 - different page behavior and spotted inconsistency in element naming, decided to not proceed further, but pottentially extendable in future

## Installation & Usage
### Local Execution
Run tests locally using environment variables:

```
PW_RUN_MODE=full PW_SCENARIO=googleWithConsent npx playwright test
```

```PowerShell
$env:PW_RUN_MODE="full"
$env:PW_SCENARIO="googleWithConsent"
npx playwright test
```

### CI / GitHub Actions
Test execution is defined in:

```poweshell
.github/workflows/playwright.yml
```

**The workflow supports:**
- Automatic runs on push and pull requests
- Scheduled nightly runs via cron (commented out for now to avoid having unplanned executions)
- Manual execution with selectable parameters:
- run mode (see Configurable execution mode)
- scenario (referer and cookies combination)

**To trigger manually:**
Go to GitHub → Actions
Select Playwright Tests
Click Run workflow
Choose desired configuration

**Reports**
After execution, a Playwright HTML report is generated and uploaded as an artifact:
```playwright-report/```

You can open it locally with:
```npx playwright show-report```

## Notes
Google Search is not directly automated due to bot protection; instead, it is simulated
WebKit execution may require custom browser path configuration in local environments
Scheduled workflows run in UTC time and may not execute exactly on minute boundaries