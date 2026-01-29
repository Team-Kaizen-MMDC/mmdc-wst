#!/bin/bash

# Cleanup Day 4 test artifacts
# Reads .day4_artifacts.json created by test-day4.sh and attempts to
# withdraw application, delete job, and delete company using saved tokens.

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:5001/api/v1}"
ARTIFACTS_FILE="${ARTIFACTS_FILE:-$(cd "$(dirname "$0")/.." && pwd)/.day4_artifacts.json}"

if [ ! -f "$ARTIFACTS_FILE" ]; then
  echo "Artifacts file not found: $ARTIFACTS_FILE"
  echo "Run the test script first or pass ARTIFACTS_FILE=path to a valid file."
  exit 1
fi

JOBSEEKER_TOKEN=$(jq -r '.jobseeker_token // empty' "$ARTIFACTS_FILE")
EMPLOYER_TOKEN=$(jq -r '.employer_token // empty' "$ARTIFACTS_FILE")
JOBSEEKER_ID=$(jq -r '.jobseeker_id // empty' "$ARTIFACTS_FILE")
EMPLOYER_ID=$(jq -r '.employer_id // empty' "$ARTIFACTS_FILE")
COMPANY_ID=$(jq -r '.company_id // empty' "$ARTIFACTS_FILE")
JOB_ID=$(jq -r '.job_id // empty' "$ARTIFACTS_FILE")
APPLICATION_ID=$(jq -r '.application_id // empty' "$ARTIFACTS_FILE")

echo "Using API_BASE: $API_BASE"

# Helper to call and print short status
call() {
  local method=$1; shift
  local url=$1; shift
  local token=${1:-}
  local data=${2:-}

  if [ -n "$token" ]; then
    auth=( -H "Authorization: Bearer $token" )
  else
    auth=()
  fi

  if [ -n "$data" ]; then
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" "${auth[@]}" -d "$data")
  else
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" "${auth[@]}")
  fi

  body=$(echo "$resp" | sed "$/d" )
  code=$(echo "$resp" | tail -n1)
  echo "[$method] $url -> HTTP $code"
  if [ -n "$body" ]; then
    echo "$body" | jq . || echo "$body"
  fi
  return 0
}

# Withdraw application (jobseeker)
if [ -n "$APPLICATION_ID" ] && [ "$APPLICATION_ID" != "null" ]; then
  if [ -z "$JOBSEEKER_TOKEN" ]; then
    echo "No jobseeker token available; skipping application withdraw"
  else
    echo "Withdrawing application: $APPLICATION_ID"
    call PUT "$API_BASE/applications/$APPLICATION_ID/withdraw" "$JOBSEEKER_TOKEN"
  fi
fi

# Delete job (employer)
if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  if [ -z "$EMPLOYER_TOKEN" ]; then
    echo "No employer token available; skipping job delete"
  else
    echo "Deleting job: $JOB_ID"
    call DELETE "$API_BASE/jobs/$JOB_ID" "$EMPLOYER_TOKEN"
  fi
fi

# Delete company (owner)
if [ -n "$COMPANY_ID" ] && [ "$COMPANY_ID" != "null" ]; then
  if [ -z "$EMPLOYER_TOKEN" ]; then
    echo "No employer token available; skipping company delete"
  else
    echo "Deleting company: $COMPANY_ID"
    call DELETE "$API_BASE/companies/$COMPANY_ID" "$EMPLOYER_TOKEN"
  fi
fi

# Note: user deletion is admin-only; we do not attempt to delete users here.

echo "Cleanup complete (non-admin actions)." 
