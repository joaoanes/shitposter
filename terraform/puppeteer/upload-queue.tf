module "upload_queue" {
  source = "../modules/queue"
  name = "scraper-upload-queue"
  fifo = true
}

output "upload_queue_url" {
  value = "${module.upload_queue.queue_url}"
}
