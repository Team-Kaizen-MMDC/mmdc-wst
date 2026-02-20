#!/usr/bin/env node

/**
 * AWS S3 Configuration Verification Script
 *
 * This script verifies that your AWS configuration is correct for the
 * resume upload functionality.
 *
 * Usage:
 *   node verify-aws-config.js
 */

require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {
  STSClient,
  GetCallerIdentityCommand,
  AssumeRoleCommand,
} = require("@aws-sdk/client-sts");
const { getS3Client, getResumeBucket } = require("./src/utils/awsS3");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

async function verifyConfiguration() {
  log("\n📋 AWS S3 Resume Upload Configuration Verification\n", colors.blue);

  let allChecksPass = true;

  // 1. Check environment variables
  logInfo("Step 1: Checking environment variables...");

  const requiredVars = ["AWS_REGION", "RESUME_S3_BUCKET"];
  const optionalVars = ["AWS_ROLE_ARN", "AWS_PROFILE"];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} = ${process.env[varName]}`);
    } else {
      logError(`${varName} is not set in .env`);
      allChecksPass = false;
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logInfo(`${varName} = ${process.env[varName]}`);
    } else {
      logWarning(`${varName} is not set (optional for local dev)`);
    }
  }

  // Warn if access keys are present
  if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY) {
    logWarning("AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY detected in .env");
    logWarning("Consider using IAM roles instead for better security");
  }

  console.log("");

  // 2. Check AWS CLI configuration
  logInfo("Step 2: Checking AWS CLI configuration...");

  try {
    const { execSync } = require("child_process");
    const awsVersion = execSync("aws --version", { encoding: "utf8" }).trim();
    logSuccess(`AWS CLI installed: ${awsVersion}`);

    try {
      const awsProfile = execSync("aws configure list", { encoding: "utf8" });
      logSuccess("AWS CLI is configured");
      console.log(awsProfile);
    } catch (err) {
      logWarning("AWS CLI may not be properly configured");
      logWarning("Run: aws configure");
    }
  } catch (err) {
    logWarning("AWS CLI not found. Install: brew install awscli");
    logWarning("AWS CLI is needed for local development with IAM roles");
  }

  console.log("");

  // 3. Check AWS credentials and identity
  logInfo("Step 3: Checking AWS credentials and identity...");

  try {
    const stsClient = new STSClient({ region: process.env.AWS_REGION });
    const identityCommand = new GetCallerIdentityCommand({});
    const identity = await stsClient.send(identityCommand);

    logSuccess("AWS credentials are valid");
    logInfo(`Account: ${identity.Account}`);
    logInfo(`User/Role ARN: ${identity.Arn}`);
    logInfo(`User ID: ${identity.UserId}`);
  } catch (err) {
    logError("Failed to get AWS identity");
    logError(err.message);
    allChecksPass = false;
  }

  console.log("");

  // 4. Check IAM role assumption (if AWS_ROLE_ARN is set)
  if (process.env.AWS_ROLE_ARN) {
    logInfo("Step 4: Testing IAM role assumption...");

    try {
      const stsClient = new STSClient({ region: process.env.AWS_REGION });
      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: "verification-test",
        DurationSeconds: 900, // 15 minutes
      });

      const assumeRoleResult = await stsClient.send(assumeRoleCommand);
      logSuccess(`Successfully assumed role: ${process.env.AWS_ROLE_ARN}`);
      logInfo(`Session expiration: ${assumeRoleResult.Credentials.Expiration}`);
    } catch (err) {
      logError("Failed to assume IAM role");
      logError(err.message);
      logWarning("Make sure your IAM user has permission to assume this role");
      logWarning("Check the role's trust policy");
      allChecksPass = false;
    }
  } else {
    logWarning("Step 4: Skipping role assumption test (AWS_ROLE_ARN not set)");
  }

  console.log("");

  // 5. Test S3 client initialization
  logInfo("Step 5: Testing S3 client initialization...");

  try {
    const s3Client = getS3Client();
    const bucket = getResumeBucket();

    logSuccess("S3 client initialized successfully");
    logInfo(`Target bucket: ${bucket}`);
  } catch (err) {
    logError("Failed to initialize S3 client");
    logError(err.message);
    allChecksPass = false;
  }

  console.log("");

  // 6. Test S3 bucket access
  logInfo("Step 6: Testing S3 bucket access...");

  try {
    const s3Client = getS3Client();
    const bucket = getResumeBucket();
    const testKey = `test-verification-${Date.now()}.txt`;
    const testContent =
      "This is a test file for AWS S3 configuration verification.";

    // Test PUT
    logInfo("Testing S3 PutObject...");
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: testContent,
        ContentType: "text/plain",
      }),
    );
    logSuccess("Successfully uploaded test file to S3");

    // Test GET
    logInfo("Testing S3 GetObject...");
    const getResult = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: testKey,
      }),
    );
    logSuccess("Successfully retrieved test file from S3");

    // Test DELETE
    logInfo("Testing S3 DeleteObject...");
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      }),
    );
    logSuccess("Successfully deleted test file from S3");

    logSuccess("All S3 operations completed successfully!");
  } catch (err) {
    logError("S3 bucket access test failed");
    logError(err.message);

    if (err.name === "AccessDenied") {
      logWarning("IAM role may not have required S3 permissions");
      logWarning(
        "Required permissions: s3:PutObject, s3:GetObject, s3:DeleteObject",
      );
    } else if (err.name === "NoSuchBucket") {
      logWarning("S3 bucket does not exist");
      logWarning(`Check RESUME_S3_BUCKET: ${process.env.RESUME_S3_BUCKET}`);
    }

    allChecksPass = false;
  }

  console.log("");

  // Summary
  log("\n" + "=".repeat(60), colors.blue);
  if (allChecksPass) {
    logSuccess("✨ All checks passed! AWS configuration is correct.");
    log("\nYou can now run the backend server:", colors.cyan);
    log("  cd backend && npm run dev\n", colors.cyan);
  } else {
    logError("❌ Some checks failed. Please review the errors above.");
    log("\nTroubleshooting steps:", colors.yellow);
    log("  1. Ensure AWS CLI is installed and configured", colors.yellow);
    log("  2. Check .env file has required variables", colors.yellow);
    log("  3. Verify IAM role permissions and trust policy", colors.yellow);
    log(
      "  4. See AWS_IAM_SETUP.md for detailed setup instructions\n",
      colors.yellow,
    );
  }
  log("=".repeat(60) + "\n", colors.blue);

  process.exit(allChecksPass ? 0 : 1);
}

// Run verification
verifyConfiguration().catch((err) => {
  logError("Unexpected error during verification:");
  console.error(err);
  process.exit(1);
});
