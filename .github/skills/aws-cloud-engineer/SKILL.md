---
name: "aws-cloud-engineer"
title: "AWS / Cloud Infrastructure Engineer"
description: "Skill profile for AWS / Cloud Infrastructure Engineer — S3, IAM, Terraform, OIDC."
---

# ☁️ AWS / Cloud Infrastructure Engineer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Manage S3 buckets for static assets and resume file storage
- Configure IAM roles, policies, and OIDC federation for GitHub Actions
- Maintain Terraform state and apply infrastructure changes
- Manage presigned URL generation for secure resume downloads

## Required Tech Stack
| Service | Purpose |
|---|---|
| S3 | Resume uploads (`multer` + `@aws-sdk/client-s3`), static frontend hosting |
| IAM | OIDC role for CI/CD, least-privilege access for app |
| STS | Role assumption via `@aws-sdk/client-sts` |
| S3 Presigner | `@aws-sdk/s3-request-presigner` for time-limited resume download URLs |
| Terraform | IaC for all AWS resources (`terraform/`) |

## AWS SDK Usage Pattern
```js
// AWS SDK v3 — modular imports only (tree-shakeable)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
```

## Terraform Files
| File | Purpose |
|---|---|
| `terraform/main.tf` | Core resource definitions |
| `terraform/s3.tf` | S3 bucket configuration |
| `terraform/iam.tf` | IAM roles and policies |
| `terraform/ci_oidc.tf` | GitHub Actions OIDC federation |
| `terraform/provider.tf` | AWS provider + remote state config |
| `terraform/variables.tf` | Input variable declarations |
| `terraform/outputs.tf` | Output values (bucket names, ARNs) |
| `terraform/terraform.tfvars.example` | Template — copy to `terraform.tfvars` (gitignored) |

## Conventions
- `AWS_REGION=ap-southeast-1` (Singapore — closest to Japan use case)
- Never use root account credentials — IAM roles only
- Verify AWS config before deploying: `npm run verify:aws` (from `backend/`)
- State bucket must be versioned with MFA-delete enabled
- Presigned URLs expire after 15 minutes — do not increase without security review
- Max file upload size: 10 MB (enforced in Multer config)

## OIDC / CI Auth Flow
```
GitHub Actions runner
  → assumes AWS IAM Role via OIDC (ci_oidc.tf)
  → no AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY ever stored
  → scoped permissions: s3:PutObject, s3:GetObject, s3:DeleteObject
```

## Related Skills
- [DevOps Engineer](../devops-engineer/SKILL.MD) — Terraform workflow & CI pipelines
- [Security Engineer](../security-engineer/SKILL.MD) — IAM least-privilege & secrets
- [Backend Developer](../backend-developer/SKILL.MD) — AWS SDK integration in API
