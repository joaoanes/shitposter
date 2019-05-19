module "list" {
  source = "./lambda"
  entry_point = "lambda.list"
  aws_lambda_function_name = "lmaoscraper_list"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}

module "updateIndex" {
  source = "./lambda"
  entry_point = "lambda.updateIndex"
  aws_lambda_function_name = "lmaoscraper_updateIndex"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}

module "fetch" {
  source = "./lambda"
  entry_point = "lambda.fetch"
  aws_lambda_function_name = "lmaoscraper_fetch"
  aws_s3_bucket_name = "${var.bucket_name}"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}
