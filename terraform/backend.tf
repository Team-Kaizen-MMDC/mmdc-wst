// Minimal backend block so CLI `-backend-config` options can override
// Keeps the configuration explicit and avoids the "Missing backend configuration" warning
terraform {
  backend "s3" {}
}
