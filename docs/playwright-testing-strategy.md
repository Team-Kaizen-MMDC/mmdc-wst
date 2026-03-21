# Playwright Testing Strategy for the Japan SSW Static Site

Overview

This document describes a practical, low-friction approach to add Playwright-based automated tests for this static site. It focuses on: local development, smoke/E2E flows, accessibility checks, visual snapshots, and CI integration.

Goals

- Provide a stable, fast test harness for critical user flows (signup, signin, job search, company pages).
- Catch regressions early with E2E and visual snapshot tests.
- Run accessibility checks as part of E2E tests.
- Keep the setup minimal so contributors can run tests locally.

What we will add

- A small Playwright config and example tests under `tests/playwright/`.
- Guidance to run tests locally and in CI.
- Suggested GitHub Actions workflow (example).

Why Playwright

- Fast, modern E2E framework with first-class browser automation (Chromium, WebKit, Firefox).
- Built-in test runner with parallelism, retries, and trace/trace viewer support.
- Works well for static sites: spins up a local static server and hits pages directly.

Directory layout (suggested)

- tests/playwright/
  - playwright.config.js # test runner config
  - example.spec.js # small sample tests (health, nav, signup flow)
  - fixtures/ # reusable helpers (if needed)
  - snapshots/ # Playwright will manage visual snapshots

Quick setup (local)

1. Ensure Node.js is installed (v16+ recommended).
2. From repo root, install Playwright and browsers:

```bash
npm init -y
npm i -D @playwright/test
# install browsers (Chromium/Firefox/WebKit)
npx playwright install
```

1. Run a local server from the repo root:

```bash
# simple python server
python3 -m http.server 8000
# or use npm package
npx http-server -p 8000
```

1. Run Playwright tests:

```bash
npx playwright test --project=chromium
# run with headed browser for debugging
npx playwright test --headed
```

Example tests (what to cover)

- Smoke tests (fast):

  - Home page loads (200) and main nav links exist.
  - Company page (e.g., /pages/companies/ana.html) loads and has a "View jobs" button.
  - Footer renders and contains copyright/legal links.

- Critical flows (E2E):

  - Signup flow: open `createAccount.html`, fill fields, submit (the site is static so validate redirect/next page exists).
  - Job search / job detail flows.

- Accessibility checks:

  - Use Playwright + axe-core to run basic accessibility assertions on key pages.

- Visual snapshots:
  - Capture screenshots of the homepage, hero, and company detail page at standard sizes (mobile/tablet/desktop).

Config notes

- Keep tests deterministic: use `waitForSelector` and avoid hard timeouts.
  -- Use `baseURL` in Playwright config (`http://localhost:3000`) for convenience.
- Use `trace` on failure to debug flakiness: `playwright show-trace`.

Sample GitHub Actions CI

- Steps:
  1. Checkout
  2. Setup Node
  3. Install dependencies
  4. Install Playwright browsers
  5. Start a static server (python -m http.server 8000)
  6. Run `npx playwright test`

Notes on flakiness

- Keep tests tiny and focused. Prefer API/unit tests for logic, E2E only for real flows.
- Use stable selectors (data-testid or class names) and avoid CSS that changes frequently.

Next steps

- I created a small config and example test in `tests/playwright/` for you. Run `npx playwright test --headed` to see it in action.
- If you want I can also create a GitHub Actions workflow file to run Playwright on PRs.

Appendix: Commands summary

Install & browsers:

```bash
npm i -D @playwright/test
npx playwright install
```

Run server (dev):

```bash
python3 -m http.server 8000
```

Run tests:

```bash
npx playwright test
npx playwright test --project=chromium
npx playwright test --headed
```
