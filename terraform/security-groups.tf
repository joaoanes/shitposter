resource "aws_security_group" "https" {
  name = "https"

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]

    #these two parameters behave differently within the ICMP protocol
    #instead of ports, they represent the ICMP type number and code
    from_port = 8 #type number, in our case, Echo (ping)

    to_port = 0 #code, and the Echo ICMP type only uses code 0
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "shitposter" {
  name = "shitposter-shit"

  ingress {
    protocol    = "tcp"
    from_port   = 4000
    to_port     = 4000
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "http-ssh" {
  name = "http-ssh"

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]

    #these two parameters behave differently within the ICMP protocol
    #instead of ports, they represent the ICMP type number and code
    from_port = 8 #type number, in our case, Echo (ping)

    to_port = 0 #code, and the Echo ICMP type only uses code 0
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "default" {
  name                   = "default"
  description            = "default VPC security group"
  vpc_id                 = "${aws_vpc.default.id}"
  revoke_rules_on_delete = "false"

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
