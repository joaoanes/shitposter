module "list" {
  source = "./lambda"
  entry_point = "lambda.list"
  aws_lambda_function_name = "lmaoscraper_list"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}

module "updateIndex" {
  source = "./lambda"
  entry_point = "lambda.updateIndex"
  aws_lambda_function_name = "lmaoscraper_updateIndex"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}

module "fetch" {
  source = "./lambda"
  entry_point = "lambda.fetch"
  aws_lambda_function_name = "lmaoscraper_fetch"
  shitposter_api_ip = "${var.shitposter_api_ip}"
}
