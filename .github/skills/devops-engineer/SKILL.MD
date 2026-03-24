# 🚀 DevOps Engineer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Maintain GitHub Actions CI/CD workflows in `.github/workflows/`
- Manage Terraform infrastructure for AWS (S3, IAM, OIDC)
- Configure and manage cloud deployment targets
- Manage secrets via GitHub Actions secrets and environment variables

## Required Tech Stack
| Technology | Notes |
|---|---|
| GitHub Actions | Workflows in `.github/workflows/`; Node 18 runners |
| Terraform | IaC in `terraform/`; provider: AWS; state in S3 |
| AWS | S3 (resume storage + static hosting), IAM, OIDC federation (`ci_oidc.tf`) |
| Fly.io | PaaS option for backend API containers |
| Vercel | Frontend static/SSR deployments |
| Render | Backend Node.js service hosting |
| Railway | Full-stack deployments with managed services |
| Docker | Containerize backend for Fly.io / Render |

## GitHub Actions Workflows
| Workflow | File | Trigger |
|---|---|---|
| Playwright Smoke | `playwright-smoke.yml` | `workflow_dispatch` |
| Usability Tests | `usability-tests.yml` | `workflow_dispatch` |
| Terraform S3 | `terraform-s3.yml` | `workflow_dispatch` |
| Translate | `translate.yml` | `workflow_dispatch` |

## Terraform Conventions
- Backend state: S3 bucket (configured in `provider.tf`)
- OIDC role for GitHub Actions: `ci_oidc.tf` — no long-lived AWS keys in CI
- IAM least-privilege: separate roles for S3 read, write, deploy
- `terraform.tfvars` is gitignored — use `terraform.tfvars.example` as template
- Plan before apply: always `terraform plan -out=tfplan` then `terraform apply tfplan`
- Modules: `s3.tf` (bucket config), `iam.tf` (roles/policies), `main.tf` (core resources), `outputs.tf`

## Deployment Targets

### AWS S3 (Static Frontend)
- Bucket name and region from `terraform/variables.tf`
- CloudFront distribution for CDN and HTTPS
- Deploy via `terraform-s3.yml` workflow

### Fly.io (Backend API)
- `fly.toml` at `backend/` root
- Set all secrets via `fly secrets set KEY=VALUE`
- `PORT` must match what Fly expects (configured in `fly.toml`)
- Health check endpoint: `GET /health` — implement if missing

### Vercel (Frontend)
- `vercel.json` at project root for rewrites/headers
- Environment variables set in Vercel dashboard
- Preview deployments on every PR branch

### Render / Railway
- Use `render.yaml` / `railway.json` for infrastructure-as-config
- Set `NODE_ENV=production` and all env vars in platform dashboard
- Auto-deploy on push to `main`

## CI/CD Best Practices
- Use `actions/checkout@v4`, `actions/setup-node@v4` (Node 18)
- Cache `node_modules` with `actions/cache` keyed on `package-lock.json`
- Use OIDC for AWS auth — never store `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as long-lived secrets
- Separate workflows for test, build, deploy — don't combine into one giant workflow
- All secrets injected as env vars; never echo secrets in logs
- PRs should run tests before merging; protect `main` branch

## Related Skills
- [AWS / Cloud Engineer](../aws-cloud-engineer/SKILL.MD) — Terraform & S3 deep dive
- [Security Engineer](../security-engineer/SKILL.MD) — secrets & OIDC
- [Test Engineer](../test-engineer/SKILL.MD) — CI test integration
