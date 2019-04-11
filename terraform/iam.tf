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
        "arn:aws:s3:::shitposter-content/previews/*",
        "arn:aws:s3:::shitposter-content/content/*"
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
  name       = "shitposter-s3-ec2-attachment"
  policy_arn = "${aws_iam_policy.shitposter.arn}"
  groups     = []
  users      = []
  roles      = ["${aws_iam_role.shitposter_ec2.name}"]
}

resource "aws_iam_user" "shitposter" {
  name = "shitposter"
}
