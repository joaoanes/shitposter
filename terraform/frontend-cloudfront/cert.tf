resource "aws_acm_certificate" "shitpost-network" {
  provider= "aws.us-east-1"
  domain_name       = "${var.website-root}"
  validation_method = "DNS"

  subject_alternative_names = ["*.${var.website-root}"]
}
