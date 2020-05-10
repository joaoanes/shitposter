module "sa-cute-lambda" {
  source = "./modules/scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
  scraper_name = "sa-cute"
  sqs_final_url = "${module.sanitizer.queue_url}"
  sqs_puppeteer_events_url = "${module.puppeteer.events_url}"
}

module "sa-funny-lambda" {
  source = "./modules/scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
  scraper_name = "sa-funny"
  sqs_final_url = "${module.sanitizer.queue_url}"
  sqs_puppeteer_events_url = "${module.puppeteer.events_url}"
}


module "sa-gifs-lambda" {
  source = "./modules/scraper"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  bucket_name = "${aws_s3_bucket.shitposter-scraper-next.bucket}"
  scraper_name = "sa-gifs"
  sqs_final_url = "${module.sanitizer.queue_url}"
  sqs_puppeteer_events_url = "${module.puppeteer.events_url}"
}

// TODO: boy, would you look at all those empty vars! sure doesn't smell here!
module "sanitizer" {
  source = "./modules/lambda"
  entry_point = "lambda.sanitize"
  aws_lambda_function_name = "sanitizer"
  aws_s3_bucket_name = ""
  next_sqs_url = "${module.puppeteer.upload_queue_url}"
  shitposter_api_ip = "${aws_instance.shitposter.public_ip}"
  scraper_name = ""
  sqs_trigger_enabled = true
  sqs_puppeteer_events_url = "${module.puppeteer.events_url}"
}

locals {
  scrapers = "${jsonencode(list("sa-gifs", "sa-funny", "sa-cute"))}"
}

// One day
# module "extractor" {
#   source = "./modules/lambda"
#   entry_point = "lambda.extract"
#   aws_lambda_function_name = "extractor"
#   aws_s3_bucket_name = ""
#   shitposter_api_ip = ""
#   scraper_name = ""
#   sqs_trigger_enabled = false
# }
