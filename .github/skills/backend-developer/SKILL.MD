# ⚙️ Backend Developer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Maintain and extend the Express API in `backend/src/`
- Implement REST endpoints following existing route/controller/model pattern
- Integrate Google OAuth and JWT authentication flows
- Write Swagger/OpenAPI annotations for all routes
- Apply security best practices at every layer

## Required Tech Stack
| Technology | Version | Notes |
|---|---|---|
| Node.js | 18 LTS | Runtime |
| Express | v5 | `backend/src/app.js` |
| JWT | jsonwebtoken v9 | Auth tokens, secret in `JWT_SECRET` env |
| Passport.js | v0.7 | `passport-google-oauth20` strategy, config in `backend/src/config/passport.js` |
| Google Auth Library | v10 | `backend/src/routes/oauthRoutes.js` |
| Helmet | v8 | Applied globally in `app.js` |
| CORS | v2 | Origin controlled by `FRONTEND_URL` env var |
| express-rate-limit | v8 | Window/max controlled by env vars |
| express-mongo-sanitize | v2 | Prevents NoSQL injection |
| express-validator | v7 | Request validation in `backend/src/validators/` |
| bcryptjs | v3 | Password hashing |
| Morgan | v1 | HTTP request logging |
| Winston | v3 | Application-level logging (`backend/src/utils/`) |
| Multer | v1 | File uploads (resume PDFs) |
| AWS SDK v3 | S3, STS, Presigner | Resume upload to S3 bucket |
| Swagger JSDoc + UI | v6 / v5 | API docs at `/api-docs`, config in `backend/src/config/swagger.js` |
| nodemon | v3 | Dev hot-reload: `npm run dev` |

## Project Structure
```
backend/src/
├── app.js              # Express app bootstrap (helmet, cors, middleware, routes)
├── config/
│   ├── database.js     # Mongoose Atlas connection
│   ├── passport.js     # Google OAuth strategy
│   └── swagger.js      # Swagger config
├── controllers/        # Business logic (one per resource)
├── middleware/
│   ├── auth.js         # JWT verification middleware
│   ├── asyncHandler.js # Wraps async controllers
│   └── errorHandler.js # Global error handler
├── models/             # Mongoose schemas
├── routes/             # Express routers (mounted in app.js)
└── validators/         # express-validator chains
```

## Security Conventions
- **Never** store secrets in source code — use `.env` (see `backend/.env`)
- All routes that mutate data must be protected by `auth.js` middleware
- Input validation required on every POST/PUT/PATCH via `express-validator`
- Rate limiting is global; add stricter limits to auth routes
- Sanitize all MongoDB queries with `express-mongo-sanitize`
- Set `HttpOnly`, `Secure`, `SameSite=Strict` on session/auth cookies
- Use `asyncHandler` wrapper on every async controller to propagate errors to `errorHandler`

## Postman
- Collection lives in `postman/`
- Export updated collection after adding new endpoints: `npm run export:swagger`
- Environment variables mirror `backend/.env` key names

## Related Skills
- [Database Architect](../database-architect/SKILL.MD) — Mongoose models
- [Security Engineer](../security-engineer/SKILL.MD) — auth & hardening
- [Documentation Specialist](../documentation-specialist/SKILL.MD) — Swagger annotations
- [Test Engineer](../test-engineer/SKILL.MD) — Jest + Supertest
