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
