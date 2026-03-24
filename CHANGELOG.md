# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Featured companies** (`Company.featured` field): 9 companies from `pages/companies/` are always shown in Top Companies on homepage. API: `GET /api/v1/companies?featured=true`.
- **Company list pagination**: `pages/companies/company-list.html` — 9 per page, smart ellipsis, prev/next, result count.
- **Job filter pagination**: `pages/jobs/jobFilter.html` — 10 per page, same pagination pattern.
- **Atlas cloud backups**: `npm run backup:atlas` pushes snapshots to `japansswdb_backups` database on same Atlas cluster. `npm run restore:atlas -- --list/--latest/--session`.
- **Seed featured companies**: `npm run seed:featured` seeds 9 featured + 10 additional SSW companies (29 total) with 133 jobs.
- **10 additional companies**: Toyota, JAL, Yamato Transport, Komatsu, Obayashi, Maruha Nichiro, Seven & i Food Systems, Nihon Anzen Seimei Care, ISS Facility Services Japan, JFE Steel.

### Fixed
- Company logos in Top Companies section broken (used absolute Railway URLs). Changed to relative paths `/assets/images/company-logos/…` which work in both local and production.
- 401 Unauthorized on job apply: `jobDetails.js` and `storage.js` now check `localStorage` for JWT token before falling back to cookies.
- CSP violation for company listings in production: hardcoded `localhost:3000` URLs replaced with dynamic same-origin API base in `homeCompanies.js`, `companyDetails.js`, `companyList.js`.
- Incorrect logos on 10 new companies (placeholder logos of other companies): logo field removed so ui-avatars.com fallback renders company-initial avatars.

### Changed
- `Company` model: added `featured` field, corrected `logo` validation to accept relative paths, added `size: "5000+"` enum value.
- `homeCompanies.js`: fetches `?featured=true&sort=name` instead of `?limit=6` (newest-first) — homepage is no longer affected by DB insertion order.
- `jobFilter.js`: API fetch limit raised from 100 → 500 to support pagination over full job set.
