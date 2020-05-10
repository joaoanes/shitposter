module "list" {
  source = "../lambda"
  entry_point = "lambda.list"
  aws_lambda_function_name = "${var.scraper_name}_list"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  scraper_name = "${var.scraper_name}"
  no_queue = true
  next_sqs_url = "${module.parse.queue_url}"
  sqs_puppeteer_events_url = "${var.sqs_puppeteer_events_url}"
}

module "updateIndex" {
  source = "../lambda"
  entry_point = "lambda.updateIndex"
  aws_lambda_function_name = "${var.scraper_name}_updateIndex"
  aws_s3_bucket_name = "${var.bucket_name}"
  aws_lambda_memory = "3008"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  no_queue = true
  scraper_name = "${var.scraper_name}"
  sqs_puppeteer_events_url = "${var.sqs_puppeteer_events_url}"
}

module "parse" {
  source = "../lambda"
  entry_point = "lambda.parse"
  aws_lambda_function_name = "${var.scraper_name}_parse"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  scraper_name = "${var.scraper_name}"
  next_sqs_url = "${var.sqs_final_url}"
  sqs_puppeteer_events_url = "${var.sqs_puppeteer_events_url}"
}
