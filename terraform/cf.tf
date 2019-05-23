module "frontend-cf" {
  source = "./frontend-cloudfront"
  api-ip = "${aws_instance.shitposter.public_ip}"
}

output "distribution_url" {
  value = "${module.frontend-cf.distribution_url}"
}
