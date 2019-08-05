resource "aws_sqs_queue" "scaper_queue_dlq" {
  count = "${var.no_queue ? 0 : 1}"
  fifo_queue                  = "${var.sqs_fifo}"
  name                      = "${var.sqs_fifo ? "${var.aws_lambda_function_name}-dlq.fifo" : "${var.aws_lambda_function_name}-dlq"}"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "scraper_queue" {
  count = "${var.no_queue ? 0 : 1}"
  name                      = "${var.sqs_fifo ? "${var.aws_lambda_function_name}.fifo" : "${var.aws_lambda_function_name}"}"
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  visibility_timeout_seconds = 900
  fifo_queue                  = "${var.sqs_fifo}"
  content_based_deduplication = "${var.sqs_fifo}"
  redrive_policy            = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.scaper_queue_dlq.arn}\",\"maxReceiveCount\":4}"
}

output "queue_url" {
  depends_on = [
    "aws_sqs_queue.scraper_queue"
  ]
  value = "${element(concat(aws_sqs_queue.scraper_queue.*.id , list("no_queue")), 0)}"
}
