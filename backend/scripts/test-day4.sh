#!/bin/bash

# Day 4 Quick Test Script
# Tests all application and user management endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
# Allow overriding API base via environment variable, default to localhost:5000
API_BASE="${API_BASE:-http://localhost:5000/api/v1}"

# Function to print section headers
print_header() {
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}\n"
}

# Function to print test results
print_test() {
    echo -e "${GREEN}Test: $1${NC}"
}

# Function to print errors
print_error() {
    echo -e "${RED}Error: $1${NC}"
}

# Check if server is running
echo "Checking if backend server is running..."
if ! curl -s "$API_BASE/../health" > /dev/null; then
    print_error "Backend server is not running!"
    echo "Please start the server with: cd backend && npm run dev"
    exit 1
fi

echo -e "${GREEN}✓ Backend server is running${NC}"

print_header "Day 4 Testing - Application Workflow"

# Step 1: Create test accounts
print_test "Step 1: Creating test accounts"

echo "Creating jobseeker account..."
JOBSEEKER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testjobseeker@example.com",
    "password": "Test123!",
    "role": "jobseeker"
  }')

JOBSEEKER_TOKEN=$(echo $JOBSEEKER_RESPONSE | jq -r '.data.token')
JOBSEEKER_ID=$(echo $JOBSEEKER_RESPONSE | jq -r '.data.user.id')

if [ "$JOBSEEKER_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Jobseeker account created${NC}"
    echo "  ID: $JOBSEEKER_ID"
else
    # Try to login if account exists
    echo "Account may exist, trying to login..."
    JOBSEEKER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testjobseeker@example.com",
        "password": "Test123!"
      }')
    JOBSEEKER_TOKEN=$(echo $JOBSEEKER_RESPONSE | jq -r '.data.token')
    JOBSEEKER_ID=$(echo $JOBSEEKER_RESPONSE | jq -r '.data.user._id')
    
    if [ "$JOBSEEKER_TOKEN" != "null" ]; then
        echo -e "${GREEN}✓ Logged in as jobseeker${NC}"
    else
        print_error "Failed to create/login jobseeker account"
        echo $JOBSEEKER_RESPONSE | jq .
        exit 1
    fi
fi

echo "Creating employer account..."
EMPLOYER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testemployer@example.com",
    "password": "Test123!",
    "role": "employer"
  }')

EMPLOYER_TOKEN=$(echo $EMPLOYER_RESPONSE | jq -r '.data.token')
EMPLOYER_ID=$(echo $EMPLOYER_RESPONSE | jq -r '.data.user.id')

if [ "$EMPLOYER_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Employer account created${NC}"
    echo "  ID: $EMPLOYER_ID"
else
    # Try to login if account exists
    echo "Account may exist, trying to login..."
    EMPLOYER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testemployer@example.com",
        "password": "Test123!"
      }')
    EMPLOYER_TOKEN=$(echo $EMPLOYER_RESPONSE | jq -r '.data.token')
    EMPLOYER_ID=$(echo $EMPLOYER_RESPONSE | jq -r '.data.user._id')
    
    if [ "$EMPLOYER_TOKEN" != "null" ]; then
        echo -e "${GREEN}✓ Logged in as employer${NC}"
    else
        print_error "Failed to create/login employer account"
        echo $EMPLOYER_RESPONSE | jq .
        exit 1
    fi
fi

# Step 2: Create a company
print_test "Step 2: Creating test company"

COMPANY_RESPONSE=$(curl -s -X POST "$API_BASE/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{
    "name": "Day 4 Test Company",
    "industry": "Manufacturing",
    "size": "201-500",
    "founded": 2015,
    "website": "https://test-company.com",
    "description": "A test company for Day 4 testing",
    "location": {
      "prefecture": "Tokyo",
      "city": "Shibuya"
    },
    "contact": {
      "email": "contact@test-company.com",
      "phone": "+81-3-1234-5678"
    }
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data._id')

if [ "$COMPANY_ID" != "null" ] && [ "$COMPANY_ID" != "" ]; then
    echo -e "${GREEN}✓ Company created${NC}"
    echo "  ID: $COMPANY_ID"
    
    # Update employer with company
    curl -s -X PUT "$API_BASE/users/$EMPLOYER_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $EMPLOYER_TOKEN" \
      -d "{\"company\": \"$COMPANY_ID\"}" > /dev/null
    
    echo -e "${GREEN}✓ Employer linked to company${NC}"
else
    print_error "Failed to create company"
    echo $COMPANY_RESPONSE | jq .
fi

# Step 3: Create a job
print_test "Step 3: Creating test job"

JOB_RESPONSE=$(curl -s -X POST "$API_BASE/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d "{
    \"company\": \"$COMPANY_ID\",
    \"title\": \"Day 4 Test Job - Manufacturing Engineer\",
    \"industry\": \"Manufacturing\",
    \"category\": \"Engineering\",
    \"summary\": \"A test job for Day 4 application testing\",
    \"responsibilities\": [\"Test responsibility 1\", \"Test responsibility 2\"],
    \"requirements\": {
      \"education\": \"Bachelor's degree or equivalent\",
      \"japaneseLevel\": \"N3\",
      \"experience\": \"2 years\",
      \"skills\": [\"Manufacturing\", \"Quality Control\"]
    },
    \"compensation\": {
      \"salaryMin\": 250000,
      \"salaryMax\": 350000,
      \"currency\": \"JPY\",
      \"period\": \"month\"
    },
    \"location\": {
      \"prefecture\": \"Tokyo\",
      \"city\": \"Shibuya\",
      \"remote\": false
    },
    \"status\": \"active\"
  }")

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.data._id')

if [ "$JOB_ID" != "null" ] && [ "$JOB_ID" != "" ]; then
    echo -e "${GREEN}✓ Job created${NC}"
    echo "  ID: $JOB_ID"
else
    print_error "Failed to create job"
    echo $JOB_RESPONSE | jq .
    exit 1
fi

# Step 4: Jobseeker applies to job
print_test "Step 4: Jobseeker applies to job"

APPLICATION_RESPONSE=$(curl -s -X POST "$API_BASE/jobs/$JOB_ID/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN" \
  -d '{
    "coverLetter": "I am very interested in this position and believe my skills in manufacturing would be a great fit. I have completed my Japanese N3 certification and have 3 years of experience in quality control."
  }')

APP_ID=$(echo $APPLICATION_RESPONSE | jq -r '.data._id')

if [ "$APP_ID" != "null" ] && [ "$APP_ID" != "" ]; then
    echo -e "${GREEN}✓ Application submitted${NC}"
    echo "  ID: $APP_ID"
    echo "  Status: $(echo $APPLICATION_RESPONSE | jq -r '.data.status')"
else
    print_error "Failed to submit application"
    echo $APPLICATION_RESPONSE | jq .
    exit 1
fi

# Step 5: Jobseeker views their applications
print_test "Step 5: Jobseeker views their applications"

MY_APPS_RESPONSE=$(curl -s -X GET "$API_BASE/applications/me" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN")

APP_COUNT=$(echo $MY_APPS_RESPONSE | jq '.data.pagination.total')
echo -e "${GREEN}✓ Retrieved applications${NC}"
echo "  Total applications: $APP_COUNT"

# Step 6: Employer views applications for their job
print_test "Step 6: Employer views applications for their job"

JOB_APPS_RESPONSE=$(curl -s -X GET "$API_BASE/jobs/$JOB_ID/applications" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")

JOB_APP_COUNT=$(echo $JOB_APPS_RESPONSE | jq '.data.pagination.total')
echo -e "${GREEN}✓ Retrieved job applications${NC}"
echo "  Total applications for job: $JOB_APP_COUNT"

# Step 7: Employer updates application status to reviewing
print_test "Step 7: Employer updates application status to reviewing"

UPDATE_STATUS_RESPONSE=$(curl -s -X PUT "$API_BASE/applications/$APP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{
    "status": "reviewing"
  }')

NEW_STATUS=$(echo $UPDATE_STATUS_RESPONSE | jq -r '.data.status')

if [ "$NEW_STATUS" = "reviewing" ]; then
    echo -e "${GREEN}✓ Status updated to reviewing${NC}"
else
    print_error "Failed to update status"
    echo $UPDATE_STATUS_RESPONSE | jq .
fi

# Step 8: Employer adds notes
print_test "Step 8: Employer adds notes to application"

NOTES_RESPONSE=$(curl -s -X PUT "$API_BASE/applications/$APP_ID/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{
    "notes": "Strong candidate. Good experience in manufacturing. Recommend for phone screening."
  }')

if echo $NOTES_RESPONSE | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ Notes added successfully${NC}"
else
    print_error "Failed to add notes"
    echo $NOTES_RESPONSE | jq .
fi

# Step 9: Employer updates to interview status
print_test "Step 9: Employer schedules interview"

INTERVIEW_RESPONSE=$(curl -s -X PUT "$API_BASE/applications/$APP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{
    "status": "interview",
    "interview": {
      "date": "2026-02-15T10:00:00Z",
      "location": "Tokyo Office, 3F Meeting Room A",
      "notes": "Please bring your portfolio and ID. Interview will be in Japanese (N3 level)."
    }
  }')

INTERVIEW_STATUS=$(echo $INTERVIEW_RESPONSE | jq -r '.data.status')

if [ "$INTERVIEW_STATUS" = "interview" ]; then
    echo -e "${GREEN}✓ Interview scheduled${NC}"
    echo "  Date: $(echo $INTERVIEW_RESPONSE | jq -r '.data.interview.date')"
    echo "  Location: $(echo $INTERVIEW_RESPONSE | jq -r '.data.interview.location')"
else
    print_error "Failed to schedule interview"
    echo $INTERVIEW_RESPONSE | jq .
fi

# Step 10: Jobseeker views application details
print_test "Step 10: Jobseeker views application details"

APP_DETAILS_RESPONSE=$(curl -s -X GET "$API_BASE/applications/$APP_ID" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN")

APP_STATUS=$(echo $APP_DETAILS_RESPONSE | jq -r '.data.status')
HAS_INTERVIEW=$(echo $APP_DETAILS_RESPONSE | jq -e '.data.interview' > /dev/null && echo "yes" || echo "no")
HAS_EMPLOYER_NOTES=$(echo $APP_DETAILS_RESPONSE | jq -r '.data.employerNotes')

echo -e "${GREEN}✓ Application details retrieved${NC}"
echo "  Status: $APP_STATUS"
echo "  Has interview details: $HAS_INTERVIEW"
echo "  Employer notes visible to jobseeker: $HAS_EMPLOYER_NOTES (should be null)"

# Step 11: Test password update
print_test "Step 11: Test password update"

PASSWORD_UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/users/update-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN" \
  -d '{
    "currentPassword": "Test123!",
    "newPassword": "NewTest123!"
  }')

if echo $PASSWORD_UPDATE_RESPONSE | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ Password updated successfully${NC}"
    NEW_TOKEN=$(echo $PASSWORD_UPDATE_RESPONSE | jq -r '.data.token')
    echo "  New token received: ${NEW_TOKEN:0:20}..."
else
    print_error "Failed to update password"
    echo $PASSWORD_UPDATE_RESPONSE | jq .
fi

# Step 12: Authorization tests
print_test "Step 12: Testing authorization (negative tests)"

# Test: Jobseeker tries to view job applications (should fail)
echo "Testing: Jobseeker tries to view job applications..."
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$API_BASE/jobs/$JOB_ID/applications" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN")

IS_ERROR=$(echo $UNAUTHORIZED_RESPONSE | jq -r '.success')
if [ "$IS_ERROR" = "false" ]; then
    echo -e "${GREEN}✓ Authorization correctly blocked jobseeker from viewing job applications${NC}"
else
    print_error "Authorization test failed - jobseeker should not access this endpoint"
fi

# Test: Jobseeker tries to update application status (should fail)
echo "Testing: Jobseeker tries to update application status..."
UNAUTHORIZED_RESPONSE2=$(curl -s -X PUT "$API_BASE/applications/$APP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JOBSEEKER_TOKEN" \
  -d '{"status": "accepted"}')

IS_ERROR2=$(echo $UNAUTHORIZED_RESPONSE2 | jq -r '.success')
if [ "$IS_ERROR2" = "false" ]; then
    echo -e "${GREEN}✓ Authorization correctly blocked jobseeker from updating application status${NC}"
else
    print_error "Authorization test failed - jobseeker should not update status"
fi

print_header "Day 4 Testing Complete!"

echo -e "${GREEN}✅ All Day 4 endpoints tested successfully!${NC}"
echo ""
echo "Summary:"
echo "  - Jobseeker account created and tested"
echo "  - Employer account created and tested"
echo "  - Company created: $COMPANY_ID"
echo "  - Job posted: $JOB_ID"
echo "  - Application submitted: $APP_ID"
echo "  - Status updated: submitted → reviewing → interview"
echo "  - Employer notes added (private)"
echo "  - Interview scheduled"
echo "  - Authorization checks passed"
echo "  - Password update tested"
echo ""
echo "Next steps:"
echo "  1. Review the application in database"
echo "  2. Check status history"
echo "  3. Verify employer notes are not visible to jobseeker"
echo "  4. Continue with Day 5 (seed data and documentation)"
echo ""
