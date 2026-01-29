# Seeding the database

This document explains how to run the programmatic seeder and a small smoke-test that validates core endpoints against the seeded data.

Files

- `seedDatabase.js` — programmatic seeder that creates an employer, a jobseeker, a company, a job, a profile and an application. Writes artifacts to `.seed_artifacts.json`.
- `fixSeedData.js` — small script to adjust JSON seed files if needed (already present).
- `scripts/smoke-seed-check.sh` — smoke test script that verifies the seeded data via the API.

Requirements

- Node 18+ (project already uses commonjs)
- A running MongoDB instance accessible by `MONGODB_URI` in `backend/.env` (or environment)
- `jq` installed locally (smoke test uses `jq`)

Environment

- `MONGODB_URI` — connection string used by the seeder (optional; defaults to `mongodb://127.0.0.1:27017/mmdc-wst-seed`)
- `API_BASE` — base URL for your API endpoints (default `http://localhost:5000/api/v1`). Used by the smoke test.

Usage

1. Stop the backend server (optional but recommended).

2. Run the fixer if you need to correct JSON seed data (optional):

```bash
cd backend
npm run fix-seed
```

3. Run the seeder (normal):

```bash
cd backend
npm run seed
# or: node seedDatabase.js
```

4. Run the seeder and clear existing test data first:

```bash
cd backend
npm run seed -- --clear
# or: node seedDatabase.js --clear
```

5. After a successful seed you will find `backend/.seed_artifacts.json` with created IDs and emails.

6. Run the smoke-test to verify the API using the seeded data:

```bash
cd backend
chmod +x ./scripts/smoke-seed-check.sh
API_BASE="http://localhost:5001/api/v1" ./scripts/smoke-seed-check.sh
```

Troubleshooting

- If seeding fails due to validation errors, inspect `seedDatabase.js` or run `npm run fix-seed` to normalize seed JSON files.
- Ensure `MONGODB_URI` points to a writable DB where deleting test data is acceptable.
- If `jq` is not installed, install it via your package manager (brew install jq).

Cleanup

- The seeder writes `.seed_artifacts.json`. You can remove created records via the application or by calling the cleanup script you already have (`backend/scripts/cleanup-day4.sh`) tailored for Day 4 artifacts. For full teardown, run the seeder with `--clear` and it will delete the collections used by the seeder before seeding.

Security

- The seeder creates accounts with predictable passwords (`Test123!`) for quick testing. Do not run this against production databases.

Contact

- If you'd like I can add a GitHub Actions job to run seeding+smoke-tests on PRs.
