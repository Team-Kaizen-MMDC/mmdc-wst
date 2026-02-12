# Terraform S3 + IAM module

This folder contains a small Terraform module to create an S3 bucket in the `ap-southeast-1` region with an associated IAM role and policies that allow read/write access.

Files created

- **Added**: [terraform/provider.tf](terraform/provider.tf) — provider and required providers
- **Added**: [terraform/variables.tf](terraform/variables.tf) — variables
- **Added**: [terraform/main.tf](terraform/main.tf) — random id and generated bucket name
- **Added**: [terraform/s3.tf](terraform/s3.tf) — S3 bucket and bucket policy
- **Added**: [terraform/iam.tf](terraform/iam.tf) — IAM role, policy and attachment
- **Added**: [terraform/outputs.tf](terraform/outputs.tf) — outputs
- **Added**: [terraform/terraform.tfvars.example](terraform/terraform.tfvars.example) — example variables

Usage

1. Ensure your AWS credentials are available (environment variables or shared credentials file).
   - Environment variables (temporary): set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (and optionally `AWS_SESSION_TOKEN`). Example:

     ```bash
     export AWS_ACCESS_KEY_ID=AKIA...YOURKEY
     export AWS_SECRET_ACCESS_KEY=...YOURSECRET
     # optional: export AWS_SESSION_TOKEN=...YOUR_SESSION_TOKEN
     ```

   - Shared credentials file (persistent): run `aws configure` or edit `~/.aws/credentials`:

     ```ini
     [default]
     aws_access_key_id = AKIA...YOURKEY
     aws_secret_access_key = ...YOURSECRET
     ```

   - Use a named profile by setting `AWS_PROFILE` (example `myprofile`):

     ```bash
     export AWS_PROFILE=myprofile
     aws sts get-caller-identity
     ```

   - Verify credentials work with:

     ```bash
     aws sts get-caller-identity
     ```

2. From the repository root run:

```bash
cd terraform
terraform init
terraform plan -var-file="terraform.tfvars"    # optional: create a terraform.tfvars from the example
terraform apply -var-file="terraform.tfvars" -auto-approve
```

Notes

- By default the module will generate a unique bucket name. To supply your own name, set `bucket_name` in a `terraform.tfvars` file.
- If you want the bucket policy to allow additional principals (other roles/accounts), set `allowed_principals = ["arn:aws:iam::123456789012:role/other-role"]` in `terraform.tfvars`.
- The IAM role created has an AssumeRole trust for `ec2.amazonaws.com`. Adjust `iam.tf` if you need a different principal (e.g. `lambda.amazonaws.com`).

Security

- The bucket blocks public access and uses server-side encryption (AES256).

CI / GitHub Actions

This repository includes a workflow to run Terraform plan/apply/destroy for the S3 resources: `.github/workflows/terraform-s3.yml`.

Key notes:

- **Trigger:** open the Actions tab and run the `Terraform S3 lifecycle` workflow (or use the `workflow_dispatch` API).
- **Inputs:** `action` (plan|apply|destroy), optional `bucket_name`, `use_remote_state` (true/false), `state_bucket`, `state_key`, and `confirm` (must be `yes` to perform apply/destroy).
- **Required repository secrets:** set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in repository settings so the workflow can authenticate to AWS.
- **OIDC best practice:** instead of using long-lived secrets, you can provision an OIDC provider and a dedicated role for the workflow. Apply the Terraform config `ci_oidc.tf` in this folder to create the OIDC provider and role, then pass the role ARN to the workflow via the `oidc_role_arn` input. The workflow will assume the role using GitHub's OIDC tokens.

Using the role ARN as a repository secret

If you prefer to keep the role ARN in repository settings (so you don't need to paste it when running the workflow), add it as a repository secret and let the workflow read it automatically.

1. Add a repo secret named `OIDC_ROLE_ARN` (Settings → Secrets and variables → Actions → New repository secret) with the value `arn:aws:iam::182371258083:role/mmdc-wst-github-actions-role`.

2. The workflow is configured to use the input `oidc_role_arn` if provided, otherwise it will use the `GITHUB_OIDC_ROLE_ARN` secret automatically. Example run (CLI):

```bash
gh workflow run terraform-s3.yml --ref fix/s3workflow \
  -f action=plan
```

3. If you prefer to supply the role ARN at dispatch time, you can still pass `-f oidc_role_arn=...` to override the secret.

Security note: storing the role ARN in a secret keeps the workflow configuration tidy; the secret only holds the ARN (not credentials) and is safe to store. Ensure the role's trust policy remains restricted to this repository.
- **Remote state:** if you set `use_remote_state=true` and provide `state_bucket`, the workflow will attempt to create that bucket (with versioning) and use it for Terraform backend. Ensure the credentials used by the workflow have permissions to create/list buckets and put objects in the state bucket.
- **Plan artifact:** the workflow uploads a `tfplan` artifact after planning; the apply step will use the plan file if present.
- **Safety:** the workflow requires `confirm: yes` to perform destructive actions (`apply` and `destroy`). For destroy operations the README's "Destroying / Cleanup" guidance still applies (empty buckets before destroy or enable `force_destroy` intentionally).

Example: run a non-destructive plan with a custom bucket name

```bash
# From the repo you can dispatch the workflow using the GitHub CLI (gh) if available:
gh workflow run terraform-s3.yml --repo Team-Kaizen-MMDC/mmdc-wst -f action=plan -f bucket_name=my-unique-bucket
```

Add the secrets in the repo settings: `Settings → Secrets and variables → Actions`.

Destroying / Cleanup

Follow these steps to safely destroy the resources created by this module:

- Inspect planned changes before destroying:

  ```bash
  cd terraform
  terraform init
  terraform plan -destroy -var-file="terraform.tfvars"
  ```

- Empty the S3 bucket first (recommended) to avoid accidental data loss and speed up destruction. Example using the AWS CLI:

  ```bash
  # verify bucket name from outputs or AWS console
  aws s3 ls s3://$(terraform output -raw bucket_name)
  aws s3 rm s3://$(terraform output -raw bucket_name) --recursive
  ```

- If you prefer Terraform to remove objects automatically, set `force_destroy = true` on the `aws_s3_bucket` resource in `s3.tf` before running `terraform apply` (note: this will permanently delete all objects).

- Perform the destroy (interactive):

  ```bash
  terraform destroy -var-file="terraform.tfvars"
  ```

- Or run non-interactively (use with caution):

  ```bash
  terraform destroy -var-file="terraform.tfvars" -auto-approve
  ```

- After destroy, verify no residual IAM policies or roles remain that you do not need. You can list them with:

  ```bash
  aws iam list-roles | grep mmdc-wst || true
  aws iam list-policies --scope Local | grep mmdc-wst || true
  ```

Notes

- Always have backups of any data before deleting buckets. Destroying is irreversible.
- Use `terraform state show` and `terraform state rm` only if you need to remove a resource from state without deleting the remote resource; be careful when manipulating state files.
