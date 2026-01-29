# Japan SSW Platform - API Fields Reference

Complete reference of **tested and verified** API endpoints from the Successful Test Suite.

**Base URL:** `http://localhost:3000/api/v1`

**Date:** January 29, 2026  
**API Version:** v1.0.0  
**Test Suite Status:** ✅ 100% Success Rate (25/25 assertions passing)

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Profile Operations](#2-profile-operations)
3. [Jobs Operations](#3-jobs-operations)
4. [Companies Operations](#4-companies-operations)
5. [Cleanup](#5-cleanup)

---

## 1. Authentication Flow

| Feature                      | Endpoint         | HTTP Method | Request Body Parameters                                                                   | Response Fields                                      |
| ---------------------------- | ---------------- | ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1.0 Register Jobseeker       | `/auth/register` | POST        | `email` (string, required)<br>`password` (string, required)<br>`role` (string: jobseeker) | `success`, `data` (user, token when created)         |
| 1.1 Login as Jobseeker       | `/auth/login`    | POST        | `email` (string, required)<br>`password` (string, required)                               | `success`, `data` (token, user: id, email, role)     |
| 1.2 Get Current User Profile | `/auth/me`       | GET         | None (Auth header required)                                                               | `success`, `data` (user: id, email, role, createdAt) |
| 1.3 Logout                   | `/auth/logout`   | POST        | None (Auth header required)                                                               | `success`, `message`                                 |
| 1.4 Re-login for Tests       | `/auth/login`    | POST        | `email` (string, required)<br>`password` (string, required)<br>_(Re-login)_               | `success`, `data` (token, user: id, email, role)     |

### Authentication Headers

- **Authorization:** `Bearer <JWT_TOKEN>` (required for protected routes)

### Test Credentials

```json
{
  "email": "carlos.rivera@example.com",
  "password": "Test123!"
}
```

---

## 2. Profile Operations

| Feature             | Endpoint   | HTTP Method | Request Body Parameters                                                                                                                                                                                                                                                                                                           | Response Fields                             |
| ------------------- | ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 2.1 Create Profile  | `/profile` | POST        | `firstName` (string, required)<br>`lastName` (string, required)<br>`dateOfBirth` (date, required)<br>`gender` (string)<br>`nationality` (string, required)<br>`phone` (string, required)<br>`address` (string)<br>`prefecture` (string)<br>`city` (string)<br>`postalCode` (string)<br>`japaneseLevel` (string)<br>`bio` (string) | `success`, `data` (profile with all fields) |
| 2.2 Get Own Profile | `/profile` | GET         | None (Auth header required)                                                                                                                                                                                                                                                                                                       | `success`, `data` (complete profile object) |
| 2.3 Update Profile  | `/profile` | PUT         | Any profile fields to update (partial update supported)<br>Example: `phone`, `japaneseLevel`, `bio`                                                                                                                                                                                                                               | `success`, `data` (updated profile)         |

---

## 3. Jobs Operations

| Feature                    | Endpoint    | HTTP Method | Query Parameters                                                                     | Response Fields                             |
| -------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| 3.1 Get All Jobs           | `/jobs`     | GET         | `page` (number, default: 1)<br>`limit` (number, default: 10)                         | `success`, `data` (jobs array, pagination)  |
| 3.2 Search Jobs by Filters | `/jobs`     | GET         | **Filters:**<br>`industry=Manufacturing`<br>`prefecture=Tokyo`<br>`japaneseLevel=N3` | `success`, `data` (filtered jobs array)     |
| 3.3 Get Single Job Details | `/jobs/:id` | GET         | None (job ID in URL)<br>Example: `/jobs/697b380e5d7e6fe346a6269e`                    | `success`, `data` (single job with company) |

---

## 4. Companies Operations

| Feature                          | Endpoint         | HTTP Method | Query Parameters                                                | Response Fields                                 |
| -------------------------------- | ---------------- | ----------- | --------------------------------------------------------------- | ----------------------------------------------- |
| 4.1 Get All Companies            | `/companies`     | GET         | `page` (number, default: 1)<br>`limit` (number, default: 10)    | `success`, `data` (companies array, pagination) |
| 4.2 Get Single Company Details   | `/companies/:id` | GET         | None (company ID in URL)<br>Example: `/companies/697b380e5d...` | `success`, `data` (single company details)      |
| 4.3 Search Companies by Industry | `/companies`     | GET         | **Filter:**<br>`industry=Manufacturing`                         | `success`, `data` (filtered companies array)    |

---

## 5. Cleanup

| Feature                       | Endpoint   | HTTP Method | Request Body Parameters     | Response Fields      |
| ----------------------------- | ---------- | ----------- | --------------------------- | -------------------- |
| 5.1 Delete Profile (Optional) | `/profile` | DELETE      | None (Auth header required) | `success`, `message` |

**Note:** Optional cleanup operation to reset profile for next test run.

---

## Common Response Format

### Success Response

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {
    // ... response data
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description"
}
```

---

## Status Codes

| Code | Meaning                          |
| ---- | -------------------------------- |
| 200  | OK - Request succeeded           |
| 201  | Created - Resource created       |
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Auth required     |
| 404  | Not Found - Resource not found   |
| 500  | Internal Server Error            |

---

## Testing

### Newman Test Results

**Latest Run:** January 29, 2026  
**Status:** ✅ 100% Success  
**Assertions:** 25/25 passed  
**Requests:** 14/14 successful  
**Duration:** 5.3 seconds  
**Average Response Time:** 160ms

### Postman Collection

Import the successful test collection:  
`backend/postman/Japan_SSW_API_Successful_Tests.postman_collection.json`

### Environment

Use the environment file:  
`backend/postman/Japan_SSW_API.postman_environment.json`

### Running Tests

```bash
cd backend/postman
newman run Japan_SSW_API_Successful_Tests.postman_collection.json \
  -e Japan_SSW_API.postman_environment.json \
  --reporters cli,htmlextra \
  --delay-request 200
```

---

**Last Updated:** January 29, 2026  
**Maintained by:** Team Kaizen MMDC  
**Test Suite:** Japan SSW Platform API - Successful Test Suite

- `Hospitality`
- `Agriculture`
- `Food Processing`
- `Technology`
- `Retail`

### Company Sizes

- `1-50` employees
- `51-200` employees
- `201-500` employees
- `501+` employees

### Skill Levels

- `Beginner`
- `Intermediate`
- `Advanced`
- `Expert`

### Language Proficiency

- `Native`
- `Fluent`
- `Intermediate`
- `Basic`

---

## Validation Rules

### Email

- Must be valid email format
- Must be unique in system

### Password

- Minimum 6 characters
- Must contain at least one uppercase, one lowercase, and one number

### Phone Number

- Must include country code
- Example: `+81-90-1234-5678`

### Dates

- Format: `YYYY-MM-DD` or ISO 8601
- Future dates allowed for availability and deadlines
- Past dates for education/experience

### Salary Range

- Must include `min`, `max`, and `currency`
- Min must be less than max
- Currency: `JPY`, `USD`, etc.

---

## Authentication & Authorization

### Protected Routes

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access

| Role          | Allowed Actions                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| **Jobseeker** | Create/update profile, apply to jobs, manage own applications                    |
| **Employer**  | Create/manage company, post jobs, review applications, update application status |
| **Admin**     | All actions + user management, view statistics, moderate content                 |

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **General API endpoints:** 100 requests per 15 minutes per user
- **Search endpoints:** 30 requests per minute per user

---

## Pagination

All list endpoints support pagination with these query parameters:

- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sort` (default varies by endpoint)

**Pagination Response:**

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Status Codes

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 200  | OK - Request succeeded                   |
| 201  | Created - Resource created successfully  |
| 400  | Bad Request - Invalid parameters         |
| 401  | Unauthorized - Authentication required   |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource doesn't exist       |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error - Server error     |

---

## Testing

### Quick Test Credentials

**Jobseeker:**

```
Email: carlos.rivera@example.com
Password: Test123!
```

**Employer:**

```
Email: employer1@techinnov.com
Password: Test123!
```

**Admin:**

```
Email: admin@japanssw.com
Password: Admin123!
```

### Postman Collection

Import the complete Postman collection from:
`backend/postman/Japan_SSW_API_Complete.postman_collection.json`

### Swagger Documentation

Interactive API documentation available at:
`http://localhost:3000/api-docs`

---

## Additional Resources

- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Postman Guide:** [postman/README.md](./postman/README.md)
- **Developer Guide:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Frontend Integration:** [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)

---

**Last Updated:** January 29, 2026  
**Maintained by:** Team Kaizen MMDC
