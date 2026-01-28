# Japan SSW Platform API Documentation

Complete REST API for the Japan Specified Skilled Worker (SSW) job platform connecting Filipino jobseekers with Japanese employers.

## 📚 Interactive Documentation

### Swagger UI (Recommended)

**Live interactive documentation with test interface:**

```
http://localhost:3000/api-docs
```

Features:

- ✅ Browse all endpoints with detailed schemas
- ✅ Test API calls directly in browser
- ✅ See request/response examples
- ✅ Automatic JWT token management
- ✅ Filter by tags (Authentication, Profile, Jobs, Companies)

### Swagger JSON

**Raw OpenAPI 3.0 specification:**

```
http://localhost:3000/api-docs.json
```

## 📮 Postman Collection

Import pre-configured requests with automatic token management:

### Files Location

```
backend/postman/
├── Japan_SSW_API.postman_collection.json    # All API endpoints
└── Japan_SSW_API.postman_environment.json   # Environment variables
```

### Import Steps

1. Open Postman
2. Click **Import** → **File**
3. Select both JSON files from `backend/postman/`
4. Select **Japan SSW API - Local** environment
5. Start testing!

### Auto-Variables

The collection automatically saves tokens and IDs:

- `JWT_TOKEN` - Saved after login/register
- `USER_ID` - Saved after authentication
- `COMPANY_ID` - Saved after creating company
- `JOB_ID` - Saved after creating job

## 🚀 Quick Start

### 1. Start Server

```bash
cd backend
NODE_ENV=development USE_MONGOOSE=true node server.js
```

### 2. Open Documentation

Visit: http://localhost:3000/api-docs

### 3. Test Authentication Flow

**Register:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "jobseeker"
  }'
```

**Login & Get Token:**

```bash
TOKEN=$(curl -sS -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' \
  | jq -r '.data.token')

echo $TOKEN
```

**Use Token:**

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 📑 API Overview

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout user (protected)
- `POST /api/v1/auth/forgot-password` - Request password reset

### Profile Endpoints

- `GET /api/v1/profile` - Get own profile (protected)
- `POST /api/v1/profile` - Create profile (protected)
- `PUT /api/v1/profile` - Update profile (protected)
- `DELETE /api/v1/profile` - Delete profile (protected)
- `POST /api/v1/profile/education` - Add education (protected)
- `PUT /api/v1/profile/education/:id` - Update education (protected)
- `DELETE /api/v1/profile/education/:id` - Delete education (protected)
- `POST /api/v1/profile/experience` - Add experience (protected)
- `PUT /api/v1/profile/experience/:id` - Update experience (protected)
- `DELETE /api/v1/profile/experience/:id` - Delete experience (protected)
- `PUT /api/v1/profile/skills` - Update skills (protected)
- `PUT /api/v1/profile/certifications` - Update certifications (protected)
- `PUT /api/v1/profile/languages` - Update languages (protected)
- `PUT /api/v1/profile/availability` - Update availability (protected)

### Job Endpoints

- `GET /api/v1/jobs` - Get all jobs (public, with filters)
- `GET /api/v1/jobs/:id` - Get job by ID (public)
- `POST /api/v1/jobs` - Create job (employer only)
- `PUT /api/v1/jobs/:id` - Update job (employer only, ownership check)
- `DELETE /api/v1/jobs/:id` - Delete job (employer only, soft delete)
- `GET /api/v1/jobs/company/:companyId` - Get jobs by company (public)

### Company Endpoints

- `GET /api/v1/companies` - Get all companies (public)
- `GET /api/v1/companies/:id` - Get company by ID (public)
- `POST /api/v1/companies` - Create company (employer only)
- `PUT /api/v1/companies/:id` - Update company (employer only)

## 🔐 Authentication

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Token Lifecycle

- **Expires:** 7 days (configurable via `JWT_EXPIRE`)
- **Storage:** Client-side (sessionStorage/localStorage)
- **Renewal:** Login again to get new token

## 🔍 Advanced Filtering (Jobs)

### Query Parameters

```bash
GET /api/v1/jobs?industry=Manufacturing&prefecture=Tokyo&japaneseLevel=N3&page=1&limit=10
```

**Supported Filters:**

- `industry` - Filter by industry (Manufacturing, Nursing Care, etc.)
- `prefecture` - Filter by prefecture (Tokyo, Osaka, etc.)
- `city` - Filter by city
- `japaneseLevel` - Filter by required Japanese level (N5-N1)
- `minSalary` - Minimum salary
- `maxSalary` - Maximum salary
- `remote` - Remote work (true/false)
- `search` - Text search (title, summary, responsibilities)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10, max: 100)
- `sort` - Sort field (e.g., `-createdAt` for newest first)

### Example Queries

```bash
# Find manufacturing jobs in Tokyo requiring N3 Japanese
GET /api/v1/jobs?industry=Manufacturing&prefecture=Tokyo&japaneseLevel=N3

# Find high-paying jobs (>300k JPY/month)
GET /api/v1/jobs?minSalary=300000

# Search for "engineer" jobs
GET /api/v1/jobs?search=engineer

# Remote-friendly jobs
GET /api/v1/jobs?remote=true
```

## 📊 Response Format

### Success Response

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack (development only)"
}
```

### Paginated Response

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 5,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🛡️ Security Features

- ✅ **JWT Authentication** - Bearer token validation
- ✅ **Password Hashing** - bcrypt with 12 salt rounds
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **CORS** - Configurable allowed origins
- ✅ **Helmet** - Security headers (CSP, HSTS, etc.)
- ✅ **Input Validation** - express-validator on all inputs
- ✅ **Role-Based Access** - Jobseeker/Employer/Admin permissions
- ✅ **Ownership Checks** - Users can only modify their own data

## 🔧 Environment Variables

Required for API functionality:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.net/japansswdb

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📝 Testing Workflow

### Complete User Journey

```bash
# 1. Register jobseeker
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jobseeker@test.com","password":"Pass123!","role":"jobseeker"}'

# 2. Login & save token
TOKEN=$(curl -sS -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jobseeker@test.com","password":"Pass123!"}' \
  | jq -r '.data.token')

# 3. Create profile
curl -X POST http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Maria","lastName":"Santos","nationality":"Philippines"}'

# 4. Browse jobs
curl -X GET 'http://localhost:3000/api/v1/jobs?industry=Manufacturing'
```

## 🌐 Production Deployment

Update `servers` in swagger config for production:

```javascript
servers: [
  {
    url: "https://api.japanssw.com",
    description: "Production server",
  },
];
```

## 📞 Support

- **API Issues:** Check `/api-docs` for latest schema
- **Postman Problems:** Re-import collection after updates
- **Authentication Errors:** Verify token in Authorization header
- **Rate Limit Exceeded:** Wait 15 minutes or increase limits

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** January 28, 2026  
**API Version:** 1.0.0  
**Documentation:** http://localhost:3000/api-docs
