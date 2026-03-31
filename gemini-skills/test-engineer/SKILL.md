---
name: test-engineer
description: Skill for writing and maintaining E2E, accessibility, and unit tests for the Japan SSW Platform. Use for Playwright (E2E/Accessibility), Jest (Backend unit/integration), and Supertest (API assertions).
---

# 🧪 Test Engineer — Japan SSW Platform

## Overview
This skill guides the testing and quality assurance efforts for the Japan SSW Platform (`mmdc-wst`). It ensures that all features are thoroughly tested for functionality, accessibility, and responsiveness, following project-specific standards.

## Tech Stack
- **Playwright (v1.40+)**: E2E, accessibility, keyboard, smoke, and i18n tests.
- **Jest (v30)**: Backend unit and integration tests.
- **Supertest (v6)**: HTTP assertions against the Express API.
- **mongodb-memory-server (v8)**: In-memory database for isolated backend tests.
- **axe-core**: Accessibility audits via `runAxe.js`.

## Frontend Test Commands
- `npm test`: All Playwright tests.
- `npm run test:smoke`: Smoke link checks.
- `npm run test:accessibility`: axe-core audit.
- `npm run test:e2e`: Full navigation E2E tests.
- `npm run test:i18n`: Internationalization rendering tests.
- `npm run test:with-server`: Starts the Python server and runs all tests.

## Backend Test Commands
- `cd backend && npm test`: All Jest tests (runs in serial using `--runInBand`).

## Playwright Conventions
- Tests live in `tests/playwright/`.
- Use `page.getByRole()` and `page.getByLabel()` for resilient selectors.
- Always wait for network idle or specific elements; avoid `waitForTimeout`.
- Accessibility tests MUST pass WCAG 2.1 AA.
- Ensure the static server is running on port 8000 before execution.

## Jest Conventions
- Tests are located in the `backend/` directory near the source files.
- Use `mongodb-memory-server` for all database-related tests.
- Mock external services (e.g., AWS S3, Google OAuth) using `jest.mock()`.
- Use `--runInBand` to prevent parallel connection conflicts with the memory server.
- Follow the `*.test.js` naming convention.
- Cover happy paths, missing fields, unauthorized access, and invalid input.
