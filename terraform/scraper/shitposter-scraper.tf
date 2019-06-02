module "list" {
  source = "./lambda"
  entry_point = "lambda.list"
  aws_lambda_function_name = "${var.scraper_name}_list"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  scraper_name = "${var.scraper_name}"
}

module "updateIndex" {
  source = "./lambda"
  entry_point = "lambda.updateIndex"
  aws_lambda_function_name = "${var.scraper_name}_updateIndex"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  scraper_name = "${var.scraper_name}"
}

module "fetch" {
  source = "./lambda"
  entry_point = "lambda.fetch"
  aws_lambda_function_name = "${var.scraper_name}_fetch"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
  scraper_name = "${var.scraper_name}"
}
