variable "aws_region" {
  default = "eu-central-1"
}

variable "aws_account_id" {
  default = "305518020756"
}

variable "aws_lambda_function_name" {
  default = "lmaoscraper"
}

variable "aws_s3_bucket_name" {

}

variable "shitposter_token" {
  default = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJTaGl0cG9zdGVyQmFja2VuZCIsImV4cCI6MTU4MzM4MzYxMCwiaWF0IjoxNTUyMjc5NjEwLCJpc3MiOiJTaGl0cG9zdGVyQmFja2VuZCIsImp0aSI6IjI3ZTZlMjU1LTY1NDEtNGVmOS05M2Y4LTRlYzI0MmJiOTQ5YiIsIm5iZiI6MTU1MjI3OTYwOSwic3ViIjoiMSIsInR5cCI6ImFjY2VzcyJ9.mbuhNN5Njr0uKpwOlaTO7u3BTWYt97ganJ1_dn_g0tItGfb66ryKDQuV3U9ezGdYuYbqJZxLSvl3FUDF9w_k3A"
}

variable "shitposter_api_ip" {

}

variable "source_file" {
  default = "../scrapers-lambda/scrape.zip"
}

variable "entry_point" {

}

variable "scraper_name" {

}
