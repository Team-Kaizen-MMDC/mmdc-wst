# Day 4 Manual Testing Guide

## Quick Start

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Test with curl or Postman:**

### Step 1: Login as Jobseeker

Get an existing jobseeker token or create a new account:

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker1@example.com",
    "password": "Pass123!"
  }'
```

Save the token from response: `JOBSEEKER_TOKEN`

### Step 2: Login as Employer

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer1@example.com",
    "password": "Pass123!"
  }'
```

Save the token from response: `EMPLOYER_TOKEN`

### Step 3: Apply to a Job

First, get a job ID:

```bash
curl -X GET http://localhost:5000/api/v1/jobs
```

Then apply:

```bash
curl -X POST http://localhost:5000/api/v1/jobs/YOUR_JOB_ID/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN" \
  -d '{
    "coverLetter": "I am very interested in this position..."
  }'
```

Save the application ID from response: `APP_ID`

### Step 4: View My Applications (Jobseeker)

```bash
curl -X GET http://localhost:5000/api/v1/applications/me \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN"
```

### Step 5: View Job Applications (Employer)

```bash
curl -X GET http://localhost:5000/api/v1/jobs/YOUR_JOB_ID/applications \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

### Step 6: Update Application Status (Employer)

```bash
# Update to reviewing
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APP_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{"status": "reviewing"}'

# Update to interview
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APP_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "status": "interview",
    "interview": {
      "date": "2026-02-15T10:00:00Z",
      "location": "Tokyo Office",
      "notes": "Bring portfolio"
    }
  }'
```

### Step 7: Add Employer Notes

```bash
curl -X PUT http://localhost:5000/api/v1/applications/YOUR_APP_ID/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{"notes": "Strong candidate. Recommend for interview."}'
```

### Step 8: Update Password

```bash
curl -X PUT http://localhost:5000/api/v1/users/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "Pass123!",
    "newPassword": "NewPass123!"
  }'
```

## Verification Checklist

- [ ] Jobseeker can apply to jobs
- [ ] Jobseeker can view their applications
- [ ] Employer can view applications for their jobs
- [ ] Employer can update application status
- [ ] Employer can add notes (not visible to jobseeker)
- [ ] Authorization works (jobseeker can't access employer endpoints)
- [ ] User can update password

## Day 4 Complete! ✅

All endpoints are implemented and ready for testing.
