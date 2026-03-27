output "bucket_name" {
  value = aws_s3_bucket.this.bucket
  description = "S3 bucket name"
}

output "bucket_arn" {
  value = aws_s3_bucket.this.arn
  description = "S3 bucket ARN"
}

output "iam_role_arn" {
  value = aws_iam_role.app_role.arn
  description = "IAM role ARN created for S3 access"
}

output "iam_policy_arn" {
  value = aws_iam_policy.s3_access_policy.arn
  description = "IAM policy ARN for S3 access"
}

# Railway user outputs (only populated when create_railway_user = true)
output "railway_user_access_key_id" {
  value       = length(aws_iam_access_key.railway) > 0 ? aws_iam_access_key.railway[0].id : null
  description = "AWS_ACCESS_KEY_ID to set in Railway environment variables"
  sensitive   = true
}

output "railway_user_secret_access_key" {
  value       = length(aws_iam_access_key.railway) > 0 ? aws_iam_access_key.railway[0].secret : null
  description = "AWS_SECRET_ACCESS_KEY to set in Railway environment variables"
  sensitive   = true
}
