# Starter: Add a Node.js API for pages (quick step-by-step)

This short starter guide helps a new developer add a simple API that serves page content (e.g., pages under `pages/` like `about.html`, `contact.html`) and a small index/listing endpoint used by `index.html`.

Assumptions

- Backend uses the app factory in `backend/src/app.js` and exposes a DB connection on startup (native MongoDB client by default). If the repo has `USE_MONGOOSE=true`, add or use the Mongoose model alternative shown below.
- There is already a `POST /api/content` upsert endpoint for development seeding; this guide shows how to add/read content programmatically and how to wire the front-end.

What you'll add — quick summary

- A `GET /api/content/:slug` endpoint that returns JSON for a page (e.g. slug `about`).
- A `GET /api/contents` endpoint that returns a list/summary for `index.html` (e.g., featured pages, titles, slugs).
- A small front-end fetch snippet to be used in `pages/<page>.html` or `index.html`.

Step 1 — Choose the slug and collection

- Pick a slug for the page, e.g. `contact`.
- Use the canonical collection name from `backend/.env.example`: `CONTENT_COLLECTION` (default `contents`).

Step 2 — Seed content (quick, Postman or curl)

Use the existing upsert endpoint (development helper) so the API returns content immediately.

curl example:

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "X-ADMIN-TOKEN: your-token-if-configured" \
  -d '{"slug":"contact","title":"Contact Us","paragraphs":["Call us.","Email us."]}'
```

Step 3 — Add a route (native driver example)

Create `backend/src/routes/contentRoutes.js` (or update your existing routes) and export a router factory that receives the `db` instance from the app factory. Example using the native driver and the app locals pattern:

```js
// backend/src/routes/contentRoutes.js
const express = require("express");

module.exports = function ({ db, collections = {} }) {
  const router = express.Router();
  const CONTENT_COLLECTION = collections.CONTENT_COLLECTION || "contents";

  // GET /api/content/:slug
  router.get("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const doc = await db.collection(CONTENT_COLLECTION).findOne({ slug });
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (err) {
      console.error("GET /api/content/:slug error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/contents  (summary for index)
  router.get("/", async (req, res) => {
    try {
      const docs = await db
        .collection(CONTENT_COLLECTION)
        .find({}, { projection: { slug: 1, title: 1, featured: 1 } })
        .toArray();
      res.json(docs);
    } catch (err) {
      console.error("GET /api/contents error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
```

How to mount this in your app (example snippet for `backend/src/app.js`):

```js
// within createApp() after DB connected
const contentRoutes = require("./routes/contentRoutes")({
  db: client.db(MONGODB_DB),
  collections: process.env,
});
app.use("/api/content", contentRoutes);
```

Step 4 — Mongoose variant (optional)

If you enable `USE_MONGOOSE=true`, create a Mongoose model (if not already present) and use it in a mongoose-backed controller. Example model:

```js
// backend/src/models/Content.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: String,
  paragraphs: [String],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Content", contentSchema);
```

And the controller/router (simple example):

```js
// backend/src/routes/contentRoutes.mongoose.js
const express = require("express");
const Content = require("../models/Content");

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const doc = await Content.findOne({ slug }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

router.get("/", async (req, res) => {
  const docs = await Content.find({}, "slug title featured").lean();
  res.json(docs);
});

module.exports = router;
```

Step 5 — Front-end: fetch content in `pages/<page>.html` or `index.html`

Place this snippet in a page-specific script or inside `assets/js/main.js` as an on-load operation. Example for `about.html`:

```js
// pages/about.html (or assets/js that runs on that page)
async function loadPageContent(slug) {
  try {
    const res = await fetch(`/api/content/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      console.warn("Content not found", res.status);
      return;
    }
    const data = await res.json();
    // Simple DOM injection example
    document.querySelector("#page-title").textContent = data.title || "";
    const container = document.querySelector("#page-body");
    container.innerHTML = "";
    (data.paragraphs || []).forEach((p) => {
      const el = document.createElement("p");
      el.textContent = p;
      container.appendChild(el);
    });
  } catch (err) {
    console.error("Failed to load page content", err);
  }
}

// Example usage: loadPageContent('about')
```

For `index.html`, fetch `/api/contents` and render a list of links to pages using the returned `slug` and `title`.

Step 6 — Protect write endpoints and validate input

- Keep `POST /api/content` protected in dev with `X-ADMIN-TOKEN` or a short-lived token defined in `.env` (see `X_ADMIN_TOKEN`).
- Validate payloads server-side before upserting: require `slug` and at least one content field (`title` or `paragraphs`). Return 400 for invalid payloads.

Step 7 — Test locally

- Start backend: `cd backend && npm ci && node server.js` (or `npm run dev` if you have nodemon configured).
- Seed a page (curl or Postman) and then open `http://localhost:3000/pages/contact.html` (or `index.html`) to see the result.

Troubleshooting & tips

- If the route returns 500, check server logs and ensure DB connection is available in `app.locals` or the `db` object passed to the router.
- When migrating to Mongoose, set `USE_MONGOOSE=true` in `backend/.env` and restart. Create mongoose-backed route files alongside native ones and the app factory will preferentially use mongoose controllers when present.
- When adding many pages, keep a small validation helper (e.g., `backend/src/lib/validateContent.js`) used by controllers.

Next steps (recommended)

- Add unit tests for `GET /api/content/:slug` (use an in-memory MongoDB or a test DB). See `docs/NODEJS_REST_API_CRUD_GUIDE.md` for testing patterns.
- Add `POST /api/content` server-side validation (express-validator or manual). Protect with `X-ADMIN-TOKEN` until proper auth is added.
- Consider adding caching headers or a small in-memory cache for high-traffic pages.

Where this file lives

- File: `docs/ADD_PAGE_API_STARTER.md` — a short, copyable starter for new devs. Link this from `backend/DEVELOPER_GUIDE.md` or the onboarding docs for first-week tasks.

If you want, I can also create the route files and minimal controllers in `backend/src/` for you and run a quick lint pass — tell me whether you want the native-driver or Mongoose example created as files in the repo.
