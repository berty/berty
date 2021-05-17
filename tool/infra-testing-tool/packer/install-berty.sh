#!/bin/bash

sudo apt-get update
sudo apt-get install build-essential make -y
wget https://golang.org/dl/go1.16.3.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.16.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo $(go version)
cd ~/
git clone https://github.com/berty/berty
cd berty/go
make install
sudo mv ~/go/bin/* /usr/local/bin
berty version
