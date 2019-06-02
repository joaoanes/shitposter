data "aws_iam_policy_document" "lambda_logging_policy" {
  statement {
    actions = ["logs:CreateLogGroup"]
    resources = ["arn:aws:logs:${var.aws_region}:${var.aws_account_id}:*"]
  }

  statement {
    actions = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.aws_lambda_function_name}:*"]
  }
}

data "aws_iam_policy_document" "lambda_s3_policy" {
  statement {
    actions = ["s3:GetObject", "s3:PutObject"]
    resources = ["arn:aws:s3:::${var.aws_s3_bucket_name}/*"]
  }
}

data "aws_iam_policy_document" "lambda_s3_list_policy" {
  statement {
    actions = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.aws_s3_bucket_name}"]
  }
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "lambda_logging_policy" {
  policy = "${data.aws_iam_policy_document.lambda_logging_policy.json}"
}

resource "aws_iam_policy" "lambda_s3_policy" {
  policy = "${data.aws_iam_policy_document.lambda_s3_policy.json}"
}
resource "aws_iam_policy" "lambda_s3_list_policy" {
  policy = "${data.aws_iam_policy_document.lambda_s3_list_policy.json}"
}


resource "aws_iam_role" "iam_role_for_lambda" {
  name = "${var.aws_lambda_function_name}_LoggingAndBucketAccess"
  assume_role_policy = "${data.aws_iam_policy_document.lambda_assume_role_policy.json}"
}

resource "aws_iam_role_policy_attachment" "iam_for_lambda_logging_policy_attachment" {
  role       = "${aws_iam_role.iam_role_for_lambda.name}"
  policy_arn = "${aws_iam_policy.lambda_logging_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "iam_for_lambda_s3_policy_attachment" {
  role       = "${aws_iam_role.iam_role_for_lambda.name}"
  policy_arn = "${aws_iam_policy.lambda_s3_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "iam_for_lambda_s3_list_policy_attachment" {
  role       = "${aws_iam_role.iam_role_for_lambda.name}"
  policy_arn = "${aws_iam_policy.lambda_s3_list_policy.arn}"
}

resource "aws_lambda_function" "lambda" {
  filename = "../scrapers-lambda/scrape.zip"
  function_name = "${var.aws_lambda_function_name}"
  role = "${aws_iam_role.iam_role_for_lambda.arn}"
  memory_size = "512"
  runtime = "provided"
  handler = "${var.entry_point}"
  source_code_hash = "${base64sha256(file("${var.source_file}"))}"
  timeout = 900
  layers = ["arn:aws:lambda:eu-central-1:553035198032:layer:nodejs11:16"]

  environment {
    variables = {
      SHITPOSTER_GRAPHQL_URL = "http://${var.shitposter_api_ip}:4000/"
      SHITPOSTER_GRAPHQL_TOKEN = "${var.shitposter_token}"
      BUCKET_NAME = "${var.aws_s3_bucket_name}"
      SCRAPER_NAME = "${var.scraper_name}"
    }
  }
}
