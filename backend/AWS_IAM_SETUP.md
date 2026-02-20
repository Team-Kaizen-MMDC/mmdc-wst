# AWS IAM Role Setup for S3 Resume Upload

This document explains how to configure AWS IAM roles for the resume upload functionality, replacing IAM user access keys with role-based authentication.

## Why Use IAM Roles Instead of Access Keys?

✅ **Security Best Practices:**

- No hardcoded credentials in code or environment variables
- Temporary credentials that automatically rotate
- Fine-grained access control
- Better audit trail through CloudTrail
- Reduces risk of credential leakage

❌ **Avoid IAM User Access Keys:**

- Static credentials that can be leaked
- Require manual rotation
- Harder to audit and track usage
- Security vulnerability if committed to git

---

## Available IAM Roles

Your AWS account has the following IAM roles configured:

```
arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59
arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role
```

---

## Configuration

### Environment Variables (.env)

The following AWS configuration has been added to your `.env` file:

```bash
# AWS Region
AWS_REGION=ap-northeast-1

# S3 Bucket Name
RESUME_S3_BUCKET=japanssw-s3-84cafb59

# IAM Role ARN (for local development with role assumption)
AWS_ROLE_ARN=arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59
```

### Required IAM Role Permissions

The IAM role must have a policy attached with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::japanssw-s3-84cafb59/*"
    }
  ]
}
```

#### Verify IAM Role Policy

Check if your role has the correct permissions:

```bash
# List policies attached to the role
aws iam list-attached-role-policies --role-name mmdc-wst-s3-access-role-84cafb59

# Get inline policies
aws iam list-role-policies --role-name mmdc-wst-s3-access-role-84cafb59

# Get policy details (if using managed policy)
aws iam get-policy-version --policy-arn <POLICY_ARN> --version-id v1
```

#### Update IAM Role Policy (if needed)

If the role doesn't have the correct permissions, create or update the policy:

```bash
# Create a policy document
cat > s3-resume-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::japanssw-s3-84cafb59/*"
    }
  ]
}
EOF

# Attach inline policy to role
aws iam put-role-policy \
  --role-name mmdc-wst-s3-access-role-84cafb59 \
  --policy-name S3ResumeAccess \
  --policy-document file://s3-resume-policy.json
```

---

## Setup for Different Environments

### 1. Local Development

For local development, you need to configure AWS CLI and set up role assumption.

#### Option A: Using AWS CLI Credentials with AssumeRole

1. **Install AWS CLI** (if not already installed):

   ```bash
   # macOS
   brew install awscli

   # Or download from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
   ```

2. **Configure AWS CLI** with your IAM user credentials:

   ```bash
   aws configure
   ```

   Enter your credentials when prompted:
   - AWS Access Key ID: [Your IAM user access key]
   - AWS Secret Access Key: [Your IAM user secret]
   - Default region: ap-northeast-1
   - Default output format: json

3. **Verify AWS CLI is working:**

   ```bash
   aws sts get-caller-identity
   ```

4. **Test role assumption:**

   ```bash
   aws sts assume-role \
     --role-arn arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59 \
     --role-session-name test-session
   ```

5. **Run the backend:**

   ```bash
   cd backend
   npm run dev
   ```

   The application will automatically assume the role specified in `AWS_ROLE_ARN`.

#### Option B: Using AWS CLI Named Profiles

1. **Configure a named profile** in `~/.aws/config`:

   ```ini
   [profile japanssw]
   role_arn = arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59
   source_profile = default
   region = ap-northeast-1
   ```

2. **Update your `.env`** to use the profile:

   ```bash
   AWS_PROFILE=japanssw
   # Comment out AWS_ROLE_ARN when using profile
   # AWS_ROLE_ARN=
   ```

3. **Run the backend:**
   ```bash
   cd backend
   npm run dev
   ```

#### Option C: Temporarily Using Access Keys (NOT RECOMMENDED)

If you absolutely must use access keys for local development (not recommended):

1. **Remove** `AWS_ROLE_ARN` from `.env`
2. **Add** temporary access keys (NEVER commit these):
   ```bash
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_here
   ```
3. **Remember:** This approach is less secure and should only be used for initial testing.

---

### 2. AWS EC2 Deployment

When deployed on EC2, the instance will use its attached IAM role automatically.

1. **Attach IAM role to EC2 instance:**

   ```bash
   aws ec2 associate-iam-instance-profile \
     --instance-id i-1234567890abcdef0 \
     --iam-instance-profile Name=mmdc-wst-s3-access-role-84cafb59
   ```

2. **Update `.env` on EC2:**

   ```bash
   # Remove or leave empty - EC2 will use instance profile
   AWS_ROLE_ARN=

   # Keep these
   AWS_REGION=ap-northeast-1
   RESUME_S3_BUCKET=japanssw-s3-84cafb59
   ```

3. **No AWS credentials needed** - the SDK will automatically use the instance profile.

---

### 3. AWS Lambda Deployment

When deployed as a Lambda function, it will use its execution role.

1. **Create or update Lambda execution role** with S3 permissions:

   ```bash
   aws iam create-role \
     --role-name mmdc-wst-lambda-execution \
     --assume-role-policy-document file://lambda-trust-policy.json

   aws iam attach-role-policy \
     --role-name mmdc-wst-lambda-execution \
     --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

   aws iam put-role-policy \
     --role-name mmdc-wst-lambda-execution \
     --policy-name S3ResumeAccess \
     --policy-document file://s3-resume-policy.json
   ```

2. **Update Lambda function environment variables:**
   ```bash
   AWS_REGION=ap-northeast-1
   RESUME_S3_BUCKET=japanssw-s3-84cafb59
   # No AWS_ROLE_ARN needed
   ```

---

### 4. AWS ECS/Fargate Deployment

When deployed on ECS or Fargate, the task will use its task execution role.

1. **Create or update ECS task execution role:**

   ```bash
   aws iam attach-role-policy \
     --role-name ecsTaskExecutionRole \
     --policy-arn arn:aws:iam::182371258083:policy/S3ResumeAccess
   ```

2. **Configure task definition** with task role:

   ```json
   {
     "taskRoleArn": "arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59",
     "executionRoleArn": "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
   }
   ```

3. **Environment variables in task definition:**
   ```json
   {
     "environment": [
       {
         "name": "AWS_REGION",
         "value": "ap-northeast-1"
       },
       {
         "name": "RESUME_S3_BUCKET",
         "value": "japanssw-s3-84cafb59"
       }
     ]
   }
   ```

---

## Trust Relationships

### Allow Your IAM User to Assume the Role

The IAM role must trust your IAM user or other AWS services to assume it.

1. **Check current trust policy:**

   ```bash
   aws iam get-role --role-name mmdc-wst-s3-access-role-84cafb59 \
     --query 'Role.AssumeRolePolicyDocument'
   ```

2. **Update trust policy if needed:**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": [
             "ec2.amazonaws.com",
             "lambda.amazonaws.com",
             "ecs-tasks.amazonaws.com"
           ],
           "AWS": "arn:aws:iam::182371258083:user/YOUR_IAM_USER"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```

3. **Update the trust policy:**
   ```bash
   aws iam update-assume-role-policy \
     --role-name mmdc-wst-s3-access-role-84cafb59 \
     --policy-document file://trust-policy.json
   ```

---

## Testing the Setup

### Test S3 Access with AWS CLI

```bash
# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://japanssw-s3-84cafb59/test/test.txt

# Test download
aws s3 cp s3://japanssw-s3-84cafb59/test/test.txt downloaded.txt

# Test delete
aws s3 rm s3://japanssw-s3-84cafb59/test/test.txt

# Clean up
rm test.txt downloaded.txt
```

### Test Resume Upload Endpoint

```bash
# Start the backend server
cd backend
npm run dev

# Test upload (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/your/resume.pdf"

# Test get resume URL
curl -X GET http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test delete resume
curl -X DELETE http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Error: "Unable to locate credentials"

**Cause:** AWS SDK cannot find credentials.

**Solution:**

1. Verify AWS CLI is configured: `aws configure list`
2. Check `.env` has `AWS_REGION` set
3. Verify IAM role ARN is correct
4. Test role assumption: `aws sts assume-role --role-arn arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59 --role-session-name test`

### Error: "Access Denied" when uploading to S3

**Cause:** IAM role doesn't have required S3 permissions.

**Solution:**

1. Verify role policy: `aws iam list-role-policies --role-name mmdc-wst-s3-access-role-84cafb59`
2. Update policy with required permissions (see above)
3. Ensure bucket name matches: `japanssw-s3-84cafb59`

### Error: "AssumeRole is not authorized"

**Cause:** Your IAM user doesn't have permission to assume the role.

**Solution:**

1. Check trust policy on the role (see Trust Relationships section)
2. Ensure your IAM user is listed in the Principal
3. Ask AWS admin to update trust policy

### Error: "Region is missing"

**Cause:** `AWS_REGION` not set in `.env`.

**Solution:**

1. Add to `.env`: `AWS_REGION=ap-northeast-1`
2. Restart the backend server

---

## Security Checklist

- [ ] IAM role has minimal required permissions (only S3 actions on specific bucket)
- [ ] Trust policy only allows necessary principals
- [ ] No AWS access keys in `.env` or code (unless temporary for testing)
- [ ] `.env` file is in `.gitignore`
- [ ] CloudTrail logging enabled for audit trail
- [ ] S3 bucket has encryption enabled
- [ ] S3 bucket blocks public access
- [ ] Regular review of IAM role usage in CloudTrail

---

## Additional Resources

- [AWS IAM Roles Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [AWS SDK for JavaScript v3 - Credentials](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials.html)
- [AWS Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)

---

## Support

If you encounter issues with IAM role setup:

1. Check CloudTrail logs for detailed error messages
2. Review IAM role permissions and trust policy
3. Verify AWS CLI configuration
4. Test role assumption manually with AWS CLI
5. Contact your AWS administrator for access issues
