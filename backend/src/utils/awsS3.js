/**
 * AWS S3 Client Configuration with IAM Role Support
 *
 * DEPLOYMENT SCENARIOS:
 *
 * 1. Local Development:
 *    - Uses AWS CLI credentials (~/.aws/credentials) via fromNodeProviderChain
 *    - If AWS_ROLE_ARN is set, those credentials are used to assume the role
 *
 * 2. AWS Deployment (EC2, ECS, Lambda):
 *    - Uses the attached instance/task/execution role automatically
 *    - AWS_ROLE_ARN can optionally be set to cross-account assume a role
 *
 * 3. Railway (or any non-AWS host):
 *    - Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY of the Railway IAM user
 *      (created by: terraform apply -var="create_railway_user=true")
 *    - Set AWS_ROLE_ARN to the S3 access role ARN
 *    - The code uses fromTemporaryCredentials to explicitly call sts:AssumeRole
 *      using the IAM user keys, then uses the resulting temp credentials for S3
 */

const { S3Client } = require("@aws-sdk/client-s3");
const {
  fromNodeProviderChain,
  fromTemporaryCredentials,
} = require("@aws-sdk/credential-providers");

const AWS_REGION        = process.env.AWS_REGION        || "ap-northeast-1";
const AWS_ROLE_ARN      = process.env.AWS_ROLE_ARN;
const RESUME_S3_BUCKET  = process.env.RESUME_S3_BUCKET  || "japanssw-s3-84cafb59";

function createS3Client() {
  let credentials;

  if (AWS_ROLE_ARN) {
    // Explicitly assume the role using whatever base credentials are available
    // (env vars on Railway, instance profile on EC2, CLI creds locally).
    // fromNodeProviderChain({ roleArn }) only does profile-file role chaining —
    // fromTemporaryCredentials is required for programmatic STS AssumeRole.
    credentials = fromTemporaryCredentials({
      masterCredentials: fromNodeProviderChain(),
      params: {
        RoleArn:         AWS_ROLE_ARN,
        RoleSessionName: "japanssw-backend-session",
        DurationSeconds: 3600,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[awsS3] Using role assumption: ${AWS_ROLE_ARN}`);
  } else {
    // No role — use chain directly (works on EC2/ECS with attached role, or with env key creds)
    credentials = fromNodeProviderChain();
    // eslint-disable-next-line no-console
    console.log("[awsS3] Using default credential provider chain (no role assumption)");
  }

  return new S3Client({ region: AWS_REGION, credentials });
}

// Create and export a singleton S3 client instance
const s3Client = createS3Client();

if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_ROLE_ARN) {
  // eslint-disable-next-line no-console
  console.warn(
    "[awsS3] WARNING: Neither AWS_ACCESS_KEY_ID nor AWS_ROLE_ARN is set. " +
    "S3 operations will fail on non-AWS hosts (e.g. Railway). " +
    "Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_ROLE_ARN in Railway env vars."
  );
}

function getS3Client()   { return s3Client; }
function getResumeBucket() { return RESUME_S3_BUCKET; }

module.exports = {
  getS3Client,
  getResumeBucket,
  s3Client,
  S3_BUCKET: RESUME_S3_BUCKET,
};
