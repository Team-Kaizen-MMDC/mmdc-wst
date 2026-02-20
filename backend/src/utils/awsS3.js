/**
 * AWS S3 Client Configuration with IAM Role Support
 *
 * This module configures the AWS SDK v3 S3 client to use IAM role assumption
 * instead of IAM user access keys, following AWS security best practices.
 *
 * DEPLOYMENT SCENARIOS:
 *
 * 1. Local Development:
 *    - Uses AWS CLI credentials configured with `aws configure`
 *    - Or uses AWS_PROFILE environment variable
 *    - Or assumes a role if AWS_ROLE_ARN is provided
 *
 * 2. AWS Deployment (EC2, ECS, Lambda, etc.):
 *    - Automatically uses the IAM role attached to the compute resource
 *    - No explicit credentials needed
 *
 * REQUIRED IAM ROLE PERMISSIONS:
 * The IAM role must have a policy allowing:
 * - s3:PutObject
 * - s3:GetObject
 * - s3:DeleteObject
 * on the bucket specified in RESUME_S3_BUCKET
 */

const { S3Client } = require("@aws-sdk/client-s3");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");

// Environment configuration
const AWS_REGION = process.env.AWS_REGION || "ap-northeast-1";
const AWS_ROLE_ARN = process.env.AWS_ROLE_ARN; // Optional: for explicit role assumption
const RESUME_S3_BUCKET = process.env.RESUME_S3_BUCKET || "japanssw-s3-84cafb59";

/**
 * Create S3 Client with IAM Role Support
 *
 * The credential provider chain automatically tries (in order):
 * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) - NOT RECOMMENDED
 * 2. Shared credentials file (~/.aws/credentials) - for local development
 * 3. ECS container credentials - if running on ECS
 * 4. EC2 instance metadata - if running on EC2
 * 5. Assumes role if AWS_ROLE_ARN is provided
 *
 * @returns {S3Client} Configured S3 client instance
 */
function createS3Client() {
  const clientConfig = {
    region: AWS_REGION,
  };

  // Use default credential provider chain (supports IAM roles automatically)
  // This will use:
  // - Instance profile/execution role when deployed on AWS
  // - AWS CLI credentials or AWS_PROFILE for local development
  // - Environment variables as a fallback (not recommended for production)
  clientConfig.credentials = fromNodeProviderChain({
    // Optional: specify a role to assume for local development
    roleArn: AWS_ROLE_ARN,
    // Session name for CloudTrail logging
    roleSessionName: "japanssw-backend-session",
  });

  return new S3Client(clientConfig);
}

// Create and export a singleton S3 client instance
const s3Client = createS3Client();

/**
 * Get S3 Client Instance
 *
 * @returns {S3Client} Configured S3 client
 */
function getS3Client() {
  return s3Client;
}

/**
 * Get S3 Bucket Name
 *
 * @returns {string} S3 bucket name for resume storage
 */
function getResumeBucket() {
  return RESUME_S3_BUCKET;
}

module.exports = {
  getS3Client,
  getResumeBucket,
  s3Client, // Export for backward compatibility
  S3_BUCKET: RESUME_S3_BUCKET, // Export for backward compatibility
};
