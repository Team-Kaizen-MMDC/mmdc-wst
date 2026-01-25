# Backend Developer Onboarding — Content APIs

Purpose

- Quick, practical onboarding guide for new backend developers building page APIs. We use the `about` page implementation as the example and keep the stack minimal (native MongoDB driver + Express) to lower the learning curve.

Quick start (run locally)

- Copy `.env.example` to `.env` and set `MONGODB_URI` and `MONGODB_DB`.
- Install dependencies and start the server:

```bash
cd backend
npm ci
node server.js
```

- Open: http://localhost:3000/pages/about.html (the page fetches content from the API).

What you'll use (minimal stack)

- Node.js + Express
- Native MongoDB driver (no Mongoose yet) — keeps code simple for beginners
- dotenv for env vars

Guiding principles

- Keep endpoints small and predictable. Use `slug` for page lookups (e.g. `about`).
- Keep DB access in a small module (we have `config.js` and `server.js` that open a single client connection on startup).
- Validate incoming JSON in controllers before writing to the DB.
- Protect write endpoints with a simple token while you develop (add proper auth later).

Conventions

- Collections: plural, descriptive names (e.g., `contents`, `jobs`, `users`). Use env vars `CONTENT_COLLECTION` and `ABOUT_COLLECTION` (see `.env.example`).
- Documents should include: `slug` (string, unique), content fields (title, paragraphs), and timestamps (`createdAt`, `updatedAt`).
- Endpoints return JSON and proper HTTP status codes. On error return `{ error: 'message' }`.

Step-by-step: add a new page API (example: `contact`)

1. Decide the slug and collection

- Use `slug: 'contact'`. Put pages in `contents` collection (controlled by `CONTENT_COLLECTION`).

2. Add a route in `backend/server.js` (or later split into `routes/`)

- Implement `GET /api/content/:slug` that queries `db.collection(CONTENT_COLLECTION).findOne({ slug })` and returns 404 when missing.

3. Add manual import endpoint (already present)

- Use `POST /api/content` to upsert documents during development (via Postman). Ensure the JSON includes `slug`.

4. Validate input

- Check required fields (`slug`, `title` or `paragraphs`) and return 400 for invalid payloads.

5. Test locally

- Use Postman or curl to POST a sample `contact` document to `/api/content`. Then visit `/pages/contact.html` (or update a page to fetch that slug) to verify rendering.

Developer checklist (first week tasks)

- [ ] Create a simple content validation helper (e.g., `backend/lib/validateContent.js`) — 2h
- [ ] Implement `GET /api/content/:slug` and `GET /api/contents` using native driver — 4h
- [ ] Use `POST /api/content` to add one canonical page (contact/about) via Postman — 1h
- [ ] Add a small token check for write endpoints (`X-ADMIN-TOKEN` header) and document the token in `.env.example` — 1h
- [ ] Add unit test for `GET /api/content/:slug` using a small in-memory Mongo or local dev DB — 4h

Where to extend later

- Replace native driver with Mongoose when the team is comfortable (adds schemas and validation helpers).
- Extract `backend/` into `services/content-service/` and add `api-gateway` only when you need multiple services.
- Add CI to run lint/tests and a staging environment for integration tests.

Notes for reviewers and maintainers

- Keep `backend/server.js` readable — it's intentionally minimal to help new developers trace the app flow.
- Document any changes to collection names in `backend/.env.example`.

Contact

- Ask on the team channel or open a PR with `WIP` for reviews; pair-program the first route implementation with a team member.
