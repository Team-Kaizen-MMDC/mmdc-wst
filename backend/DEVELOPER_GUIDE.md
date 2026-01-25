# Backend Developer Guide — APIs for Pages

Purpose

- Teach new backend developers how to create HTTP APIs for site pages using the existing `about` implementation as the canonical example.
- Provide conventions, minimal architecture recommendations, and a step-by-step recipe so the team can replicate the pattern for other pages.

Recommended architecture (practical for a small/junior team)

- Start with a single `content-service` (Express + Mongoose) that owns site content documents (slug + body fields).
- Frontend calls the content-service via a lightweight `api-gateway` (simple reverse proxy). Keep other services (jobs, auth) separate later.
- Use one MongoDB cluster, but give each service its own database namespace (db per service) or at least distinct collection names.
- Use docker-compose for local dev; add Kubernetes later if needed.

Key conventions

- Collections: plural, descriptive names (e.g., `contents`, `jobs`, `users`). Environment variables per-service: `MONGODB_URI`, `MONGODB_DB`, and per-collection keys like `CONTENT_COLLECTION` or `ABOUT_COLLECTION`.
- Documents: include `slug` (string, indexed, unique), page-specific fields, and timestamps (`createdAt`, `updatedAt`).
- Validation: use Mongoose schemas for type safety and beginner-friendly validation.
- Config: central `config.js` (we added `backend/config.js`) to read env vars and collection names.
- Error handling: return appropriate HTTP status codes (200, 201, 400, 401, 404, 500) and structured JSON {error: string} on failures.

How to implement a page API (step-by-step — use `about` as example)

1. Create a model (Mongoose)

- Path: `services/content-service/src/models/Content.js` (or `backend/models/content.js` for now).
- Fields: `slug: {type: String, required: true, unique: true}`, `title: String`, `paragraphs: [String]`, `mission: String`, `vision: String`, timestamps.

2. Add route handlers

- Path: `services/content-service/src/routes/content.js` (or `backend/routes/content.js`).
- Endpoints (minimum):
  - `GET /api/content/:slug` — return a single document by slug
  - `GET /api/contents` — list content documents (supports pagination/filter)
  - `POST /api/content` — create (protected)
  - `PUT /api/content/:id` — update (protected)
  - `DELETE /api/content/:id` — delete (protected)

3. Use config for collection names

- Read collection names from `config.COLLECTIONS.*` to avoid hardcoding collection names in code. This allows running multiple services against the same cluster safely.

4. Seed data

- Provide a seed script `services/content-service/seed/seedContent.js` that upserts canonical pages by `slug` (idempotent). We already have `backend/seedAbout.js` — copy the pattern for other pages.
- Include an npm script `npm run seed` in the service package.json.

5. Frontend integration

- Client-side fetch patterns: prefer specific endpoints (`/api/content/about` or `/api/content/:slug`) instead of fetching all documents. Use the `about.html` pattern: fetch, check status, parse JSON, escape HTML before insertion.

6. Tests

- Add unit tests for model validation with Jest. Add integration tests with Supertest to exercise `GET /api/content/:slug` and `GET /api/contents`.

7. Local dev & Docker

- Provide a `Dockerfile` and `docker-compose.yml` entry for content-service and a local `mongo` service. Use `nodemon` for live reload in development.

8. CI/CD

- Each service should have a pipeline: install, lint, test, build docker image, push. Keep a separate staging deploy job that runs seed/migrations.

Security and operations notes

- Protect write endpoints: implement a simple token or JWT-based auth with `auth-service` before exposing POST/PUT/DELETE.
- Store `MONGODB_URI` and secrets in your host's secret manager; do not commit real credentials.
- Add basic logging (request id, route, status, duration) and capture errors centrally if possible.

Quick checklist for adding a new page API (developer checklist)

- [ ] Define schema and create Mongoose model
- [ ] Create route file and wire into Express app
- [ ] Add tests (unit + integration)
- [ ] Add seed script and run locally to populate DB
- [ ] Add dockerfile and compose service entry
- [ ] Update frontend page to call new endpoint and render data
- [ ] Document the endpoint in this guide

Example commands (run from repo root)

```bash
# install deps (service-level or repo root)
npm ci

# seed about
node backend/seedAbout.js

# start server (development)
node backend/server.js

# run tests (example)
npx jest services/content-service
```

Where to put files now

- Short-term: keep `backend/` as the content-service until you extract services/ folders. Place seeds in `backend/seed/` and models in `backend/models/`.
- Long-term: move `backend/*` into `services/content-service/` and create `services/auth-service/`, `services/jobs-service/`, etc.

Further reading and onboarding tips

- Pair each junior dev with one task from the checklist (model, routes, seed, frontend) and run a short code walkthrough together.
- Use the `README.md` and `backend/README.md` for quick start; update them as services are extracted.

Contact

- If you need a pull request template or PR checklist for backend changes I can add one to the repo.
