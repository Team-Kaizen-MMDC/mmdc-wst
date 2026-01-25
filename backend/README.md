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

- The API endpoint `GET /api/about` will seed a default `about` document into the configured MongoDB collection if none exists.
- The static server serves the repository root so pages under `/pages` are accessible.
