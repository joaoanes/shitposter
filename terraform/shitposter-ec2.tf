resource "aws_instance" "shitposter" {
  ami = "${data.aws_ami.ubuntu-bionic.id}"
  instance_type = "t2.medium"
  key_name = "${aws_key_pair.mac.key_name}"

  security_groups = [
      "${aws_security_group.http-ssh.name}",
      "${aws_security_group.https.name}",
      "${aws_security_group.default.name}",
      "${aws_security_group.shitposter.name}",
      "${aws_security_group.puppeteer.name}",
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

        "sudo sh -c \"echo '[Unit]\nDescription=Shitposter!\n[Service]\nType=simple\nUser=ubuntu\nRestart=on-failure\nEnvironment=MIX_ENV=prod\nEnvironment=PORT=4000\nEnvironment=DATABASE_URL=${data.template_file.database_dsn.rendered}\nWorkingDirectory=/home/ubuntu/shitposter/backend\nExecStart=/usr/bin/mix phx.server\n[Install]\nWantedBy=multi-user.target' > /etc/systemd/system/shitposter.service\"",
        "sudo systemctl daemon-reload",
        "sudo systemctl enable shitposter",

        "MIX_ENV=prod DATABASE_URL=${data.template_file.database_dsn.rendered} mix do ecto.migrate",

        "cd lib/shitposter_backend/workers/scraper/",
        "yarn",
        #"sudo reboot &"
    ]
  }
  provisioner "remote-exec" {
    connection {
      user = "ubuntu"
    }

    inline = [
        "sleep 5",
        # "sudo apt update",
        # "curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh",
        # "sudo bash nodesource_setup.sh",
        # "sudo apt update",
        # "sudo apt install nodejs --yes",
        # "sudo apt install build-essential make --yes",
        # "sudo apt install libxss1 libnss3 libasound2 --yes",
        # "sudo npm install -g yarn",

        # "sudo chown ubuntu /home/ubuntu/.config",


        # "chmod 0600 ~/.ssh/deploy-key",
        # "eval $(ssh-agent)",
        # "ssh-add ~/.ssh/deploy-key",
        # "ssh-keyscan github.com >> ~/.ssh/known_hosts",

        "git clone git@github.com:joaoanes/shitposter.git puppeteer",
        "cd puppeteer/nodescraper",

        "yarn",
        "yarn build",

        "sudo sh -c \"echo '[Unit]\nDescription=Shitposter puppeteer!\n[Service]\nType=simple\nUser=ubuntu\nRestart=on-failure\nEnvironment=NODE_ENV=prod\nEnvironment=SHITPOSTER_GRAPHQL_URL=http://localhost:4000\nEnvironment=BUCKET_NAME=${aws_s3_bucket.shitposter-scraper-next.bucket}\nEnvironment=SHITPOSTER_GRAPHQL_TOKEN=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJTaGl0cG9zdGVyQmFja2VuZCIsImV4cCI6MTU4MzM4MzYxMCwiaWF0IjoxNTUyMjc5NjEwLCJpc3MiOiJTaGl0cG9zdGVyQmFja2VuZCIsImp0aSI6IjI3ZTZlMjU1LTY1NDEtNGVmOS05M2Y4LTRlYzI0MmJiOTQ5YiIsIm5iZiI6MTU1MjI3OTYwOSwic3ViIjoiMSIsInR5cCI6ImFjY2VzcyJ9.mbuhNN5Njr0uKpwOlaTO7u3BTWYt97ganJ1_dn_g0tItGfb66ryKDQuV3U9ezGdYuYbqJZxLSvl3FUDF9w_k3A\nEnvironment=PORT=4001\nEnvironment=DATABASE_URL=${module.puppeteer.database_url}\nWorkingDirectory=/home/ubuntu/puppeteer/nodescraper\nExecStart=/usr/bin/node ./lib/puppeteerServer.js\n[Install]\nWantedBy=multi-user.target' > /etc/systemd/system/puppeteer.service\"",
        "sudo systemctl daemon-reload",
        "sudo systemctl enable puppeteer",

        #"sudo reboot &",
    ]
  }

   provisioner "remote-exec" {
    connection {
      user = "ubuntu"
    }

    inline = [
        "wget https://github.com/advantageous/systemd-cloud-watch/releases/download/v0.2.1/systemd-cloud-watch_linux",
        "chmod +x ./systemd-cloud-watch_linux",
        "echo 'log_group = \"shitposter-ec2-journald\"' >> .cwconfig",
        "sudo sh -c \"echo '[Unit]\nDescription=journald-cloudwatch-logs\nWants=basic.target\nAfter=basic.target network.target\n[Service]\nUser=nobody\nGroup=nobody\nExecStart=/home/ubuntu/systemd-cloud-watch_linux /home/ubuntu/.cwconfig\nKillMode=process\nRestart=on-failure\nRestartSec=42s' > /etc/systemd/system/cw.service\"",

        "sudo systemctl daemon-reload",
        "sudo systemctl enable cw",

        #"sudo reboot &",
    ]
  }

  provisioner "remote-exec" {
    connection {
      user = "ubuntu"
    }

    inline = [
        "wget https://github.com/mholt/caddy/releases/download/v1.0.0/caddy_v1.0.0_linux_amd64.tar.gz",
        "tar -xvf caddy_v1.0.0_linux_amd64.tar.gz caddy",
        "echo -e 'https://api.shitpost.network {\n proxy / localhost:4000\n tls joao.anes@gmail.com\n}\nhttps://puppeteer.shitpost.network {\n proxy / localhost:4001\n tls joao.anes@gmail.com\n}' >> ./Caddyfile",
        "sudo sh -c \"echo '[Unit]\nDescription=caddy\nWants=basic.target\nAfter=basic.target network.target\n[Service]\nUser=root\nExecStart=/home/ubuntu/caddy -agree -conf /home/ubuntu/Caddyfile\nKillMode=process\nRestart=on-failure\nRestartSec=42s' > /etc/systemd/system/caddy.service\"",

        "sudo systemctl daemon-reload",
        "sudo systemctl enable caddy",

        "sudo reboot &",
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
