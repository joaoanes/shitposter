resource "aws_api_gateway_rest_api" "scraper" {
  name        = "ShitposterScraper"
  description = "Shitposter's scrape lambda"
}

resource "aws_api_gateway_resource" "fetch" {
  rest_api_id = "${aws_api_gateway_rest_api.scraper.id}"
  parent_id   = "${aws_api_gateway_rest_api.scraper.root_resource_id}"
  path_part   = "fetch"
}

resource "aws_api_gateway_method" "fetch" {
  rest_api_id   = "${aws_api_gateway_rest_api.scraper.id}"
  resource_id   = "${aws_api_gateway_resource.fetch.id}"
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.scraper.id}"
  resource_id = "${aws_api_gateway_method.fetch.resource_id}"
  http_method = "${aws_api_gateway_method.fetch.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.lmaoscraper_lambda_function.invoke_arn}"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.lmaoscraper_lambda_function.arn}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.scraper.id}/*/${aws_api_gateway_method.fetch.http_method}${aws_api_gateway_resource.fetch.path}"
}

resource "aws_api_gateway_deployment" "scraper" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.scraper.id}"
  stage_name  = "test"
}

output "lambda_url" {
  value = "${aws_api_gateway_deployment.scraper.invoke_url}"
}
