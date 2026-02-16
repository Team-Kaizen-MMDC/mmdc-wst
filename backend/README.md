# Japan SSW Platform — Backend API

**Version:** 1.0.0  
**Node.js:** 18+ required  
**Database:** MongoDB Atlas  
**API Documentation:** See [API_REFERENCE.md](./API_REFERENCE.md) and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md). Generated OpenAPI JSON: [backend/api-docs.json](backend/api-docs.json). Postman collections: [backend/postman/Japan_SSW_API_day1_day4.postman_collection.json](backend/postman/Japan_SSW_API_day1_day4.postman_collection.json), [postman/Japan_SSW_API_Complete.postman_collection.json](postman/Japan_SSW_API_Complete.postman_collection.json)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Running the Server](#running-the-server)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Production-ready Node.js REST API backend for the Japan Specified Skilled Worker (SSW) platform. Built with Express.js, MongoDB Atlas, and JWT authentication.

### Features

- ✅ **Authentication System** - JWT-based authentication with bcrypt password hashing
- ✅ **User Management** - Jobseekers, employers, and admin roles
- ✅ **Profile Management** - Complete profile CRUD with education, experience, skills
- ✅ **Job Listings** - Search, filter, and manage job postings
- ✅ **Applications** - Job application workflow for jobseekers and employers
- ✅ **Company Management** - Company profiles and verification
- ✅ **Security** - Rate limiting, CORS, helmet, input sanitization
- ✅ **Comprehensive Seed Data** - 21 users, 10 companies, 44 jobs, 20 applications

### Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit, express-mongo-sanitize
- **Logging:** Winston
- **Documentation:** Swagger/OpenAPI 3.0, Postman

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Git
- Postman (optional, for API testing)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Team-Kaizen-MMDC/mmdc-wst.git
cd mmdc-wst/backend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env with your MongoDB Atlas credentials
# Required: MONGODB_URI, JWT_SECRET

# 5. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output to JWT_SECRET in .env

# 6. Start server
npm start
```

Server will start at `http://localhost:3000` (recommended for macOS local development)

---

## Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── companyController.js
│   │   └── userController.js
│   ├── routes/          # Express routes
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── companyRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── asyncHandler.js
│   ├── utils/           # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── logger.js
│   │   └── password.js
│   └── validators/      # Input validation
│       ├── profileValidator.js
│       ├── jobValidator.js
│       └── applicationValidator.js
├── seedData/            # Database seed files
│   ├── users.json
│   └── companies.json
├── postman/             # Postman collections
│   ├── Japan_SSW_API_Complete.postman_collection.json
│   └── Japan_SSW_API.postman_environment.json
├── logs/                # Application logs
├── .env.example         # Environment template
├── .env                 # Your environment (DO NOT COMMIT)
├── server.js            # Server entry point
├── config.js            # Configuration
├── seedDatabase-comprehensive.js  # Seed script
├── package.json
├── API_REFERENCE.md     # Complete API reference
├── API_DOCUMENTATION.md # Swagger documentation
├── FRONTEND_INTEGRATION_GUIDE.md  # Frontend integration guide
└── README.md            # This file
```

---

## Environment Setup

### Required Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server
NODE_ENV=development
PORT=3000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japansswdb?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=<generate-32-char-random-string>
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `JWT_SECRET` in your `.env` file.

---

## Database Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new cluster (free tier M0)
4. Wait for cluster provisioning (~5-10 minutes)

### 2. Configure Database Access

1. **Database Access** → Add new database user
   - Username: `japanssw-user`
   - Password: Generate secure password
   - Role: `Atlas admin` or `Read and write to any database`

2. **Network Access** → Add IP Address
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP for better security

### 3. Get Connection String

1. Click "Connect" on your cluster
2. Select "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `japansswdb`
6. Paste into `.env` as `MONGODB_URI`

### 4. Seed Database

```bash
# Seed database with test data
npm run seed:full

# Output:
# ✅ Connected to MongoDB Atlas
# ✅ Created 21 users
# ✅ Created 10 companies
# ✅ Created 44 jobs
# ✅ Created 20 applications
```

### Test Accounts After Seeding

**Jobseeker:**

- Email: `carlos.rivera@example.com`
- Password: `Test123!`

**Employer:**

- Email: `employer1@techinnov.com`
- Password: `Test123!`

**Admin:**

- Email: `admin@japanssw.com`
- Password: `Admin123!`

---

## Running the Server

### Development Mode

```bash
# Start with auto-reload (nodemon)
npm run dev

# Start without auto-reload
npm start
```

Server starts at: `http://localhost:3000`

### Production Mode

```bash
# Set NODE_ENV to production in .env
NODE_ENV=production

# Start server
npm start
```

### NPM Scripts

```bash
npm start              # Start server
npm run dev            # Start with nodemon (auto-reload)
npm run seed:full      # Seed database with comprehensive data
npm test               # Run tests (if configured)
npm run export:swagger # Export Swagger to JSON
```

---

## API Documentation

### Interactive Documentation

Once server is running:

- **Swagger UI:** http://localhost:3000/api-docs
- **API Base URL:** http://localhost:3000/api/v1

### Documentation Files

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete endpoint reference with examples
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Swagger/OpenAPI documentation
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend integration guide
- **[Postman Collection](./postman/Japan_SSW_API_Complete.postman_collection.json)** - Import into Postman

### Quick API Test

```bash
# Test health check
curl http://localhost:3000/api/v1/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"jobseeker"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## Testing

### Using Postman

1. Import collection: `postman/Japan_SSW_API_Complete.postman_collection.json`
2. Import environment: `postman/Japan_SSW_API.postman_environment.json`
3. Select "Japan SSW API - Local" environment
4. Run "Authentication → Login" with test credentials
5. JWT token auto-saves, test other endpoints

### Manual Testing

```bash
# 1. Start server
npm start

# 2. Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test123!","role":"jobseeker"}'

# 3. Login (save token from response)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test123!"}'

# 4. Access protected route (replace TOKEN)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Google OAuth (developer helpers & testing)

This project includes small developer helpers to make it easy to obtain Google OAuth tokens (id_token) for local testing and to exercise the server-side ID token verification flow.

Important environment variables (add to `backend/.env`):

- `GOOGLE_CLIENT_ID` — your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` — your Google OAuth Client Secret
- `GOOGLE_REDIRECT_URI` — redirect uri used when generating consent URL (defaults to `http://localhost:3000/api/v1/auth/google/callback`)

Available developer helpers

- CLI helper: `backend/scripts/exchange-code-for-token.js`
  - Usage:
    - Print consent URL: `node backend/scripts/exchange-code-for-token.js` (or `npm run oauth:consent` from `backend` if scripts are installed)
    - Exchange a code for tokens: `node backend/scripts/exchange-code-for-token.js --code YOUR_CODE`
  - The script prints a JSON blob that includes `id_token` you can pass to the backend.

- Dev-only routes (mounted under `/api/v1/auth`):
  - `POST /api/v1/auth/google` — server endpoint that accepts a Google `id_token` (in JSON body `{ idToken: "..." }`), verifies it server-side, and returns the application's JWT on success. This is the production-facing contract used by the frontend to sign-in with Google tokens.
  - `GET /api/v1/auth/google/start` — developer helper that redirects your browser to Google's OAuth consent screen to obtain an authorization code.
  - `GET /api/v1/auth/google/callback` — developer helper that exchanges the authorization code for tokens and returns them as JSON. Useful when testing locally without a frontend.

Safety and deployment notes

- The `start` and `callback` helper routes and the CLI script are intended for local development only. They should be disabled or guarded before deploying to production. Recommended patterns:
  - Only register the helper routes when `NODE_ENV !== 'production'` or when a `DEV_HELPERS=true` environment flag is set.
  - Do not expose `GOOGLE_CLIENT_SECRET` or returned tokens in public logs or error messages.

Testing the flow locally

1. Add Google credentials to `backend/.env` and set `GOOGLE_REDIRECT_URI` if you changed the default.
2. From the repo root:

```bash
cd backend
npm install
npm run oauth:consent   # prints consent URL or use the script directly
```

3. Open the consent URL in a browser, approve the test account, then either copy the returned code and run the CLI to exchange it, or use the `/api/v1/auth/google/callback` helper which will return tokens directly.

4. Call `POST /api/v1/auth/google` with `{ "idToken": "<ID_TOKEN>" }` to sign in via Google and receive the app JWT.

See the tests (unit + integration) for example usage: `src/utils/__tests__/googleAuth.test.js` and `tests/integration/auth.google.test.js`.

---

## Deployment

### Option 1: Railway (Recommended)

**Pros:** Easy setup, free tier, automatic deployments, built-in MongoDB

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add MongoDB plugin (optional)
railway add mongodb

# 5. Set environment variables
railway variables set MONGODB_URI="your-connection-string"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"

# 6. Deploy
railway up
```

**Environment Variables to Set:**

- `NODE_ENV=production`
- `MONGODB_URI` (from MongoDB Atlas)
- `JWT_SECRET` (32+ character random string)
- `FRONTEND_URL` (your frontend domain)
- All other variables from `.env.example`

### Option 2: Vercel

**Pros:** Free tier, automatic HTTPS, GitHub integration

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login
```

## Troubleshooting

- **Port conflict (macOS 5000):** macOS may reserve port 5000 (AirPlay/AirTunes). Use `PORT=3000` for local development. To check and stop the process binding port 5000:
  - `lsof -i :5000` — shows PID
  - `kill <PID>` — stop the process (use `sudo kill -9 <PID>` if required)

- **Server won't start / HTTP 403 on localhost:5000:** change `.env` `PORT` to `3000`, then restart the server (`npm run dev` or `npm start`) and verify with `curl -I http://localhost:3000/pages/about.html` (expect `HTTP/1.1 200 OK`).

- **Mongoose duplicate index warning:** If you see "Duplicate schema index on {\"user\":1} found", fully stop Node processes, then start a clean process. If it persists:
  - Search models for duplicate `index` declarations and remove the explicit duplicate.
  - Ensure only one `unique: true` / `schema.index(..., { unique: true })` exists for the field.

- **Regenerate OpenAPI JSON:**
  - `cd backend && npm run export:swagger` — writes `backend/api-docs.json`.

- **Postman collection:** Import [backend/postman/Japan_SSW_API_day1_day4.postman_collection.json](backend/postman/Japan_SSW_API_day1_day4.postman_collection.json) (or [postman/Japan_SSW_API_Complete.postman_collection.json](postman/Japan_SSW_API_Complete.postman_collection.json)). Set `{{baseUrl}}` to `http://localhost:3000` and run the Authentication → Login request to obtain a token.

- **Quick verify API health:**
  - `curl http://localhost:3000/api/v1/health` — should return a healthy status.

If you'd like, I can also add a short troubleshooting script (`scripts/check-ports.sh`) to automate the `lsof`/`kill` steps and a Postman environment file for the day1+day4 collection. Want me to add those now?

# 3. Deploy

vercel

# 4. Set environment variables in Vercel dashboard

# Settings → Environment Variables → Add each variable from .env

````

**Create `vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
````

### Option 3: Heroku

**Pros:** Classic PaaS, well-documented

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create japanssw-api

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set FRONTEND_URL="your-frontend-url"

# 5. Deploy
git push heroku main
```

### Production Checklist

Before deploying to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Update `MONGODB_URI` with production database
- [ ] Set `FRONTEND_URL` to actual frontend domain
- [ ] Configure CORS origins properly
- [ ] Review rate limiting settings
- [ ] Enable HTTPS (usually automatic with hosting providers)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure logging (CloudWatch, Papertrail, etc.)
- [ ] Test all critical endpoints
- [ ] Set up backup strategy for database
- [ ] Review and update security headers

---

## Troubleshooting

### Common Issues

#### 1. "MongoDB connection failed"

**Cause:** Invalid connection string or network access

**Solutions:**

- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB Atlas → Network Access → Allow your IP
- Ensure database user has correct permissions
- Try "Allow Access from Anywhere" (0.0.0.0/0) for testing

#### 2. "JWT token invalid"

**Cause:** Token expired or invalid secret

**Solutions:**

- Login again to get fresh token
- Verify `JWT_SECRET` in `.env` matches server secret
- Check token expiration (default 7 days)

#### 3. "Port 5000 already in use"

**Cause:** Another process using port 5000

**Solutions:**

```bash
# Find process using port 5000
lsof -i :5000

# Kill process (replace PID)
kill -9 PID

# Or change PORT in .env
PORT=3000
```

#### 4. "Cannot seed database"

**Cause:** Validation errors or database connection issues

**Solutions:**

- Check error messages for specific validation failures
- Verify database connection works
- Try clearing database first:
  ```bash
  # Connect to MongoDB Atlas shell and run:
  use japansswdb
  db.dropDatabase()
  ```
- Run seed again: `npm run seed:full`

#### 5. "CORS error from frontend"

**Cause:** Frontend origin not allowed

**Solutions:**

- Add frontend URL to `FRONTEND_URL` in `.env`
- For development: `FRONTEND_URL=http://localhost:3000`
- For production: `FRONTEND_URL=https://your-domain.com`
- For multiple origins: `FRONTEND_URL=http://localhost:3000,https://your-domain.com`

### Debug Mode

Enable detailed logging:

```bash
# In .env
LOG_LEVEL=debug

# Restart server
npm start
```

Check logs in `logs/app.log`

### Getting Help

1. Check [API_REFERENCE.md](./API_REFERENCE.md) for endpoint details
2. View Swagger docs: http://localhost:5000/api-docs
3. Test with Postman collection
4. Review error logs in `logs/app.log`
5. Check MongoDB Atlas logs for database issues

---

## Security Best Practices

### For Development

- ✅ Use `.env` file (never commit)
- ✅ Use strong JWT secret
- ✅ Enable rate limiting
- ✅ Validate all inputs
- ✅ Sanitize MongoDB queries

### For Production

- ✅ Use environment variables (not files)
- ✅ Enable HTTPS (SSL/TLS)
- ✅ Restrict CORS origins
- ✅ Use MongoDB Atlas IP whitelist
- ✅ Enable database authentication
- ✅ Set up monitoring and alerts
- ✅ Regular security audits
- ✅ Keep dependencies updated
- ✅ Use managed secrets (AWS Secrets Manager, etc.)
- ✅ Enable database backups

---

## Performance Optimization

### For Production

1. **Enable Compression**

   ```javascript
   // Already enabled in server.js
   app.use(compression());
   ```

2. **Database Indexing**
   - Indexes already created on common query fields
   - Monitor slow queries in MongoDB Atlas

3. **Caching**
   - Consider Redis for session management
   - Cache frequently accessed data

4. **Load Balancing**
   - Use multiple instances behind load balancer
   - Railway/Vercel handle this automatically

---

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

---

## License

Proprietary - Team Kaizen MMDC

---

## Support

- **Documentation:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Issues:** Create GitHub issue
- **Email:** lr.bjcarlos@mmdc.mcl.edu.ph

---

**Last Updated:** January 29, 2026  
**Version:** 1.0.0  
**Maintained By:** Backend Team
