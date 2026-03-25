---
name: "test-engineer"
title: "Test Engineer"
description: "Skill profile for Test Engineer — Playwright, Jest, test conventions and CI integration."
---

# 🧪 Test Engineer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Write and maintain Playwright E2E and accessibility tests in `tests/playwright/`
- Write and maintain Jest unit/integration tests in `backend/`
- Ensure all new features have test coverage before merging
- Run usability tests (accessibility + keyboard navigation)

## Required Tech Stack
| Technology | Version | Notes |
|---|---|---|
| Playwright | v1.40+ | E2E, accessibility, keyboard, smoke, i18n tests |
| Jest | v30 | Backend unit + integration tests |
| Supertest | v6 | HTTP assertions against Express app |
| mongodb-memory-server | v8 | Isolated in-memory MongoDB for Jest |
| axe-core (via runAxe.js) | — | Accessibility audit (`npm run test:accessibility`) |

## Frontend Test Commands
```bash
npm test                          # All Playwright tests
npm run test:smoke                # Smoke link checks
npm run test:e2e                  # Full navigation E2E
npm run test:i18n                 # Internationalization
npm run test:accessibility        # axe-core audit
npm run test:keyboard             # Keyboard navigation
npm run test:offcanvas            # Offcanvas component
npm run test:chromium             # Chromium only
npm run test:firefox              # Firefox only
npm run test:mobile               # WebKit / mobile viewport
npm run test:report               # Open HTML report
npm run test:with-server          # Auto-starts Python server then runs all tests
```

## Backend Test Commands
```bash
cd backend
npm test                          # All Jest tests (--runInBand for serial execution)
```

## Playwright Conventions
- Tests live in `tests/playwright/`
- Config: `tests/playwright/playwright.config.js`
- Use `page.getByRole()` and `page.getByLabel()` over CSS selectors for resilience
- Always wait for network idle or specific elements — no arbitrary `waitForTimeout`
- Each spec file is scoped to one feature (e.g., `offcanvas.spec.ts`, `i18n.spec.ts`)
- Accessibility tests must pass WCAG 2.1 AA — violations are CI failures
- Run with static server on port 8000 (`npm run test:with-server`)

## Jest Conventions
- Tests live alongside or near source files in `backend/`
- Use `mongodb-memory-server` for all DB tests — never test against Atlas
- Use `supertest` to test HTTP endpoints end-to-end
- Mock external services (AWS S3, Google OAuth) with `jest.mock()`
- Use `--runInBand` (already in `npm test`) to avoid parallel connection conflicts
- Test files: `*.test.js` naming convention
- Cover: happy path, missing fields, unauthorized access, invalid input

## CI Integration
- Playwright smoke and usability tests run via GitHub Actions (`playwright-smoke.yml`, `usability-tests.yml`)
- Backend Jest tests should be added to CI pipeline — see DevOps agent for workflow setup

## Related Skills
- [Frontend Developer](../frontend-developer/SKILL.MD) — pages under test
- [Backend Developer](../backend-developer/SKILL.MD) — API endpoints under test
- [DevOps Engineer](../devops-engineer/SKILL.MD) — CI workflow configuration
