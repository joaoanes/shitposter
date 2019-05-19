module "puppeteer" {
  source = "./puppeteer"
  redis_security_group = "${aws_security_group.redis.id}"
}
