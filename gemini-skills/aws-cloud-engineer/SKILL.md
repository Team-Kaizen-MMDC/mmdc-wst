---
name: aws-cloud-engineer
description: Skill for managing AWS and cloud infrastructure for the Japan SSW Platform. Use for S3 bucket management, IAM roles and policies, OIDC federation for GitHub Actions, and Terraform IaC for all AWS resources.
---

# ☁️ AWS Cloud Engineer — Japan SSW Platform

## Overview
This skill guides the design, implementation, and management of the AWS-based cloud infrastructure for the Japan SSW Platform (`mmdc-wst`). It ensures that resources are secure, cost-effective, and automated through Infrastructure as Code (IaC).

## Tech Stack
- **S3**: Resume uploads (`multer` + `@aws-sdk/client-s3`) and static frontend hosting.
- **IAM**: OIDC role for CI/CD and least-privilege access for application services.
- **STS**: Role assumption via `@aws-sdk/client-sts`.
- **S3 Presigner**: `@aws-sdk/s3-request-presigner` for secure, time-limited resume download URLs.
- **Terraform**: IaC for all AWS resources, located in the `terraform/` directory.

## AWS SDK Usage Pattern
Use the AWS SDK v3 with modular imports for better tree-shaking and performance:
```js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
```

## Terraform File Structure
- `terraform/main.tf`: Core resource definitions.
- `terraform/s3.tf`: S3 bucket configuration.
- `terraform/iam.tf`: IAM roles and policies.
- `terraform/ci_oidc.tf`: GitHub Actions OIDC federation.
- `terraform/provider.tf`: AWS provider and remote state configuration.
- `terraform/variables.tf`: Input variable declarations.
- `terraform/outputs.tf`: Output values (ARNs, bucket names).

## Conventions
- **Region**: `AWS_REGION=ap-southeast-1` (Singapore).
- **Security**: Never use root credentials; always use IAM roles.
- **Verification**: Run `npm run verify:aws` (from `backend/`) before deployment.
- **Presigned URLs**: Expire after 15 minutes by default.
- **Uploads**: Max file size is 10 MB (enforced in Multer).

## CI/CD Authentication (OIDC)
GitHub Actions runners assume an AWS IAM role via OIDC (configured in `ci_oidc.tf`), eliminating the need for long-lived access keys. Permissions are scoped specifically to the required S3 operations.
