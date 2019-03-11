#!/bin/bash

set -e

yarn build
yarn install --production --modules-folder lib/node_modules
cd lib
zip -r ../scrape.zip .

#cleanup
cd ..
rm -rf lib
yarn
