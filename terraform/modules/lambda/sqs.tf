resource "aws_sqs_queue" "scaper_queue_dlq" {
  count = "${var.no_queue ? 0 : 1}"
  name = "${var.aws_lambda_function_name}_dlq"
}

resource "aws_sqs_queue" "scraper_queue" {
  count = "${var.no_queue ? 0 : 1}"
  name                      = "${var.aws_lambda_function_name}"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  visibility_timeout_seconds = 900
  redrive_policy            = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.scaper_queue_dlq.arn}\",\"maxReceiveCount\":4}"
}

output "queue_url" {
  depends_on = [
    "aws_sqs_queue.scraper_queue"
  ]
  value = "${element(concat(aws_sqs_queue.scraper_queue.*.id , list("no_queue")), 0)}"
}
