module "lmaoscraper-lambda" {
  source = "./scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
  scraper_name = "lmaoscraper"
}

module "wholesomescraper-lambda" {
  source = "./scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
  scraper_name = "wholesomescraper"
}


// TODO: boy, would look at those empty vars! sure doesn't smell here!
module "sanitizer" {
  source = "./scraper/lambda"
  entry_point = "lambda.sanitize"
  aws_lambda_function_name = "sanitizer"
  aws_s3_bucket_name = ""
  shitposter_api_ip = ""
  scraper_name = ""
}
