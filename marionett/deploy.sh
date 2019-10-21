#/bin/bash

yarn build
AWS_PROFILE=joaoanes aws s3 sync ./build s3://shitposter-scraper-frontend/
