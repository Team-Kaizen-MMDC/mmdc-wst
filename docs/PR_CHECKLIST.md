# PR Checklist — What to include and how reviewers should validate

Purpose: a short, reproducible checklist for contributors and reviewers to ensure PRs meet quality, accessibility, and CI standards before merge.

Before opening a PR

- [ ] Create a feature branch and commit with clear messages.
- [ ] Run unit and smoke tests locally:

```bash
# start dev server (from repo root)
python3 -m http.server 8000 &
./run-tests.sh smoke chromium
```

- [ ] Run Playwright with JSON reporter and save the report (attach to PR):

```bash
./run-tests.sh smoke chromium --reporter=json
# copy or attach tests/playwright/tests/playwright/results or JSON artifact
```

- [ ] Run automated accessibility check (axe/pa11y) on changed pages and attach results:

```bash
# example (using pa11y):
pa11y http://localhost:3000/index.html --reporter json > tests/accessibility/results/index-pa11y.json
```

- [ ] Provide a short accessibility summary in PR description (what was added/changed and any remaining known issues).
- [ ] Include screenshots or short screen recordings for visual changes (desktop and mobile breakpoints).

PR description template (copy into the PR body)

- Summary: 1-2 lines describing the change.
- Files changed: list of top-level files or directories.
- Tests: which tests were run and their results (attach Playwright JSON + HTML report link if available).
- Accessibility: axe/pa11y summary and link to report (note any outstanding issues and their severity).
- How to run locally: copy/paste the short commands above.

Reviewer checklist

- [ ] Code review: changes are small and focused; CSS/JS follow existing conventions.
- [ ] Smoke tests: runs locally and in CI (no failing tests).
- [ ] E2E tests: if the PR touches flows covered by E2E, verify the relevant tests pass.
- [ ] Accessibility: no critical/serious axe violations for changed pages; review keyboard flows.
- [ ] Visual: check screenshots for regressions in major breakpoints (mobile, tablet, desktop).
- [ ] i18n: ensure `data-i18n` attributes are present where needed and translations keys exist or fallback behavior is acceptable.
- [ ] Documentation: docs updated (design system, accessibility checklist, README) if behavior or components changed.

Merge gates (suggested for maintainer to enforce)

- All CI checks pass (lint/type/test).
- Smoke tests pass in CI and no critical accessibility violations.
- At least one approving review from a frontend or accessibility reviewer.

Attaching artifacts to PR

- Attach Playwright HTML report and the JSON reporter file.
- Attach Axe/Pa11y JSON or HTML reports for changed pages.

Notes for larger PRs

- For PRs touching multiple concerns (design + large JS changes), consider splitting into smaller incremental PRs.
- When in doubt, add a short note in the PR describing what the reviewer should pay attention to (e.g., "focus on job search interactions and header keyboard flow").

Change log:

- 2025-10-25: Created — initial PR checklist for this project.
