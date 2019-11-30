#!/bin/sh

set -e

# https://docs.docker.com/v17.12/install/linux/docker-ce/debian/#set-up-the-repository

apt-get update
apt-get -y install \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
     software-properties-common
curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
add-apt-repository -y \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"

apt-get update
apt-get -y install docker-ce
