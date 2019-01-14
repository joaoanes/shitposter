terraform {
  backend "s3" {
    bucket  = "shitposter-tf-backend"
    key     = "state.tf"
    region  = "eu-central-1"
    profile = "joaoanes"
  }
}