module "lmaoscraper-lambda" {
  source = "./scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
}
