
# god damn it, RDS again
resource "aws_db_instance" "scraper-posts" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "10"
  instance_class       = "db.t3.micro"
  name                 = "scrapers_posts"
  username             = "puppeteer"
  password             = "${random_string.postgres.result}"
  skip_final_snapshot = true
}

resource "random_string" "postgres" {
  length = 32
  special = false
}
data "template_file" "database_dsn" {
  template = "$${engine}://$${username}:$${password}@$${host}:$${port}/$${name}?sslmode=$${sslmode}"

  vars {
    engine   = "${aws_db_instance.scraper-posts.engine}"
    username = "${aws_db_instance.scraper-posts.username}"
    password = "${random_string.postgres.result}"
    host     = "${aws_db_instance.scraper-posts.address}"
    port     = "${aws_db_instance.scraper-posts.port}"
    name     = "${aws_db_instance.scraper-posts.name}"
    sslmode  = "verify-full"
  }
}

output "database_url" {
  value = "${data.template_file.database_dsn.rendered}"
}
