# Deployment Guide — Japan SSW Platform Backend

This guide provides detailed deployment instructions for Railway, Vercel, and Heroku, plus production testing and monitoring setup.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Railway Deployment (Recommended)](#railway-deployment-recommended)
3. [Vercel Deployment](#vercel-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [MongoDB Atlas Production Setup](#mongodb-atlas-production-setup)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Production Testing](#production-testing)
8. [Monitoring & Logging](#monitoring--logging)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to any platform, complete these tasks:

### 1. Environment Configuration

- [ ] **Generate Production JWT Secret**

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Save this value securely — you'll use it as `JWT_SECRET`

- [ ] **Review `.env.example`** — ensure all required variables are documented

- [ ] **Set NODE_ENV to production** — affects security middleware, logging, and performance

### 2. Code Preparation

- [ ] **Test locally in production mode**

  ```bash
  NODE_ENV=production npm start
  ```

  Verify server starts correctly with production settings

- [ ] **Run all tests** (if configured)

  ```bash
  npm test
  ```

- [ ] **Update CORS configuration** — set `FRONTEND_URL` to your production frontend domain

- [ ] **Review rate limiting** — adjust `RATE_LIMIT_MAX_REQUESTS` if needed for production traffic

- [ ] **Check package.json scripts** — ensure `start` script is correct
  ```json
  {
    "scripts": {
      "start": "node server.js"
    }
  }
  ```

### 3. Database Preparation

- [ ] **MongoDB Atlas Production Cluster Ready** — see [MongoDB Atlas Production Setup](#mongodb-atlas-production-setup)

- [ ] **Database user created** with strong password

- [ ] **Network access configured** for production (IP whitelist or allow all)

- [ ] **Connection string tested** locally

- [ ] **Seed data loaded** (optional, but recommended for initial deployment)
  ```bash
  npm run seed:full
  ```

### 4. Security Review

- [ ] **JWT_SECRET is strong** (32+ characters, cryptographically random)

- [ ] **Passwords are hashed** (bcrypt with rounds >= 10)

- [ ] **Rate limiting enabled** for all routes

- [ ] **CORS properly configured** (not allowing `*` in production)

- [ ] **Helmet enabled** for security headers

- [ ] **Input validation** on all endpoints

- [ ] **MongoDB sanitization** enabled to prevent injection

---

## Railway Deployment (Recommended)

**Why Railway?** Easy setup, free tier, automatic HTTPS, built-in PostgreSQL/MongoDB support, GitHub integration.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

Your browser will open — login with GitHub account.

### Step 3: Initialize Project

```bash
cd backend
railway init
```

Follow prompts to create new project or link existing one.

### Step 4: Add MongoDB (Optional)

If you don't have MongoDB Atlas, Railway can provision one:

```bash
railway add mongodb
```

Railway automatically sets `MONGO_URL` environment variable. Copy this value and use it as `MONGODB_URI`.

### Step 5: Set Environment Variables

```bash
# Method 1: Via CLI
railway variables set NODE_ENV="production"
railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
railway variables set JWT_SECRET="your-32-char-random-string"
railway variables set JWT_EXPIRE="7d"
railway variables set JWT_COOKIE_EXPIRE="7"
railway variables set FRONTEND_URL="https://your-frontend-domain.com"
railway variables set RATE_LIMIT_WINDOW_MS="900000"
railway variables set RATE_LIMIT_MAX_REQUESTS="100"

# Method 2: Via Dashboard
# 1. Go to https://railway.app/dashboard
# 2. Select your project
# 3. Click "Variables" tab
# 4. Add each variable manually
```

**Required Variables:**

- `NODE_ENV=production`
- `MONGODB_URI` (from MongoDB Atlas)
- `JWT_SECRET` (32+ character random string)
- `FRONTEND_URL` (your frontend domain with protocol)

**Optional but Recommended:**

- `PORT` (Railway auto-sets this, but you can override)
- `JWT_EXPIRE=7d`
- `JWT_COOKIE_EXPIRE=7`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`

### Step 6: Deploy

```bash
railway up
```

Railway will:

1. Upload your code
2. Install dependencies
3. Run `npm start`
4. Provide a public URL (e.g., `https://your-app.up.railway.app`)

### Step 7: Monitor Deployment

```bash
# View logs
railway logs

# Check status
railway status
```

### Step 8: Custom Domain (Optional)

1. Go to Railway dashboard → Your project → Settings
2. Click "Domains"
3. Click "Generate Domain" or add custom domain
4. Update DNS records if using custom domain

### Railway Production Checklist

- [ ] All environment variables set (see list above)
- [ ] `NODE_ENV=production`
- [ ] CORS configured with production `FRONTEND_URL`
- [ ] MongoDB Atlas connection string working
- [ ] Public URL accessible
- [ ] Test critical endpoints (register, login, profile)
- [ ] Logs showing no errors
- [ ] Custom domain configured (if needed)

---

## Vercel Deployment

**Why Vercel?** Free tier, automatic HTTPS, GitHub integration, great for serverless functions.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Create `vercel.json`

Create this file in `backend/` directory:

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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 4: Deploy

```bash
cd backend
vercel
```

Follow prompts:

- Link to existing project? (No for first deployment)
- Project name? (japanssw-api or your choice)
- Directory? (. — current directory)

Vercel will deploy and provide a URL like `https://your-app.vercel.app`

### Step 5: Set Environment Variables

**Method 1: Via CLI**

```bash
vercel env add NODE_ENV
# Enter: production

vercel env add MONGODB_URI
# Enter: your-mongodb-atlas-connection-string

vercel env add JWT_SECRET
# Enter: your-32-char-random-string

vercel env add FRONTEND_URL
# Enter: https://your-frontend-domain.com
```

**Method 2: Via Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `your-secret`
   - `FRONTEND_URL` = `https://your-frontend.com`
   - All other variables from `.env.example`

### Step 6: Redeploy with Variables

```bash
vercel --prod
```

### Step 7: GitHub Integration (Optional)

1. Go to Vercel dashboard → Your project → Settings → Git
2. Connect GitHub repository
3. Enable automatic deployments on push to `main`

### Vercel Production Checklist

- [ ] `vercel.json` created with correct configuration
- [ ] All environment variables set in Vercel dashboard
- [ ] `NODE_ENV=production`
- [ ] CORS configured with production `FRONTEND_URL`
- [ ] MongoDB Atlas connection working
- [ ] Production URL accessible
- [ ] Test critical endpoints
- [ ] GitHub auto-deploy enabled (optional)

---

## Heroku Deployment

**Why Heroku?** Classic PaaS, well-documented, reliable.

### Step 1: Install Heroku CLI

Download from: https://devcenter.heroku.com/articles/heroku-cli

Or via Homebrew (macOS):

```bash
brew tap heroku/brew && brew install heroku
```

### Step 2: Login to Heroku

```bash
heroku login
```

Browser will open — login with Heroku account.

### Step 3: Create Heroku App

```bash
cd backend
heroku create japanssw-api
```

Heroku will create app and add remote to git:

- App URL: `https://japanssw-api.herokuapp.com`
- Git remote: `https://git.heroku.com/japanssw-api.git`

### Step 4: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/japansswdb?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your-32-char-random-string"
heroku config:set JWT_EXPIRE="7d"
heroku config:set JWT_COOKIE_EXPIRE="7"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
heroku config:set RATE_LIMIT_WINDOW_MS="900000"
heroku config:set RATE_LIMIT_MAX_REQUESTS="100"
```

Verify variables:

```bash
heroku config
```

### Step 5: Create `Procfile`

Create `Procfile` (no extension) in `backend/` directory:

```
web: node server.js
```

### Step 6: Deploy to Heroku

**If backend is in subdirectory (not root):**

```bash
# From repository root
git subtree push --prefix backend heroku main
```

**If backend is in root:**

```bash
git push heroku main
```

### Step 7: Monitor Deployment

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Open in browser
heroku open
```

### Step 8: Scale Dynos (Optional)

Free tier has limited hours/month. To upgrade:

```bash
# Scale to 1 dyno (required for free tier)
heroku ps:scale web=1

# Upgrade to Hobby plan ($7/month, no sleep)
heroku ps:resize web=hobby
```

### Heroku Production Checklist

- [ ] Heroku app created
- [ ] All environment variables set via `heroku config:set`
- [ ] `Procfile` created with `web: node server.js`
- [ ] `NODE_ENV=production`
- [ ] CORS configured with production `FRONTEND_URL`
- [ ] MongoDB Atlas connection working
- [ ] App deployed successfully
- [ ] Logs showing no errors
- [ ] Test critical endpoints
- [ ] Dyno scaled appropriately

---

## MongoDB Atlas Production Setup

### 1. Create Production Cluster

1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster or use existing
3. Choose production tier (M10+ recommended for high traffic)
4. Select region close to your backend server

### 2. Configure Database Access

1. **Database Access** → Add Database User
   - Username: `japanssw-prod`
   - Password: Generate strong password (save securely!)
   - Privileges: `Atlas admin` or `Read and write to any database`

### 3. Configure Network Access

**Option A: Allow All IPs (Simplest)**

1. **Network Access** → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Comment: "Production servers"

**Option B: Whitelist Specific IPs (More Secure)**

1. Get your hosting provider's outbound IPs
   - Railway: Check dashboard or logs
   - Vercel: Uses dynamic IPs (recommend Option A)
   - Heroku: `heroku ps:ip` (requires paid dyno)
2. Add each IP to Network Access

### 4. Get Production Connection String

1. Click "Connect" on your cluster
2. Select "Connect your application"
3. Copy connection string (Node.js driver)
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `japansswdb`
6. Add to hosting platform as `MONGODB_URI`

**Example Connection String:**

```
mongodb+srv://japanssw-prod:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/japansswdb?retryWrites=true&w=majority
```

### 5. Enable Backup (Recommended)

1. **Backup** tab → Enable Cloud Backup
2. Configure backup schedule
3. Set retention policy

### 6. Monitor Performance

1. **Metrics** tab → View database performance
2. Set up alerts for:
   - High CPU usage
   - High memory usage
   - Connection pool exhaustion
   - Slow queries

### MongoDB Atlas Checklist

- [ ] Production cluster created (M10+ for high traffic)
- [ ] Database user created with strong password
- [ ] Network access configured (allow all or whitelist IPs)
- [ ] Connection string tested locally
- [ ] Connection string added to hosting platform
- [ ] Backup enabled
- [ ] Monitoring alerts configured

---

## Environment Variables Reference

### Required Variables

| Variable       | Example             | Description                            |
| -------------- | ------------------- | -------------------------------------- |
| `NODE_ENV`     | `production`        | Environment (production/development)   |
| `PORT`         | `5000`              | Server port (auto-set by most hosts)   |
| `MONGODB_URI`  | `mongodb+srv://...` | MongoDB Atlas connection string        |
| `JWT_SECRET`   | `abc123...`         | 32+ char random string for JWT signing |
| `FRONTEND_URL` | `https://app.com`   | Frontend domain for CORS               |

### Optional Variables

| Variable                  | Default  | Description                           |
| ------------------------- | -------- | ------------------------------------- |
| `JWT_EXPIRE`              | `7d`     | JWT token expiration                  |
| `JWT_COOKIE_EXPIRE`       | `7`      | JWT cookie expiration (days)          |
| `RATE_LIMIT_WINDOW_MS`    | `900000` | Rate limit window (15 min)            |
| `RATE_LIMIT_MAX_REQUESTS` | `100`    | Max requests per window               |
| `LOG_LEVEL`               | `info`   | Logging level (debug/info/warn/error) |

---

## Production Testing

### Test NODE_ENV=production Locally

```bash
# Set environment
export NODE_ENV=production

# Or in .env
NODE_ENV=production

# Start server
npm start
```

**Verify:**

- [ ] Server starts without errors
- [ ] CORS headers correct (check with frontend)
- [ ] Rate limiting active
- [ ] Security headers present (helmet)
- [ ] Error messages don't expose stack traces
- [ ] Logs show production mode

### Test MongoDB Atlas Connection

```bash
# Test connection locally with production URI
MONGODB_URI="mongodb+srv://prod-user:password@cluster.mongodb.net/japansswdb" npm start
```

**Verify:**

- [ ] Connection succeeds
- [ ] No authentication errors
- [ ] Database operations work

### Test Critical Endpoints

Use Postman collection or curl:

```bash
# Health check
curl https://your-app.herokuapp.com/api/v1/health

# Register user
curl -X POST https://your-app.herokuapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"jobseeker"}'

# Login
curl -X POST https://your-app.herokuapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get profile (use token from login response)
curl https://your-app.herokuapp.com/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verify:**

- [ ] All endpoints return correct status codes
- [ ] Authentication works
- [ ] Protected routes require JWT
- [ ] Data validation works
- [ ] Error responses are proper JSON

### Load Testing (Optional)

Use tools like Apache Bench or Artillery:

```bash
# Install Artillery
npm install -g artillery

# Create test scenario
cat > load-test.yml << EOF
config:
  target: "https://your-app.herokuapp.com"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/v1/health"
EOF

# Run test
artillery run load-test.yml
```

---

## Monitoring & Logging

### Railway Monitoring

```bash
# View logs
railway logs --follow

# Check metrics in dashboard
# Visit: https://railway.app/dashboard → Your project → Metrics
```

### Vercel Monitoring

1. Go to Vercel dashboard → Your project → Logs
2. View real-time logs
3. Check function invocations
4. Monitor error rates

### Heroku Monitoring

```bash
# View logs
heroku logs --tail

# Add log drain (optional, e.g., Papertrail)
heroku addons:create papertrail
```

### MongoDB Atlas Monitoring

1. **Metrics** tab → View performance
2. **Real-Time** tab → Active connections
3. **Performance Advisor** → Slow query suggestions
4. Set up alerts:
   - Go to **Alerts** → New Alert
   - Configure thresholds (CPU, memory, connections)

### Third-Party Monitoring (Optional)

**Application Performance Monitoring:**

- [Sentry](https://sentry.io) — Error tracking
- [LogRocket](https://logrocket.com) — Session replay
- [New Relic](https://newrelic.com) — Full APM

**Uptime Monitoring:**

- [UptimeRobot](https://uptimerobot.com) — Free uptime checks
- [Pingdom](https://pingdom.com) — Advanced monitoring

---

## Post-Deployment Checklist

After deployment, verify everything works:

### Deployment Verification

- [ ] Backend URL accessible (e.g., `https://your-app.herokuapp.com`)
- [ ] Swagger docs accessible (e.g., `/api-docs`)
- [ ] Health check endpoint working (`/api/v1/health`)

### Functionality Testing

- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require JWT
- [ ] Profile CRUD operations work
- [ ] Job listings work
- [ ] Application submission works
- [ ] Company management works
- [ ] Admin routes work (if applicable)

### Security Verification

- [ ] HTTPS enabled (check padlock icon)
- [ ] CORS allows only production frontend
- [ ] Rate limiting active (test with multiple requests)
- [ ] JWT tokens expire correctly
- [ ] Passwords stored as hashes (never plaintext)
- [ ] Error messages don't expose sensitive data

### Performance Check

- [ ] Response times acceptable (< 500ms for most endpoints)
- [ ] MongoDB queries efficient (check Atlas slow query log)
- [ ] No memory leaks (monitor for 24-48 hours)
- [ ] Rate limits appropriate for traffic

### Monitoring Setup

- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Uptime monitoring active
- [ ] Database alerts configured
- [ ] Team notifications enabled

### Documentation Update

- [ ] Production URL documented in README
- [ ] Environment variables documented
- [ ] Deployment instructions tested
- [ ] Troubleshooting guide updated
- [ ] Team notified of deployment

---

## Troubleshooting

### Deployment Fails

**Symptom:** Deployment hangs or errors during build

**Solutions:**

- Check logs for specific errors
- Verify `package.json` scripts are correct
- Ensure all dependencies listed in `dependencies` (not `devDependencies`)
- Test `npm install && npm start` locally

### App Crashes on Startup

**Symptom:** App deploys but crashes immediately

**Solutions:**

- Check logs: `railway logs`, `heroku logs --tail`, or Vercel dashboard
- Verify all required environment variables set
- Test locally with `NODE_ENV=production`
- Check MongoDB connection string

### Database Connection Fails

**Symptom:** `MongooseServerSelectionError` or connection timeout

**Solutions:**

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas Network Access allows hosting provider IPs
- Test connection string locally
- Verify database user has correct permissions

### CORS Errors from Frontend

**Symptom:** Browser console shows CORS error

**Solutions:**

- Set `FRONTEND_URL` to exact frontend domain (with protocol)
- Check CORS middleware in `server.js`
- Verify frontend is using correct backend URL
- For multiple origins, use comma-separated list

### 502 Bad Gateway

**Symptom:** Hosting provider returns 502 error

**Solutions:**

- Check app is listening on correct `PORT`
- Railway/Heroku auto-set `PORT` — use `process.env.PORT || 5000`
- Verify app starts successfully (check logs)
- Check MongoDB connection isn't blocking startup

### Rate Limiting Too Strict

**Symptom:** Users getting "Too Many Requests" errors

**Solutions:**

- Increase `RATE_LIMIT_MAX_REQUESTS` in environment variables
- Adjust `RATE_LIMIT_WINDOW_MS` for longer window
- Consider IP-based exemptions for trusted clients
- Monitor actual traffic patterns before adjusting

---

## Rollback Procedure

If deployment causes issues:

### Railway

```bash
# Redeploy previous version from dashboard
# Or rollback via CLI
railway rollback
```

### Vercel

1. Go to Vercel dashboard → Your project → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

### Heroku

```bash
# List releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

---

## Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Heroku Docs:** https://devcenter.heroku.com
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Express.js Production Best Practices:** https://expressjs.com/en/advanced/best-practice-performance.html

---

**Last Updated:** January 29, 2026  
**Maintained By:** Backend Team
