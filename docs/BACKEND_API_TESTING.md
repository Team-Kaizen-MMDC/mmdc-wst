# Backend API Testing Guide

This guide covers the backend API test suites added for `mmdc-wst`, how to run them locally, and how to use the matching Postman collection for manual verification.

## What is covered

The backend Jest suite now includes both integration and unit coverage for high-value API behavior:

- Authentication integration tests for register, login, and `GET /api/v1/auth/me`
- Company API integration tests for listing, creating, and updating companies
- Job API integration tests for listing, creating, and soft-deleting jobs
- Profile API integration tests for creating, reading, updating, and deleting profiles
- Middleware and utility unit tests for auth guards, async error forwarding, API errors, and API responses
- Existing Google token integration and unit tests remain part of the backend suite

## Test locations

```text
backend/
├── jest.config.js
├── tests/
│   ├── helpers/
│   │   └── integrationTestUtils.js
│   ├── integration/
│   │   ├── auth.google.test.js
│   │   ├── auth.routes.test.js
│   │   ├── company.routes.test.js
│   │   ├── job.routes.test.js
│   │   └── profile.routes.test.js
│   └── unit/
│       ├── middleware/
│       │   ├── asyncHandler.test.js
│       │   ├── auth.middleware.test.js
│       │   └── errorHandler.test.js
│       └── utils/
│           └── api-primitives.test.js
└── src/
    └── utils/
        └── __tests__/
            └── googleAuth.test.js
```

## How the backend integration tests work

The integration suites use:

- `jest` as the test runner
- `supertest` for HTTP assertions against the Express app
- `mongodb-memory-server` for an isolated in-memory MongoDB instance
- env overrides from `backend/tests/helpers/integrationTestUtils.js`

This means the backend integration tests do **not** hit MongoDB Atlas and do not require a locally running backend server.

## Run the backend tests

From the repository root:

```bash
cd backend
npm test
```

To run a single suite:

```bash
cd backend
npx jest --runInBand tests/integration/auth.routes.test.js
```

To run only the unit suites:

```bash
cd backend
npx jest --runInBand tests/unit
```

To run only the integration suites:

```bash
cd backend
npx jest --runInBand tests/integration
```

## Frontend and backend test boundaries

The root project Playwright commands are now explicitly scoped to `tests/playwright/playwright.config.js`, so frontend E2E runs no longer try to execute backend Jest files.

Frontend tests still run from the repo root:

```bash
npm test
```

Backend API tests run from `backend/`:

```bash
cd backend
npm test
```

## Adding new backend API tests

Follow the existing patterns:

1. Add reusable seeding or auth helpers to `backend/tests/helpers/integrationTestUtils.js` when the logic will be shared.
2. Put HTTP behavior tests in `backend/tests/integration/`.
3. Put isolated middleware, utility, or controller logic tests in `backend/tests/unit/`.
4. Prefer success and failure-path coverage together in each suite.
5. Mock external services such as Google OAuth or AWS/S3 instead of reaching external systems.

## New Postman collection

A new manual verification collection lives at:

```text
backend/postman/Japan_SSW_Backend_API_Testing.postman_collection.json
```

Use collection variables:

- `baseUrl` — defaults to `http://localhost:3000/api/v1`
- `bearerToken` — set this after login or registration
- `companyId` — optional for company/job update requests
- `jobId` — optional for job delete requests

Typical manual flow:

1. Run the backend locally.
2. Call **Auth → Register Jobseeker** or **Auth → Login**.
3. Copy the returned JWT into the `bearerToken` collection variable.
4. Exercise protected Profile, Company, and Job requests.

## Notes

- The legacy Google auth route in `backend/src/app.js` now returns `401` for invalid tokens to align with the backend integration expectations.
- Logging in test output is still fairly verbose because the app includes request debugging middleware. The test results remain reliable even with noisy logs.
