resource "aws_db_instance" "shitposter-prod" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "10"
  instance_class       = "db.t3.micro"
  name                 = "shitposter_production"
  username             = "shitposter"
  password             = "${random_string.postgres.result}"
  skip_final_snapshot = true
  snapshot_identifier = "after-scrape"
}

resource "random_string" "postgres" {
  length = 32
  special = false
}
data "template_file" "database_dsn" {
  template = "$${engine}://$${username}:$${password}@$${host}:$${port}/$${name}?sslmode=$${sslmode}"

  vars {
    engine   = "${aws_db_instance.shitposter-prod.engine}"
    username = "${aws_db_instance.shitposter-prod.username}"
    password = "${random_string.postgres.result}"
    host     = "${aws_db_instance.shitposter-prod.address}"
    port     = "${aws_db_instance.shitposter-prod.port}"
    name     = "${aws_db_instance.shitposter-prod.name}"
    sslmode  = "verify-full"
  }
}

output "database_url" {
  value = "${data.template_file.database_dsn.rendered}"
}
