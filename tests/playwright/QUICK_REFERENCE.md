# Playwright Tests - Quick Reference

## 🚀 Quick Start

```bash
# Start dev server
python -m http.server 8000

# Run all tests
npx playwright test

# Run with UI (recommended)
npx playwright test --ui
```

## 📋 Test Files

| File                     | Purpose              | Tests   |
| ------------------------ | -------------------- | ------- |
| `smoke-links.spec.ts`    | All pages, all links | 72      |
| `e2e-navigation.spec.ts` | User flows           | 30      |
| `i18n.spec.ts`           | Language toggle      | 7       |
| `jobs.spec.js`           | Job pages            | 5       |
| `offcanvas.spec.ts`      | Mobile menu          | 5       |
| **TOTAL**                |                      | **119** |

## 🎯 Common Commands

```bash
# Run specific test file
npx playwright test smoke-links.spec.ts
npx playwright test e2e-navigation.spec.ts

# Run specific test by name
npx playwright test -g "Brand logo navigates"

# Run in debug mode
npx playwright test --debug

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit-mobile

# Run headed (see browser)
npx playwright test --headed

# Show test report
npx playwright show-report
```

## 📊 Coverage

### Pages (32 total)

- ✅ Homepage
- ✅ 11 Core pages (about, agency, contact, signin, etc.)
- ✅ 6 Job pages (mechanic, cleaner, construction, server, nursing, jobFilter)
- ✅ 9 Company pages (ANA, Nissan, SOMPO, etc.)
- ✅ 5 Add/Edit pages (profile, contact, education, experience, skill)

### Links Tested

- ✅ 6 Header links (Jobs, Companies, Agency, About, Signup, Login)
- ✅ 8 Footer links (Home, About, Contact, Privacy, Terms, etc.)
- ✅ Mobile offcanvas (all nav + auth buttons)
- ✅ Hash links (#jobs, #companies)

### User Flows

- ✅ Job search → Apply
- ✅ Company browse → Back
- ✅ Signup flow
- ✅ Login flow
- ✅ Profile editing
- ✅ Info pages navigation

## 🔧 Development

```bash
# Watch mode
npx playwright test --ui

# Single test debug
npx playwright test --debug smoke-links.spec.ts

# Generate code (record actions)
npx playwright codegen http://localhost:8000
```

## 📁 Test Organization

```
tests/playwright/
├── smoke-links.spec.ts      # 72 tests - all pages/links
├── e2e-navigation.spec.ts   # 30 tests - user flows
├── i18n.spec.ts            # 7 tests - language toggle
├── jobs.spec.js            # 5 tests - job pages
├── offcanvas.spec.ts       # 5 tests - mobile menu
├── TEST_GUIDE.md           # Full documentation
├── TEST_UPDATE_SUMMARY.md  # What changed
└── playwright.config.js    # Configuration
```

## ⚙️ Configuration

- **Base URL:** http://localhost:8000
- **Browsers:** Chromium, Firefox, Webkit (iPhone 12)
- **Timeout:** 30s per test
- **Retries:** 1
- **Trace:** On first retry
- **Screenshots:** On failure

## 🐛 Debugging

1. **UI Mode (Best):**

   ```bash
   npx playwright test --ui
   ```

   - Timeline view
   - Inspect DOM
   - See console/network

2. **Debug Mode:**

   ```bash
   npx playwright test --debug
   ```

   - Step through test
   - Interactive debugging

3. **View Trace:**
   ```bash
   npx playwright show-report
   ```
   - After failure
   - Full recording

## 📝 Adding Tests

### New Page

```typescript
// Add to PAGES array in smoke-links.spec.ts
{ path: '/pages/newpage.html', name: 'New Page' }
```

### New User Flow

```typescript
// Add to e2e-navigation.spec.ts
test("User can complete new flow", async ({ page }) => {
  await page.goto("/");
  // ... test steps
});
```

## 🔍 What Gets Tested

### Every Page (33 pages)

- ✅ Header links visible and correct href
- ✅ Brand logo links to homepage
- ✅ Auth buttons (Signup, Login) work

### Representative Pages (6 pages)

- ✅ Footer links visible and correct href
- ✅ Copyright text present

### Critical Paths

- ✅ Brand logo → Homepage
- ✅ Signup → Create Account page
- ✅ Login → Sign In page
- ✅ Jobs → Scroll to #jobs
- ✅ Companies → Scroll to #companies

### Mobile (4 pages)

- ✅ Offcanvas opens/closes
- ✅ All nav links present
- ✅ Auth buttons work
- ✅ Focus management

## 🚨 Common Issues

**Tests timeout:**

- ☑️ Check dev server is running on port 8000
- ☑️ Check selector is correct
- ☑️ Increase timeout if element is slow

**Navigation fails:**

- ☑️ Verify href attributes are correct
- ☑️ Check for JavaScript errors
- ☑️ Test manually in browser first

**Element not found:**

- ☑️ Inspect page to verify selector
- ☑️ Check if element is hidden by CSS
- ☑️ Try more specific selector

## 📚 Resources

- **Full Guide:** `TEST_GUIDE.md`
- **Summary:** `TEST_UPDATE_SUMMARY.md`
- **Playwright Docs:** https://playwright.dev/
- **Config:** `playwright.config.js`

## ✅ Quick Check

Before running tests:

1. ☑️ Dev server running on port 8000
2. ☑️ Node modules installed (`npm install`)
3. ☑️ Playwright browsers installed (`npx playwright install`)

Then run:

```bash
npx playwright test
```

---

**Total Tests:** 119 | **Pages Covered:** 32 | **Browsers:** 3
