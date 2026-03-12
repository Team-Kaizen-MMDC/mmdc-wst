# Render / Railway Setup — backend

Use this guide to deploy the bundled Node app (static + API) as a single service on Render or Railway.

1) Connect repository and create a new Web Service
   - Render: New -> Web Service -> Connect GitHub -> Select this repo -> Set the `Root Directory` to `backend/`.
   - Railway: New Project -> Deploy from GitHub -> Select `backend/` as the service path.

2) Build & Start commands
   - Build Command: (optional) leave blank or add any prebuild commands you require. If your repo root contains Tailwind build steps run them before Docker build or in this build step.
   - Start Command: `node server.js`

3) Environment variables (copy from `backend/.env.example` and set real values in provider secrets)

- NODE_ENV (production)
- PORT (use provider-assigned port; many providers set `PORT` automatically — default 3000)
- MONGODB_URI
- MONGODB_USER (optional)
- MONGODB_PASS (optional)
- MONGODB_HOST (optional)
- MONGODB_DB (optional)
- CONTENT_COLLECTION
- ABOUT_COLLECTION
- USE_MONGOOSE (true/false)
- JWT_SECRET
- JWT_EXPIRE
- JWT_COOKIE_EXPIRE
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URIS (comma-separated list)
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- FRONTEND_URL
- MAX_FILE_SIZE
- UPLOAD_PATH
- RESUME_S3_BUCKET
- SENDGRID_API_KEY
- FROM_EMAIL
- FROM_NAME
- LOG_LEVEL
- LOG_FILE
- X_ADMIN_TOKEN

4) Health check
   - Configure a health check URL: `/health` (or `/` if not present). Render and Railway support HTTP health checks.

5) Files / Uploads
   - If you use S3 for large files, add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `RESUME_S3_BUCKET` as secrets (or configure provider-specific IAM roles if supported).

6) OAuth redirect URIs
   - Update Google Cloud Console OAuth credentials to include the deployed `FRONTEND_URL` and backend redirect flows if your app uses server-side callbacks.

7) Post-deploy checks
   - Confirm `/health` returns 200
   - Test login flows (Google OAuth) and file uploads
   - Run Playwright smoke tests from CI if configured

8) Notes about providers
   - Render: auto-build + deploy from Git; you may choose a Docker-based service and use the Dockerfile added to `backend/`.
   - Railway: fast for prototyping; add `MONGODB` add-on or connect to Atlas and set env vars.

9) Scaling and sessions
   - If you scale to multiple instances, avoid in-memory session storage. Use JWTs or an external session store like Redis. Review `backend/src/app.js` for session setup.

10) Example quick local test (after deployment)

```bash
curl -I https://<your-backend-domain>/health
```
