#!/usr/bin/env bash

# Smoke check for seeded data
# Verifies basic flows: login, fetch job, jobseeker applications, employer job applications

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:5000/api/v1}"

BASEDIR="$(cd "$(dirname "$0")/.." && pwd)"
ARTIFACTS_FILE="$BASEDIR/.seed_artifacts.json"

if [ ! -f "$ARTIFACTS_FILE" ]; then
  echo "Artifacts file not found: $ARTIFACTS_FILE"
  echo "Run the seeder first: npm run seed"
  exit 2
fi

JOB_ID=$(jq -r .job_id "$ARTIFACTS_FILE")
EMPLOYER_EMAIL=$(jq -r .employer_email "$ARTIFACTS_FILE")
JOBSEEKER_EMAIL=$(jq -r .jobseeker_email "$ARTIFACTS_FILE")

echo "Using API_BASE=$API_BASE"

echo "Logging in employer ($EMPLOYER_EMAIL)..."
EMPLOYER_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\": \"$EMPLOYER_EMAIL\", \"password\": \"Test123!\"}" | jq -r '.data.token // empty')
if [ -z "$EMPLOYER_TOKEN" ]; then
  echo "Failed to login employer. Response:"
  curl -s -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\": \"$EMPLOYER_EMAIL\", \"password\": \"Test123!\"}" | jq .
  exit 3
fi
echo "Employer token acquired"

echo "Logging in jobseeker ($JOBSEEKER_EMAIL)..."
JOBSEEKER_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\": \"$JOBSEEKER_EMAIL\", \"password\": \"Test123!\"}" | jq -r '.data.token // empty')
if [ -z "$JOBSEEKER_TOKEN" ]; then
  echo "Failed to login jobseeker. Response:"
  curl -s -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\": \"$JOBSEEKER_EMAIL\", \"password\": \"Test123!\"}" | jq .
  exit 4
fi
echo "Jobseeker token acquired"

echo "Fetching job $JOB_ID..."
JOB_RESP=$(curl -s -X GET "$API_BASE/jobs/$JOB_ID")
JOB_EXISTS=$(echo "$JOB_RESP" | jq -r '.data._id // .data.job._id // empty')
if [ -z "$JOB_EXISTS" ]; then
  echo "Job not found or unexpected response:"; echo "$JOB_RESP" | jq .; exit 5
fi
echo "Job found: $JOB_EXISTS"

echo "Fetching jobseeker applications..."
MY_APPS=$(curl -s -X GET "$API_BASE/applications/me" -H "Authorization: Bearer $JOBSEEKER_TOKEN")
MY_APPS_TOTAL=$(echo "$MY_APPS" | jq -r '.data.pagination.total // (.data | length) // 0')
echo "Jobseeker has $MY_APPS_TOTAL applications"

echo "Fetching employer view of job applications..."
JOB_APPS=$(curl -s -X GET "$API_BASE/jobs/$JOB_ID/applications" -H "Authorization: Bearer $EMPLOYER_TOKEN")
JOB_APPS_TOTAL=$(echo "$JOB_APPS" | jq -r '.data.pagination.total // (.data | length) // 0')
echo "Employer sees $JOB_APPS_TOTAL applications for job $JOB_ID"

if [ "$MY_APPS_TOTAL" -gt 0 ] && [ "$JOB_APPS_TOTAL" -gt 0 ]; then
  echo "\n✅ Smoke checks passed: seeded data is accessible and key endpoints return expected values."
  exit 0
else
  echo "\n❌ Smoke check failed: expected at least 1 application in both jobseeker and employer views."
  echo "Jobseeker response:"; echo "$MY_APPS" | jq .
  echo "Employer response:"; echo "$JOB_APPS" | jq .
  exit 6
fi
