# shitpost.network terraform files

This contains the terraform files managing shitpost.network's infra. 
It consists of an ec2 instance for the backend web server, an rds database using Postgres, an s3 bucket and cloudflare distribution for the frontend, route53 resources for DNS management, AWS Lambda functions for scraping and probably others.
Modules that structure what a scraper consists of (usually a lambda function to scrape data, another to validate it and another to sanitize it) are available and should be used whenever possible.

## Useful commands

`terraform init`

`terraform apply` or `terraform plan`

`terraform taint module.lmaoscraper-lambda` to redeploy kittens lambdas (in this case, the lmaoscraper scraper)
