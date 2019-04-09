#!/bin/sh

docker run -d \
  --name watchtower \
  -e REPO_USER="$REPO_USER" \
  -e REPO_PASS="$REPO_PASS" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  v2tec/watchtower berty-push
