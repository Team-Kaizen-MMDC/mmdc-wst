# Backend Implementation Plan — 5-Day Sprint

**Target Completion:** Monday, February 2, 2026  
**Current Status:** Foundation exists (basic server, config, Content API)  
**Goal:** Production-ready Node.js REST API with MongoDB Atlas

---

## Overview

This is an **accelerated implementation plan** to build a complete REST API backend for the Japan SSW platform in 5 days. The plan prioritizes core functionality (authentication, profiles, jobs) while deferring advanced features.

### Critical Success Factors

- ✅ Secure authentication system (JWT) — **COMPLETED**
- ✅ User profile CRUD operations
- ✅ Job listings with search/filter
- ✅ Job application functionality
- ✅ Employer dashboard support
- ✅ Database seeding for testing
- ⚠️ File uploads (optional/defer)
- ⚠️ Email notifications (optional/defer)
- ⚠️ Admin features (optional/defer)

---

## Day 1 Status: ✅ COMPLETED

**All authentication endpoints tested and working:**

- ✅ POST `/api/v1/auth/register` — User registration with JWT
- ✅ POST `/api/v1/auth/login` — Login with password validation
- ✅ GET `/api/v1/auth/me` — Protected route with JWT verification
- ✅ MongoDB Atlas connected successfully
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Security middleware (helmet, cors, rate limiting)

---

## Daily Sprint Plan

### Day 1 (Wednesday) — Foundation & Authentication ✅ COMPLETED

**Goal:** Secure authentication system operational

#### Morning Tasks (4-5 hours)

- [x] Install missing dependencies

  ```bash
  cd backend
  npm install bcryptjs jsonwebtoken express-validator express-rate-limit helmet cors express-mongo-sanitize morgan winston
  npm install --save-dev @types/bcryptjs @types/jsonwebtoken
  ```

- [x] Create utility files
  - [x] `src/utils/logger.js` — Winston logger configuration
  - [x] `src/utils/ApiError.js` — Custom error class
  - [x] `src/utils/ApiResponse.js` — Response formatter
  - [x] `src/utils/password.js` — Password hashing helpers

- [x] Create core middleware
  - [x] `src/middleware/asyncHandler.js` — Async error wrapper
  - [x] `src/middleware/errorHandler.js` — Global error handler
  - [x] `src/middleware/auth.js` — JWT verification middleware

#### Afternoon Tasks (4-5 hours)

- [x] Create User model
  - [x] `src/models/User.js` — Complete user schema with:
    - Email (unique, validated)
    - Password (hashed, select: false)
    - Role (jobseeker, employer, admin, rso)
    - Profile reference
    - Company reference
    - isActive, isEmailVerified flags
    - Login attempts & account locking
    - Pre-save password hashing
    - comparePassword method
    - getSignedJwtToken method

- [x] Create authentication controller
  - [x] `src/controllers/authController.js`:
    - `register` — POST /api/v1/auth/register
    - `login` — POST /api/v1/auth/login
    - `logout` — POST /api/v1/auth/logout
    - `getMe` — GET /api/v1/auth/me
    - `forgotPassword` — POST /api/v1/auth/forgot-password (stub)

- [x] Create auth routes
  - [x] `src/routes/authRoutes.js` — Auth route definitions
  - [x] Update `src/routes/index.js` — Mount auth routes

#### Evening Tasks (2-3 hours)

- [x] Update `src/app.js` with security middleware:
  - [x] helmet()
  - [x] cors()
  - [x] Rate limiting
  - [x] mongoSanitize()
  - [x] Global error handler

- [x] Test authentication endpoints with Postman/cURL:
  - [x] POST /api/v1/auth/register (create test user)
  - [x] POST /api/v1/auth/login (get JWT token)
  - [x] GET /api/v1/auth/me (verify token works)

**End of Day 1 Checkpoint:**

- ✅ Authentication system implemented
- ✅ JWT token generation ready
- ✅ Password hashing functional
- ✅ MongoDB Atlas connected and tested
- ✅ All authentication endpoints verified working
- ✅ CSP configured to allow CDN resources
- 📝 See `backend/QUICK_SETUP_DAY1.md` for setup instructions

---

### Day 2 (Thursday) — User Profile Management

**Goal:** Complete profile CRUD operations

#### Morning Tasks (4-5 hours)

- [x] Create UserProfile model
  - [x] `src/models/UserProfile.js`:
    - Basic info (firstName, lastName, dateOfBirth, gender, nationality)
    - Contact info (phone, address, prefecture, city, postalCode)
    - Education array (school, degree, field, startDate, endDate, current)
    - Experience array (company, title, description, startDate, endDate, current)
    - Skills array (name, level, category)
    - Certifications array (name, issuer, date, expiryDate)
    - Languages array (language, level)
    - Availability (startDate, visaStatus, relocate, remote)
    - Japanese language level (N5-N1)
    - User reference
    - Resume/CV file paths (for future)

- [x] Create profile controller
  - [x] `src/controllers/profileController.js`:
    - `getProfile` — GET /api/v1/profile
    - `createProfile` — POST /api/v1/profile
    - `updateProfile` — PUT /api/v1/profile
    - `deleteProfile` — DELETE /api/v1/profile

#### Afternoon Tasks (4-5 hours)

- [x] Add education sub-resource endpoints:
  - `addEducation` — POST /api/v1/profile/education
  - `updateEducation` — PUT /api/v1/profile/education/:id
  - `deleteEducation` — DELETE /api/v1/profile/education/:id

- [x] Add experience sub-resource endpoints:
  - `addExperience` — POST /api/v1/profile/experience
  - `updateExperience` — PUT /api/v1/profile/experience/:id
  - `deleteExperience` — DELETE /api/v1/profile/experience/:id

- [x] Add skills/certifications endpoints:
  - `updateSkills` — PUT /api/v1/profile/skills
  - `updateCertifications` — PUT /api/v1/profile/certifications
  - `updateLanguages` — PUT /api/v1/profile/languages
  - `updateAvailability` — PUT /api/v1/profile/availability

- [x] Create profile routes
  - [x] `src/routes/profileRoutes.js` — All profile routes
  - [x] Update `src/routes/index.js` — Mount profile routes

#### Evening Tasks (2-3 hours)

- [x] Create validators
  - [x] `src/validators/profileValidator.js` — express-validator rules

- [x] Test profile endpoints:
  - [x] Create profile for test user
  - [x] Add education entry
  - [x] Add experience entry
  - [x] Update skills/certifications
  - [x] Retrieve full profile

**End of Day 2 Checkpoint:**

- ✅ UserProfile model complete
- ✅ All profile CRUD endpoints working
- ✅ Education/experience sub-resources functional
- ✅ Skills/certifications/languages/availability endpoints functional
- ✅ Validators implemented
- ✅ Test user has complete profile
- ✅ All endpoints tested and verified

---

### Day 3 (Friday) — Job Listings & Search ✅ COMPLETED

**Goal:** Job CRUD operations with search/filter

#### Morning Tasks (4-5 hours)

- [x] Create Job model
  - [x] `src/models/Job.js`:
    - Company reference (required)
    - Posted by user reference (required)
    - Job info (title, industry, category)
    - Description (summary, responsibilities, requirements, benefits)
    - Requirements (education, japaneseLevel, experience, skills, certifications)
    - Compensation (salary min/max, currency, period, bonuses, overtime)
    - Location (prefecture, city, address, remote, remoteType)
    - Work conditions (workHours, daysOff, vacation, insurance)
    - Application info (deadline, startDate, contactEmail, contactPhone, applicationUrl)
    - Status (draft, active, closed, filled, archived)
    - Visibility (public, private, rso-only)
    - Views counter
    - Applications array (references)
    - Featured flag
    - Indexes for search (industry, prefecture, status, deadline, text search)
    - Virtuals (applicationCount, isExpired)
    - incrementViews method

- [x] Create Company model
  - [x] `src/models/Company.js`:
    - Company name (required, unique)
    - Logo URL
    - Industry
    - Size (employees)
    - Founded year
    - Website
    - Description
    - Location (prefecture, city, address)
    - Contact info
    - Jobs array (references)
    - Certifications/licenses
    - isVerified flag

#### Afternoon Tasks (4-5 hours)

- [x] Create job controller
  - [x] `src/controllers/jobController.js`:
    - `getJobs` — GET /api/v1/jobs (with pagination, filters, search)
    - `getJob` — GET /api/v1/jobs/:id
    - `createJob` — POST /api/v1/jobs (employer only)
    - `updateJob` — PUT /api/v1/jobs/:id (employer only, ownership check)
    - `deleteJob` — DELETE /api/v1/jobs/:id (soft delete, employer only)
    - `getJobsByCompany` — GET /api/v1/jobs/company/:companyId
    - `getMyJobs` — GET /api/v1/jobs/my-jobs (employer's posted jobs)

- [x] Implement advanced filtering:
  - Industry filter
  - Prefecture/city filter
  - Salary range filter
  - Japanese level filter
  - Remote work filter
  - Text search (title, description, skills)
  - Featured jobs flag
  - Status filter

#### Evening Tasks (2-3 hours)

- [x] Create company controller (basic endpoints)
  - [x] `src/controllers/companyController.js`:
    - `getCompanies` — GET /api/v1/companies
    - `getCompany` — GET /api/v1/companies/:id
    - `createCompany` — POST /api/v1/companies (admin/employer)
    - `updateCompany` — PUT /api/v1/companies/:id

- [x] Create routes
  - [x] `src/routes/jobRoutes.js`
  - [x] `src/routes/companyRoutes.js`
  - [x] Update `src/routes/index.js`

- [x] Test job endpoints:
  - [x] Create test company
  - [x] Create test jobs (various industries)
  - [x] Search/filter jobs
  - [x] Retrieve job details

**End of Day 3 Checkpoint:**

- ✅ Job model with full schema (views counter, soft delete, virtuals, indexes)
- ✅ Company model operational (slug generation, verification, ownership)
- ✅ Job CRUD endpoints working (all 8 endpoints tested)
- ✅ Company CRUD endpoints working (create, read, update, admin management)
- ✅ Search/filter functionality tested (industry, prefecture, Japanese level filters working)
- ✅ Pagination working correctly
- ✅ Test data: 1 company (Tech Innovation Corp), 1 job (Manufacturing Engineer)
- ✅ All endpoints returning proper ApiResponse format
- ✅ Authorization working (employer-only routes protected)
- 📝 Fixed pre-save middleware issues in both Job and Company models

---

### Day 4 (Saturday) — Job Applications & Employer Features ✅ COMPLETED

**Goal:** Complete application workflow

#### Morning Tasks (4-5 hours)

- [x] Create Application model
  - [ ] `src/models/Application.js`:
    - Applicant (User reference, required)
    - Job (Job reference, required)
    - Status (submitted, reviewing, interview, offer, accepted, rejected, withdrawn)
    - Cover letter
    - Resume/CV path
    - Applied date
    - Last updated
    - Status history array (status, changedBy, date, notes)
    - Employer notes (private)
    - Interview info (date, location, notes)
    - Rejection reason
    - Indexes (applicant, job, status)

- [x] Create application controller
  - [x] `src/controllers/applicationController.js`:
    - `applyToJob` — POST /api/v1/jobs/:jobId/apply (jobseeker)
    - `getMyApplications` — GET /api/v1/applications/me (jobseeker)
    - `getApplication` — GET /api/v1/applications/:id
    - `withdrawApplication` — PUT /api/v1/applications/:id/withdraw (jobseeker)
    - `getJobApplications` — GET /api/v1/jobs/:jobId/applications (employer)
    - `updateApplicationStatus` — PUT /api/v1/applications/:id/status (employer)
    - `addEmployerNotes` — PUT /api/v1/applications/:id/notes (employer)

#### Afternoon Tasks (4-5 hours)

- [x] Enhance User controller
  - [x] `src/controllers/userController.js`:
    - `getUsers` — GET /api/v1/users (admin only, pagination)
    - `getUser` — GET /api/v1/users/:id
    - `updateUser` — PUT /api/v1/users/:id (self or admin)
    - `deleteUser` — DELETE /api/v1/users/:id (soft delete, admin)
    - `updatePassword` — PUT /api/v1/users/update-password

- [x] Create role-based middleware enhancements
  - [x] Update `src/middleware/auth.js`:
    - Add `authorize(...roles)` middleware
    - Add ownership check helpers

- [x] Create application routes
  - [x] `src/routes/applicationRoutes.js`
  - [x] Update `src/routes/index.js`

#### Evening Tasks (2-3 hours)

- [x] Create validators
  - [x] `src/validators/jobValidator.js`
  - [x] `src/validators/applicationValidator.js`

- [x] Test application workflow:
  - [x] Jobseeker applies to job
  - [x] Employer views applications
  - [x] Employer updates application status
  - [x] Jobseeker views application status
  - [x] Test authorization (jobseeker can't access employer endpoints)

**End of Day 4 Checkpoint:**

- ✅ Application model complete
- ✅ Full application workflow functional
- ✅ Role-based access control working
- ✅ Employer can manage applications
- ✅ Jobseeker can track applications
- ✅ User management endpoints complete
- ✅ Password update functionality working
- ✅ Authorization properly enforced
- 📝 Testing guides created: `backend/DAY4_TESTING.md` and `backend/DAY4_QUICK_TEST.md`

---

### Day 5 (Sunday) — Data Seeding, Testing & Frontend Integration

**Goal:** Production-ready backend with comprehensive test data

#### Morning Tasks (4-5 hours)

- [ ] Create comprehensive seed script
  - [ ] `backend/seedDatabase.js`:
    - Clear existing data function (optional flag)
    - Seed admin user
    - Seed 10 jobseeker users with varied profiles
    - Seed 5 employer users
    - Seed 5 companies (various industries)
    - Seed 25-30 jobs (distributed across companies/industries)
    - Seed 15-20 applications (various statuses)
    - Link profiles to users
    - Link companies to employers

- [ ] Create seed data files
  - [ ] `backend/seedData/users.json` — Sample user data
  - [ ] `backend/seedData/companies.json` — Sample companies
  - [ ] `backend/seedData/jobs.json` — Sample job postings
  - [ ] `backend/seedData/profiles.json` — Sample profile data

- [ ] Add npm script:

  ```json
  "scripts": {
    "seed": "node seedDatabase.js",
    "seed:clear": "node seedDatabase.js --clear"
  }
  ```

- [ ] Run seed script and verify data in MongoDB Atlas

#### Afternoon Tasks (4-5 hours)

- [ ] Create API documentation
  - [ ] `backend/API_DOCUMENTATION.md`:
    - All endpoints with request/response examples
    - Authentication flow
    - Error codes and handling
    - Query parameters and filtering

- [ ] Create Postman collection
  - [ ] Export all endpoints to Postman collection JSON
  - [ ] Include environment variables (BASE_URL, JWT_TOKEN)
  - [ ] Add example requests for each endpoint
  - [ ] Save to `backend/postman/Japan_SSW_API.postman_collection.json`

- [ ] Integration testing checklist:
  - [ ] Test full user journey: Register → Login → Create Profile → Apply to Job
  - [ ] Test employer journey: Login → Create Job → Review Applications → Update Status
  - [ ] Test search/filter with various parameters
  - [ ] Test authorization (unauthorized access attempts fail)
  - [ ] Test pagination on large datasets
  - [ ] Test error handling (invalid data, missing fields, etc.)

#### Evening Tasks (3-4 hours)

- [ ] Frontend integration preparation:
  - [ ] Document CORS configuration for frontend
  - [ ] Create environment setup guide for local development
  - [ ] List all frontend pages needing API integration (17 pages)
  - [ ] Create `FRONTEND_INTEGRATION_GUIDE.md` with:
    - API base URL configuration
    - Authentication token storage/retrieval
    - API call examples for each page
    - Error handling patterns

- [ ] Deployment preparation:
  - [ ] Update `.env.example` with all required variables
  - [ ] Create `backend/README.md` with setup instructions
  - [ ] Test with `NODE_ENV=production`
  - [ ] Verify MongoDB Atlas connection works remotely
  - [ ] Create deployment checklist (Vercel/Heroku/Railway)

- [ ] Final verification:
  - [ ] All endpoints documented
  - [ ] All tests passing
  - [ ] Seed data loads correctly
  - [ ] Error handling comprehensive
  - [ ] Security middleware active
  - [ ] Rate limiting configured
  - [ ] Logging operational

**End of Day 5 Checkpoint:**

- ✅ Complete backend API operational
- ✅ Comprehensive seed data loaded
- ✅ API documentation complete
- ✅ Postman collection exported
- ✅ Frontend integration guide ready
- ✅ Deployment-ready

---

## Database Seeding Strategy

### Seed Data Structure

```
backend/
├── seedDatabase.js           # Main seed script
├── seedData/
│   ├── users.json           # 15 users (10 jobseekers, 5 employers, 1 admin)
│   ├── profiles.json        # Complete profiles for jobseekers
│   ├── companies.json       # 5 companies with details
│   ├── jobs.json            # 30 jobs across industries
│   └── applications.json    # 20 applications with varied statuses
└── clearDatabase.js         # Optional: Clear all collections
```

### Sample Data Requirements

#### Users (15 total)

- **1 Admin:** admin@japanssw.com (password: Admin123!)
- **10 Jobseekers:**
  - 5 from Philippines (various skill levels)
  - 3 from Vietnam
  - 2 from Indonesia
  - Mix of Japanese levels (N5 to N2)
  - Ages 22-35
  - Various educational backgrounds

- **4 Employers:**
  - employer1@company.com → Company A
  - employer2@company.com → Company B
  - employer3@company.com → Company C
  - employer4@company.com → Company D

#### Companies (5 total)

- **Company A:** Manufacturing (Tokyo) - 500 employees
- **Company B:** Nursing Care (Osaka) - 200 employees
- **Company C:** Construction (Nagoya) - 150 employees
- **Company D:** Agriculture (Hokkaido) - 80 employees
- **Company E:** Food Service (Fukuoka) - 120 employees

#### Jobs (30 total)

- 8 Manufacturing jobs (Company A)
- 7 Nursing Care jobs (Company B)
- 5 Construction jobs (Company C)
- 5 Agriculture jobs (Company D)
- 5 Food Service jobs (Company E)
- Mix of salary ranges: ¥180,000 - ¥350,000/month
- Various prefectures: Tokyo, Osaka, Nagoya, Hokkaido, Fukuoka, Saitama, Chiba
- Different Japanese level requirements (N5 to N3)
- Some remote-friendly positions

#### Applications (20 total)

- **5 Submitted:** Just applied, pending review
- **5 Reviewing:** Under review by employer
- **3 Interview:** Interview scheduled
- **3 Offer:** Offer extended
- **2 Accepted:** Offer accepted by candidate
- **2 Rejected:** Application rejected

### Seed Script Features

```javascript
// backend/seedDatabase.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");
const UserProfile = require("./src/models/UserProfile");
const Company = require("./src/models/Company");
const Job = require("./src/models/Job");
const Application = require("./src/models/Application");

// Load seed data
const users = require("./seedData/users.json");
const profiles = require("./seedData/profiles.json");
const companies = require("./seedData/companies.json");
const jobs = require("./seedData/jobs.json");
const applications = require("./seedData/applications.json");

// Options
const clearData = process.argv.includes("--clear");
const verbose = process.argv.includes("--verbose");

// Main seed function
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    if (clearData) {
      console.log("🗑️  Clearing existing data...");
      await User.deleteMany({});
      await UserProfile.deleteMany({});
      await Company.deleteMany({});
      await Job.deleteMany({});
      await Application.deleteMany({});
      console.log("✅ Data cleared");
    }

    // Seed in order (respecting references)
    console.log("📝 Seeding users...");
    const createdUsers = await seedUsers();

    console.log("📝 Seeding companies...");
    const createdCompanies = await seedCompanies(createdUsers);

    console.log("📝 Seeding profiles...");
    await seedProfiles(createdUsers);

    console.log("📝 Seeding jobs...");
    const createdJobs = await seedJobs(createdCompanies);

    console.log("📝 Seeding applications...");
    await seedApplications(createdUsers, createdJobs);

    console.log("\n✅ Database seeded successfully!");
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Jobs: ${createdJobs.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedDatabase();
```

---

## Testing Checklist

### API Endpoint Testing

#### Authentication Endpoints

- [ ] POST /api/v1/auth/register (jobseeker)
- [ ] POST /api/v1/auth/register (employer)
- [ ] POST /api/v1/auth/login (valid credentials)
- [ ] POST /api/v1/auth/login (invalid credentials → 401)
- [ ] GET /api/v1/auth/me (with valid token)
- [ ] GET /api/v1/auth/me (without token → 401)

#### Profile Endpoints

- [ ] GET /api/v1/profile (own profile)
- [ ] POST /api/v1/profile (create profile)
- [ ] PUT /api/v1/profile (update profile)
- [ ] POST /api/v1/profile/education (add education)
- [ ] PUT /api/v1/profile/education/:id (update education)
- [ ] DELETE /api/v1/profile/education/:id (delete education)
- [ ] POST /api/v1/profile/experience (add experience)
- [ ] PUT /api/v1/profile/skills (update skills)
- [ ] PUT /api/v1/profile/availability (update availability)

#### Job Endpoints

- [ ] GET /api/v1/jobs (all jobs, public)
- [ ] GET /api/v1/jobs?industry=Manufacturing (filter by industry)
- [ ] GET /api/v1/jobs?prefecture=Tokyo (filter by prefecture)
- [ ] GET /api/v1/jobs?minSalary=250000 (filter by salary)
- [ ] GET /api/v1/jobs?search=engineer (text search)
- [ ] GET /api/v1/jobs/:id (single job)
- [ ] POST /api/v1/jobs (create job, employer only)
- [ ] POST /api/v1/jobs (unauthorized as jobseeker → 403)
- [ ] PUT /api/v1/jobs/:id (update own job, employer)
- [ ] PUT /api/v1/jobs/:id (update other's job → 403)
- [ ] DELETE /api/v1/jobs/:id (soft delete)
- [ ] GET /api/v1/jobs/my-jobs (employer's jobs)

#### Application Endpoints

- [ ] POST /api/v1/jobs/:jobId/apply (apply to job, jobseeker)
- [ ] POST /api/v1/jobs/:jobId/apply (apply twice to same job → 400)
- [ ] GET /api/v1/applications/me (jobseeker's applications)
- [ ] GET /api/v1/applications/:id (single application)
- [ ] PUT /api/v1/applications/:id/withdraw (withdraw application)
- [ ] GET /api/v1/jobs/:jobId/applications (employer views applications)
- [ ] PUT /api/v1/applications/:id/status (employer updates status)
- [ ] PUT /api/v1/applications/:id/notes (employer adds notes)

#### Company Endpoints

- [ ] GET /api/v1/companies (all companies)
- [ ] GET /api/v1/companies/:id (single company)
- [ ] GET /api/v1/jobs/company/:companyId (company's jobs)
- [ ] POST /api/v1/companies (create company, employer)
- [ ] PUT /api/v1/companies/:id (update company)

#### User Endpoints

- [ ] GET /api/v1/users (admin only)
- [ ] GET /api/v1/users/:id (self or admin)
- [ ] PUT /api/v1/users/:id (self or admin)
- [ ] PUT /api/v1/users/update-password (change password)

### Security Testing

- [ ] JWT expiration works correctly
- [ ] Rate limiting prevents abuse (101st request blocked)
- [ ] CORS allows frontend origin
- [ ] Helmet security headers present
- [ ] NoSQL injection prevention (test with `$gt` operators)
- [ ] Password hashing verified (bcrypt rounds = 12)
- [ ] Sensitive data not exposed (password field excluded)

### Data Integrity Testing

- [ ] Seed data loads without errors
- [ ] User references in profiles correct
- [ ] Job references in applications correct
- [ ] Company references in jobs correct
- [ ] Orphaned records prevented (cascading deletes)

---

## Frontend Integration Roadmap

### Pages Requiring API Integration (Priority Order)

#### High Priority (Days 6-7)

1. **Authentication Pages:**
   - [createAccount.html](pages/createAccount.html) → POST /api/v1/auth/register
   - [signin.html](pages/signin.html) → POST /api/v1/auth/login
   - Replace localStorage with JWT token in cookies/sessionStorage
   - Add logout functionality

2. **Profile Dashboard:**
   - [profileDashboard.html](pages/profileDashboard.html) → GET /api/v1/profile, GET /api/v1/applications/me
   - Display real profile data
   - Show application statuses

3. **Profile Edit Pages (7 pages):**
   - [contact.html](pages/addEdit/contact.html) → PUT /api/v1/profile
   - [education.html](pages/addEdit/education.html) → POST/PUT/DELETE /api/v1/profile/education
   - [experience.html](pages/addEdit/experience.html) → POST/PUT/DELETE /api/v1/profile/experience
   - [skills.html](pages/addEdit/skills.html) → PUT /api/v1/profile/skills
   - [certifications.html](pages/addEdit/certifications.html) → PUT /api/v1/profile/certifications
   - [languages.html](pages/addEdit/languages.html) → PUT /api/v1/profile/languages
   - [availability.html](pages/addEdit/availability.html) → PUT /api/v1/profile/availability

#### Medium Priority (Days 8-9)

4. **Job Pages:**
   - [jobs.html](pages/jobs/) (11 files) → GET /api/v1/jobs with filters
   - Job detail pages → GET /api/v1/jobs/:id
   - Apply button → POST /api/v1/jobs/:jobId/apply

5. **Employer Dashboard:**
   - [companyDashboard.html](pages/companyDashboard.html) → GET /api/v1/jobs/my-jobs, GET /api/v1/jobs/:jobId/applications
   - Application review → PUT /api/v1/applications/:id/status

6. **Job Posting:**
   - [jobPost/](pages/jobPost/) pages → POST /api/v1/jobs, PUT /api/v1/jobs/:id

#### Low Priority (Days 10+)

7. **Company Pages:**
   - [companies/](pages/companies/) → GET /api/v1/companies, GET /api/v1/companies/:id

8. **About/Contact:**
   - Keep existing Content API integration
   - Add contact form API endpoint

---

## Deployment Strategy

### Option 1: Vercel (Recommended)

- Serverless deployment
- Automatic HTTPS
- GitHub integration
- Free tier sufficient

**Steps:**

1. Create `vercel.json` in backend/
2. Set environment variables in Vercel dashboard
3. Deploy via `vercel --prod`

### Option 2: Railway

- Container-based deployment
- Easy MongoDB integration
- Free tier: $5 credit/month
- No cold starts

**Steps:**

1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically on push

### Option 3: Heroku

- Classic PaaS
- Well-documented
- Free tier (with credit card)

**Steps:**

1. Install Heroku CLI
2. `heroku create japanssw-api`
3. Set config vars
4. `git push heroku main`

---

## Environment Variables Checklist

Required for deployment:

```env
# Server
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanssw_db?retryWrites=true&w=majority

# Collections
CONTENT_COLLECTION=contents
ABOUT_COLLECTION=about

# JWT
JWT_SECRET=[GENERATE-SECURE-32-CHAR-STRING]
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Optional (Phase 6)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@japanssw.com
FROM_NAME=Japan SSW Platform
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

---

## Risk Mitigation

### Potential Blockers & Solutions

| Risk                              | Impact | Mitigation                                                         |
| --------------------------------- | ------ | ------------------------------------------------------------------ |
| MongoDB Atlas setup delays        | HIGH   | Set up Atlas account on Day 1 morning, use local MongoDB as backup |
| JWT implementation complexity     | MEDIUM | Use proven patterns from guide, extensive testing                  |
| Seed data creation time           | MEDIUM | Create minimal seed data first, expand later                       |
| Frontend integration unknowns     | LOW    | Focus on backend completion first, frontend can happen Week 2      |
| Time overruns on complex features | MEDIUM | Prioritize ruthlessly, defer file uploads/emails if needed         |

### Cut List (If Time Runs Short)

1. ❌ File upload endpoints (multer) → Defer to Week 2
2. ❌ Email notifications → Defer to Week 2
3. ❌ Admin dashboard endpoints → Defer to Week 2
4. ❌ Advanced search (fuzzy matching, etc.) → Keep basic search only
5. ❌ Comprehensive validation messages → Use basic validation
6. ⚠️ Reduce seed data from 30 to 15 jobs

### Must-Have Features (Cannot Cut)

- ✅ Authentication (JWT)
- ✅ Profile CRUD
- ✅ Job CRUD
- ✅ Application workflow
- ✅ Basic search/filter
- ✅ Role-based access control
- ✅ Minimal seed data (5 users, 3 companies, 10 jobs, 5 applications)

---

## Success Criteria

### Day 1 Success

- ✅ Can register new user
- ✅ Can login and receive JWT
- ✅ Can access protected routes with token

### Day 2 Success

- ✅ Can create complete user profile
- ✅ Can add/edit/delete education/experience
- ✅ Profile persists in database

### Day 3 Success

- ✅ Can create jobs (employer role)
- ✅ Can search/filter jobs by multiple criteria
- ✅ Job listings load dynamically

### Day 4 Success

- ✅ Jobseeker can apply to jobs
- ✅ Employer can view applications
- ✅ Employer can update application status
- ✅ Authorization rules enforced

### Day 5 Success

- ✅ Seed script populates realistic test data
- ✅ All endpoints tested and documented
- ✅ API ready for frontend integration
- ✅ Deployment configuration complete

---

## Daily Standup Questions

Ask yourself at end of each day:

1. **What did I complete today?** (Check completed tasks)
2. **What blockers did I encounter?** (Document for troubleshooting)
3. **Am I on track for Monday deadline?** (Adjust priorities if needed)
4. **What's my focus for tomorrow?** (Review next day's plan)

---

## Post-Implementation (Week 2+)

### Immediate Follow-Up Tasks

- [ ] Frontend integration (17 pages)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] API documentation website (Swagger/Postman)

### Future Enhancements

- [ ] File upload (multer) for resumes/photos
- [ ] Email notifications (SendGrid)
- [ ] Admin dashboard
- [ ] Analytics/reporting
- [ ] Advanced search (Elasticsearch)
- [ ] Internationalization (i18n)
- [ ] Real-time notifications (Socket.io)
- [ ] Background jobs (Bull/Redis)

---

## Resources & References

- [NODEJS_REST_API_CRUD_GUIDE.MD](./NODEJS_REST_API_CRUD_GUIDE.MD) — Complete implementation guide
- [Backend Developer Guide](../backend/DEVELOPER_GUIDE.md) — Existing backend documentation
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Document Version:** 1.0  
**Created:** January 28, 2026  
**Target Completion:** February 2, 2026 (Monday)  
**Status:** 🚀 SPRINT IN PROGRESS
