#!/usr/bin/env bash
set -euo pipefail

BUCKET="japanssw-s3-84cafb59"
PAGE_SIZE=1000

command -v jq >/dev/null || { echo "jq is required; install it and retry"; exit 1; }

echo "Emptying versioned bucket: $BUCKET"

STARTING_TOKEN=""

while :; do
  if [ -z "$STARTING_TOKEN" ]; then
    RESP_JSON=$(aws s3api list-object-versions --bucket "$BUCKET" --max-items "$PAGE_SIZE" --output json)
  else
    RESP_JSON=$(aws s3api list-object-versions --bucket "$BUCKET" --max-items "$PAGE_SIZE" --starting-token "$STARTING_TOKEN" --output json)
  fi

  # Build delete payload with Versions + DeleteMarkers (may be empty array)
  echo "$RESP_JSON" | jq -c '{
    Objects: ( ([.Versions[]? | {Key:.Key, VersionId:.VersionId}] + [.DeleteMarkers[]? | {Key:.Key, VersionId:.VersionId}]) )
  }' > todelete.json

  COUNT=$(jq '.Objects | length' todelete.json)
  if [ "$COUNT" -gt 0 ]; then
    echo "Deleting $COUNT items..."
    aws s3api delete-objects --bucket "$BUCKET" --delete file://todelete.json >/dev/null
  else
    echo "No objects/delete-markers in this page."
  fi

  # Get next token (if any) for pagination
  STARTING_TOKEN=$(echo "$RESP_JSON" | jq -r '.NextToken // empty')
  if [ -z "$STARTING_TOKEN" ]; then
    echo "No more pages."
    break
  fi
done

# final safety check: ensure bucket is empty
echo "Final check: listing remaining object versions..."
aws s3api list-object-versions --bucket "$BUCKET" --output json | jq '.Versions, .DeleteMarkers'
echo "Done."