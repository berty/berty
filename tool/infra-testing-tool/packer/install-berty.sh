#!/bin/bash

sudo yum update
sudo yum install build-essential make htop wget git gcc -y
wget https://golang.org/dl/go1.16.4.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.16.4.linux-amd64.tar.gz
rm go1.16.4.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version

cd ~/ || exit
git clone https://github.com/berty/berty
cd berty/go || exit
make install -j 4
sudo mv ~/go/bin/* /usr/local/bin
berty version
