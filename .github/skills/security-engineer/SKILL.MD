# 🔐 Security Engineer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Audit and harden all Express middleware and route configurations
- Manage secrets, environment variables, and credentials lifecycle
- Implement and review OAuth 2.0 / JWT flows
- Configure AWS IAM least-privilege policies and OIDC federation
- Review Mongoose schemas for data exposure risks

## Required Tech Stack & Practices
| Area | Tools / Patterns |
|---|---|
| HTTP Security Headers | Helmet v8 (`helmet()` in `app.js`) |
| Input Sanitization | `express-mongo-sanitize`, `express-validator` |
| Rate Limiting | `express-rate-limit` (global + per-route) |
| Password Hashing | `bcryptjs` (salt rounds ≥ 12) |
| Auth Tokens | JWT (`jsonwebtoken`), `HttpOnly` cookies |
| OAuth | Passport.js + `passport-google-oauth20`, `google-auth-library` |
| CORS | Strict origin whitelist via `FRONTEND_URL` |
| Secrets Management | `.env` (never committed), GitHub Actions secrets, AWS Secrets Manager for prod |
| AWS Auth | OIDC role assumption (no long-lived keys) |
| NoSQL Injection | `express-mongo-sanitize` on all request bodies |

## Security Checklist (per PR)
- [ ] No secrets or credentials in source code or logs
- [ ] All new routes protected by `auth.js` middleware (unless explicitly public)
- [ ] Input validated and sanitized before DB operations
- [ ] Sensitive Mongoose fields have `select: false`
- [ ] New env vars documented in `backend/.env` (template, no real values)
- [ ] Rate limits applied to any new auth or mutation endpoints
- [ ] CORS origin unchanged unless intentional

## Key Files
| File | Purpose |
|---|---|
| `backend/src/middleware/auth.js` | JWT verification middleware |
| `backend/src/config/passport.js` | Google OAuth strategy setup |
| `backend/src/routes/oauthRoutes.js` | OAuth callback handling |
| `backend/src/middleware/errorHandler.js` | Prevents leaking stack traces |
| `backend/.env` | Secret template (never commit real values) |

## Related Skills
- [Backend Developer](../backend-developer/SKILL.MD) — route & middleware implementation
- [DevOps Engineer](../devops-engineer/SKILL.MD) — CI secrets & OIDC setup
- [AWS / Cloud Engineer](../aws-cloud-engineer/SKILL.MD) — IAM policies
- [Database Architect](../database-architect/SKILL.MD) — schema data exposure
