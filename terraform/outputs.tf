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
