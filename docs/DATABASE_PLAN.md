# Database Plan - Japan SSW Job Matching Platform

**Project:** MMDC WST (Web Systems and Technology)  
**Database:** MongoDB Atlas  
**Database Name:** japansswdb  
**Last Updated:** January 31, 2026

---

## Table of Contents

1. [Collections and Documents](#1-collections-and-documents)
2. [CRUD Operations](#2-crud-operations)
3. [UI and Data Flow](#3-ui-and-data-flow)
4. [Database Relationships](#4-database-relationships)
5. [Indexes and Performance](#5-indexes-and-performance)
6. [Data Validation Rules](#6-data-validation-rules)

---

## 1. Collections and Documents

### User Domain

| Collection Name  | Document Structure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **users**        | `{ "_id": ObjectId, "email": "user@example.com", "password": "hashed_password", "role": "jobseeker" \| "employer" \| "admin" \| "rso", "profile": ObjectId, "company": ObjectId, "isActive": true, "isEmailVerified": false, "lastLogin": Date, "loginAttempts": 0, "lockUntil": Date, "createdAt": Date, "updatedAt": Date }`                                                                                                                                                                                                                                                                                                                                                                                    |
| **userprofiles** | `{ "_id": ObjectId, "user": ObjectId, "firstName": "John", "lastName": "Doe", "phone": "+81-90-1234-5678", "dateOfBirth": Date, "nationality": "Japanese", "currentLocation": { "country": "Japan", "city": "Tokyo", "prefecture": "Tokyo" }, "languages": [{ "language": "Japanese", "proficiency": "native" }], "education": [{ "school": "Tokyo University", "degree": "Bachelor", "field": "Computer Science", "startDate": Date, "endDate": Date }], "experience": [{ "company": "ABC Corp", "title": "Software Engineer", "startDate": Date, "endDate": Date, "current": false }], "skills": [{ "name": "JavaScript", "level": "advanced" }], "resume": "https://...", "bio": "Experienced developer..." }` |

### Company Domain

| Collection Name | Document Structure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **companies**   | `{ "_id": ObjectId, "name": "Tech Corp", "slug": "tech-corp", "logo": "https://...", "industry": "Manufacturing" \| "Nursing Care" \| "Construction" \| etc., "size": "51-200", "founded": 2010, "website": "https://company.com", "description": "Leading company...", "tagline": "Innovation first", "address": { "street": "123 Main St", "city": "Tokyo", "prefecture": "Tokyo", "postalCode": "100-0001", "country": "Japan" }, "contactEmail": "hr@company.com", "contactPhone": "+81-3-1234-5678", "socialMedia": { "linkedin": "...", "facebook": "..." }, "benefits": ["Health Insurance", "Visa Support"], "verified": false, "isActive": true, "createdAt": Date, "updatedAt": Date }` |

### Job Domain

| Collection Name | Document Structure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **jobs**        | `{ "_id": ObjectId, "company": ObjectId, "postedBy": ObjectId, "title": "Software Engineer", "industry": "Manufacturing", "category": "Technology", "summary": "Looking for...", "responsibilities": "Develop and maintain...", "requirements": "3+ years experience...", "benefits": "Competitive salary...", "requiredEducation": "Bachelor", "requiredExperience": "2-5 years", "japaneseLevel": "N3", "location": { "city": "Tokyo", "prefecture": "Tokyo", "address": "..." }, "salary": { "min": 3000000, "max": 5000000, "currency": "JPY", "period": "year" }, "employmentType": "full-time", "visaSponsorship": true, "workSchedule": { "hoursPerWeek": 40, "shift": "day" }, "applicationDeadline": Date, "startDate": Date, "numberOfPositions": 2, "status": "active", "featured": false, "views": 0, "createdAt": Date, "updatedAt": Date }` |

### Application Domain

| Collection Name  | Document Structure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **applications** | `{ "_id": ObjectId, "applicant": ObjectId, "job": ObjectId, "status": "submitted" \| "reviewing" \| "interview" \| "offer" \| "accepted" \| "rejected" \| "withdrawn", "coverLetter": "I am interested in...", "resumePath": "https://...", "statusHistory": [{ "status": "submitted", "changedBy": ObjectId, "date": Date, "notes": "Application received" }], "employerNotes": "Strong candidate...", "interview": { "date": Date, "location": "Office", "notes": "...", "interviewers": ["John Doe"] }, "rejectionReason": "Position filled", "createdAt": Date, "updatedAt": Date }` |

### Content Domain (Legacy)

| Collection Name | Document Structure                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **contents**    | `{ "_id": ObjectId, "title": "Page Title", "slug": "page-slug", "content": "HTML content...", "type": "page" \| "article", "language": "en" \| "ja", "published": true, "createdAt": Date, "updatedAt": Date }` |
| **about**       | `{ "_id": ObjectId, "section": "mission", "content": "Our mission...", "language": "en" \| "ja", "order": 1 }`                                                                                                  |

---

## 2. CRUD Operations

### Authentication & User Management

| Feature Name                    | Operation | Description                                                                  | API Endpoint                                                            |
| ------------------------------- | --------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **User Account (Signup/Login)** | Create    | Create a new user account during signup                                      | `POST /api/v1/auth/register`                                            |
|                                 | Read      | Authenticate user credentials during login and fetch account status/role     | `POST /api/v1/auth/login`<br>`GET /api/v1/auth/me`                      |
|                                 | Update    | Allow user to change password and update account status (e.g., verify email) | `PUT /api/v1/users/update-password`<br>`POST /api/v1/auth/verify-email` |
|                                 | Delete    | Allow admin to deactivate/delete user accounts if needed                     | `DELETE /api/v1/users/:id`                                              |

### User Profile Management

| Feature Name           | Operation | Description                                                             | API Endpoint                                                                                    |
| ---------------------- | --------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Job Seeker Profile** | Create    | Create initial profile after registration                               | `POST /api/v1/profile`                                                                          |
|                        | Read      | View own profile or view public profiles                                | `GET /api/v1/profile/me`<br>`GET /api/v1/profile/:id`                                           |
|                        | Update    | Update personal info, add education, experience, skills, certifications | `PUT /api/v1/profile/me`<br>`PUT /api/v1/profile/education`<br>`PUT /api/v1/profile/experience` |
|                        | Delete    | Remove education/experience entries or deactivate profile               | `DELETE /api/v1/profile/education/:id`                                                          |

### Company Management

| Feature Name        | Operation | Description                                                    | API Endpoint                                           |
| ------------------- | --------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| **Company Profile** | Create    | Employer creates company profile during registration           | `POST /api/v1/companies`                               |
|                     | Read      | View company details and public company profiles               | `GET /api/v1/companies/:id`<br>`GET /api/v1/companies` |
|                     | Update    | Update company information, logo, benefits, contact details    | `PUT /api/v1/companies/:id`                            |
|                     | Delete    | Admin can deactivate companies or employers can close accounts | `DELETE /api/v1/companies/:id`                         |

### Job Posting Management

| Feature Name     | Operation | Description                                                       | API Endpoint                                 |
| ---------------- | --------- | ----------------------------------------------------------------- | -------------------------------------------- |
| **Job Postings** | Create    | Employer posts new job openings                                   | `POST /api/v1/jobs`                          |
|                  | Read      | Job seekers search and view job listings                          | `GET /api/v1/jobs`<br>`GET /api/v1/jobs/:id` |
|                  | Update    | Employer updates job details, status (active/closed), or deadline | `PUT /api/v1/jobs/:id`                       |
|                  | Delete    | Employer removes outdated job postings                            | `DELETE /api/v1/jobs/:id`                    |

### Application Management

| Feature Name         | Operation | Description                                                                           | API Endpoint                                                                  |
| -------------------- | --------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Job Applications** | Create    | Job seeker submits application to job posting                                         | `POST /api/v1/applications`                                                   |
|                      | Read      | Job seeker views their applications; Employer views applications for their jobs       | `GET /api/v1/applications/me`<br>`GET /api/v1/applications/job/:jobId`        |
|                      | Update    | Employer updates application status (reviewing, interview, offer, etc.) or adds notes | `PUT /api/v1/applications/:id/status`<br>`PUT /api/v1/applications/:id/notes` |
|                      | Delete    | Job seeker can withdraw application                                                   | `DELETE /api/v1/applications/:id`                                             |

### Content Management (Admin)

| Feature Name     | Operation | Description                                                | API Endpoint                 |
| ---------------- | --------- | ---------------------------------------------------------- | ---------------------------- |
| **Site Content** | Create    | Admin creates new pages or articles                        | `POST /api/v1/content`       |
|                  | Read      | All users can view published content pages                 | `GET /api/v1/content/:slug`  |
|                  | Update    | Admin updates content, translations, or publication status | `PUT /api/v1/content/:id`    |
|                  | Delete    | Admin removes outdated content                             | `DELETE /api/v1/content/:id` |

---

## 3. Sample API Requests

### Authentication & User Management

#### Register New User

```bash
# cURL Request
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "role": "jobseeker"
  }'
```

```javascript
// JavaScript (Fetch API)
const response = await fetch("http://localhost:3000/api/v1/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john.doe@example.com",
    password: "SecurePass123",
    role: "jobseeker",
  }),
});
const data = await response.json();
console.log(data.data.token); // Save this token
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67e83b793cdca5ee7a411e2f",
      "email": "john.doe@example.com",
      "role": "jobseeker"
    }
  }
}
```

#### Login User

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67e83b793cdca5ee7a411e2f",
      "email": "john.doe@example.com",
      "role": "jobseeker",
      "lastLogin": "2026-01-31T10:30:00.000Z"
    }
  }
}
```

#### Get Current User

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "67e83b793cdca5ee7a411e2f",
      "email": "john.doe@example.com",
      "role": "jobseeker",
      "profile": "67e83b7a3cdca5ee7a411e30",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-01-30T08:00:00.000Z"
    }
  }
}
```

### User Profile Management

#### Create Profile

```bash
curl -X POST http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+81-90-1234-5678",
    "dateOfBirth": "1995-03-15",
    "nationality": "American",
    "currentLocation": {
      "country": "Japan",
      "city": "Tokyo",
      "prefecture": "Tokyo"
    },
    "languages": [
      { "language": "English", "proficiency": "native" },
      { "language": "Japanese", "proficiency": "conversational" }
    ],
    "bio": "Experienced software developer looking for opportunities in Japan"
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "67e83b7a3cdca5ee7a411e30",
      "user": "67e83b793cdca5ee7a411e2f",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+81-90-1234-5678",
      "currentLocation": {
        "country": "Japan",
        "city": "Tokyo",
        "prefecture": "Tokyo"
      },
      "languages": [...],
      "bio": "Experienced software developer..."
    }
  }
}
```

#### Update Profile

```bash
curl -X PUT http://localhost:3000/api/v1/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+81-90-9876-5432",
    "bio": "Updated bio with new information"
  }'
```

#### Add Education

```bash
curl -X PUT http://localhost:3000/api/v1/profile/education \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "school": "Tokyo University",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "startDate": "2013-04-01",
    "endDate": "2017-03-31",
    "current": false,
    "description": "Focused on software engineering and AI"
  }'
```

### Company Management

#### Create Company Profile

```bash
curl -X POST http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer EMPLOYER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Innovations Japan",
    "industry": "Manufacturing",
    "size": "51-200",
    "founded": 2010,
    "website": "https://techinnovations.jp",
    "description": "Leading technology company specializing in IoT and AI solutions",
    "tagline": "Innovation for a better tomorrow",
    "address": {
      "street": "1-2-3 Shibuya",
      "city": "Tokyo",
      "prefecture": "Tokyo",
      "postalCode": "150-0001",
      "country": "Japan"
    },
    "contactEmail": "hr@techinnovations.jp",
    "contactPhone": "+81-3-1234-5678",
    "benefits": ["Health Insurance", "Visa Sponsorship", "Housing Allowance"]
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Company created successfully",
  "data": {
    "company": {
      "_id": "67e83b8a3cdca5ee7a411e31",
      "name": "Tech Innovations Japan",
      "slug": "tech-innovations-japan",
      "industry": "Manufacturing",
      "size": "51-200",
      "verified": false,
      "isActive": true,
      "createdAt": "2026-01-31T10:00:00.000Z"
    }
  }
}
```

#### Get All Companies (Public)

```bash
curl -X GET "http://localhost:3000/api/v1/companies?limit=10&page=1"
```

### Job Posting Management

#### Create Job Posting

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer EMPLOYER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "industry": "Manufacturing",
    "category": "Technology",
    "summary": "Looking for experienced software engineer to join our IoT team",
    "responsibilities": "Develop and maintain IoT solutions, collaborate with hardware team, write clean code",
    "requirements": "3+ years experience, proficiency in JavaScript/Python, good communication skills",
    "benefits": "Competitive salary, health insurance, visa sponsorship available",
    "requiredEducation": "Bachelor",
    "requiredExperience": "2-5 years",
    "japaneseLevel": "N3",
    "location": {
      "city": "Tokyo",
      "prefecture": "Tokyo",
      "address": "1-2-3 Shibuya, Tokyo"
    },
    "salary": {
      "min": 4000000,
      "max": 6000000,
      "currency": "JPY",
      "period": "year"
    },
    "employmentType": "full-time",
    "visaSponsorship": true,
    "workSchedule": {
      "hoursPerWeek": 40,
      "shift": "day",
      "flexibleHours": true
    },
    "applicationDeadline": "2026-03-31",
    "startDate": "2026-04-01",
    "numberOfPositions": 2
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Job created successfully",
  "data": {
    "job": {
      "_id": "67e83b9b3cdca5ee7a411e32",
      "company": "67e83b8a3cdca5ee7a411e31",
      "postedBy": "67e83b793cdca5ee7a411e2f",
      "title": "Software Engineer",
      "industry": "Manufacturing",
      "status": "active",
      "views": 0,
      "createdAt": "2026-01-31T10:15:00.000Z"
    }
  }
}
```

#### Search Jobs with Filters

```bash
# Search with multiple filters
curl -X GET "http://localhost:3000/api/v1/jobs?industry=Manufacturing&location=Tokyo&visaSponsorship=true&minSalary=3000000&page=1&limit=20"
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "_id": "67e83b9b3cdca5ee7a411e32",
        "title": "Software Engineer",
        "company": {
          "_id": "67e83b8a3cdca5ee7a411e31",
          "name": "Tech Innovations Japan",
          "logo": "https://..."
        },
        "industry": "Manufacturing",
        "location": { "city": "Tokyo", "prefecture": "Tokyo" },
        "salary": { "min": 4000000, "max": 6000000, "currency": "JPY" },
        "visaSponsorship": true,
        "status": "active",
        "views": 15,
        "createdAt": "2026-01-31T10:15:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalJobs": 45,
      "limit": 20
    }
  }
}
```

#### Get Job Details

```bash
curl -X GET http://localhost:3000/api/v1/jobs/67e83b9b3cdca5ee7a411e32
```

### Application Management

#### Submit Job Application

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer JOBSEEKER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "job": "67e83b9b3cdca5ee7a411e32",
    "coverLetter": "I am very interested in this position. With 5 years of experience in software development and IoT systems, I believe I would be a great fit for your team. I am currently studying Japanese and have reached N3 level proficiency."
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "67e83bac3cdca5ee7a411e33",
      "applicant": "67e83b793cdca5ee7a411e2f",
      "job": "67e83b9b3cdca5ee7a411e32",
      "status": "submitted",
      "coverLetter": "I am very interested...",
      "statusHistory": [
        {
          "status": "submitted",
          "date": "2026-01-31T11:00:00.000Z"
        }
      ],
      "createdAt": "2026-01-31T11:00:00.000Z"
    }
  }
}
```

#### Get My Applications (Job Seeker)

```bash
curl -X GET http://localhost:3000/api/v1/applications/me \
  -H "Authorization: Bearer JOBSEEKER_TOKEN_HERE"
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "_id": "67e83bac3cdca5ee7a411e33",
        "status": "submitted",
        "job": {
          "_id": "67e83b9b3cdca5ee7a411e32",
          "title": "Software Engineer",
          "company": {
            "name": "Tech Innovations Japan",
            "logo": "https://..."
          }
        },
        "createdAt": "2026-01-31T11:00:00.000Z"
      }
    ]
  }
}
```

#### Update Application Status (Employer)

```bash
curl -X PUT http://localhost:3000/api/v1/applications/67e83bac3cdca5ee7a411e33/status \
  -H "Authorization: Bearer EMPLOYER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interview",
    "notes": "Strong candidate. Schedule interview for next week."
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application status updated",
  "data": {
    "application": {
      "_id": "67e83bac3cdca5ee7a411e33",
      "status": "interview",
      "employerNotes": "Strong candidate. Schedule interview for next week.",
      "statusHistory": [
        {
          "status": "submitted",
          "date": "2026-01-31T11:00:00.000Z"
        },
        {
          "status": "interview",
          "changedBy": "67e83b793cdca5ee7a411e2f",
          "date": "2026-01-31T14:30:00.000Z",
          "notes": "Strong candidate. Schedule interview for next week."
        }
      ]
    }
  }
}
```

#### Get Applications for Job (Employer)

```bash
curl -X GET http://localhost:3000/api/v1/applications/job/67e83b9b3cdca5ee7a411e32 \
  -H "Authorization: Bearer EMPLOYER_TOKEN_HERE"
```

### Error Responses

#### 400 Bad Request (Validation Error)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

#### 401 Unauthorized (Missing/Invalid Token)

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authorized to access this route"
}
```

#### 403 Forbidden (Insufficient Permissions)

```json
{
  "success": false,
  "statusCode": 403,
  "message": "User role 'jobseeker' is not authorized to access this route"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found"
}
```

---

## 4. UI and Data Flow

### UI Elements and Their Functions

| UI Element                  | Functionality                                                                           | Related Collection               |
| --------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| **Signup Form (Register)**  | Allow new users to register by entering email, password, and role (jobseeker/employer)  | `users`                          |
| **Login Form**              | Allows existing users to sign in to access their profile and features                   | `users`                          |
| **Profile Dashboard**       | Display user profile info with edit capabilities (personal details, experience, skills) | `users`, `userprofiles`          |
| **Profile Edit Form**       | Multi-section form for updating personal info, education, experience, skills            | `userprofiles`                   |
| **Company Dashboard**       | Employer view to manage company profile and job postings                                | `companies`, `jobs`              |
| **Company Edit Form**       | Update company details, logo, benefits, contact information                             | `companies`                      |
| **Job Posting Form**        | Employer creates/edits job listings with all required fields                            | `jobs`                           |
| **Job Search & Listing**    | Search interface with filters (industry, location, salary, visa sponsorship)            | `jobs`                           |
| **Job Detail Page**         | Display full job information with "Apply" button                                        | `jobs`                           |
| **Application Form**        | Job seeker submits application with cover letter and resume                             | `applications`                   |
| **My Applications Page**    | Job seeker views status of all submitted applications                                   | `applications`                   |
| **Applications Management** | Employer reviews, filters, and updates application statuses                             | `applications`                   |
| **Admin Panel**             | Manage users, companies, content, and approve verifications                             | `users`, `companies`, `contents` |

### Data Flow Diagrams

#### User Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Registration Form
    participant API as Backend API
    participant DB as MongoDB

    User->>UI: Fill registration form (email, password, role)
    UI->>UI: Validate form inputs
    UI->>API: POST /api/v1/auth/register
    API->>API: Validate data & check duplicate email
    API->>DB: Insert into users collection
    DB-->>API: Return user document
    API->>API: Generate JWT token
    API-->>UI: Return { token, user }
    UI->>UI: Store token in localStorage
    UI-->>User: Redirect to profile/dashboard
```

#### Job Application Flow

```mermaid
sequenceDiagram
    participant JS as Job Seeker
    participant UI as Application Form
    participant API as Backend API
    participant DB as MongoDB
    participant EM as Employer

    JS->>UI: Click "Apply" on job listing
    UI->>UI: Display application form
    JS->>UI: Fill cover letter & upload resume
    UI->>API: POST /api/v1/applications<br/>{applicant, job, coverLetter, resume}
    API->>API: Verify JWT & user permissions
    API->>DB: Insert into applications collection
    DB-->>API: Return application document
    API->>DB: Update job's application count
    API-->>UI: Return success { application }
    UI-->>JS: Show "Application submitted!"

    Note over EM: Employer Dashboard
    EM->>API: GET /api/v1/applications/job/:jobId
    API->>DB: Query applications for job
    DB-->>API: Return applications list
    API-->>EM: Display applications
    EM->>UI: Update application status
    UI->>API: PUT /api/v1/applications/:id/status
    API->>DB: Update application & add status history
    DB-->>API: Return updated application
    API-->>EM: Confirmation
```

#### Job Search Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Job Search Page
    participant API as Backend API
    participant DB as MongoDB

    User->>UI: Open job search page
    UI->>API: GET /api/v1/jobs
    API->>DB: Query jobs (default: active, limit 20)
    DB-->>API: Return job listings
    API-->>UI: Display jobs { jobs: [...] }
    UI-->>User: Show job cards

    User->>UI: Apply filters (industry, location, salary)
    UI->>API: GET /api/v1/jobs?industry=Manufacturing&location=Tokyo
    API->>DB: Query with filters & sort
    DB-->>API: Return filtered results
    API-->>UI: Update job listings
    UI-->>User: Display filtered jobs

    User->>UI: Click on job card
    UI->>API: GET /api/v1/jobs/:id
    API->>DB: Find job by ID & populate company
    API->>DB: Increment view count
    DB-->>API: Return job details with company info
    API-->>UI: Display job detail page
    UI-->>User: Show full job information + Apply button
```

#### Profile Update Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Profile Form
    participant API as Backend API
    participant DB as MongoDB

    User->>UI: Navigate to profile page
    UI->>API: GET /api/v1/profile/me<br/>Header: Authorization: Bearer token
    API->>API: Verify JWT token
    API->>DB: Find profile by user ID
    DB-->>API: Return profile document
    API-->>UI: Display profile data
    UI-->>User: Show editable form with current data

    User->>UI: Edit fields & click "Save"
    UI->>UI: Validate form data
    UI->>API: PUT /api/v1/profile/me<br/>{firstName, lastName, phone, ...}
    API->>API: Verify token & validate data
    API->>DB: Update userprofiles document
    DB-->>API: Return updated profile
    API-->>UI: Return success { profile }
    UI-->>User: Show "Profile updated!" message
```

#### Authentication Flow (Login)

```mermaid
sequenceDiagram
    participant User
    participant UI as Login Form
    participant API as Auth API
    participant DB as MongoDB

    User->>UI: Enter email & password
    UI->>UI: Client-side validation
    UI->>API: POST /api/v1/auth/login<br/>{email, password}
    API->>DB: Find user by email (with password field)
    DB-->>API: Return user document

    alt User not found
        API-->>UI: 401 Invalid credentials
        UI-->>User: Show error message
    else User found
        API->>API: Compare password with bcrypt
        alt Password incorrect
            API->>DB: Increment loginAttempts
            API-->>UI: 401 Invalid credentials
            UI-->>User: Show error message
        else Password correct
            API->>DB: Reset loginAttempts, update lastLogin
            API->>API: Generate JWT token
            API-->>UI: 200 { token, user }
            UI->>UI: Store token in localStorage
            UI-->>User: Redirect to dashboard
        end
    end
```

---

## 4. Database Relationships

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| UserProfile : "has one"
    User ||--o| Company : "owns (employer)"
    User ||--o{ Application : "creates (jobseeker)"
    User ||--o{ Job : "posts (employer)"

    Company ||--o{ Job : "has many"

    Job ||--o{ Application : "receives many"

    User {
        ObjectId _id PK
        String email UK
        String password
        String role
        ObjectId profile FK
        ObjectId company FK
        Boolean isActive
        Date createdAt
    }

    UserProfile {
        ObjectId _id PK
        ObjectId user FK
        String firstName
        String lastName
        String phone
        Array education
        Array experience
        Array skills
    }

    Company {
        ObjectId _id PK
        String name UK
        String slug UK
        String industry
        String description
        Object address
        Boolean verified
    }

    Job {
        ObjectId _id PK
        ObjectId company FK
        ObjectId postedBy FK
        String title
        String industry
        Object salary
        Object location
        String status
        Date applicationDeadline
    }

    Application {
        ObjectId _id PK
        ObjectId applicant FK
        ObjectId job FK
        String status
        String coverLetter
        Array statusHistory
        Date createdAt
    }
```

### Relationship Summary

| Relationship       | Type        | Description                                    |
| ------------------ | ----------- | ---------------------------------------------- |
| User → UserProfile | One-to-One  | Each user (jobseeker) has one extended profile |
| User → Company     | One-to-One  | Each employer user owns one company profile    |
| User → Application | One-to-Many | Job seekers can submit multiple applications   |
| User → Job         | One-to-Many | Employers can post multiple job listings       |
| Company → Job      | One-to-Many | Each company can have multiple job openings    |
| Job → Application  | One-to-Many | Each job receives multiple applications        |

---

## 5. Indexes and Performance

### Collection Indexes

#### users

```javascript
{
  email: 1,        // Unique index (auto-created)
  role: 1,         // For role-based queries
  isActive: 1      // Filter active users
}
```

#### userprofiles

```javascript
{
  user: 1,         // Unique - one profile per user
  'skills.name': 1 // Search by skills
}
```

#### companies

```javascript
{
  name: 1,         // Unique index
  slug: 1,         // Unique for URLs
  industry: 1,     // Filter by industry
  isActive: 1      // Filter active companies
}
```

#### jobs

```javascript
{
  company: 1,          // Jobs by company
  postedBy: 1,         // Jobs by poster
  title: 1,            // Search by title
  industry: 1,         // Filter by industry
  status: 1,           // Filter active/closed jobs
  'location.city': 1,  // Search by location
  createdAt: -1        // Sort by newest
}

// Compound indexes for common queries
{
  status: 1,
  industry: 1,
  'location.city': 1
}
```

#### applications

```javascript
{
  applicant: 1,    // Applications by user
  job: 1,          // Applications for job
  status: 1,       // Filter by status
  createdAt: -1    // Sort by date
}

// Compound index for employer dashboard
{
  job: 1,
  status: 1,
  createdAt: -1
}
```

### Performance Optimization Strategies

1. **Use `.populate()` selectively** - Only populate needed fields
2. **Implement pagination** - Limit results to 20-50 per page
3. **Add text search** - For job title/description full-text search
4. **Cache frequent queries** - Redis for job listings, company profiles
5. **Use projections** - Select only needed fields in queries
6. **Monitor slow queries** - Enable MongoDB profiling

---

## 6. Data Validation Rules

### Field Validation Summary

| Collection       | Field                   | Validation Rule                                                             |
| ---------------- | ----------------------- | --------------------------------------------------------------------------- |
| **users**        | email                   | Required, unique, valid email format                                        |
|                  | password                | Required, min 8 characters, hashed with bcrypt                              |
|                  | role                    | Enum: jobseeker, employer, admin, rso                                       |
| **userprofiles** | phone                   | Valid phone number format                                                   |
|                  | dateOfBirth             | Valid date, user must be 18+                                                |
|                  | languages[].proficiency | Enum: native, fluent, conversational, basic                                 |
| **companies**    | name                    | Required, unique, max 200 chars                                             |
|                  | industry                | Required, enum of 16 industries                                             |
|                  | website                 | Valid URL format                                                            |
|                  | contactEmail            | Valid email format                                                          |
| **jobs**         | title                   | Required, max 200 chars                                                     |
|                  | industry                | Required, matches company industry enum                                     |
|                  | salary.min              | Must be less than salary.max                                                |
|                  | japaneseLevel           | Enum: N5, N4, N3, N2, N1, Native, None                                      |
|                  | status                  | Enum: draft, active, closed, expired                                        |
| **applications** | status                  | Enum: submitted, reviewing, interview, offer, accepted, rejected, withdrawn |
|                  | coverLetter             | Max 2000 chars                                                              |

### Business Logic Validation

```mermaid
graph TD
    A[User Registration] --> B{Role?}
    B -->|jobseeker| C[Create User + UserProfile]
    B -->|employer| D[Create User + Company]
    B -->|admin/rso| E[Create User only]

    F[Job Application] --> G{User is jobseeker?}
    G -->|No| H[Reject: Employers cannot apply]
    G -->|Yes| I{Already applied?}
    I -->|Yes| J[Reject: Duplicate application]
    I -->|No| K{Job is active?}
    K -->|No| L[Reject: Job closed]
    K -->|Yes| M[Create Application]

    N[Job Posting] --> O{User is employer?}
    O -->|No| P[Reject: Only employers can post]
    O -->|Yes| Q{Has company profile?}
    Q -->|No| R[Reject: Create company first]
    Q -->|Yes| S[Create Job]
```

### Validation Error Messages

```javascript
// Standardized error responses
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email is already registered"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Appendix

### Environment Variables

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japansswdb
MONGODB_DB=japansswdb

# Collections (optional overrides)
CONTENT_COLLECTION=contents
ABOUT_COLLECTION=about

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Application
NODE_ENV=development
PORT=3000
```

### Migration Scripts

Location: `backend/scripts/`

- `list-collections.js` - Audit database collections
- `check-collection-sizes.js` - Check storage usage
- `seedDatabase.js` - Populate database with sample data
- `remove-unused-collections.js` - Clean up unused collections

### Backup Strategy

1. **Automated Daily Backups** - MongoDB Atlas automatic backups
2. **Pre-Deployment Snapshot** - Manual backup before major changes
3. **Retention Policy** - Keep daily backups for 7 days, weekly for 4 weeks

---

**Document Version:** 1.0  
**Last Review:** January 31, 2026  
**Next Review:** As needed with schema changes
