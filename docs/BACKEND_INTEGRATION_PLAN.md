**Backend Integration Plan**

This document outlines a pragmatic, beginner-friendly plan to integrate a Node.js REST API backend with MongoDB Atlas for the existing mmdc-wst codebase. The goal is to minimize changes to the current frontend (vanilla JavaScript + Bootstrap) while addressing critical security and persistence needs (authentication, user profiles, job data).

Purpose
- Move sensitive and persistent data (user accounts, profiles, job listings) to MongoDB Atlas.
- Replace insecure client-only authentication (plain cookies/localStorage) with a secure server-side approach.
- Preserve as much of the existing frontend code as possible to keep changes minimal and approachable for beginner developers.

High-level Approach
- Add a small Express.js server that exposes simple REST endpoints.
- Use the existing MongoDB driver pattern (see `mongodbtest.js`) to connect to MongoDB Atlas via `MONGODB_URI` (or MONGODB_USER/MONGODB_PASS/MONGODB_HOST environment variables).
- Implement password hashing (bcrypt) and issue JWTs stored in httpOnly cookies for session management.
- Migrate data incrementally: start with authentication and user profiles, then jobs, then companies and admin features.
- Keep frontend UI and validation logic unchanged where possible — replace storage calls (cookies/localStorage) with fetch() calls to the API.

Phase 0 — Preparation
- Add server folder: `server/` (Express app entrypoint `server/index.js`).
- Add `.env.example` with variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`.
- Add `server/README.md` with simple setup and run instructions.
- Add npm scripts in root `package.json` for `server` and `dev` (nodemon) so beginners can run the backend easily.

Phase 1 — Minimal Secure Auth & Profile
- Goal: fix the biggest security issue quickly — replace plaintext cookies and localStorage authentication.
- Create collections: `users` (email, passwordHash, createdAt, profile object).
- Endpoints:
  - `POST /api/auth/register` — validate input, hash password with bcrypt, insert user, set httpOnly JWT cookie.
  - `POST /api/auth/login` — validate, compare password, set httpOnly JWT cookie.
  - `POST /api/auth/logout` — clear cookie.
  - `GET /api/auth/me` — return current user (based on JWT cookie).
  - `GET /api/profile` — read-only user profile (authenticated).
  - `PUT /api/profile` — update profile (authenticated).
- Frontend changes:
  - Replace `setCookie()`/`getCookie()` auth flows with `fetch()` POSTs to `/api/auth/*` from `assets/js/modules/auth.js` while keeping client-side validation.
  - Replace localStorage profile saves with `fetch()` PUT/GET to `/api/profile`.
- Notes for beginners:
  - Keep UI identical — only change where data is persisted or read.
  - Use browser devtools Network tab to observe requests and responses during development.

Phase 2 — Jobs & Companies
- Move hardcoded job arrays and company data into MongoDB collections (`jobs`, `companies`).
- Endpoints:
  - `GET /api/jobs` — list + filters + pagination.
  - `GET /api/jobs/:id` — job details.
  - `POST /api/jobs` — employer-created job (require auth + role check).
  - `GET /api/companies` and `GET /api/companies/:id`.
- Frontend changes:
  - Replace any direct job data imports with fetch to `/api/jobs` in the pages that render job lists and filters.
  - Keep filtering UI logic intact, just call the API with query params.

Phase 3 — Optional Improvements (iterate as team learns)
- Add role-based access control (roles: user, employer, admin). Simple `role` field on `users` collection.
- File uploads (resumes) using signed URL approach or direct backend uploads to a storage service.
- Server-side validation and sanitization (express-validator, sanitizers).
- Rate limiting and basic logging (express-rate-limit, morgan/winston).

Development Environment & Running
- Minimal dependencies: `express`, `mongodb`, `dotenv`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `cors`, `nodemon` (dev).
- Example `package.json` scripts (add to root `package.json`):

```json
"scripts": {
  "server": "node server/index.js",
  "dev:server": "nodemon server/index.js",
  "start": "npm-run-all --parallel dev:server serve:static",
  "serve:static": "python3 -m http.server 8000"
}
```

- Example `.env.example`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.example.mongodb.net/mydb
JWT_SECRET=replace_this_with_a_strong_secret
PORT=3000
```

Security Notes (must-do)
- Never store plaintext passwords in cookies or localStorage.
- Use bcrypt to hash passwords with a safe cost factor (e.g., saltRounds=10).
- Store JWTs in httpOnly cookies to reduce XSS risk.
- Use CORS to only allow trusted origins in development/production.
- Validate and sanitize all inputs on the server.

Frontend Framework Recommendation
- Keep current vanilla JavaScript + Bootstrap 5.
  - Rationale: this requires minimal changes, the UI is already Bootstrap, and the devs are beginners.
  - If the team later wants a component framework, adopt Vue.js progressively for small pieces (profile dashboard) without a full rewrite.

Deployment Options
- Two simple deployment approaches (choose one):
 1. Separate deployments:
    - Frontend: GitHub Pages / Netlify / Vercel (static site hosting)
    - Backend: Render / Railway / Heroku (Express + env vars)
    - Pros: CDN for static files, independent scaling.
 2. Single deployment:
    - Serve static files from Express `express.static()` and deploy a single server on Render/Heroku.
    - Pros: simpler for small teams; Cons: less CDN advantage, single point to scale.

Checklist for First Implementation (quick wins)
- [ ] Add `server/` and minimal `server/index.js` with DB connection using `mongodbtest.js` approach.
- [ ] Implement `POST /api/auth/register` and `POST /api/auth/login` with bcrypt + JWT cookie.
- [ ] Implement `GET/PUT /api/profile` for user profile storage.
- [ ] Update `assets/js/modules/auth.js` and user profile save/load code to use `fetch()`.
- [ ] Add `.env.example` and update `README.md` with instructions.
- [ ] Test end-to-end: register -> login -> save profile -> logout -> login.

Suggested File Layout (server)
- server/
  - index.js (Express app + route registration)
  - db.js (MongoDB connection helper)
  - routes/
    - auth.js
    - profile.js
    - jobs.js
  - controllers/
    - authController.js
    - profileController.js
    - jobsController.js
  - models/ (optional simple model helpers)
  - README.md

Quick Example: `server/index.js` (sketch)

```javascript
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectToDb } = require('./db');

const app = express();
app.use(cors({ origin: 'http://localhost:8000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

connectToDb().then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('Server running'));
});
```

Next Steps
- Implement the minimal server and auth endpoints and test locally using the existing frontend.
- After the first pass, migrate job data and company data to the database and update frontend calls progressively.

Appendix: Learning Resources (for beginners)
- Express Quickstart: https://expressjs.com/en/starter/hello-world.html
- MongoDB Node.js Driver Docs: https://www.mongodb.com/docs/drivers/node/current/
- bcrypt usage: https://www.npmjs.com/package/bcrypt
- JWT introduction: https://jwt.io/introduction/
