module "events" {
  source = "../modules/queue"
  name = "scraper-puppeteer-events"
  fifo = true
  dlq  = true
  retention = 518400
}

output "events_url" {
  value = "${module.events.queue_url}"
}

output "events_arn" {
  value = "${module.events.queue_arn}"
}
