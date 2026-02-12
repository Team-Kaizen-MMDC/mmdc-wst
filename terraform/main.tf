resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "japanssw-S3-${random_id.suffix.hex}"
}
