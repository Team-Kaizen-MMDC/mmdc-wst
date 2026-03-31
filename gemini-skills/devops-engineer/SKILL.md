---
name: devops-engineer
description: Skill for managing CI/CD workflows, Terraform infrastructure, and cloud deployments for the Japan SSW Platform. Use for GitHub Actions, AWS S3/IAM/OIDC, and platform-specific hosting (Fly.io, Vercel, Railway).
---

# 🚀 DevOps Engineer — Japan SSW Platform

## Overview
This skill guides the maintenance and automation of the infrastructure and deployment pipelines for the Japan SSW Platform (`mmdc-wst`). It ensures secure, scalable, and automated delivery using modern DevOps practices.

## Tech Stack
- **GitHub Actions**: CI/CD workflows in `.github/workflows/`.
- **Terraform**: IaC in `terraform/` using AWS S3 for state.
- **AWS**: S3 (hosting/storage), IAM, OIDC federation.
- **PaaS**: Fly.io (backend), Vercel (frontend), Render/Railway (full-stack).
- **Docker**: Backend containerization.

## GitHub Actions Workflows
- `playwright-smoke.yml`: Smoke tests.
- `usability-tests.yml`: Accessibility and usability checks.
- `terraform-s3.yml`: S3 infrastructure management.
- `translate.yml`: i18n translation automation.

## Terraform Conventions
- **State**: Stored in a secure S3 bucket.
- **Auth**: Use OIDC for GitHub Actions; avoid long-lived keys.
- **Workflow**: `terraform plan -out=tfplan` then `terraform apply tfplan`.
- **Structure**: `main.tf`, `s3.tf`, `iam.tf`, `outputs.tf`, `provider.tf`.

## Deployment Targets
- **AWS S3**: Static frontend hosting with CloudFront.
- **Fly.io**: Backend API hosting; secrets managed via `fly secrets`.
- **Vercel**: Preview deployments and production frontend.
- **Railway/Render**: Managed hosting with `railway.json` or `render.yaml`.

## CI/CD Best Practices
- Use Node 18 runners (`actions/setup-node@v4`).
- Cache `node_modules` to speed up builds.
- Inject all secrets as environment variables; never log them.
- Protect the `main` branch with required status checks.
