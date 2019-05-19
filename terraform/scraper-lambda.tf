module "lmaoscraper-lambda" {
  source = "./scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
}
