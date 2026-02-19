# Japan SSW Platform — Complete API Reference

**Version:** 1.0  
**Base URL:** `http://localhost:3000/api/v1`  
**Production URL:** `https://your-domain.com/api/v1`  
**Last Updated:** January 29, 2026

> **Note:** For interactive Swagger documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or visit `http://localhost:3000/api-docs`

---

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Jobs](#jobs)
4. [Applications](#applications)
5. [Companies](#companies)
6. [Users](#users)
7. [Error Handling](#error-handling)
8. [Authentication Flow](#authentication-flow)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Register User

**`POST /auth/register`**  
**Access:** Public

Creates a new user account and returns a JWT token.

**Request Body:**

```json
{
  "email": "carlos.rivera@example.com",
  "password": "Test123!",
  "role": "jobseeker"
}
```

**Field Validations:**

- `email`: Valid email format, unique in database
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `role`: Must be one of `jobseeker`, `employer`, `admin`, or `rso`

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65abc123def456789",
      "email": "carlos.rivera@example.com",
      "role": "jobseeker",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-01-29T10:30:00.000Z"
    }
  }
}
```

---

### Login

**`POST /auth/login`**  
**Access:** Public

Authenticates user and returns JWT token.

**Request Body:**

```json
{
  "email": "carlos.rivera@example.com",
  "password": "Test123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65abc123def456789",
      "email": "carlos.rivera@example.com",
      "role": "jobseeker"
    }
  }
}
```

---

### Get Current User

**`GET /auth/me`**  
**Access:** Protected (Requires JWT)

Returns the currently authenticated user's information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "email": "carlos.rivera@example.com",
    "role": "jobseeker",
    "isActive": true,
    "profile": "65abc789def123456",
    "createdAt": "2026-01-29T10:30:00.000Z"
  }
}
```

---

### Logout

**`POST /auth/logout`**  
**Access:** Protected

Logs out the current user.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## User Profile

### Get Own Profile

**`GET /profile`**  
**Access:** Protected (Jobseeker only)

Retrieves the authenticated user's complete profile.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc789def123456",
    "user": "65abc123def456789",
    "firstName": "Carlos",
    "lastName": "Rivera",
    "dateOfBirth": "1995-03-15",
    "gender": "Male",
    "nationality": "Philippines",
    "phone": "+81-90-1234-5678",
    "prefecture": "Tokyo",
    "city": "Minato",
    "education": [
      {
        "_id": "65abc456def789123",
        "school": "University of Manila",
        "degree": "Bachelor",
        "field": "Computer Science",
        "startDate": "2013-06-01",
        "endDate": "2017-03-31"
      }
    ],
    "experience": [
      {
        "_id": "65abc654fed987321",
        "company": "Tech Corp Philippines",
        "title": "Software Developer",
        "startDate": "2017-04-01",
        "current": true
      }
    ],
    "skills": [
      {
        "name": "JavaScript",
        "level": "Advanced",
        "category": "Programming"
      }
    ],
    "japaneseLevel": "N3"
  }
}
```

---

### Create Profile

**`POST /profile`**  
**Access:** Protected (Jobseeker only)

Creates a new profile for the authenticated user.

**Request Body:**

```json
{
  "firstName": "Carlos",
  "lastName": "Rivera",
  "dateOfBirth": "1995-03-15",
  "gender": "Male",
  "nationality": "Philippines",
  "phone": "+81-90-1234-5678",
  "prefecture": "Tokyo",
  "city": "Minato",
  "japaneseLevel": "N3"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    /* profile object */
  }
}
```

---

### Update Profile

**`PUT /profile`**  
**Access:** Protected (Jobseeker only)

Updates the authenticated user's profile. Supports partial updates.

**Request Body (example - any fields):**

```json
{
  "phone": "+81-90-9876-5432",
  "prefecture": "Osaka",
  "japaneseLevel": "N2"
}
```

---

### Add Education

**`POST /profile/education`**  
**Access:** Protected (Jobseeker only)

Adds an education entry to the profile.

**Request Body:**

```json
{
  "school": "Tokyo Japanese Language School",
  "degree": "Certificate",
  "field": "Japanese Language",
  "startDate": "2025-04-01",
  "endDate": "2026-03-31",
  "current": true
}
```

---

### Update Education

**`PUT /profile/education/:educationId`**  
**Access:** Protected (Jobseeker only)

---

### Delete Education

**`DELETE /profile/education/:educationId`**  
**Access:** Protected (Jobseeker only)

---

### Add Experience

**`POST /profile/experience`**  
**Access:** Protected (Jobseeker only)

---

### Update Experience

**`PUT /profile/experience/:experienceId`**  
**Access:** Protected (Jobseeker only)

---

### Delete Experience

**`DELETE /profile/experience/:experienceId`**  
**Access:** Protected (Jobseeker only)

---

### Update Skills

**`PUT /profile/skills`**  
**Access:** Protected (Jobseeker only)

**Request Body:**

```json
{
  "skills": [
    {
      "name": "Welding",
      "level": "Advanced",
      "category": "Technical"
    }
  ]
}
```

---

### Update Certifications

**`PUT /profile/certifications`**  
**Access:** Protected (Jobseeker only)

---

### Update Languages

**`PUT /profile/languages`**  
**Access:** Protected (Jobseeker only)

---

### Update Availability

**`PUT /profile/availability`**  
**Access:** Protected (Jobseeker only)

**Request Body:**

```json
{
  "startDate": "2026-06-01",
  "visaStatus": "Approved",
  "relocate": true
}
```

---

## Jobs

### Get All Jobs

**`GET /jobs`**  
**Access:** Public

Retrieves all active job postings with filtering, search, and pagination.

**Query Parameters:**

| Parameter       | Type    | Description                            | Example                   |
| --------------- | ------- | -------------------------------------- | ------------------------- |
| `page`          | Number  | Page number (default: 1)               | `?page=2`                 |
| `limit`         | Number  | Items per page (default: 10, max: 100) | `?limit=20`               |
| `industry`      | String  | Filter by industry                     | `?industry=Manufacturing` |
| `prefecture`    | String  | Filter by prefecture                   | `?prefecture=Tokyo`       |
| `minSalary`     | Number  | Minimum monthly salary                 | `?minSalary=250000`       |
| `maxSalary`     | Number  | Maximum monthly salary                 | `?maxSalary=400000`       |
| `japaneseLevel` | String  | Required Japanese level                | `?japaneseLevel=N3`       |
| `remote`        | Boolean | Filter remote jobs                     | `?remote=true`            |
| `search`        | String  | Text search                            | `?search=engineer`        |

**Example Request:**

```
GET /jobs?industry=Manufacturing&prefecture=Tokyo&minSalary=250000&page=1&limit=10
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "count": 44,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalCount": 44
  },
  "data": [
    {
      "_id": "65job123abc456def",
      "company": {
        "_id": "65comp123abc456",
        "name": "Tech Innovation Japan Corp",
        "logo": "https://example.com/logo.png",
        "industry": "Manufacturing"
      },
      "title": "Manufacturing Engineer",
      "industry": "Manufacturing",
      "category": "Engineering",
      "summary": "Seeking experienced manufacturing engineer",
      "salaryMin": 280000,
      "salaryMax": 380000,
      "location": {
        "prefecture": "Tokyo",
        "city": "Minato"
      },
      "japaneseLevel": "N3",
      "requiredExperience": {
        "years": 2
      },
      "status": "active",
      "views": 127,
      "applicationCount": 3,
      "createdAt": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Job

**`GET /jobs/:jobId`**  
**Access:** Public

Retrieves detailed information about a specific job. Automatically increments view counter.

---

### Create Job

**`POST /jobs`**  
**Access:** Protected (Employer only)

Creates a new job posting.

**Request Body:**

```json
{
  "company": "65comp123abc456",
  "title": "Quality Control Inspector",
  "industry": "Manufacturing",
  "category": "Quality Assurance",
  "summary": "Inspect products and ensure quality standards",
  "responsibilities": "Conduct inspections; Document findings",
  "requirements": "High school diploma; Japanese N4",
  "requiredEducation": "High School",
  "japaneseLevel": "N4",
  "requiredExperience": {
    "years": 1,
    "description": "Quality control experience"
  },
  "requiredSkills": ["Quality Control", "Attention to Detail"],
  "salaryMin": 220000,
  "salaryMax": 290000,
  "location": {
    "prefecture": "Tokyo",
    "city": "Minato",
    "remote": false
  },
  "workHours": "8:00-17:00",
  "applicationDeadline": "2026-04-30",
  "contactEmail": "hr@company.com"
}
```

---

### Update Job

**`PUT /jobs/:jobId`**  
**Access:** Protected (Employer only, must own the job)

Updates an existing job. Supports partial updates.

---

### Delete Job

**`DELETE /jobs/:jobId`**  
**Access:** Protected (Employer only, must own the job)

Soft deletes a job (sets status to "archived").

---

### Get Jobs by Company

**`GET /jobs/company/:companyId`**  
**Access:** Public

Retrieves all jobs posted by a specific company.

---

### Get My Jobs

**`GET /jobs/my-jobs`**  
**Access:** Protected (Employer only)

Retrieves all jobs posted by the authenticated employer.

---

## Applications

### Apply to Job

**`POST /jobs/:jobId/apply`**  
**Access:** Protected (Jobseeker only)

Submits an application to a job posting.

**Request Body:**

```json
{
  "coverLetter": "I am very interested in this position. I have 3 years of manufacturing experience and JLPT N3 certification..."
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "65app123abc456def",
    "applicant": "65user123abc456",
    "job": "65job123abc456def",
    "status": "submitted",
    "coverLetter": "I am very interested...",
    "appliedDate": "2026-01-29T15:00:00.000Z"
  }
}
```

---

### Get My Applications

**`GET /applications/me`**  
**Access:** Protected (Jobseeker only)

Retrieves all applications submitted by the authenticated jobseeker.

**Query Parameters:**

| Parameter | Type   | Description      | Example             |
| --------- | ------ | ---------------- | ------------------- |
| `status`  | String | Filter by status | `?status=reviewing` |
| `page`    | Number | Page number      | `?page=1`           |
| `limit`   | Number | Items per page   | `?limit=20`         |

---

### Get Single Application

**`GET /applications/:applicationId`**  
**Access:** Protected (Applicant or Job Employer only)

---

### Withdraw Application

**`PUT /applications/:applicationId/withdraw`**  
**Access:** Protected (Applicant only)

Withdraws an application. Cannot be done after certain statuses (e.g., "accepted").

---

### Get Job Applications

**`GET /jobs/:jobId/applications`**  
**Access:** Protected (Employer only, must own the job)

Retrieves all applications for a specific job posting.

---

### Update Application Status

**`PUT /applications/:applicationId/status`**  
**Access:** Protected (Employer only, must own the job)

Updates the status of an application.

**Request Body:**

```json
{
  "status": "interview",
  "notes": "Scheduling interview for next week",
  "interviewInfo": {
    "date": "2026-02-05T10:00:00.000Z",
    "location": "Company Office, Meeting Room A",
    "notes": "Please bring your resume"
  }
}
```

**Valid Status Values:**

- `submitted`
- `reviewing`
- `interview`
- `offer`
- `accepted`
- `rejected`
- `withdrawn`

---

### Add Employer Notes

**`PUT /applications/:applicationId/notes`**  
**Access:** Protected (Employer only, must own the job)

Adds private notes to an application (visible only to employer).

---

## Companies

### Get All Companies

**`GET /companies`**  
**Access:** Public

**Query Parameters:**

| Parameter    | Type   | Description          | Example                   |
| ------------ | ------ | -------------------- | ------------------------- |
| `industry`   | String | Filter by industry   | `?industry=Manufacturing` |
| `prefecture` | String | Filter by prefecture | `?prefecture=Tokyo`       |
| `page`       | Number | Page number          | `?page=1`                 |
| `limit`      | Number | Items per page       | `?limit=10`               |

---

### Get Single Company

**`GET /companies/:companyId`**  
**Access:** Public

---

### Create Company

**`POST /companies`**  
**Access:** Protected (Employer only)

**Request Body:**

```json
{
  "name": "New Manufacturing Corp",
  "industry": "Manufacturing",
  "size": "201-500",
  "founded": 2015,
  "website": "https://newmfg.example.jp",
  "description": "Innovative manufacturing company",
  "location": {
    "prefecture": "Kanagawa",
    "city": "Yokohama",
    "address": "5-10-20 Minato Mirai"
  },
  "contact": {
    "email": "info@newmfg.example.jp",
    "phone": "+81-45-123-4567"
  }
}
```

---

### Update Company

**`PUT /companies/:companyId`**  
**Access:** Protected (Company owner or Admin)

---

## Users

### Get All Users

**`GET /users`**  
**Access:** Protected (Admin only)

---

### Get Single User

**`GET /users/:userId`**  
**Access:** Protected (Self or Admin)

---

### Update User

**`PUT /users/:userId`**  
**Access:** Protected (Self or Admin)

---

### Update Password

**`PUT /users/update-password`**  
**Access:** Protected

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

### Delete User

**`DELETE /users/:userId`**  
**Access:** Protected (Admin only)

Soft deletes a user (sets `isActive` to false).

---

## Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning               | Common Causes                      |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE        |
| 201  | Created               | Successful POST (resource created) |
| 400  | Bad Request           | Validation errors, invalid data    |
| 401  | Unauthorized          | Missing or invalid JWT token       |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource doesn't exist             |
| 429  | Too Many Requests     | Rate limit exceeded                |
| 500  | Internal Server Error | Unexpected server error            |

### Common Error Codes

| Error Code              | Description                         |
| ----------------------- | ----------------------------------- |
| `VALIDATION_ERROR`      | Request data failed validation      |
| `DUPLICATE_EMAIL`       | Email already registered            |
| `INVALID_CREDENTIALS`   | Login failed - wrong email/password |
| `NO_TOKEN`              | Authorization header missing        |
| `INVALID_TOKEN`         | JWT token is invalid or expired     |
| `FORBIDDEN`             | User lacks permission               |
| `NOT_FOUND`             | Requested resource doesn't exist    |
| `DUPLICATE_APPLICATION` | User already applied to this job    |

---

## Authentication Flow

### Token Structure

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**

```json
{
  "id": "65user123abc456",
  "role": "jobseeker",
  "iat": 1706524800,
  "exp": 1707129600
}
```

**Token Expiration:** 7 days (configurable via `JWT_EXPIRE`)

---

## Testing Data

### Test Credentials (from seed data)

**Admin:**

- Email: `admin@japanssw.com`
- Password: `Admin123!`

**Employer:**

- Email: `employer1@techinnov.com`
- Password: `Test123!`

**Jobseeker:**

- Email: `carlos.rivera@example.com`
- Password: `Test123!`

### Available Test Data

After running `npm run seed:full`:

- **21 Users:** 1 admin, 10 employers, 10 jobseekers
- **10 Companies:** Across 9 industries
- **44 Jobs:** Distributed across all companies
- **20 Applications:** Various statuses

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "jobseeker"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Get Protected Resource

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Search Jobs

```bash
curl -X GET "http://localhost:5000/api/v1/jobs?industry=Manufacturing&prefecture=Tokyo&minSalary=250000"
```

### Apply to Job

```bash
JOB_ID="65job123abc456def"

curl -X POST http://localhost:5000/api/v1/jobs/$JOB_ID/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coverLetter": "I am very interested in this position..."
  }'
```

---

## Rate Limiting

**Default Limits:**

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706525700
```

---

## Support & Contact

**Interactive Docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or `http://localhost:3000/api-docs`  
**Postman Collection:** `backend/postman/Japan_SSW_API_day1_day4.postman_collection.json`  
**Developer Guide:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**API Version:** v1.0.0
