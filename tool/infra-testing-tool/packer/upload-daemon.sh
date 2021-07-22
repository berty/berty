#!/bin/bash

export bucket=bertytest

cd ../..
echo "archiving"
zip -r -q -dd infra.zip infra-testing-tool

echo "uploading"
# shellcheck disable=SC2154
aws s3api put-object --bucket $bucket --key infra.zip --body infra.zip

echo "changing ACL"
aws s3api put-object-acl --acl public-read --bucket $bucket --key infra.zip

