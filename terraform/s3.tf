resource "aws_s3_bucket" "shitposter-content" {
  bucket = "shitposter-content"
  acl    = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "AES256"
      }
    }
  }

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::shitposter-content/previews/*",
        "arn:aws:s3:::shitposter-content/content/*"
      ]
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::305518020756:user/shitposter"
      },
      "Action": "s3:PutObject",
      "Resource": [
        "arn:aws:s3:::shitposter-content/previews/*",
        "arn:aws:s3:::shitposter-content/content/*"
      ]
    }
  ]
}
POLICY
}

resource "aws_s3_bucket" "frontend" {
  bucket = "shitposter-frontend"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::shitposter-frontend/*"
      ]
    }
  ]
}
POLICY
}

resource "aws_s3_bucket" "scraper-frontend" {
  bucket = "shitposter-scraper-frontend"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::shitposter-scraper-frontend/*"
      ]
    }
  ]
}
POLICY
}


resource "aws_s3_bucket" "shitposter-uniquer" {
  bucket = "shitposter-uniquer"
  acl    = "private"
}

resource "aws_s3_bucket" "shitposter-scraper-stuff" {
  bucket = "shitposter-scraper-stuff"
  acl    = "private"
}

resource "aws_s3_bucket" "shitposter-scraper-next" {
  bucket = "shitposter-scraper-next"
  acl    = "private"
}

output "frontend-url" {
  value = "${aws_s3_bucket.frontend.website_endpoint}"
}

output "scraper-frontend-url" {
  value = "${aws_s3_bucket.scraper-frontend.website_endpoint}"
}
