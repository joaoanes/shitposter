resource "aws_iam_policy" "shitposter" {
  name        = "shitposter-policy"
  path        = "/"
  description = ""

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:Put*"
      ],
      "Resource": [
        "${aws_s3_bucket.shitposter-content.arn}/previews/*",
        "${aws_s3_bucket.shitposter-content.arn}/content/*"
      ]
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "puppeteer" {
  name = "shitposter-puppeteer-policy"
  path = "/"
  description = ""

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:Put*"
      ],
      "Resource": [
        "${aws_s3_bucket.shitposter-scraper-next.arn}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:*"
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "cw" {
  name        = "shitposter-cw-policy"
  path        = "/"
  description = ""

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "logs:CreateLogStream",
              "logs:PutLogEvents",
              "logs:DescribeLogStreams"
          ],
          "Resource": [
              "arn:aws:logs:*:*:log-group:*",
              "arn:aws:logs:*:*:log-group:*:log-stream:*"
          ]
      }
  ]
}
POLICY
}

resource "aws_iam_policy" "sqs" {
  name = "shitposter-sqs-policy"
  path = "/"
  description = ""

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "sqs:ChangeMessageVisibility",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
              "sqs:ReceiveMessage",
              "sqs:SendMessage"
          ],
          "Resource": [
            "*"
          ]
      }
  ]
}
POLICY
}

resource "aws_iam_policy" "s3" {
  name = "shitposter-s3-policy"
  path = "/"
  description = ""

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "s3:GetObject",
              "s3:PutObject"
          ],
          "Resource": [
            "${aws_s3_bucket.shitposter-scraper-next.arn}/*"
          ]
      }
  ]
}
POLICY
}

resource "aws_iam_role" "shitposter_ec2" {
  name = "shitposter_ec2_role"
  path = "/"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_policy_attachment" "shitposter-attach" {
  name = "shitposter-sts-ec2-attachment"
  policy_arn = "${aws_iam_policy.shitposter.arn}"
  groups = []
  users = []
  roles = ["${aws_iam_role.shitposter_ec2.name}"]
}

resource "aws_iam_policy_attachment" "sqs-attach" {
  name = "shitposter-sqs-ec2-attachment"
  policy_arn = "${aws_iam_policy.sqs.arn}"
  groups = []
  users = []
  roles = ["${aws_iam_role.shitposter_ec2.name}"]
}

resource "aws_iam_policy_attachment" "puppeteer-attach" {
  name = "shitposter-puppeteer-ec2-attachment"
  policy_arn = "${aws_iam_policy.puppeteer.arn}"
  groups = []
  users = []
  roles = ["${aws_iam_role.shitposter_ec2.name}"]
}

resource "aws_iam_policy_attachment" "cw-attach" {
  name = "shitposter-cw-ec2-attachment"
  policy_arn = "${aws_iam_policy.cw.arn}"
  groups = []
  users = []
  roles = ["${aws_iam_role.shitposter_ec2.name}"]
}

resource "aws_iam_policy_attachment" "s3-attach" {
  name = "shitposter-s3-ec2-attachment"
  policy_arn = "${aws_iam_policy.s3.arn}"
  groups = []
  users = []
  roles = ["${aws_iam_role.shitposter_ec2.name}"]
}

// TODO PLEASE REMOVE ME PLEASE OH GOD
resource "aws_iam_user" "shitposter" {
  name = "shitposter"
}
