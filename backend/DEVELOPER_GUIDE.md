# Backend Developer Onboarding — Content APIs & REST API

Purpose

- Quick, practical onboarding guide for new backend developers building page APIs and REST endpoints. We use the `about` page implementation as the example and keep the stack minimal (native MongoDB driver + Express) to lower the learning curve.
- For production-ready REST API (Auth, Profile, Jobs, Applications, Companies), see [README.md](README.md) for complete setup, testing, and deployment.

Quick start (run locally)

- Copy the canonical example [.env.example](.env.example) to `.env` and fill in values (MONGODB_URI or MONGODB_DB, JWT_SECRET, etc.). Example:

```bash
cd backend
cp .env.example .env
# edit .env and set secrets (do NOT commit .env)
```

- Install dependencies and start the server:

```bash
cd backend
npm ci
node server.js
```

- Open: http://localhost:3000/pages/about.html (the page fetches content from the API).

What you'll use (minimal stack for onboarding)

- Node.js + Express
- dotenv for env vars
- Native MongoDB driver (used by default in this onboarding flow)

Note: The repository now supports an optional Mongoose-based stack for production-ready models and validation. Mongoose is disabled by default to keep the onboarding path simple. See "Mongoose toggle" below for how to enable it and what that changes.

**Migration note:** Once comfortable with the basics, you can adopt the recommended production stack (Mongoose, bcryptjs, JWT, express-validator, helmet, etc.) documented in [docs/NODEJS_REST_API_CRUD_GUIDE.md](../docs/NODEJS_REST_API_CRUD_GUIDE.md). The minimal stack here is intentionally simplified for initial onboarding; the full guide provides schemas, validation, auth, and middleware patterns ready for production.

Guiding principles

- Keep endpoints small and predictable. Use `slug` for page lookups (e.g. `about`).
- Keep DB access in a small module (we have `config.js` and `server.js` that open a single client connection on startup).
- Validate incoming JSON in controllers before writing to the DB.
- Protect write endpoints with a simple token while you develop (add proper auth later).

Conventions

- Collections: plural, descriptive names (e.g., `contents`, `jobs`, `users`). Use env vars `CONTENT_COLLECTION` and `ABOUT_COLLECTION` (see `.env.example`).
- Documents should include: `slug` (string, unique), content fields (title, paragraphs), and timestamps (`createdAt`, `updatedAt`).
- Endpoints return JSON and proper HTTP status codes. On error return `{ error: 'message' }`.

Project layout (updated)

The backend now uses a simple `src/` application layout to make it easy to evolve into a full REST service:

```
backend/
├── src/
│   ├── config/         # database connectors and config helpers
│   ├── controllers/    # business logic (controllers called by routes)
│   ├── models/         # Mongoose models (optional when USE_MONGOOSE=true)
│   ├── routes/         # Express routers (thin, import controllers)
│   └── app.js          # app factory (creates app + DB connections)
├── server.js           # bootstrapper that calls app.createApp()
├── .env.example        # environment template
└── package.json
```

The onboarding flow (quick start above) still works and uses the native MongoDB driver by default. The app factory (`src/app.js`) will connect using the native driver unless you enable Mongoose (see below).

Step-by-step: add a new page API (example: `contact`)

1. Decide the slug and collection

- Use `slug: 'contact'`. Put pages in `contents` collection (controlled by `CONTENT_COLLECTION`).

2. Add a route in [server.js](server.js) (or later split into `routes/`)

- Implement `GET /api/content/:slug` that queries `db.collection(CONTENT_COLLECTION).findOne({ slug })` and returns 404 when missing. When running with Mongoose enabled this route can be implemented using a `Content` model instead of the native driver.

3. Add manual import endpoint (already present)

- Use `POST /api/content` to upsert documents during development (via Postman). Ensure the JSON includes `slug`.

4. Validate input

- Check required fields (`slug`, `title` or `paragraphs`) and return 400 for invalid payloads.

5. Test locally

- Use Postman or curl to POST a sample `contact` document to `/api/content`. Then visit `/pages/contact.html` (or update a page to fetch that slug) to verify rendering.

Seeding / Importing Content (Postman, Compass, curl)

---

Importing companies & jobs (importer script)

- An importer is provided to safely seed companies and jobs from the japansswdb JSON files. Script: `backend/scripts/import_japansswdb.js`.
- Usage (from repo root):

```bash
# ensure backend/.env contains a valid MONGODB_URI
node backend/scripts/import_japansswdb.js --companies ~/Downloads/japansswdb.companies.json --jobs ~/Downloads/japansswdb.jobs.json
```

- The importer upserts companies (by name), remaps old company IDs to new ObjectIds for jobs, and creates Job documents via the Job model so validation runs the same as the app.
- Results are written to `backend/scripts/import_report.json`.
- Ensure `MONGODB_URI` in `backend/.env` points to the desired database (the script uses that value).

- Purpose: manually add or update page documents in your dev or staging DB without running a seed script. The `POST /api/content` endpoint upserts by `slug` (create or replace).

- Important: Include a `slug` field in the JSON (e.g., `"about"`) — this is used by page lookups.

- Example payload (about page):

```json
{
  "slug": "about",
  "title": "About Our Service",
  "paragraphs": [
    "We help people find work.",
    "Our mission is to make hiring easier."
  ],
  "mission": "Create opportunities for everyone",
  "vision": "A world with better job matching"
}
```

- Using Postman
  1.  Start the backend: `cd backend && node server.js` (ensure `MONGODB_URI`/`MONGODB_DB` set in `.env`).
  2.  Create a new request: `POST http://localhost:3000/api/content`.
  3.  Under `Headers` add `Content-Type: application/json` and, if you enabled the optional admin token, `X-ADMIN-TOKEN: <your-token>`.
  4.  Under `Body` → `raw` paste the example JSON and send. You should get a 200/201 response with upsert info.

- Using MongoDB Compass (manual insert)
  1.  Open Compass and connect to your Atlas or local dev cluster.
  2.  Select the DB name (from `MONGODB_DB`) and the collection (see `CONTENT_COLLECTION` / `ABOUT_COLLECTION`).
  3.  Click `Insert Document`, paste the example JSON (you can omit `createdAt/updatedAt` — add them if you want explicit timestamps) and click `Insert`.
  4.  Refresh and verify the document exists with the `slug` field.

- Using curl (quick test)

```bash
curl -X POST http://localhost:3000/api/content \
	-H "Content-Type: application/json" \
	-H "X-ADMIN-TOKEN: your-token-if-configured" \
	-d '{"slug":"about","title":"About Our Service","paragraphs":["We help people find work.","Our mission is to make hiring easier."],"mission":"Create opportunities for everyone","vision":"A world with better job matching"}'
```

- Notes and tips

Mongoose toggle

If you'd like to adopt Mongoose for models and richer validation, you can enable it without refactoring the whole app immediately.

- Set `USE_MONGOOSE=true` in `backend/.env` to start the backend with Mongoose connected.
- The app will expose `app.locals.mongoose` and route modules will prefer mongoose-backed controllers when present (so we can migrate endpoints one-by-one).
- The Content Mongoose model is available at [src/models/Content.js](src/models/Content.js) as an example.

Tip: enable Mongoose and run the About endpoints to validate the model reads the same `contents` collection as the native driver.

- The endpoint performs an upsert by `slug` so re-sending the same `slug` will update the document.
- If you plan to automate imports later, prefer JSON files that include `createdAt`/`updatedAt` or let the server set timestamps consistently.
- Consider adding a short-lived `X-ADMIN-TOKEN` in `.env` and checking it in `POST /api/content` to avoid accidental public writes during development.

Developer checklist (first week tasks)

- [ ] Create a simple content validation helper (e.g., `lib/validateContent.js`) — 2h
- [ ] Implement `GET /api/content/:slug` and `GET /api/contents` using native driver — 4h
- [ ] Use `POST /api/content` to add one canonical page (contact/about) via Postman — 1h
- [ ] Add a small token check for write endpoints (`X-ADMIN-TOKEN` header) and document the token in `.env.example` — 1h
- [ ] Add unit test for `GET /api/content/:slug` using a small in-memory Mongo or local dev DB — 4h

## Production REST API (Days 1-4 Implementation)

## Resume upload & S3 (IAM Role)

- The backend now stores user resumes in an S3 bucket and uses IAM role-based credentials instead of long-lived access keys. This improves security and supports using instance/task roles in production.

- Required environment variables (add to your `.env` in `backend/`):
  - `AWS_REGION` — region where the S3 bucket lives (example: `ap-southeast-1`).
  - `RESUME_S3_BUCKET` — S3 bucket name used for resume storage.
  - `AWS_ROLE_ARN` — (optional) ARN of a role to assume for local development. In production, prefer instance/task execution roles and leave `AWS_ROLE_ARN` unset.

- Verification: A helper script `backend/verify-aws-config.js` checks env, STS identity, assumes role (if configured) and performs a small Put/Get/Delete test against the resume bucket. A npm script `verify:aws` is available in `backend/package.json`:

```bash
cd backend
npm run verify:aws
```

- Controller notes: `src/controllers/profileController.js` was updated to use the centralized S3 client (`src/utils/awsS3.js`). Uploaded file keys are saved to the user profile (`profile.resumePath`). Endpoints:
  - `POST /api/v1/profile/resume` — multipart upload (file field `resume`) saves file to S3 and stores key in profile.
  - `GET /api/v1/profile/resume` — returns a presigned GET URL if `profile.resumePath` exists.
  - `DELETE /api/v1/profile/resume` — deletes the S3 object and clears `profile.resumePath`.

- When working locally you may need to allow your developer principal to assume the role used by the backend (or configure `AWS_ROLE_ARN` to an appropriate role). See `backend/AWS_IAM_SETUP.md` and the Terraform notes in the `terraform/` folder for guidance on `allowed_principals` and trust policies.

The backend now includes a production-ready REST API with JWT authentication, user profiles, job listings, and applications. This section provides a quick overview — see [README.md](README.md) for complete documentation.

## Google OAuth (Optional)

- The backend supports Google OAuth 2.0 for user sign-in. Add these env vars to `backend/.env` (or `.env.example`):
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (callback URL registered in Google Cloud)

- Typical routes to implement / wire up:
  - `GET /api/v1/auth/google` — starts OAuth by redirecting to Google's authorization endpoint.
  - `GET /api/v1/auth/google/callback` — receives the authorization `code`, exchanges it for tokens, fetches profile info, finds/creates local user, and issues the app JWT.

- Implementation tips:
  - Request scopes: `profile email` to receive the user's name, email, and `email_verified` flag.
  - Persist provider metadata on the user (e.g., `provider: 'google'`, `providerId`).
  - Validate `email_verified` before automatically enabling accounts.
  - For local development, register a redirect URI such as `http://localhost:3000/api/v1/auth/google/callback` in the Google Cloud Console.

### Available APIs (Day 1-4)

**Day 1: Authentication** (`/api/v1/auth`)

- `POST /auth/register` — Register new user (jobseeker or employer)
- `POST /auth/login` — Login and receive JWT token
- `GET /auth/me` — Get current user (protected)
- `POST /auth/logout` — Logout

**Day 2: User Profiles** (`/api/v1/profile`)

- `GET /profile` — Get own profile (jobseeker only)
- `POST /profile` — Create profile
- `PUT /profile` — Update profile
- `POST /profile/education` — Add education entry
- `PUT /profile/education/:id` — Update education
- `DELETE /profile/education/:id` — Delete education
- Similar endpoints for experience, skills, certifications, languages, availability

**Day 3: Jobs** (`/api/v1/jobs`)

- `GET /jobs` — List jobs (public, with filters: industry, prefecture, salary, japaneseLevel, remote, search)
- `GET /jobs/:id` — Get single job
- `POST /jobs` — Create job (employer only)
- `PUT /jobs/:id` — Update job (employer only)
- `DELETE /jobs/:id` — Delete/archive job (employer only)
- `GET /jobs/company/:companyId` — Get jobs by company
- `GET /jobs/my-jobs` — Get my posted jobs (employer only)

**Day 4: Applications** (`/api/v1/applications`, `/api/v1/jobs/:id/apply`)

- `POST /jobs/:id/apply` — Apply to job (jobseeker only)
- `GET /applications/me` — Get my applications (jobseeker only)
- `GET /applications/:id` — Get single application (applicant or employer)
- `PUT /applications/:id/withdraw` — Withdraw application (applicant only)
- `GET /jobs/:id/applications` — Get all applications for job (employer only)
- `PUT /applications/:id/status` — Update application status (employer only)
- `PUT /applications/:id/notes` — Add employer notes (employer only)

**Additional APIs:**

- **Companies** (`/api/v1/companies`) — List, get, create, update companies
- **Users** (`/api/v1/users`) — Admin user management

### API Documentation & Testing

**Interactive Swagger UI:**

- Start server: `npm start` or `npm run dev`
- Visit: http://localhost:3000/api-docs
- Test endpoints directly from browser with JWT token

**Export OpenAPI JSON:**

```bash
npm run export:swagger
# Generates: backend/api-docs.json
```

**Postman Collections:**

- [postman/Japan_SSW_API_Complete.postman_collection.json](postman/Japan_SSW_API_Complete.postman_collection.json) — Full API with all endpoints
- [postman/Japan_SSW_API_day1_day4.postman_collection.json](postman/Japan_SSW_API_day1_day4.postman_collection.json) — Day 1 & Day 4 endpoints only

Import into Postman:

1. Open Postman → Import → Choose file
2. Import environment: [postman/Japan_SSW_API.postman_environment.json](postman/Japan_SSW_API.postman_environment.json)
3. Set `baseUrl` to `http://localhost:3000` (or your deployed URL)
4. Run "Authentication → Login" to obtain JWT token (auto-saves to `{{token}}`)
5. Test other endpoints (token is automatically included in Authorization header)

**Quick API Test (curl):**

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"Test123!","role":"jobseeker"}'

# Login (save token from response)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"Test123!"}'

# Get current user (replace YOUR_TOKEN)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Data (Seed Database)

After seeding (`npm run seed:full` from backend folder), you have:

- **21 users:** 1 admin, 10 employers, 10 jobseekers
- **10 companies:** across 9 industries
- **44 jobs:** distributed across companies
- **20 applications:** various statuses

**Test Credentials:**

- **Jobseeker:** `carlos.rivera@example.com` / `Test123!`
- **Employer:** `employer1@techinnov.com` / `Test123!`
- **Admin:** `admin@japanssw.com` / `Admin123!`

### Scripts

Available scripts in `backend/scripts/`:

- [export-swagger.js](scripts/export-swagger.js) — Export OpenAPI JSON (run via `npm run export:swagger`)
- [check-db.js](scripts/check-db.js) — Verify DB connection and collections
- [find-job.js](scripts/find-job.js) — Find jobs by criteria
- [normalize-seeddata.js](scripts/normalize-seeddata.js) — Normalize seed data JSON files
- [test-day4.sh](scripts/test-day4.sh) — Test Day 4 Application endpoints
- [cleanup-day4.sh](scripts/cleanup-day4.sh) — Clean up Day 4 test data

Run scripts from backend folder:

```bash
cd backend
node scripts/check-db.js
node scripts/export-swagger.js
./scripts/test-day4.sh
```

### Development Workflow (Day 1-4 APIs)

1. **Start with seed data:** `npm run seed:full`
2. **Start server:** `npm run dev` (auto-reload) or `npm start`
3. **Open Swagger UI:** http://localhost:3000/api-docs
4. **Test with Postman:** Import collection and environment, run requests
5. **Check logs:** server logs to console and `logs/` folder (Winston)
6. **Iterate:** Make changes, nodemon auto-restarts server

### Authentication Flow

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token obtained from:

1. `POST /api/v1/auth/register` (returns token)
2. `POST /api/v1/auth/login` (returns token)

Token expires after 7 days (configurable via `JWT_EXPIRE` in `.env`).

### Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

Common HTTP status codes:

- **200** — Success (GET, PUT, DELETE)
- **201** — Created (POST)
- **400** — Bad Request (validation errors)
- **401** — Unauthorized (missing/invalid token)
- **403** — Forbidden (insufficient permissions)
- **404** — Not Found
- **429** — Too Many Requests (rate limit)
- **500** — Internal Server Error

### Documentation Files

- [README.md](README.md) — Complete backend documentation, setup, deployment
- [API_REFERENCE.md](API_REFERENCE.md) — Complete endpoint reference with examples
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Swagger/OpenAPI documentation
- [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) — Frontend integration guide
- [api-docs.json](api-docs.json) — Generated OpenAPI JSON (for frontend/CI)

Developer checklist (first week tasks — legacy content API)

- [ ] Create a simple content validation helper (e.g., `lib/validateContent.js`) — 2h
- [ ] Implement `GET /api/content/:slug` and `GET /api/contents` using native driver — 4h
- [ ] Use `POST /api/content` to add one canonical page (contact/about) via Postman — 1h
- [ ] Add a small token check for write endpoints (`X-ADMIN-TOKEN` header) and document the token in [.env.example](.env.example) — 1h
- [ ] Add unit test for `GET /api/content/:slug` using a small in-memory Mongo or local dev DB — 4h
      Additional utilities (optional)

- Password helper ([src/utils/password.js](src/utils/password.js)): if you need auth (user registration/login), use the bcryptjs-based helper for hashing and comparing passwords. See [docs/NODEJS_REST_API_CRUD_GUIDE.md](../docs/NODEJS_REST_API_CRUD_GUIDE.md) for registration/login examples.
- Full REST API guide: [docs/NODEJS_REST_API_CRUD_GUIDE.md](../docs/NODEJS_REST_API_CRUD_GUIDE.md) provides a complete, production-ready structure (Mongoose models, JWT auth, middleware, testing). Use it when you're ready to expand beyond the minimal native-driver setup.

Where to extend later

- **Adopt Mongoose & production packages**: When your team is ready, migrate to Mongoose (schemas, validation), bcryptjs (password hashing), JWT (auth tokens), helmet (security headers), express-validator, and other packages detailed in [docs/NODEJS_REST_API_CRUD_GUIDE.md](../docs/NODEJS_REST_API_CRUD_GUIDE.md). The guide includes full examples for models, controllers, middleware, and testing.
- Extract `backend/` into `services/content-service/` and add `api-gateway` only when you need multiple services.
- Add CI to run lint/tests and a staging environment for integration tests.

Notes for reviewers and maintainers

- Keep [server.js](server.js) readable — it's intentionally minimal to help new developers trace the app flow.
- Document any changes to collection names in [.env.example](.env.example).

Contact

- Ask on the team channel or open a PR with `WIP` for reviews; pair-program the first route implementation with a team member.
