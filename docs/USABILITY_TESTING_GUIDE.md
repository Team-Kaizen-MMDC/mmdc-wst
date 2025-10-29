# Automated Usability Tests for Pull Requests

This repository includes automated usability tests that run on every pull request to ensure accessibility and keyboard navigation standards are maintained.

## 🎯 What Gets Tested

### 1. Accessibility Tests (axe-core)

- **WCAG 2.1 Level AA Compliance**: Automated checks for 50+ accessibility rules
- **Color Contrast**: Ensures text has sufficient contrast ratios
- **Semantic HTML**: Validates heading structure, landmarks, and ARIA attributes
- **Form Accessibility**: Checks labels, fieldsets, and form controls
- **Keyboard Support**: Verifies focus indicators and navigation order

### 2. Keyboard Navigation Tests (Playwright)

- **Skip Links**: Tests skip-to-main-content functionality
- **Focus Indicators**: Ensures all interactive elements have visible focus states
- **Tab Order**: Validates logical keyboard navigation flow
- **Interactive Controls**: Tests keyboard shortcuts (Escape, Ctrl+K, etc.)
- **ARIA Live Regions**: Verifies screen reader announcements

## 📊 PR Comment Format

Every pull request automatically receives a usability test summary comment:

```markdown
## 🎯 Usability Test Results

### ✅ PASS / ❌ FAIL

### ♿ Accessibility Tests (axe-core)

- Pages Tested: 6
- Violations: 0 ✅
- Passes: 219 ✅

### ⌨️ Keyboard Navigation Tests

- Tests Run: 25
- Passed: 25 ✅
- Failed: 0 ✅

### 📊 Summary

| Usability Score | 100% 🎉 |
```

## 🚀 Running Tests Locally

### Prerequisites

```bash
# Install dependencies
npm ci

# Install Playwright browsers (if not already installed)
npx playwright install chromium
```

### Run All Usability Tests

```bash
# Start local server
npm run server

# In another terminal, run full usability test suite
npm run test:usability
```

### Run Individual Test Suites

**Accessibility Tests Only:**

```bash
npm run test:accessibility
```

**Keyboard Navigation Tests Only:**

```bash
npm run test:keyboard
```

**Generate Summary Report:**

```bash
npm run usability:summary
```

### View Results

**Accessibility Results:**

- JSON reports: `tests/accessibility/results/*.json`
- Each page gets its own report with detailed violation information

**Keyboard Test Results:**

- Playwright HTML report: `npx playwright show-report`
- Terminal output during test run

**Summary Report:**

- Generated file: `usability-summary.md`
- Same format as PR comments

## 🔧 CI/CD Integration

### GitHub Actions Workflow

The workflow runs automatically on every PR:

- **Trigger**: Pull request opened, synchronized, or reopened
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Start local server (port 8000)
  4. Run accessibility tests (axe-core)
  5. Run keyboard navigation tests (Playwright)
  6. Generate usability summary
  7. Post/update PR comment with results
  8. Upload test artifacts

### Workflow File

`.github/workflows/usability-tests.yml`

### Summary Formatter Script

`.github/workflows/scripts/format-usability-summary.js`

## 📈 Usability Score Calculation

The usability score is calculated based on:

```
Base Score: 100%

Deductions:
- Accessibility violations: -10 points per violation (max -50)
- Failed keyboard tests: -50 points × (failed/total) failure rate

Final Score: Max(0, Base Score - Deductions)
```

**Score Interpretation:**

- **90-100%**: 🎉 Excellent usability
- **70-89%**: ⚠️ Good, but needs improvement
- **Below 70%**: ❌ Critical issues need attention

## 🧪 Test Coverage

### Pages Tested for Accessibility

- `index.html` (Home)
- `pages/about.html`
- `pages/agency.html`
- `pages/services.html`
- `pages/privacy.html`
- `pages/visaGuidance.html`

To add more pages, edit `tests/accessibility/runAxe.js`:

```javascript
const pages = [
  "index.html",
  "pages/your-new-page.html", // Add here
];
```

### Auth-protected pages (addEdit/\*)

Some pages under `pages/addEdit/` require authentication in the running site and cannot be exercised by the automated scanner in CI. To avoid false-positive "Document should have one main landmark" or "All page content should be contained by landmarks" errors the test runner excludes `pages/addEdit/*` by default.

Options for testing these pages locally:

- Run the site in a development mode that bypasses auth (recommended for local dev). Example: set `TEST_MODE=true` in your environment and start the server if your app supports it.
- Manually open the `pages/addEdit/*.html` files in a browser and run axe DevTools or the browser extension to validate accessibility.
- Temporarily remove the exclusion in `tests/accessibility/runAxe.js` to include these pages in local automated runs (not recommended in CI).

When you intentionally include addEdit pages in a PR scan, document the change in the PR description and ensure local test instructions or test-mode credentials are provided for reviewers.

### Keyboard Navigation Test Scenarios

- Skip link functionality on all major pages
- Focus indicators on interactive elements
- Logical tab order through page content
- Filter button keyboard controls (Job Filter page)
- Search input keyboard shortcuts
- Form field keyboard navigation
- ARIA live region announcements

To add more tests, edit `tests/playwright/keyboard-navigation.spec.js`

## 🐛 Fixing Common Issues

### High Color Contrast Violations

**Issue**: Text doesn't meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)

**Fix**: Use Bootstrap's color utilities or update custom colors

```css
/* Bad - low contrast */
color: #999;

/* Good - sufficient contrast */
color: #595959; /* WCAG AA compliant */
```

### Missing Focus Indicators

**Issue**: Interactive elements don't show visible focus state

**Fix**: Use Bootstrap's focus utilities or add custom focus styles

```css
button:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
```

### Heading Level Violations

**Issue**: Heading hierarchy jumps (e.g., h2 → h5)

**Fix**: Maintain proper heading order

```html
<!-- Bad -->
<h2>Section</h2>
<h5>Subsection</h5>

<!-- Good -->
<h2>Section</h2>
<h3>Subsection</h3>
```

### Missing ARIA Attributes

**Issue**: Interactive controls lack proper ARIA labels or states

**Fix**: Add appropriate ARIA attributes

```html
<button aria-label="Toggle support filter" aria-pressed="false">
  Support Available
</button>
```

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules Documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Keyboard Accessibility Guide](https://webaim.org/techniques/keyboard/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 🤝 Contributing

When adding new features:

1. Run usability tests locally before pushing
2. Fix any violations introduced by your changes
3. Add keyboard navigation tests for new interactive features
4. Ensure all tests pass before requesting review

## 📝 Interpreting PR Comments

The PR comment updates automatically with each push:

- **Green checkmarks (✅)**: No issues found
- **Red X marks (❌)**: Issues detected
- **Warning symbols (⚠️)**: Incomplete or missing results

Click "View full results" link to see detailed test artifacts.

---

**Questions?** Check the [USABILITY_IMPROVEMENT_PLAN.md](./USABILITY_IMPROVEMENT_PLAN.md) or open an issue.
