---
name: security-engineer
description: Skill for auditing, hardening, and managing security practices for the Japan SSW Platform. Use for implementing/reviewing OAuth/JWT flows, managing secrets and environment variables, configuring AWS IAM, and auditing Express middleware and Mongoose schemas.
---

# 🔐 Security Engineer — Japan SSW Platform

## Overview
This skill guides the security auditing and hardening efforts for the Japan SSW Platform (`mmdc-wst`). It ensures that all application layers, from the API to the database and infrastructure, adhere to the highest security standards.

## Tech Stack & Practices
- **HTTP Security**: Helmet v8 (`helmet()` in `app.js`).
- **Input Sanitization**: `express-mongo-sanitize`, `express-validator`.
- **Rate Limiting**: `express-rate-limit` (global and per-route).
- **Password Hashing**: `bcryptjs` (salt rounds ≥ 12).
- **Auth Tokens**: JWT (`jsonwebtoken`) with `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **OAuth**: Passport.js + `passport-google-oauth20`.
- **CORS**: Strict origin whitelist via `FRONTEND_URL`.
- **Secrets Management**: `.env` (never commit), GitHub Actions secrets, AWS Secrets Manager.
- **AWS Auth**: OIDC federation (no long-lived keys).

## Security Checklist (per PR)
- [ ] No secrets or credentials in source code or logs.
- [ ] New routes protected by `auth.js` middleware (unless public).
- [ ] Input validated and sanitized before DB operations.
- [ ] Sensitive Mongoose fields use `select: false`.
- [ ] No stack traces leaked in production error responses.
- [ ] Rate limits applied to auth or mutation endpoints.
- [ ] CORS origin is verified and unchanged.

## Key Files
- `backend/src/middleware/auth.js`: JWT verification.
- `backend/src/config/passport.js`: Google OAuth setup.
- `backend/src/middleware/errorHandler.js`: Error handling (prevents leaks).
- `backend/.env.example`: Template for environment variables.

## Important Rules
- **NEVER** commit real secret values; use `.env.example` as a template.
- Sanitize all MongoDB queries to prevent NoSQL injection.
- Ensure all data-mutating routes are protected by `auth.js`.
- Use OIDC for AWS auth in CI/CD pipelines.
