# Japan SSW Platform - Postman Collection

## 📦 Complete API Collection

This directory contains the comprehensive Postman collection for the Japan SSW Platform API with all 40+ endpoints consolidated into one collection.

---

## 🗂️ Files

- **`Japan_SSW_API_Complete.postman_collection.json`** - Complete consolidated collection with all endpoints (RECOMMENDED)
- **`Japan_SSW_API.postman_environment.json`** - Environment variables file
- **`Japan_SSW_API.postman_collection.json`** - Legacy collection (partial endpoints)

---

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop or select files:
   - `Japan_SSW_API_Complete.postman_collection.json`
   - `Japan_SSW_API.postman_environment.json`

### 2. Select Environment

1. In Postman, look for the environment dropdown (top right)
2. Select **"Japan SSW API - Local"**
3. Verify `BASE_URL` is set to `http://localhost:5000/api/v1`

### 3. Start Backend Server

```bash
cd backend
npm start
# Server should run on http://localhost:5000
```

### 4. Test Authentication Flow

**Option A: Use Existing Seed Data**

1. Open **Authentication → Login**
2. Use test credentials:
   ```json
   {
     "email": "carlos.rivera@example.com",
     "password": "Test123!"
   }
   ```
3. Click **Send** - JWT token will auto-save to environment

**Option B: Register New User**

1. Open **Authentication → Register (Jobseeker)**
2. Modify email to unique value
3. Click **Send** - JWT token will auto-save to environment

---

## 📋 Collection Structure

### 1. **Authentication** (6 endpoints)

- Register (Jobseeker)
- Register (Employer)
- Login
- Get Current User (Me)
- Logout
- Forgot Password

### 2. **User Profile** (15 endpoints)

- Create/Get/Update/Delete Profile
- Add/Update/Delete Education
- Add/Update/Delete Work Experience
- Update Skills
- Add/Delete Certification
- Update Languages
- Update Availability

### 3. **Jobs** (8 endpoints)

- Get All Jobs (with filters)
- Search Jobs
- Get Single Job
- Create Job (Employer)
- Update Job (Employer)
- Delete Job (Employer)
- Get Jobs by Company
- Get My Jobs (Employer)

### 4. **Applications** (7 endpoints)

- Apply to Job (Jobseeker)
- Get My Applications (Jobseeker)
- Get Single Application
- Get Job Applications (Employer)
- Update Application Status (Employer)
- Withdraw Application (Jobseeker)
- Delete Application

### 5. **Companies** (5 endpoints)

- Get All Companies
- Get Single Company
- Create Company (Employer)
- Update Company (Employer)
- Delete Company (Employer)

### 6. **Users (Admin)** (5 endpoints)

- Get All Users (Admin)
- Get Single User (Admin)
- Update User (Admin)
- Delete User (Admin)
- Get User Statistics (Admin)

---

## 🔑 Test Credentials

### Jobseeker Account

```
Email: carlos.rivera@example.com
Password: Test123!
```

### Employer Account

```
Email: employer1@techinnov.com
Password: Test123!
```

### Admin Account

```
Email: admin@japanssw.com
Password: Admin123!
```

---

## 🔄 Auto-Saved Environment Variables

The collection automatically saves these variables after successful requests:

| Variable         | Saved After     | Usage                                 |
| ---------------- | --------------- | ------------------------------------- |
| `JWT_TOKEN`      | Login, Register | Auto-injected in all protected routes |
| `USER_ID`        | Login, Register | Reference to current user             |
| `COMPANY_ID`     | Create Company  | Used in job creation, company routes  |
| `JOB_ID`         | Create Job      | Used in applications, job routes      |
| `APPLICATION_ID` | Apply to Job    | Used in application management        |

---

## 🎯 Common Workflows

### Workflow 1: Jobseeker Journey

1. **Register** → `Authentication → Register (Jobseeker)`
2. **Create Profile** → `User Profile → Create Profile`
3. **Add Education** → `User Profile → Add Education`
4. **Add Experience** → `User Profile → Add Work Experience`
5. **Update Skills** → `User Profile → Update Skills`
6. **Search Jobs** → `Jobs → Search Jobs (Manufacturing in Tokyo)`
7. **Apply** → `Applications → Apply to Job (Jobseeker)`
8. **Check Status** → `Applications → Get My Applications (Jobseeker)`

### Workflow 2: Employer Journey

1. **Register** → `Authentication → Register (Employer)`
2. **Create Company** → `Companies → Create Company (Employer)`
3. **Post Job** → `Jobs → Create Job (Employer)`
4. **View Applications** → `Applications → Get Job Applications (Employer)`
5. **Update Status** → `Applications → Update Application Status (Employer)`

### Workflow 3: Admin Tasks

1. **Login as Admin** → Use `admin@japanssw.com / Admin123!`
2. **View All Users** → `Users (Admin) → Get All Users (Admin)`
3. **Get Statistics** → `Users (Admin) → Get User Statistics (Admin)`
4. **Manage User** → `Users (Admin) → Update User (Admin)`

---

## 🔧 Configuration

### Change Backend URL

If your backend runs on a different port:

1. Click **Environments** in Postman sidebar
2. Select **"Japan SSW API - Local"**
3. Edit `BASE_URL` value:
   - Local: `http://localhost:5000/api/v1`
   - Production: `https://your-domain.com/api/v1`

### View Saved Variables

1. Click **Environments** in Postman sidebar
2. Select **"Japan SSW API - Local"**
3. See all current values (JWT_TOKEN, IDs, etc.)

---

## 📝 Request Examples

### Job Search with Filters

```
GET /jobs?industry=Manufacturing&prefecture=Tokyo&japaneseLevel=N3&page=1&limit=10
```

Available filters:

- `industry` - Manufacturing, Nursing Care, Construction, etc.
- `prefecture` - Tokyo, Osaka, Kyoto, etc.
- `japaneseLevel` - N5, N4, N3, N2, N1
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Company Search

```
GET /companies?industry=Manufacturing&size=201-500&page=1&limit=10
```

---

## ⚠️ Common Issues

### Issue: "Token expired" or 401 Unauthorized

**Solution:**

1. Run **Authentication → Login** again
2. JWT token will refresh automatically
3. Retry the failed request

### Issue: "User already exists"

**Solution:**

- Use **Login** instead of **Register**
- Or change email to unique value

### Issue: "Company already exists for this employer"

**Solution:**

- Each employer can only create ONE company
- Use **Update Company** to modify existing

### Issue: "Job not found"

**Solution:**

1. Run **Jobs → Get All Jobs** to see available jobs
2. Copy a valid `_id` from response
3. Manually set `JOB_ID` environment variable

---

## 📖 Additional Documentation

- **API Reference:** [../API_REFERENCE.md](../API_REFERENCE.md)
- **Swagger Docs:** [../API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
- **Interactive Swagger:** `http://localhost:5000/api-docs` (when server running)

---

## 🧪 Testing Tips

1. **Run in Sequence:** Start with Authentication, then proceed through folders in order
2. **Check Console:** Postman console shows auto-save confirmations
3. **Use Variables:** Leverage `{{JOB_ID}}`, `{{COMPANY_ID}}` placeholders
4. **Test Scripts:** Pre-request and test scripts automatically manage tokens
5. **Duplicate Requests:** Right-click any request → Duplicate to create variations

---

## 📊 Response Format

All responses follow this structure:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // ... response data
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 🚀 Production Use

For production deployment:

1. Create new environment: **"Japan SSW API - Production"**
2. Set `BASE_URL` to production URL
3. Use production credentials
4. Enable SSL/TLS verification in Postman settings

---

## 📞 Support

For issues or questions:

1. Check [API_REFERENCE.md](../API_REFERENCE.md) for endpoint details
2. Visit Swagger UI at `http://localhost:5000/api-docs`
3. Review error messages in response body
4. Check Postman console for detailed logs

---

## 🧪 Test Results

### ✅ Latest Successful Test Run - January 29, 2026

**SUCCESS RATE: 100% (25/25 assertions passed)** 🎉🎊

- ✅ **14 API endpoints** tested - 0 errors
- ✅ **Authentication Flow** - 100% working
- ✅ **Profile Operations** - 100% working (including CREATE!)
- ✅ **Jobs Module** - All endpoints operational
- ✅ **Companies Module** - All endpoints operational
- ⚡ **Average Response Time:** 160ms (excellent)

### 📊 View Test Reports

1. **[SUCCESSFUL_TEST_RESULTS.md](./SUCCESSFUL_TEST_RESULTS.md)** - Comprehensive success report
2. **[successful-test-results.html](./successful-test-results.html)** - Interactive HTML dashboard
3. **[successful-test-results.json](./successful-test-results.json)** - Raw test data

### 🚀 Run Successful Tests

```bash
# Install Newman (Postman CLI)
npm install -g newman newman-reporter-htmlextra

# Ensure backend server is running on port 3000
cd backend
node server.js

# Run the successful test suite (in a new terminal)
cd postman
newman run Japan_SSW_API_Successful_Tests.postman_collection.json \
  -e Japan_SSW_API.postman_environment.json \
  --reporters cli,json,htmlextra \
  --reporter-json-export successful-test-results.json \
  --reporter-htmlextra-export successful-test-results.html \
  --delay-request 200
```

### Previous Full Test Results (All 46 Endpoints)

For complete endpoint testing including non-implemented features:

- **[TEST_RESULTS_SUMMARY.md](./TEST_RESULTS_SUMMARY.md)** - Full endpoint analysis
- **[QUICK_TEST_SUMMARY.md](./QUICK_TEST_SUMMARY.md)** - At-a-glance status
- **[test-results.html](./test-results.html)** - Full test report

---

**Last Updated:** January 29, 2026  
**Collection Version:** 2.0.0 (Successful Tests) | 1.0.0 (Complete Collection)  
**API Version:** v1
