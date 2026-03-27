variable "region" {
  description = "AWS region to create resources in."
  type        = string
  default     = "ap-southeast-1"
}

variable "bucket_name" {
  description = "Optional explicit S3 bucket name. If empty, a unique name will be generated."
  type        = string
  default     = ""
}

variable "create_railway_user" {
  description = "Set to true to create an IAM user for Railway (non-AWS hosts that cannot use EC2 instance roles)."
  type        = bool
  default     = false
}
