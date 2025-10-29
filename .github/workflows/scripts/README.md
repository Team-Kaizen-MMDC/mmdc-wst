# GitHub Actions Scripts

This directory contains scripts used by GitHub Actions workflows.

## Scripts

### `format-usability-summary.js`

Generates a formatted usability test summary for PR comments.

**Purpose:**

- Parses accessibility test results (axe-core JSON reports)
- Parses keyboard navigation test results (Playwright JSON)
- Combines results into a human-readable markdown summary
- Calculates usability score based on violations and test failures

**Input:**

- `tests/accessibility/results/*-axe.json` - Accessibility test results
- `test-results/results.json` - Playwright test results (optional)

**Output:**

- `usability-summary.md` - Formatted markdown summary

**Usage:**

```bash
# Generate summary from test results
node .github/workflows/scripts/format-usability-summary.js

# Exit code 0 if no issues, 1 if violations/failures found
```

**Score Calculation:**

```
Base Score: 100%
- Deduct 10 points per accessibility violation (max -50)
- Deduct points based on keyboard test failure rate (max -50)

90-100%: 🎉 Excellent
70-89%:  ⚠️ Good
0-69%:   ❌ Needs work
```

## Adding New Scripts

When adding new workflow scripts:

1. Place in `.github/workflows/scripts/`
2. Use Node.js (version 18+) for consistency
3. Include error handling and clear console output
4. Document in this README
5. Test locally before committing

## Related Files

- `.github/workflows/usability-tests.yml` - Main workflow that uses these scripts
- `tests/accessibility/runAxe.js` - Generates axe-core JSON reports
- `tests/playwright/keyboard-navigation.spec.js` - Keyboard tests
