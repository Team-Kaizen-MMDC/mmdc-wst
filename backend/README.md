Quickstart — backend API for pages/about.html

1. Install dependencies (in repository root or in `backend`):

```bash
npm init -y
npm install express mongodb dotenv
```

2. Create a `.env` file (or set env vars) using `.env.example` as a template. Set `MONGODB_URI` to your Atlas connection string.

3. Run the server:

```bash
node backend/server.js
```

4. Open the page served by the static file server:

http://localhost:3000/pages/about.html

Notes:

- The static server serves the repository root so pages under `/pages` are accessible.

Manual data import (Postman)

- This backend exposes an unprotected helper endpoint to allow manual imports during early development:
  - `POST /api/content` — upserts a document by `slug` into the configured content collection. Example request body (JSON):

    {
    "slug": "about",
    "title": "About Us",
    "paragraphs": ["..."],
    "mission": "...",
    "vision": "..."
    }

  Use Postman or curl to POST JSON to this endpoint to add or update page content.
