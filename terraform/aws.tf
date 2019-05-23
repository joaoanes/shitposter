provider "aws" {
  region              = "${var.aws_region}"
  profile             = "joaoanes"
}

// goddamn cloudfront
provider "aws" {
  region = "us-east-1"
  alias = "us-east-1"
    profile             = "joaoanes"
}
