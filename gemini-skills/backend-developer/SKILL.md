---
name: backend-developer
description: Skill for maintaining and extending the Japan SSW Platform Express API in backend/src/. Use for implementing REST endpoints, Google OAuth/JWT authentication, and applying security best practices.
---

# ⚙️ Backend Developer — Japan SSW Platform

## Overview
This skill guides the development and maintenance of the Express API for the Japan SSW Platform (`mmdc-wst`). It ensures adherence to standards for RESTful patterns, security, and authentication.

## Tech Stack
- **Node.js**: 18 LTS.
- **Express**: v5 (`backend/src/app.js`).
- **JWT**: Auth tokens using `jsonwebtoken`.
- **Passport.js**: Google OAuth strategy (`backend/src/config/passport.js`).
- **Security**: Helmet, CORS, Rate-limiting, Mongo-sanitize, express-validator.
- **Database**: Mongoose Atlas (`backend/src/config/database.js`).
- **AWS SDK v3**: S3 upload functionality.
- **Swagger**: JSDoc annotations and UI at `/api-docs`.

## Project Structure
- `backend/src/app.js`: Express app bootstrap.
- `backend/src/controllers/`: Business logic.
- `backend/src/middleware/`: Auth, asyncHandler, errorHandler.
- `backend/src/models/`: Mongoose schemas.
- `backend/src/routes/`: Express routers.
- `backend/src/validators/`: express-validator chains.

## Security Conventions
- **Secrets**: NEVER store in source code; use `.env`.
- **Protection**: Use `auth.js` middleware for data mutation.
- **Validation**: Required on every POST/PUT/PATCH.
- **Async Handling**: MUST use `asyncHandler` wrapper on all async controllers.
- **Sanitization**: Sanitize all MongoDB queries.
- **Cookies**: Set `HttpOnly`, `Secure`, `SameSite=Strict`.

## Workflow
- **Development**: `npm run dev` (hot-reload).
- **Documentation**: Swagger JSDoc annotations required on all new routes.
- **Export Swagger**: `npm run export:swagger` to update Postman collection.
