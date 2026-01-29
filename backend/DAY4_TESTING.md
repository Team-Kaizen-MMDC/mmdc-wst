# Day 4 Testing Guide — Job Applications & Employer Features

**Date:** January 29, 2026  
**Status:** Testing Complete Application Workflow

---

## Overview

This guide provides comprehensive testing for Day 4 features:

- Job Applications (Apply, View, Withdraw)
- Employer Application Management (View, Update Status, Add Notes)
- User Management (Admin endpoints)
- Role-based Authorization

---

## Prerequisites

1. **Backend server running:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Test data available:**
   - At least 1 jobseeker user
   - At least 1 employer user
   - At least 1 admin user (optional)
   - At least 1 company
   - At least 1 active job

3. **Get JWT tokens for testing:**
   - Jobseeker token
   - Employer token
   - Admin token (optional)

---

## Test Suite

### 1. Application Endpoints (Jobseeker)

#### 1.1 Apply to Job

**Endpoint:** `POST /api/v1/jobs/:jobId/apply`  
**Auth:** Jobseeker token required

```bash
# Get a job ID first
curl -X GET http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json"

# Apply to job
curl -X POST http://localhost:5000/api/v1/jobs/YOUR_JOB_ID/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN" \
  -d '{
    "coverLetter": "I am very interested in this position and believe my skills would be a great fit. I have experience in manufacturing and have completed my Japanese N3 certification.",
    "resumePath": "/uploads/resumes/john-doe-resume.pdf"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Application submitted successfully",
  "data": {
    "_id": "67...",
    "applicant": "67...",
    "job": "67...",
    "status": "submitted",
    "coverLetter": "I am very interested...",
    "createdAt": "2026-01-29T..."
  }
}
```

**Test Cases:**

- ✅ Apply with cover letter
- ✅ Apply without cover letter (optional)
- ❌ Apply to non-existent job (404)
- ❌ Apply to same job twice (400)
- ❌ Apply to inactive/closed job (400)
- ❌ Apply without authentication (401)

---

#### 1.2 Get My Applications

**Endpoint:** `GET /api/v1/applications/me`  
**Auth:** Jobseeker token required

```bash
# Get all applications
curl -X GET http://localhost:5000/api/v1/applications/me \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/applications/me?status=submitted" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"

# Pagination
curl -X GET "http://localhost:5000/api/v1/applications/me?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "_id": "67...",
        "job": {
          "title": "Manufacturing Engineer",
          "company": { "name": "Tech Corp" }
        },
        "status": "submitted",
        "createdAt": "2026-01-29T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

#### 1.3 Get Single Application

**Endpoint:** `GET /api/v1/applications/:id`  
**Auth:** Applicant or Employer token required

```bash
curl -X GET http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"
```

**Test Cases:**

- ✅ Jobseeker can view own application
- ✅ Employer can view application for their job
- ❌ Jobseeker cannot view other's application (403)
- ❌ Employer cannot view application for other company's job (403)
- ❌ Get non-existent application (404)

---

#### 1.4 Withdraw Application

**Endpoint:** `PUT /api/v1/applications/:id/withdraw`  
**Auth:** Applicant token required

```bash
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID/withdraw \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application withdrawn successfully",
  "data": {
    "_id": "67...",
    "status": "withdrawn",
    "updatedAt": "2026-01-29T..."
  }
}
```

**Test Cases:**

- ✅ Withdraw own application (submitted/reviewing status)
- ❌ Withdraw application that's already accepted (400)
- ❌ Withdraw another user's application (403)
- ❌ Withdraw already withdrawn application (400)

---

### 2. Application Management (Employer)

#### 2.1 Get Job Applications

**Endpoint:** `GET /api/v1/jobs/:jobId/applications`  
**Auth:** Employer/Admin token required

```bash
# Get all applications for a job
curl -X GET http://localhost:5000/api/v1/jobs/YOUR_JOB_ID/applications \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/jobs/YOUR_JOB_ID/applications?status=submitted" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Job applications retrieved successfully",
  "data": {
    "applications": [
      {
        "_id": "67...",
        "applicant": {
          "email": "jobseeker@example.com",
          "profile": {
            "firstName": "John",
            "lastName": "Doe",
            "nationality": "Philippines",
            "japaneseLevel": "N3"
          }
        },
        "status": "submitted",
        "coverLetter": "I am very interested...",
        "createdAt": "2026-01-29T..."
      }
    ],
    "statusSummary": [
      { "_id": "submitted", "count": 3 },
      { "_id": "reviewing", "count": 2 }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Test Cases:**

- ✅ Employer views applications for own job
- ❌ Employer cannot view applications for other company's job (403)
- ❌ Jobseeker cannot view job applications (403)

---

#### 2.2 Update Application Status

**Endpoint:** `PUT /api/v1/applications/:id/status`  
**Auth:** Employer/Admin token required

```bash
# Update to reviewing
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "status": "reviewing"
  }'

# Update to interview with details
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "status": "interview",
    "interview": {
      "date": "2026-02-15T10:00:00Z",
      "location": "Tokyo Office, 3F Meeting Room",
      "notes": "Please bring portfolio and ID"
    }
  }'

# Update to rejected with reason
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "status": "rejected",
    "notes": "Thank you for applying. We have selected other candidates."
  }'
```

**Status Flow:**

- submitted → reviewing → interview → offer → accepted
- Any status → rejected
- Any status (before offer) → withdrawn (by jobseeker)

**Test Cases:**

- ✅ Employer updates status (submitted → reviewing)
- ✅ Employer updates to interview with details
- ✅ Employer updates to rejected with reason
- ✅ Employer updates to offer
- ❌ Invalid status (400)
- ❌ Employer cannot update application for other company's job (403)
- ❌ Jobseeker cannot update application status (403)

---

#### 2.3 Add Employer Notes

**Endpoint:** `PUT /api/v1/applications/:id/notes`  
**Auth:** Employer/Admin token required

```bash
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APPLICATION_ID/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "notes": "Strong candidate. Good communication skills during phone screening. Recommended for in-person interview."
  }'
```

**Test Cases:**

- ✅ Employer adds notes to application
- ✅ Employer updates existing notes
- ❌ Jobseeker cannot add employer notes (403)
- ❌ Employer cannot add notes to other company's application (403)

---

### 3. User Management (Admin)

#### 3.1 Get All Users

**Endpoint:** `GET /api/v1/users`  
**Auth:** Admin token required

```bash
# Get all users
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by role
curl -X GET "http://localhost:5000/api/v1/users?role=jobseeker" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Search by email
curl -X GET "http://localhost:5000/api/v1/users?search=test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by active status
curl -X GET "http://localhost:5000/api/v1/users?isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Test Cases:**

- ✅ Admin gets all users
- ✅ Filter by role (jobseeker, employer, admin)
- ✅ Search by email
- ✅ Pagination works
- ❌ Non-admin cannot access (403)

---

#### 3.2 Get Single User

**Endpoint:** `GET /api/v1/users/:id`  
**Auth:** Self or Admin token required

```bash
curl -X GET http://localhost:5000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Cases:**

- ✅ User can view own profile
- ✅ Admin can view any user
- ❌ User cannot view other user's profile (403)

---

#### 3.3 Update User

**Endpoint:** `PUT /api/v1/users/:id`  
**Auth:** Self or Admin token required

```bash
# User updates own email
curl -X PUT http://localhost:5000/api/v1/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "newemail@example.com"
  }'

# Admin updates user role
curl -X PUT http://localhost:5000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "employer",
    "company": "COMPANY_ID"
  }'

# Admin deactivates user
curl -X PUT http://localhost:5000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "isActive": false
  }'
```

**Test Cases:**

- ✅ User updates own email
- ✅ Admin updates user role
- ✅ Admin updates company assignment
- ✅ Admin deactivates user
- ❌ User cannot update role (403)
- ❌ User cannot update other user (403)
- ❌ Duplicate email (400)

---

#### 3.4 Delete User (Soft Delete)

**Endpoint:** `DELETE /api/v1/users/:id`  
**Auth:** Admin token required

```bash
curl -X DELETE http://localhost:5000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Test Cases:**

- ✅ Admin soft deletes user (sets isActive: false)
- ✅ Associated profile also soft deleted
- ❌ Non-admin cannot delete (403)

---

#### 3.5 Update Password

**Endpoint:** `PUT /api/v1/users/update-password`  
**Auth:** User token required

```bash
curl -X PUT http://localhost:5000/api/v1/users/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }'
```

**Test Cases:**

- ✅ Update password with correct current password
- ✅ New JWT token returned
- ❌ Wrong current password (401)
- ❌ New password too short (400)
- ❌ Missing required fields (400)

---

## Complete Workflow Test

### Scenario: End-to-End Application Process

1. **Jobseeker applies to job:**

   ```bash
   curl -X POST http://localhost:5000/api/v1/jobs/JOB_ID/apply \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer JOBSEEKER_TOKEN" \
     -d '{"coverLetter": "I am interested in this position..."}'
   ```

   - Status: `submitted`

2. **Jobseeker views their applications:**

   ```bash
   curl -X GET http://localhost:5000/api/v1/applications/me \
     -H "Authorization: Bearer JOBSEEKER_TOKEN"
   ```

   - Should see 1 application with status `submitted`

3. **Employer views applications for their job:**

   ```bash
   curl -X GET http://localhost:5000/api/v1/jobs/JOB_ID/applications \
     -H "Authorization: Bearer EMPLOYER_TOKEN"
   ```

   - Should see the application with jobseeker's profile info

4. **Employer updates status to reviewing:**

   ```bash
   curl -X PUT http://localhost:5000/api/v1/applications/APP_ID/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer EMPLOYER_TOKEN" \
     -d '{"status": "reviewing"}'
   ```

   - Status: `reviewing`

5. **Employer adds notes:**

   ```bash
   curl -X PUT http://localhost:5000/api/v1/applications/APP_ID/notes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer EMPLOYER_TOKEN" \
     -d '{"notes": "Good candidate, schedule interview"}'
   ```

6. **Employer schedules interview:**

   ```bash
   curl -X PUT http://localhost:5000/api/v1/applications/APP_ID/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer EMPLOYER_TOKEN" \
     -d '{
       "status": "interview",
       "interview": {
         "date": "2026-02-15T10:00:00Z",
         "location": "Tokyo Office",
         "notes": "Bring portfolio"
       }
     }'
   ```

   - Status: `interview`

7. **Jobseeker checks application status:**

   ```bash
   curl -X GET http://localhost:5000/api/v1/applications/APP_ID \
     -H "Authorization: Bearer JOBSEEKER_TOKEN"
   ```

   - Should see status `interview` with interview details
   - Should NOT see employer notes

8. **Employer makes offer:**

   ```bash
   curl -X PUT http://localhost:5000/api/v1/applications/APP_ID/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer EMPLOYER_TOKEN" \
     -d '{"status": "offer"}'
   ```

   - Status: `offer`

9. **Employer marks as accepted:**
   ```bash
   curl -X PUT http://localhost:5000/api/v1/applications/APP_ID/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer EMPLOYER_TOKEN" \
     -d '{"status": "accepted"}'
   ```

   - Status: `accepted`

---

## Authorization Testing

### Test Case Matrix

| Endpoint                       | Jobseeker | Employer  | Admin |
| ------------------------------ | --------- | --------- | ----- |
| POST /jobs/:id/apply           | ✅        | ❌        | ❌    |
| GET /applications/me           | ✅        | ✅        | ✅    |
| GET /applications/:id          | ✅ (own)  | ✅ (job)  | ✅    |
| PUT /applications/:id/withdraw | ✅ (own)  | ❌        | ❌    |
| GET /jobs/:id/applications     | ❌        | ✅ (own)  | ✅    |
| PUT /applications/:id/status   | ❌        | ✅ (own)  | ✅    |
| PUT /applications/:id/notes    | ❌        | ✅ (own)  | ✅    |
| GET /users                     | ❌        | ❌        | ✅    |
| GET /users/:id                 | ✅ (self) | ✅ (self) | ✅    |
| PUT /users/:id                 | ✅ (self) | ✅ (self) | ✅    |
| DELETE /users/:id              | ❌        | ❌        | ✅    |
| PUT /users/update-password     | ✅        | ✅        | ✅    |

---

## Quick Test Script

Save this as `test-day4.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:5000/api/v1"
JOBSEEKER_TOKEN="YOUR_JOBSEEKER_TOKEN"
EMPLOYER_TOKEN="YOUR_EMPLOYER_TOKEN"
JOB_ID="YOUR_JOB_ID"

echo "🧪 Testing Day 4 - Application Workflow"
echo "========================================"

# Test 1: Apply to job
echo -e "\n${GREEN}Test 1: Apply to job${NC}"
APPLY_RESPONSE=$(curl -s -X POST "$API_BASE/jobs/$JOB_ID/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN" \
  -d '{"coverLetter": "Test application"}')

echo $APPLY_RESPONSE | jq .

APP_ID=$(echo $APPLY_RESPONSE | jq -r '.data._id')
echo "Application ID: $APP_ID"

# Test 2: Get my applications
echo -e "\n${GREEN}Test 2: Get my applications${NC}"
curl -s -X GET "$API_BASE/applications/me" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN" | jq .

# Test 3: Employer views applications
echo -e "\n${GREEN}Test 3: Employer views applications${NC}"
curl -s -X GET "$API_BASE/jobs/$JOB_ID/applications" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" | jq .

# Test 4: Employer updates status
echo -e "\n${GREEN}Test 4: Employer updates status to reviewing${NC}"
curl -s -X PUT "$API_BASE/applications/$APP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"status": "reviewing"}' | jq .

# Test 5: Employer adds notes
echo -e "\n${GREEN}Test 5: Employer adds notes${NC}"
curl -s -X PUT "$API_BASE/applications/$APP_ID/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"notes": "Good candidate"}' | jq .

echo -e "\n${GREEN}✅ All tests completed!${NC}"
```

---

## Expected Database State After Tests

### Applications Collection

```javascript
{
  "_id": ObjectId("..."),
  "applicant": ObjectId("..."), // jobseeker user
  "job": ObjectId("..."), // job reference
  "status": "reviewing",
  "coverLetter": "I am very interested...",
  "resumePath": "/uploads/resumes/...",
  "statusHistory": [
    {
      "status": "submitted",
      "changedBy": ObjectId("..."),
      "date": "2026-01-29T...",
      "_id": ObjectId("...")
    },
    {
      "status": "reviewing",
      "changedBy": ObjectId("..."), // employer
      "date": "2026-01-29T...",
      "_id": ObjectId("...")
    }
  ],
  "employerNotes": "Good candidate",
  "createdAt": "2026-01-29T...",
  "updatedAt": "2026-01-29T..."
}
```

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized:**
   - Check JWT token is valid and not expired
   - Verify Authorization header format: `Bearer YOUR_TOKEN`

2. **403 Forbidden:**
   - Check user role has permission for endpoint
   - Verify employer owns the company that posted the job
   - Verify jobseeker owns the application

3. **404 Not Found:**
   - Verify job ID exists and is active
   - Verify application ID exists
   - Check ObjectId format is valid

4. **400 Bad Request:**
   - Check required fields are provided
   - Verify field types match schema
   - Check for duplicate applications

---

## Success Criteria

Day 4 is complete when:

- ✅ Jobseeker can apply to jobs
- ✅ Jobseeker can view their applications
- ✅ Jobseeker can withdraw applications
- ✅ Employer can view applications for their jobs
- ✅ Employer can update application status
- ✅ Employer can add private notes
- ✅ Admin can manage users
- ✅ Users can update their password
- ✅ Role-based authorization enforced
- ✅ Ownership checks working (employers can only manage their company's applications)

---

## Next Steps (Day 5)

- Create comprehensive seed script
- Test with large dataset
- Create Postman collection
- Document all endpoints
- Prepare for frontend integration

---

**Document Version:** 1.0  
**Created:** January 29, 2026  
**Last Updated:** January 29, 2026
