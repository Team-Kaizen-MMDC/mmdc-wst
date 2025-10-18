# Playwright Test Suite Guide

Comprehensive end-to-end and smoke tests for JapanSSW website.

## Test Files Overview

### Smoke Tests

**`smoke-links.spec.ts`** - Tests all header/footer links across all pages

- ✅ Validates header navigation links on all 30+ pages
- ✅ Tests mobile offcanvas navigation on representative pages
- ✅ Validates footer links on key page types
- ✅ Tests critical navigation flows (brand logo, signup, login, etc.)
- ✅ Tests hash link navigation (Jobs, Companies sections)

### End-to-End Tests

**`e2e-navigation.spec.ts`** - Complete user journey tests

- ✅ Job search and application flow
- ✅ Company browsing flow
- ✅ User registration flow (signup/login)
- ✅ Profile dashboard and edit forms
- ✅ Information pages navigation
- ✅ Cross-page consistency checks

### Feature Tests

**`offcanvas.spec.ts`** - Mobile offcanvas navigation

- Tests offcanvas open/close behavior across different page types
- Hash link and page navigation from offcanvas
- Focus management and accessibility
- Auth button functionality

**`i18n.spec.ts`** - Language toggle functionality

- EN to JA translation across all page types
- localStorage persistence
- Fallback behavior for failed locale loads
- Tests on homepage, jobs, companies, dashboards, info pages

**`jobs.spec.js`** - Job pages specific tests

- Navigation from homepage to job details
- Sticky apply CTA behavior
- All job pages load correctly
- Job filter page functionality
- Header/footer consistency

## Running Tests

### Quick Start

```bash
# Make sure dev server is running first
python -m http.server 8000

# Run all tests
npx playwright test

# Run specific test file
npx playwright test smoke-links.spec.ts
npx playwright test e2e-navigation.spec.ts
```

### Development Mode

```bash
# UI mode (best for development)
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Debug mode (step through tests)
npx playwright test --debug
```

### Browser-Specific

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Mobile (iPhone 12)
npx playwright test --project=webkit-mobile
```

### Specific Test Suites

```bash
# Smoke tests only
npx playwright test smoke-links.spec.ts

# E2E tests only
npx playwright test e2e-navigation.spec.ts

# Feature tests
npx playwright test offcanvas.spec.ts
npx playwright test i18n.spec.ts
npx playwright test jobs.spec.js
```

## Test Coverage

### Pages Tested (30+ pages)

**Core Pages:**

- `/` - Homepage with hero
- `/pages/about.html` - About page
- `/pages/agency.html` - Agency page
- `/pages/contact.html` - Contact page
- `/pages/createAccount.html` - Signup
- `/pages/signin.html` - Login
- `/pages/profileDashboard.html` - Profile dashboard
- `/pages/companyDashboard.html` - Company dashboard
- `/pages/services.html` - Services
- `/pages/terms.html` - Terms
- `/pages/privacy.html` - Privacy policy
- `/pages/visaGuidance.html` - Visa guidance

**Job Pages (6):**

- mechanic-ground-support-haneda.html
- cleaner-facilities-maintenance.html
- construction-worker-site-support.html
- server-hospitality.html
- ward-nursing-support.html
- jobFilter.html

**Company Pages (9):**

- ana.html
- ana-intercontinental.html
- daikin.html
- kandenko.html
- mitsubishi-heavy-industries.html
- nissan.html
- prince-hotels.html
- sompo-care.html
- yoshinoya.html

**Add/Edit Pages (5):**

- profile.html
- contact.html
- education.html
- experience.html
- skill.html

### Navigation Elements Tested

**Header:**

- Jobs (#jobs hash link)
- Companies (#companies hash link)
- Agency (pages/agency.html)
- About (pages/about.html)
- Signup button (pages/createAccount.html)
- Login button (pages/signin.html)
- Brand logo (index.html)

**Footer:**

- Company section: Home, About, Contact
- Jobs section: Search Jobs, Companies, Post a Job (hash links)
- Resources section: Visa Guidance, Employer Hub, Privacy
- Legal section: Terms, Privacy

**Mobile Offcanvas:**

- All nav links (Jobs, Companies, Agency, About)
- Auth buttons (Signup, Login)
- Open/close behavior
- Focus management

### User Flows Tested

1. **Job Search Flow**: Homepage → Job Card → Job Detail → Apply
2. **Company Browse Flow**: Homepage → Company Card → Company Detail → Back
3. **Registration Flow**: Homepage → Signup → Form
4. **Login Flow**: Homepage → Login → Form
5. **Profile Edit Flow**: Profile Dashboard → Edit Profile/Contact/Education/Experience/Skill
6. **Info Navigation**: Homepage → About/Agency/Contact → Return
7. **Footer Navigation**: Any page → Footer links → Target pages
8. **Mobile Navigation**: Offcanvas open → Navigate → Close

## Configuration

See `playwright.config.js`:

- **Base URL**: `http://localhost:8000`
- **Browsers**: Chromium, Firefox, Webkit (iPhone 12)
- **Timeout**: 30 seconds per test
- **Retries**: 1 retry on failure
- **Trace**: Collected on first retry
- **Screenshots**: Only on failure
- **Video**: On retry only

## Before Running Tests

### Start Dev Server

The tests require a local server running on port 8000:

```bash
# Python server (recommended)
python -m http.server 8000

# Or use npm script if configured
npm run server

# Or use Make if configured
make serve
```

### Install Dependencies

```bash
# Install node modules
npm install

# Install Playwright browsers (one-time)
npx playwright install
```

## CI/CD Integration

These tests are designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Start dev server
  run: python -m http.server 8000 &

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Organization Strategy

### 1. Smoke Tests (Broad Coverage)

- Test ALL pages for basic functionality
- Validate header/footer links everywhere
- Quick checks for critical elements
- Parallel execution for speed

### 2. E2E Tests (User Flows)

- Test complete user journeys
- Validate multi-step processes
- Check cross-page interactions
- Ensure flow consistency

### 3. Feature Tests (Specific Components)

- Deep testing of individual features
- Edge cases and error scenarios
- Accessibility and focus management
- Mobile/desktop variations

## Maintenance Guidelines

### When Adding New Pages:

1. Add page path to `PAGES` array in `smoke-links.spec.ts`
2. Consider if an E2E flow is needed in `e2e-navigation.spec.ts`
3. Run smoke tests to verify links work
4. Update this guide with new page count

### When Changing Navigation:

1. Update `HEADER_NAV_LINKS` and `FOOTER_LINKS` arrays in `smoke-links.spec.ts`
2. Update offcanvas tests if mobile nav structure changes
3. Update i18n tests if translated text changes
4. Run full test suite to verify all changes

### When Refactoring Components:

1. Update selectors in relevant test files
2. Consider adding new feature tests if component is complex
3. Check if smoke tests need selector updates
4. Verify E2E flows still work end-to-end

## Debugging Failed Tests

### 1. Run in UI Mode

```bash
npx playwright test --ui
```

- Visual timeline of test execution
- Inspect DOM at any point
- See console logs and network requests
- Edit tests and rerun instantly

### 2. Run in Debug Mode

```bash
npx playwright test --debug
```

- Interactive debugging with DevTools
- Step through test line by line
- Inspect page state at breakpoints
- Modify page on the fly

### 3. View Trace

```bash
# After a test failure with retry
npx playwright show-report
```

- Click on failed test to see trace
- Timeline view of all actions
- Network requests and responses
- Screenshots at each step

### 4. Common Issues

**Test times out:**

- Check if selector is correct
- Increase timeout if element is slow to load
- Check if element is hidden by CSS
- Verify dev server is running

**Navigation doesn't work:**

- Check if href attributes are correct
- Verify baseURL in config matches server
- Check for JavaScript errors in console
- Test manually in browser first

**Element not found:**

- Inspect page to verify selector
- Check if element is in shadow DOM
- Verify element is not in iframe
- Try using more specific selector

**Flaky tests:**

- Add explicit waits for network/animations
- Use `waitForLoadState('load')` after navigation
- Check for race conditions
- Add retries in config

## Best Practices

### Selectors

- Use `data-testid` attributes for stable selectors
- Prefer role-based selectors for accessibility
- Avoid fragile CSS selectors that may change
- Use text matchers for human-readable assertions

### Waits

- Always wait for load state after navigation
- Use `waitForTimeout()` sparingly (flaky)
- Prefer `waitForSelector()` or `waitForLoadState()`
- Check `toBeVisible()` before interacting

### Assertions

- Make assertions explicit and descriptive
- Check both positive and negative cases
- Assert on multiple properties when relevant
- Use soft assertions for multiple checks

### Organization

- Group related tests in `test.describe()`
- Use descriptive test names
- Keep tests independent (no shared state)
- Clean up after tests if needed

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about#priority)
