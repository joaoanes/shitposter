resource "aws_sqs_queue" "scaper_queue_dlq" {
  fifo_queue                  = "${var.fifo}"
  name                      = "${var.fifo ? "${var.name}-dlq.fifo" : "${var.name}-dlq"}"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "scraper_queue" {
  name                      = "${var.fifo ? "${var.name}.fifo" : "${var.name}"}"
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  visibility_timeout_seconds = 900
  fifo_queue                  = "${var.fifo}"
  content_based_deduplication = "${var.fifo}"
  redrive_policy            = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.scaper_queue_dlq.arn}\",\"maxReceiveCount\":4}"
}

output "queue_url" {
  value = "${aws_sqs_queue.scraper_queue.id}"
}

output "queue_arn" {
  value = "${aws_sqs_queue.scraper_queue.arn}"
}
