#!/bin/bash

set -e

rm -rf node_modules
rm -rf lib
rm -f scraper.zip
mkdir lib
echo "Running docker npm install --production"
docker run --rm -v "$PWD":/var/task lambci/lambda:build-nodejs8.10 npm install --production --verbose
mv node_modules lib/node_modules
rm -rf package-lock.json
yarn
yarn build
cd lib
zip -r ../scrape.zip .
cd ..
AWS_PROFILE=joaoanes aws s3 cp ./scrape.zip s3://shitposter-lambda-repo/scrape.zip
echo "Done!"
