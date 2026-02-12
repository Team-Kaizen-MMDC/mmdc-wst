resource "aws_s3_bucket" "this" {
  bucket = local.bucket_name

  tags = {
    Name        = local.bucket_name
    Environment = "dev"
    Project     = "mmdc-wst"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid = "AllowListBucket"

    principals {
      type        = "AWS"
      identifiers = var.allowed_principals != [] ? var.allowed_principals : [aws_iam_role.app_role.arn]
    }

    actions = ["s3:ListBucket"]
    resources = [aws_s3_bucket.this.arn]
  }

  statement {
    sid = "AllowObjectActions"

    principals {
      type        = "AWS"
      identifiers = var.allowed_principals != [] ? var.allowed_principals : [aws_iam_role.app_role.arn]
    }

    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}
