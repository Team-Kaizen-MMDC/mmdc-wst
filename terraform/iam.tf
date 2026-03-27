data "aws_iam_policy_document" "assume_role" {
  # EC2 instances with the role attached can use it directly
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }

  # Railway (or any non-AWS host) IAM user can assume the role using access keys
  dynamic "statement" {
    for_each = var.create_railway_user ? [1] : []
    content {
      effect = "Allow"
      actions = ["sts:AssumeRole"]
      principals {
        type        = "AWS"
        identifiers = [aws_iam_user.railway[0].arn]
      }
    }
  }
}

resource "aws_iam_role" "app_role" {
  name               = "mmdc-wst-s3-access-role-${random_id.suffix.hex}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    effect = "Allow"
    actions = ["s3:ListBucket"]
    resources = [aws_s3_bucket.this.arn]
  }

  statement {
    effect = "Allow"
    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
  }
}

resource "aws_iam_policy" "s3_access_policy" {
  name        = "mmdc-wst-s3-access-policy-${random_id.suffix.hex}"
  description = "Allow read/write to the mmdc-wst S3 bucket"
  policy      = data.aws_iam_policy_document.s3_policy.json
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_access_policy.arn
}

# ── Railway IAM user (only created when create_railway_user = true) ────────────
# This user's sole purpose is to call sts:AssumeRole so Railway can obtain
# temporary credentials for the role above. The access keys are set as
# Railway environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.

resource "aws_iam_user" "railway" {
  count = var.create_railway_user ? 1 : 0
  name  = "mmdc-wst-railway-deploy-${random_id.suffix.hex}"
}

data "aws_iam_policy_document" "railway_assume_role" {
  count = var.create_railway_user ? 1 : 0
  statement {
    effect    = "Allow"
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.app_role.arn]
  }
}

resource "aws_iam_user_policy" "railway_assume_role" {
  count  = var.create_railway_user ? 1 : 0
  name   = "AllowAssumeS3Role"
  user   = aws_iam_user.railway[0].name
  policy = data.aws_iam_policy_document.railway_assume_role[0].json
}

resource "aws_iam_access_key" "railway" {
  count = var.create_railway_user ? 1 : 0
  user  = aws_iam_user.railway[0].name
}
