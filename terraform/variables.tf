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

variable "allowed_principals" {
  description = "Optional list of AWS principal ARNs allowed to access the bucket. If empty, the created IAM role will be used."
  type        = list(string)
  default     = []
}
