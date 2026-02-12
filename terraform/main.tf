resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  # Ensure generated bucket names are lowercase and DNS-compliant
  bucket_name = var.bucket_name != "" ? var.bucket_name : lower("japanssw-s3-${random_id.suffix.hex}")
}
