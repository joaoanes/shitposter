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
        "arn:aws:s3:::shitposter-content/content/*",
        "arn:aws:s3:::shitposter-content/previews/*"
      ]
    },
    {
      "Sid": "Stmt1518668531714",
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
