resource "aws_instance" "shitposter" {
  ami = "${data.aws_ami.ubuntu-bionic.id}"
  instance_type = "t2.nano"
  key_name = "${aws_key_pair.mac.key_name}"

  security_groups = [
      "${aws_security_group.http-ssh.name}",
      "${aws_security_group.https.name}",
      "${aws_security_group.default.name}",
      "${aws_security_group.shitposter.name}"
    ]
  iam_instance_profile = "${aws_iam_instance_profile.shitposter.name}"

  provisioner "file" {
    connection {
      user = "ubuntu"
    }
    source      = "keys/deploy-key"
    destination = "/home/ubuntu/.ssh/deploy-key"
  }

  provisioner "remote-exec" {
    connection {
      user = "ubuntu"
    }

    inline = [
        "sleep 5",
        "sudo apt update",
        "wget https://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb && sudo dpkg -i erlang-solutions_1.0_all.deb",
        "curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh",
        "sudo bash nodesource_setup.sh",
        "sudo apt update",
        "sudo apt install nodejs --yes",
        "sudo apt install build-essential make --yes",
        "sudo apt install libxss1 libnss3 libasound2 --yes",
        "sudo apt install esl-erlang --yes",
        "sudo apt install erlang-dev erlang-xmerl erlang-parsetools --yes",
        "sudo apt install elixir --yes",
        "sudo npm install -g yarn",

        "sudo chown ubuntu /home/ubuntu/.config",


        "chmod 0600 ~/.ssh/deploy-key",
        "eval $(ssh-agent)",
        "ssh-add ~/.ssh/deploy-key",
        "ssh-keyscan github.com >> ~/.ssh/known_hosts",

        "git clone git@github.com:joaoanes/shitposter.git",
        "cd shitposter/backend",

        "mix local.rebar --force",
        "mix local.hex --force",
        "MIX_ENV=prod mix deps.get",
        "MIX_ENV=prod mix deps.compile",

        "sudo sh -c \"echo '[Unit]\nDescription=My app daemon\n[Service]\nType=simple\nUser=ubuntu\nRestart=on-failure\nEnvironment=MIX_ENV=prod PORT=4000\nEnvironment=DATABASE_URL=${data.template_file.database_dsn.rendered}\nWorkingDirectory=/home/ubuntu/shitposter/backend\nExecStart=/usr/local/bin/mix phoenix.server\n[Install]\nWantedBy=multi-user.target' > /etc/systemd/system/shitposter.service\"",
        "sudo systemctl enable shitposter",

        "MIX_ENV=prod DATABASE_URL=${data.template_file.database_dsn.rendered} mix do ecto.migrate",

        "cd lib/shitposter_backend/workers/scraper/",
        "yarn",
        "sudo reboot &"
    ]
  }
}

resource "aws_iam_instance_profile" "shitposter" {
    name = "shitposter_profile"
    role = "${aws_iam_role.shitposter_ec2.name}"
}

output "ssh string" {
  value = "ssh ubuntu@${aws_instance.shitposter.public_ip}"
}

