#! /bin/bash

yarn build
REACT_APP_TAG=$(git describe --tags) REACT_APP_COMMIT=$(git rev-parse HEAD) AWS_PROFILE=joaoanes aws s3 sync ./build s3://shitpost-network-cf/ --delete
AWS_PROFILE=joaoanes aws cloudfront create-invalidation --distribution-id E29A9QENZYC2D5 --paths /index.html
