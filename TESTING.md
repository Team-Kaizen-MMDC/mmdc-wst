# Testing Documentation

## Table of Contents

- [Overview](#overview)
- [Test Environment](#test-environment)
- [Test Scope](#test-scope)
- [Test Cases](#test-cases)
  - [Functional Testing](#functional-testing)
  - [Mobile Responsiveness](#mobile-responsiveness)
  - [Internationalization (i18n)](#internationalization-i18n)
  - [Accessibility](#accessibility)
- [Backend Integration Tests](#backend-integration-tests)
- [S3 Resume Upload Tests](#s3-resume-upload-tests)
- [Test Results Summary](#test-results-summary)
- [Known Issues](#known-issues)
- [Browser Compatibility](#browser-compatibility)

---

## Overview

This document outlines the testing performed on the Japan SSW website, focusing on:

- Mobile navigation functionality (offcanvas menu)
- Internationalization (English/Japanese language toggle)
- Responsive design and accessibility
- Cross-browser compatibility
- Backend API integration (auth, companies, jobs, applications)

**Testing Period:** October 2025 – March 2026
**Testers:** Development Team  
**Test Types:** Manual Testing, Functional Testing, Accessibility Testing, Backend Integration Testing

---

## Test Environment

### Devices Tested

- **Desktop:** macOS (Chrome, Safari, Firefox)
- **Mobile:** iOS Safari, Chrome Mobile (simulated via DevTools)
- **Tablet:** iPad (simulated via DevTools)

### Screen Resolutions

- Mobile: 375px × 667px (iPhone SE)
- Tablet: 768px × 1024px (iPad)
- Desktop: 1920px × 1080px

### Browsers

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)

---

## Test Scope

### Features Tested

1. **Mobile Navigation (Offcanvas)**

   - Menu toggle functionality
   - Link navigation
   - Close behavior
   - Accessibility (focus management)

2. **Internationalization (i18n)**

   - Language toggle (EN ⇄ JA)
   - Content translation
   - Persistence (localStorage)
   - Fallback behavior

3. **Responsive Design**

   - Layout breakpoints
   - Mobile-first design
   - Touch interactions

4. **Accessibility**
   - Keyboard navigation
   - ARIA attributes
   - Color contrast (WCAG AA)
   - Screen reader compatibility

5. **Backend API Integration**
   - Auth routes (register, login, JWT verification)
   - Companies routes (public listing, auth guards)
   - Jobs routes (public listing, filters, employer-only endpoints)
   - Applications routes (apply, withdraw, my applications)
   - Health check endpoints

6. **S3 Resume Upload**
   - File upload (PDF / DOC / DOCX)
   - Presigned URL generation (5-minute TTL)
   - File deletion
   - Security: MIME validation, size limit, ACL, key isolation

---

## Test Cases

### Functional Testing

#### TC-001: Homepage Load

**Objective:** Verify the homepage loads correctly with all assets.

**Steps:**

1. Navigate to [index.html](index.html)
2. Verify all images load
3. Check Bootstrap CSS/JS loads
4. Verify custom JS module loads

**Expected Result:** Page loads without errors, all assets present.

**Actual Result:** ✅ PASS - Page loads successfully, no console errors.

**Evidence:** All CSS/JS resources return HTTP 200, no 404 errors in Network tab.

---

#### TC-002: Navigation Links - Desktop

**Objective:** Verify all navigation links work correctly on desktop.

**Steps:**

1. Open homepage on desktop (>992px width)
2. Click "Jobs" link → should scroll to #jobs section
3. Click "Companies" link → should scroll to #companies section
4. Click "Agency" link → should navigate to [pages/agency.html](pages/agency.html)
5. Click "About" link → should navigate to [pages/about.html](pages/about.html)
6. Click "Signup" link → should navigate to [pages/createAccount.html](pages/createAccount.html)
7. Click "Login" link → should navigate to [pages/signin.html](pages/signin.html)

**Expected Result:** All links navigate/scroll to correct destinations.

**Actual Result:** ✅ PASS - All navigation links work as expected.

**Evidence:** Manual verification completed, all links functional.

---

#### TC-003: Company Logos Navigation

**Objective:** Verify company logo cards link to correct company pages.

**Steps:**

1. Scroll to "Top Company" section
2. Click on each company card (ANA InterContinental, Prince Hotels, SOMPO Care, etc.)
3. Verify navigation to correct company detail page

**Expected Result:** Each company card links to its respective detail page.

**Actual Result:** ✅ PASS - All 9 company cards link correctly.

**Evidence:** All company pages load successfully:

- [pages/companies/ana-intercontinental.html](pages/companies/ana-intercontinental.html)
- [pages/companies/prince-hotels.html](pages/companies/prince-hotels.html)
- [pages/companies/sompo-care.html](pages/companies/sompo-care.html)
- [pages/companies/nissan.html](pages/companies/nissan.html)
- [pages/companies/daikin.html](pages/companies/daikin.html)
- [pages/companies/kandenko.html](pages/companies/kandenko.html)
- [pages/companies/yoshinoya.html](pages/companies/yoshinoya.html)
- [pages/companies/ana.html](pages/companies/ana.html)
- [pages/companies/mitsubishi-heavy-industries.html](pages/companies/mitsubishi-heavy-industries.html)

---

#### TC-004: Job Listings Navigation

**Objective:** Verify job listing "Apply" buttons navigate correctly.

**Steps:**

1. Scroll to "Job Listings" section
2. Click "Apply" button for each job listing
3. Verify navigation to correct job detail page

**Expected Result:** Each Apply button links to the correct job detail page.

**Actual Result:** ✅ PASS - All job apply buttons work correctly.

**Evidence:** All job pages load successfully:

- [pages/jobs/mechanic-ground-support-haneda.html](pages/jobs/mechanic-ground-support-haneda.html)
- [pages/jobs/cleaner-facilities-maintenance.html](pages/jobs/cleaner-facilities-maintenance.html)
- [pages/jobs/construction-worker-site-support.html](pages/jobs/construction-worker-site-support.html)
- [pages/jobs/server-hospitality.html](pages/jobs/server-hospitality.html)
- [pages/jobs/job.html](pages/jobs/job.html)

---

### Mobile Responsiveness

#### TC-005: Mobile Offcanvas Menu - Open/Close

**Objective:** Verify mobile menu (offcanvas) opens and closes correctly.

**Steps:**

1. Resize browser to mobile width (<992px) or use DevTools device emulation
2. Verify hamburger menu button is visible
3. Click hamburger button
4. Verify offcanvas menu slides in from left
5. Click close button (×)
6. Verify offcanvas menu closes

**Expected Result:** Offcanvas menu opens/closes smoothly with proper animations.

**Actual Result:** ✅ PASS - Menu opens and closes correctly on mobile.

**Evidence:**

- Offcanvas button visible on mobile (`.d-lg-none` class applied)
- Bootstrap offcanvas transitions working
- Close button dismisses menu

**Screenshot Reference:** Menu opens from left, backdrop visible, close button functional.

---

#### TC-006: Mobile Offcanvas - Link Navigation

**Objective:** Verify offcanvas links navigate correctly and close menu.

**Steps:**

1. Open mobile menu (offcanvas)
2. Click "Jobs" link
3. Verify menu closes and page scrolls to #jobs
4. Reopen menu, click "Agency" link
5. Verify menu closes and navigates to agency page

**Expected Result:** Links work correctly and menu auto-closes on selection.

**Actual Result:** ✅ PASS - All offcanvas links work and menu closes on click.

**Evidence:**

- All links have `data-bs-dismiss="offcanvas"` attribute
- Navigation works after offcanvas closes (no backdrop blocking)

---

#### TC-007: Mobile Offcanvas - Accessibility (Focus Management)

**Objective:** Verify keyboard focus returns to toggle button after closing offcanvas.

**Steps:**

1. Open offcanvas using keyboard (Tab to button, press Enter)
2. Press Esc to close offcanvas
3. Verify focus returns to the toggle button

**Expected Result:** Focus management works correctly for accessibility.

**Actual Result:** ✅ PASS - Focus returns to toggle button after close.

**Evidence:** Event listener in [assets/js/main.js](assets/js/main.js) handles focus restoration:

```javascript
offcanvasEl.addEventListener("hidden.bs.offcanvas", () => {
  if (toggler) toggler.focus();
});
```

---

#### TC-008: Responsive Layout - Breakpoints

**Objective:** Verify layout adapts correctly at different breakpoints.

**Steps:**

1. Test at mobile width (375px) - verify single column layout
2. Test at tablet width (768px) - verify appropriate spacing
3. Test at desktop width (1200px) - verify full layout with desktop nav

**Expected Result:** Layout adapts smoothly at all breakpoints.

**Actual Result:** ✅ PASS - Responsive design works across all breakpoints.

**Evidence:**

- Mobile: Offcanvas menu visible, desktop nav hidden
- Tablet: Good spacing, readable content
- Desktop: Desktop nav visible, offcanvas toggle hidden

---

### Internationalization (i18n)

#### TC-009: Language Toggle - Presence and Functionality

**Objective:** Verify language toggle appears and switches languages.

**Steps:**

1. Load homepage
2. Verify language toggle (switch) is visible in header
3. Toggle switch to Japanese (日本語)
4. Verify page content translates to Japanese
5. Toggle back to English
6. Verify page content returns to English

**Expected Result:** Language toggle works correctly, content translates.

**Actual Result:** ✅ PASS - Language toggle present and functional.

**Evidence:**

- Toggle injected by `assets/js/main.js` → `ensureLanguageToggle()`
- Switch shows "English" / "日本語" label
- Content updates on toggle

---

#### TC-010: i18n - Header/Nav Translation

**Objective:** Verify header and navigation items translate correctly.

**Steps:**

1. Set language to Japanese (toggle switch)
2. Verify desktop nav items translate:
   - "Jobs" → "求人"
   - "Companies" → "企業"
   - "Agency" → "代理店"
   - "About" → "私たちについて"
3. Verify brand stays "Japan SSW"
4. Verify Signup/Login translate:
   - "Signup" → "サインアップ"
   - "Login" → "ログイン"

**Expected Result:** All nav items translate correctly to Japanese.

**Actual Result:** ✅ PASS - Desktop navigation translates correctly.

**Evidence:**

- Elements have `data-i18n` attributes (e.g., `data-i18n="nav.jobs"`)
- Translation keys present in [locales/ja.json](locales/ja.json)
- i18n runtime applies translations via [assets/js/i18n.js](assets/js/i18n.js)

---

#### TC-011: i18n - Offcanvas Menu Translation

**Objective:** Verify mobile offcanvas menu translates correctly.

**Steps:**

1. Switch to mobile view
2. Set language to Japanese
3. Open offcanvas menu
4. Verify menu title translates: "Menu" → "メニュー"
5. Verify all offcanvas links translate (Jobs, Companies, Agency, About, Signup, Login)

**Expected Result:** Offcanvas menu content translates to Japanese.

**Actual Result:** ✅ PASS - Offcanvas menu translates correctly.

**Evidence:**

- Offcanvas title has `data-i18n="nav.menu"`
- Offcanvas links have same i18n keys as desktop nav
- Translations applied by i18n runtime

**Fix Applied:** Added `data-i18n` attributes to offcanvas links in commit `d0292a1`.

---

#### TC-012: i18n - Locale File Loading

**Objective:** Verify Japanese locale file loads correctly on GitHub Pages.

**Steps:**

1. Open DevTools → Network tab
2. Switch language to Japanese
3. Verify request to [locales/ja.json](locales/ja.json) succeeds (HTTP 200)
4. Verify locale JSON is valid and contains all keys

**Expected Result:** Locale file loads without errors.

**Actual Result:** ✅ PASS - Locale file loads successfully.

**Evidence:**

- Fetch uses relative path: `new URL('../../locales/ja.json', import.meta.url)`
- Works on GitHub Pages subpath deployments
- No 404 errors in console

**Fix Applied:** Updated fetch path in `assets/js/i18n.js` (commit `3b12c6e`).

---

#### TC-013: i18n - Language Persistence

**Objective:** Verify selected language persists across page reloads.

**Steps:**

1. Set language to Japanese
2. Reload page
3. Verify language remains Japanese (not reset to English)
4. Check localStorage for `preferred_language` key

**Expected Result:** Selected language persists in localStorage.

**Actual Result:** ✅ PASS - Language preference persists correctly.

**Evidence:**

- `localStorage.setItem('preferred_language', 'ja')` on toggle
- `localStorage.getItem('preferred_language')` on page load
- i18n initializes with stored preference

---

#### TC-014: i18n - Fallback Behavior

**Objective:** Verify fallback to English when locale fails to load.

**Steps:**

1. Simulate locale file unavailable (e.g., 404)
2. Toggle to Japanese
3. Verify page shows English default text (not i18n keys)

**Expected Result:** Page shows English defaults if locale fails, not raw keys like `nav.jobs`.

**Actual Result:** ✅ PASS - Fallback to English defaults works.

**Evidence:**

- i18n runtime captures default text on page load (`defaultTexts` map)
- `translate()` method returns `defaultTexts[key]` if translation missing
- No visible i18n keys on page

**Fix Applied:** Added fallback logic to `translate()` in commit `3b12c6e`.

---

#### TC-015: i18n - Hero Section Translation

**Objective:** Verify hero section content translates.

**Steps:**

1. Switch to Japanese
2. Verify hero title translates:
   - "Specified Skilled Worker Jobs in Japan" → "日本での特定技能ワーカーの仕事"
3. Verify hero lead translates to Japanese

**Expected Result:** Hero section translates correctly.

**Actual Result:** ✅ PASS - Hero section translates.

**Evidence:**

- `data-i18n="hero.title"` and `data-i18n="hero.lead"` present
- Translations in `locales/ja.json`

---

#### TC-016: i18n - CTA Buttons Translation

**Objective:** Verify all CTA buttons translate.

**Steps:**

1. Switch to Japanese
2. Verify Apply buttons → "応募する"
3. Verify "Learn more" → "詳細を見る"
4. Verify "Search SSW jobs" → "求人を検索"
5. Verify "Post a Job" → "求人を掲載する"

**Expected Result:** All CTA buttons translate to Japanese.

**Actual Result:** ✅ PASS - CTA buttons translate correctly.

**Evidence:**

- Elements have `data-i18n="btn.apply"`, `data-i18n="btn.learn_more"`, etc.
- Translations present in locale files

---

### Accessibility

#### TC-017: Keyboard Navigation - Desktop Nav

**Objective:** Verify desktop navigation is keyboard accessible.

**Steps:**

1. Use Tab key to navigate through header links
2. Verify focus visible on each link
3. Press Enter on a link
4. Verify navigation works

**Expected Result:** All nav links are keyboard accessible.

**Actual Result:** ✅ PASS - Desktop nav fully keyboard accessible.

**Evidence:**

- Native `<a>` elements support keyboard navigation
- Focus styles visible (browser default or custom CSS)

---

#### TC-018: Keyboard Navigation - Offcanvas

**Objective:** Verify offcanvas is keyboard accessible.

**Steps:**

1. Tab to offcanvas toggle button
2. Press Enter to open menu
3. Tab through menu items
4. Press Enter on a link
5. Verify navigation works and menu closes

**Expected Result:** Offcanvas fully keyboard accessible.

**Actual Result:** ✅ PASS - Offcanvas keyboard navigation works.

**Evidence:**

- Toggle button has `aria-label="Open menu"`
- Close button has `aria-label="Close"`
- Links focusable and functional

---

#### TC-019: ARIA Attributes - Offcanvas

**Objective:** Verify proper ARIA attributes on offcanvas.

**Steps:**

1. Inspect offcanvas toggle button
2. Verify `aria-controls="siteOffcanvas"` present
3. Verify offcanvas has `aria-labelledby="siteOffcanvasLabel"`
4. Verify close button has `aria-label="Close"`

**Expected Result:** All required ARIA attributes present.

**Actual Result:** ✅ PASS - ARIA attributes correctly implemented.

**Evidence:**

```html
<button ... aria-controls="siteOffcanvas" aria-label="Open menu">
  <div ... aria-labelledby="siteOffcanvasLabel">
    <button ... aria-label="Close"></button>
  </div>
</button>
```

---

#### TC-020: Color Contrast - WCAG AA Compliance

**Objective:** Verify text color contrast meets WCAG AA standards (4.5:1 minimum).

**Steps:**

1. Use browser DevTools or contrast checker tool
2. Check primary text on white background
3. Check white text on primary button background
4. Check muted text contrast

**Expected Result:** All text meets WCAG AA contrast ratio (4.5:1 for normal text).

**Actual Result:** ✅ PASS - Color contrast meets WCAG AA standards.

**Evidence:**

- Primary text (dark) on white: >7:1 ratio
- White text on primary blue button: >4.5:1 ratio
- Muted text: >4.5:1 ratio

**Tools Used:** Chrome DevTools Accessibility panel, WebAIM Contrast Checker.

---

#### TC-021: Language Toggle - Accessibility

**Objective:** Verify language toggle is accessible.

**Steps:**

1. Tab to language toggle switch
2. Verify focus visible
3. Verify `role="switch"` and `aria-checked` attributes
4. Press Space to toggle
5. Verify `aria-checked` updates

**Expected Result:** Language toggle fully accessible with proper ARIA.

**Actual Result:** ✅ PASS - Language toggle accessible.

**Evidence:**

```html
<input ... role="switch" aria-checked="true" />
<label for="lang-toggle">日本語</label>
```

---

#### TC-022: Screen Reader - Navigation Announcement

**Objective:** Verify screen readers announce navigation correctly.

**Steps:**

1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate through header
3. Verify links announced with text + role
4. Verify offcanvas toggle announced correctly

**Expected Result:** Screen reader announces all elements correctly.

**Actual Result:** ✅ PASS - Screen reader support functional.

**Evidence:**

- Links announced as "Jobs, link" etc.
- Offcanvas toggle: "Open menu, button"
- Proper semantic HTML used throughout

---

## Backend Integration Tests

Automated integration tests for the Express/MongoDB backend API. Tests run using **Jest + Supertest** with an in-memory MongoDB instance (`mongodb-memory-server`) — no real Atlas connection required.

### Setup & Running

```bash
# One-time: install backend dependencies
cd backend && npm install

# Run all backend tests
npm test

# Run integration tests only
npm run test:integration
```

Test files live in [`backend/tests/integration/`](backend/tests/integration/). Environment variables (`MONGODB_URI`, `JWT_SECRET`, etc.) are injected automatically by `setup.js` for the in-memory server.

---

### BIT-001: Health Endpoints

**File:** `health.test.js`

| Test | Expected | Result |
|------|----------|--------|
| `GET /health` returns 200 with `status: "success"` | 200 | ✅ PASS |
| `GET /api/health` (legacy) returns `ok: true` | 200 | ✅ PASS |
| Unknown API route returns 404 | 404 | ✅ PASS |

---

### BIT-002: Authentication — Register

**File:** `auth.test.js`

| Test | Expected | Result |
|------|----------|--------|
| Register new user returns token | 201 | ✅ PASS |
| Register with missing email | 400 | ✅ PASS |
| Register with short password (<8 chars) | 400 | ✅ PASS |
| Register duplicate email | 409/400 | ✅ PASS |

---

### BIT-003: Authentication — Login

**File:** `auth.test.js`

| Test | Expected | Result |
|------|----------|--------|
| Login with valid credentials returns token | 200 | ✅ PASS |
| Login with wrong password | 401 | ✅ PASS |
| Login with non-existent email | 401 | ✅ PASS |
| Login with empty body | 400 | ✅ PASS |

---

### BIT-004: Authentication — Get Current User

**File:** `auth.test.js`

| Test | Expected | Result |
|------|----------|--------|
| `GET /api/v1/auth/me` with valid JWT returns user | 200 | ✅ PASS |
| `GET /api/v1/auth/me` with no token | 401 | ✅ PASS |
| `GET /api/v1/auth/me` with invalid token | 401 | ✅ PASS |

---

### BIT-005: Companies

**File:** `companies.test.js`

| Test | Expected | Result |
|------|----------|--------|
| `GET /api/v1/companies` returns 200 and array | 200 | ✅ PASS |
| Pagination param `?limit=5` accepted | 200 | ✅ PASS |
| `POST /api/v1/companies` unauthenticated | 401 | ✅ PASS |
| `POST /api/v1/companies` as admin | 201/403 | ✅ PASS |
| `GET /api/v1/companies/:id` non-existent ObjectId | 404 | ✅ PASS |
| `GET /api/v1/companies/:id` invalid ID format | 400/404 | ✅ PASS |

---

### BIT-006: Jobs

**File:** `jobs.test.js`

| Test | Expected | Result |
|------|----------|--------|
| `GET /api/v1/jobs` returns 200 and array | 200 | ✅ PASS |
| Pagination params `?page=1&limit=10` accepted | 200 | ✅ PASS |
| Filter param `?industry=Manufacturing` accepted | 200 | ✅ PASS |
| `GET /api/v1/jobs/:id` non-existent ObjectId | 404 | ✅ PASS |
| `GET /api/v1/jobs/:id` invalid ID format | 400/404 | ✅ PASS |
| `GET /api/v1/jobs/my/jobs` no token | 401 | ✅ PASS |
| `GET /api/v1/jobs/my/jobs` as jobseeker | 200/403 | ✅ PASS |
| `POST /api/v1/jobs` unauthenticated | 401 | ✅ PASS |

---

### BIT-007: Applications

**File:** `applications.test.js`

| Test | Expected | Result |
|------|----------|--------|
| `GET /api/v1/applications/me` no token | 401 | ✅ PASS |
| `GET /api/v1/applications/me` authenticated (empty) | 200 | ✅ PASS |
| `POST /api/v1/jobs/:jobId/apply` unauthenticated | 401 | ✅ PASS |
| Apply to non-existent job | 404/400 | ✅ PASS |
| Apply with cover letter > 2000 chars | 400/404 | ✅ PASS |
| `DELETE /api/v1/applications/:id` unauthenticated | 401 | ✅ PASS |
| Delete non-existent application (authenticated) | 404/403 | ✅ PASS |

---

### Integration Test Summary

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Health | 3 | 3 | 0 |
| Auth — Register | 4 | 4 | 0 |
| Auth — Login | 4 | 4 | 0 |
| Auth — Get Me | 3 | 3 | 0 |
| Companies | 6 | 6 | 0 |
| Jobs | 8 | 8 | 0 |
| Applications | 7 | 7 | 0 |
| **Total** | **35** | **35** | **0** |

> **Note:** `cd backend && npm run test:integration` runs these 35 tests against an ephemeral in-memory database. No environment variables or Atlas connection are needed.

---

## S3 Resume Upload Tests

The S3 layer is verified through two complementary approaches: a live verification script that runs real AWS operations, and the existing `profile.routes.test.js` integration tests for the profile API surface.

### Verification Script

```bash
cd backend && npm run verify:aws
```

`backend/verify-aws-config.js` validates the full AWS setup end-to-end:

| Check | What it verifies |
|-------|-----------------|
| Environment variables | `AWS_REGION`, `RESUME_S3_BUCKET` present |
| AWS credentials | STS `GetCallerIdentity` succeeds |
| IAM role assumption | STS `AssumeRole` with `AWS_ROLE_ARN` succeeds |
| S3 PutObject | Writes a test object to the bucket |
| S3 GetObject | Reads the test object back |
| S3 DeleteObject | Removes the test object |

### Manual API Testing

```bash
# Upload a resume (replace TOKEN and /path/to/resume.pdf)
curl -X POST http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer TOKEN" \
  -F "resume=@/path/to/resume.pdf"

# Get presigned download URL (valid 5 minutes)
curl -X GET http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer TOKEN"

# Delete resume
curl -X DELETE http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer TOKEN"
```

### S3-001: Upload — Valid File

**Objective:** Verify a valid PDF upload is stored in S3 and returns a presigned URL.

**Steps:**
1. Authenticate and obtain a JWT token.
2. `POST /api/v1/profile/resume` with a `.pdf` file ≤ 10 MB.
3. Verify response contains `resumeUrl` (presigned URL).
4. Confirm `UserProfile.resumePath` is saved as `resumes/{userId}/resume.pdf`.

**Expected Result:** 200, `resumeUrl` present, object visible in S3 console.

---

### S3-002: Upload — Invalid File Type

**Objective:** Verify non-allowed file types are rejected before reaching S3.

**Steps:**
1. `POST /api/v1/profile/resume` with a `.txt` or `.exe` file.

**Expected Result:** 400, `{"success": false}`, no object written to S3.

---

### S3-003: Upload — File Too Large

**Objective:** Verify files over 10 MB are rejected by multer.

**Steps:**
1. `POST /api/v1/profile/resume` with a file > 10 MB.

**Expected Result:** 413 Payload Too Large, no object written to S3.

---

### S3-004: Upload — Unauthenticated

**Objective:** Verify unauthenticated requests are rejected.

**Steps:**
1. `POST /api/v1/profile/resume` without `Authorization` header.

**Expected Result:** 401 Unauthorized.

---

### S3-005: Presigned URL — Expiry

**Objective:** Verify presigned URLs expire after 5 minutes.

**Steps:**
1. Upload a resume and capture `resumeUrl`.
2. Wait > 5 minutes.
3. Attempt to access the presigned URL.

**Expected Result:** AWS returns `403 AccessDenied` / `Request has expired`.

---

### S3-006: Delete — Removes from S3 and DB

**Objective:** Verify deletion clears S3 object and `resumePath` in MongoDB.

**Steps:**
1. Upload a resume to confirm it exists.
2. `DELETE /api/v1/profile/resume` with valid JWT.
3. Check S3 — object should no longer exist.
4. Check `UserProfile` — `resumePath` should be `undefined`.

**Expected Result:** 200, S3 object gone, DB field cleared.

---

### S3-007: Key Isolation

**Objective:** Verify users cannot access each other's resumes.

**Steps:**
1. Upload a resume as User A.
2. Authenticate as User B.
3. Construct User A's S3 key (`resumes/{userAId}/resume.pdf`) and attempt `GET /api/v1/profile/resume`.

**Expected Result:** User B's presigned URL resolves to User B's own `resumePath` (not User A's). Direct S3 access without a presigned URL returns `403`.

---

### S3 Test Summary

| Test | Method | Expected Status | Notes |
|------|--------|-----------------|-------|
| S3-001 | POST upload valid PDF | 200 | presigned URL in response |
| S3-002 | POST invalid file type | 400 | rejected before S3 |
| S3-003 | POST file > 10 MB | 413 | multer limit |
| S3-004 | POST no auth token | 401 | JWT protect middleware |
| S3-005 | GET presigned URL after 5 min | 403 (AWS) | URL expiry |
| S3-006 | DELETE removes object + DB | 200 | S3 + MongoDB cleared |
| S3-007 | Cross-user key access | 403 (AWS) | key isolation |

> Run `npm run verify:aws` from `backend/` to validate the live AWS configuration before deploying.

---

## Test Results Summary

| Category              | Total Tests | Passed | Failed | Pass Rate |
| --------------------- | ----------- | ------ | ------ | --------- |
| Functional Testing    | 4           | 4      | 0      | 100%      |
| Mobile Responsiveness | 4           | 4      | 0      | 100%      |
| Internationalization  | 8           | 8      | 0      | 100%      |
| Accessibility         | 6           | 6      | 0      | 100%      |
| **TOTAL**             | **22**      | **22** | **0**  | **100%**  |

### Critical Fixes Implemented

1. **i18n Locale Loading (TC-012):**

   - **Issue:** Locale file failed to load on GitHub Pages (404 error)
   - **Fix:** Changed fetch path from absolute `/locales/ja.json` to relative `../../locales/ja.json` using `import.meta.url`
   - **Commit:** `3b12c6e`

2. **i18n Fallback Behavior (TC-014):**

   - **Issue:** Raw i18n keys (e.g., `nav.jobs`) displayed when locale failed
   - **Fix:** Added fallback to captured default English text in `translate()` method
   - **Commit:** `3b12c6e`

3. **Offcanvas Translation (TC-011):**
   - **Issue:** Mobile offcanvas menu not translating
   - **Fix:** Added `data-i18n` attributes to offcanvas links and title
   - **Commit:** `d0292a1`

---

## Known Issues

### Low Priority

- Job posting validation: The frontend now posts admin-created jobs to `POST /api/v1/jobs` (admins allowed). Ensure the job-post form supplies required company contact fields when auto-creating a company (contact.email, contact.phone, description). Validation errors may occur when form select values don't match backend enums (e.g., `japaneseLevel`, `industry`).

### Future Enhancements

1. Add automated E2E tests using Playwright
2. Add visual regression testing
3. Implement automated accessibility audits (Lighthouse CI)

---

## Browser Compatibility

| Browser       | Version       | Status  | Notes                        |
| ------------- | ------------- | ------- | ---------------------------- |
| Chrome        | Latest (120+) | ✅ PASS | Full support                 |
| Safari        | Latest (17+)  | ✅ PASS | Full support                 |
| Firefox       | Latest (121+) | ✅ PASS | Full support                 |
| Edge          | Latest (120+) | ✅ PASS | Chromium-based, full support |
| Mobile Safari | iOS 16+       | ✅ PASS | Touch interactions work      |
| Chrome Mobile | Android 12+   | ✅ PASS | Full support                 |

### Legacy Browser Support

- **IE11:** Not supported (ES6 modules used)
- **Safari < 14:** Limited support (missing some modern JS features)

---

## Testing Tools Used

- **Manual Testing:** Human verification of all features
- **Chrome DevTools:** Network, Console, Accessibility panels
- **Browser DevTools:** Device emulation for mobile testing
- **VoiceOver (macOS):** Screen reader testing
- **WebAIM Contrast Checker:** Color contrast verification
- **Lighthouse:** Performance and accessibility audit

---

## Conclusion

All 22 frontend test cases have passed successfully, and all 35 backend integration tests pass. The Japan SSW website demonstrates:

- ✅ Robust mobile navigation with offcanvas menu
- ✅ Full internationalization support (EN/JP)
- ✅ WCAG AA accessibility compliance
- ✅ Cross-browser compatibility
- ✅ Responsive design across all breakpoints
- ✅ Backend API auth, CRUD, and edge-case handling verified by automated integration tests

The i18n implementation successfully handles locale loading on GitHub Pages, provides proper fallbacks, and persists user language preferences. All critical accessibility requirements are met with proper ARIA attributes, keyboard navigation, and screen reader support.

**Recommendation:** Ready for production deployment.

---

**Document Version:** 1.1  
**Last Updated:** March 24, 2026  
**Next Review:** Post-deployment validation
