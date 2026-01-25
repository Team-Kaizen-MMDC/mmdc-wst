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

Seeding / Importing Content (Postman, Compass, curl)

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
  - The endpoint performs an upsert by `slug` so re-sending the same `slug` will update the document.
  - If you plan to automate imports later, prefer JSON files that include `createdAt`/`updatedAt` or let the server set timestamps consistently.
  - Consider adding a short-lived `X-ADMIN-TOKEN` in `.env` and checking it in `POST /api/content` to avoid accidental public writes during development.

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
