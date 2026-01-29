# Japan SSW Platform - API Fields Reference

Complete reference of all API endpoints with required fields, parameters, and response structures.

**Base URL:** `http://localhost:5000/api/v1`

**Date:** January 29, 2026  
**API Version:** v1.0.0

---

## Table of Contents

1. [Authentication API](#1-authentication-api)
2. [User Profile API](#2-user-profile-api)
3. [Jobs API](#3-jobs-api)
4. [Applications API](#4-applications-api)
5. [Companies API](#5-companies-api)
6. [Users (Admin) API](#6-users-admin-api)

---

## 1. Authentication API

| Feature            | Endpoint                | HTTP Method | Request Body Parameters                                                                                                                                                                                  | Response Fields                                                                               |
| ------------------ | ----------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Register Jobseeker | `/auth/register`        | POST        | `email` (string, required)<br>`password` (string, required)<br>`firstName` (string, required)<br>`lastName` (string, required)<br>`role` (string, default: "jobseeker")                                  | `success`, `message`, `token`, `user` (userId, email, firstName, lastName, role)              |
| Register Employer  | `/auth/register`        | POST        | `email` (string, required)<br>`password` (string, required)<br>`firstName` (string, required)<br>`lastName` (string, required)<br>`role` (string, value: "employer")<br>`companyName` (string, optional) | `success`, `message`, `token`, `user` (userId, email, firstName, lastName, role, companyName) |
| Login              | `/auth/login`           | POST        | `email` (string, required)<br>`password` (string, required)                                                                                                                                              | `success`, `message`, `token`, `user` (userId, email, firstName, lastName, role)              |
| Get Current User   | `/auth/me`              | GET         | None (Auth header required)                                                                                                                                                                              | `success`, `user` (userId, email, firstName, lastName, role, createdAt)                       |
| Logout             | `/auth/logout`          | POST        | None (Auth header required)                                                                                                                                                                              | `success`, `message`                                                                          |
| Forgot Password    | `/auth/forgot-password` | POST        | `email` (string, required)                                                                                                                                                                               | `success`, `message`, `resetToken`                                                            |

### Authentication Headers

- **Authorization:** `Bearer <JWT_TOKEN>` (required for protected routes)

---

## 2. User Profile API

| Feature                | Endpoint                                       | HTTP Method | Request Body Parameters                                                                                                                                                                                                                                                                                                                                         | Response Fields                                                                                                                |
| ---------------------- | ---------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Create Profile         | `/profiles`                                    | POST        | `dateOfBirth` (date, required)<br>`gender` (string, enum: Male/Female/Other)<br>`nationality` (string, required)<br>`currentLocation` (string, required)<br>`phoneNumber` (string, required)<br>`japaneseLevel` (string, enum: N5/N4/N3/N2/N1)<br>`biography` (string)<br>`preferredIndustries` (array of strings)<br>`preferredPrefectures` (array of strings) | `success`, `message`, `profile` (profileId, userId, dateOfBirth, gender, nationality, phoneNumber, japaneseLevel, etc.)        |
| Get My Profile         | `/profiles/me`                                 | GET         | None (Auth header required)                                                                                                                                                                                                                                                                                                                                     | `success`, `profile` (all profile fields including education, workExperience, skills, languages, certifications, availability) |
| Update Profile         | `/profiles/me`                                 | PUT         | Any profile fields to update (partial update supported)                                                                                                                                                                                                                                                                                                         | `success`, `message`, `profile` (updated profile data)                                                                         |
| Delete Profile         | `/profiles/me`                                 | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                                                     | `success`, `message`                                                                                                           |
| Add Education          | `/profiles/me/education`                       | POST        | `institution` (string, required)<br>`degree` (string, required)<br>`fieldOfStudy` (string, required)<br>`startDate` (date, required)<br>`endDate` (date)<br>`isCurrent` (boolean)<br>`description` (string)                                                                                                                                                     | `success`, `message`, `education` (educationId, institution, degree, fieldOfStudy, dates)                                      |
| Update Education       | `/profiles/me/education/:educationId`          | PUT         | Any education fields to update                                                                                                                                                                                                                                                                                                                                  | `success`, `message`, `education` (updated education data)                                                                     |
| Delete Education       | `/profiles/me/education/:educationId`          | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                                                     | `success`, `message`                                                                                                           |
| Add Work Experience    | `/profiles/me/work-experience`                 | POST        | `company` (string, required)<br>`position` (string, required)<br>`startDate` (date, required)<br>`endDate` (date)<br>`isCurrent` (boolean)<br>`description` (string)<br>`responsibilities` (array of strings)                                                                                                                                                   | `success`, `message`, `workExperience` (experienceId, company, position, dates, description)                                   |
| Update Work Experience | `/profiles/me/work-experience/:experienceId`   | PUT         | Any work experience fields to update                                                                                                                                                                                                                                                                                                                            | `success`, `message`, `workExperience` (updated experience data)                                                               |
| Delete Work Experience | `/profiles/me/work-experience/:experienceId`   | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                                                     | `success`, `message`                                                                                                           |
| Update Skills          | `/profiles/me/skills`                          | PUT         | `skills` (array of objects)<br>Each skill: `name` (string), `level` (string: Beginner/Intermediate/Advanced/Expert)                                                                                                                                                                                                                                             | `success`, `message`, `skills` (array of updated skills)                                                                       |
| Add Certification      | `/profiles/me/certifications`                  | POST        | `name` (string, required)<br>`issuingOrganization` (string, required)<br>`issueDate` (date, required)<br>`expiryDate` (date)<br>`credentialId` (string)<br>`credentialUrl` (string)                                                                                                                                                                             | `success`, `message`, `certification` (certificationId, name, issuingOrganization, dates)                                      |
| Delete Certification   | `/profiles/me/certifications/:certificationId` | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                                                     | `success`, `message`                                                                                                           |
| Update Languages       | `/profiles/me/languages`                       | PUT         | `languages` (array of objects)<br>Each language: `language` (string), `proficiency` (string: Native/Fluent/Intermediate/Basic)                                                                                                                                                                                                                                  | `success`, `message`, `languages` (array of updated languages)                                                                 |
| Update Availability    | `/profiles/me/availability`                    | PUT         | `availableFrom` (date)<br>`workPreference` (string: Full-time/Part-time/Contract/Internship)<br>`willingToRelocate` (boolean)<br>`visaStatus` (string)                                                                                                                                                                                                          | `success`, `message`, `availability` (updated availability data)                                                               |

---

## 3. Jobs API

| Feature             | Endpoint                   | HTTP Method | Query/Body Parameters                                                                                                                                                                                                                                                                                                                                                                                                            | Response Fields                                                                             |
| ------------------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Get All Jobs        | `/jobs`                    | GET         | **Query Params:**<br>`industry` (string)<br>`prefecture` (string)<br>`japaneseLevel` (string: N5-N1)<br>`employmentType` (string)<br>`page` (number, default: 1)<br>`limit` (number, default: 10)<br>`sort` (string, default: -createdAt)                                                                                                                                                                                        | `success`, `jobs` (array), `pagination` (page, limit, totalPages, totalJobs)                |
| Search Jobs         | `/jobs/search`             | GET         | **Query Params:**<br>`keyword` (string, searches in title/description)<br>`industry` (string)<br>`prefecture` (string)<br>`japaneseLevel` (string)<br>`page` (number)<br>`limit` (number)                                                                                                                                                                                                                                        | `success`, `jobs` (array), `pagination`, `searchQuery`                                      |
| Get Single Job      | `/jobs/:jobId`             | GET         | None (jobId in URL)                                                                                                                                                                                                                                                                                                                                                                                                              | `success`, `job` (jobId, title, company, description, requirements, salary, location, etc.) |
| Create Job          | `/jobs`                    | POST        | `title` (string, required)<br>`description` (string, required)<br>`industry` (string, required)<br>`prefecture` (string, required)<br>`city` (string, required)<br>`employmentType` (string, required)<br>`salaryRange` (object: min, max, currency)<br>`requiredJapaneseLevel` (string)<br>`requiredSkills` (array of strings)<br>`benefits` (array of strings)<br>`applicationDeadline` (date)<br>`numberOfPositions` (number) | `success`, `message`, `job` (created job data with jobId)                                   |
| Update Job          | `/jobs/:jobId`             | PUT         | Any job fields to update (partial update supported)                                                                                                                                                                                                                                                                                                                                                                              | `success`, `message`, `job` (updated job data)                                              |
| Delete Job          | `/jobs/:jobId`             | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                                                                                                                      | `success`, `message`                                                                        |
| Get Jobs by Company | `/jobs/company/:companyId` | GET         | **Query Params:**<br>`page` (number)<br>`limit` (number)                                                                                                                                                                                                                                                                                                                                                                         | `success`, `jobs` (array of company jobs), `pagination`                                     |
| Get My Jobs         | `/jobs/my-jobs`            | GET         | **Query Params:**<br>`status` (string: active/closed/draft)<br>`page` (number)<br>`limit` (number)                                                                                                                                                                                                                                                                                                                               | `success`, `jobs` (array of employer's jobs), `pagination`                                  |

---

## 4. Applications API

| Feature                   | Endpoint                                | HTTP Method | Request Body Parameters                                                                                                                                                         | Response Fields                                                                              |
| ------------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Apply to Job              | `/applications`                         | POST        | `jobId` (string, required)<br>`coverLetter` (string, required)<br>`resumeUrl` (string)<br>`expectedSalary` (number)<br>`availableStartDate` (date)<br>`additionalInfo` (string) | `success`, `message`, `application` (applicationId, jobId, applicantId, status, submittedAt) |
| Get My Applications       | `/applications/my-applications`         | GET         | **Query Params:**<br>`status` (string: pending/reviewed/shortlisted/rejected/accepted)<br>`page` (number)<br>`limit` (number)<br>`sort` (string)                                | `success`, `applications` (array with job and company details), `pagination`                 |
| Get Single Application    | `/applications/:applicationId`          | GET         | None (applicationId in URL)                                                                                                                                                     | `success`, `application` (full application details with job, applicant, and company info)    |
| Get Job Applications      | `/applications/job/:jobId`              | GET         | **Query Params:**<br>`status` (string)<br>`page` (number)<br>`limit` (number)                                                                                                   | `success`, `applications` (array with applicant profile details), `pagination`, `jobTitle`   |
| Update Application Status | `/applications/:applicationId/status`   | PUT         | `status` (string, required: reviewed/shortlisted/rejected/accepted)<br>`notes` (string)                                                                                         | `success`, `message`, `application` (updated application with new status)                    |
| Withdraw Application      | `/applications/:applicationId/withdraw` | PUT         | `reason` (string, optional)                                                                                                                                                     | `success`, `message`, `application` (application with status: withdrawn)                     |
| Delete Application        | `/applications/:applicationId`          | DELETE      | None (Auth header required)                                                                                                                                                     | `success`, `message`                                                                         |

---

## 5. Companies API

| Feature            | Endpoint                | HTTP Method | Request Body Parameters                                                                                                                                                                                                                                                                                                           | Response Fields                                                                                          |
| ------------------ | ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Get All Companies  | `/companies`            | GET         | **Query Params:**<br>`industry` (string)<br>`prefecture` (string)<br>`size` (string: 1-50, 51-200, 201-500, 501+)<br>`page` (number)<br>`limit` (number)                                                                                                                                                                          | `success`, `companies` (array), `pagination`                                                             |
| Get Single Company | `/companies/:companyId` | GET         | None (companyId in URL)                                                                                                                                                                                                                                                                                                           | `success`, `company` (companyId, name, description, industry, size, location, website, activeJobs count) |
| Create Company     | `/companies`            | POST        | `name` (string, required)<br>`description` (string, required)<br>`industry` (string, required)<br>`size` (string, required)<br>`foundedYear` (number)<br>`website` (string)<br>`headquarters` (object: prefecture, city, address)<br>`offices` (array of location objects)<br>`benefits` (array of strings)<br>`culture` (string) | `success`, `message`, `company` (created company data with companyId)                                    |
| Update Company     | `/companies/:companyId` | PUT         | Any company fields to update (partial update supported)                                                                                                                                                                                                                                                                           | `success`, `message`, `company` (updated company data)                                                   |
| Delete Company     | `/companies/:companyId` | DELETE      | None (Auth header required)                                                                                                                                                                                                                                                                                                       | `success`, `message`                                                                                     |

---

## 6. Users (Admin) API

| Feature             | Endpoint         | HTTP Method | Query/Body Parameters                                                                                                                                          | Response Fields                                                                                  |
| ------------------- | ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Get All Users       | `/users`         | GET         | **Query Params:**<br>`role` (string: jobseeker/employer/admin)<br>`status` (string: active/inactive)<br>`page` (number)<br>`limit` (number)<br>`sort` (string) | `success`, `users` (array), `pagination`                                                         |
| Get Single User     | `/users/:userId` | GET         | None (userId in URL)                                                                                                                                           | `success`, `user` (userId, email, firstName, lastName, role, status, profile, createdAt)         |
| Update User         | `/users/:userId` | PUT         | `firstName` (string)<br>`lastName` (string)<br>`email` (string)<br>`role` (string)<br>`status` (string: active/inactive)                                       | `success`, `message`, `user` (updated user data)                                                 |
| Delete User         | `/users/:userId` | DELETE      | None (Auth header required)                                                                                                                                    | `success`, `message`                                                                             |
| Get User Statistics | `/users/stats`   | GET         | None (Auth header required)                                                                                                                                    | `success`, `stats` (totalUsers, usersByRole, usersByStatus, newUsersThisMonth, activeUsersToday) |

---

## Common Response Format

### Success Response

```json
{
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
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

---

## Enumerations Reference

### User Roles

- `jobseeker`
- `employer`
- `admin`

### Japanese Language Levels

- `N5` (Basic)
- `N4` (Elementary)
- `N3` (Intermediate)
- `N2` (Advanced)
- `N1` (Native-level)

### Employment Types

- `Full-time`
- `Part-time`
- `Contract`
- `Internship`
- `Temporary`

### Application Status

- `pending` (Initial submission)
- `reviewed` (Employer has viewed)
- `shortlisted` (Selected for interview)
- `rejected` (Application declined)
- `accepted` (Offer extended)
- `withdrawn` (Applicant withdrew)

### Industries (Examples)

- `Manufacturing`
- `Nursing Care`
- `Construction`
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
`http://localhost:5000/api-docs`

---

## Additional Resources

- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Postman Guide:** [postman/README.md](./postman/README.md)
- **Developer Guide:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Frontend Integration:** [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)

---

**Last Updated:** January 29, 2026  
**Maintained by:** Team Kaizen MMDC
