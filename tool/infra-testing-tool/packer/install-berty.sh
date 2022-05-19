#!/bin/bash

# This script is used by Packer to build a Berty AMI (Amazon Machine Image)
# that will be used by the infra testing tool servers

# update system
sudo yum update -y
sudo yum install gcc gcc-c++ make htop wget git gcc awslogs -y

# install golang
echo "Installing go..."
wget -q "https://golang.org/dl/go$SERVER_GO_VERSION.linux-amd64.tar.gz"
sudo tar -C /usr/local -xzf "go$SERVER_GO_VERSION.linux-amd64.tar.gz"
export PATH=$PATH:/usr/local/go/bin
go version

# install berty
echo "Installing berty ($GITHUB_REMOTE/$GITHUB_BRANCH)..."
git clone --depth 1 --branch $GITHUB_BRANCH "https://github.com/$GITHUB_REMOTE/berty.git"
cd berty/go && make install -j 4
sudo mv $HOME/go/bin/berty /usr/local/bin
berty version

# install berty-infra-server
echo "Installing berty-infra-server..."
cd $HOME/berty/tool/infra-testing-tool && make build.server
sudo mv berty-infra-server /usr/local/bin
sudo mv go/server/infra-server.service /etc/systemd/system
sudo systemctl enable infra-server.service

# create config
echo "Creating AWS config..."
mkdir $HOME/.aws
cat << EOF > $HOME/.aws/config
[default]
region = $(ec2-metadata --availability-zone | sed 's/placement: \(.*\).$/\1/')
EOF
cat $HOME/.aws/config

# create bashrc
echo "Creating bashrc..."
cat << 'EOF' >> $HOME/.bashrc
export publicIp=$(curl -s 'http://169.254.169.254/latest/meta-data/public-ipv4')

macs=$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs)
COUNTER=0
for mac in $macs; do
	export "localIp${COUNTER}"=$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/"${mac%?}"/local-ipv4s)
	((COUNTER++))
done
EOF
cat $HOME/.bashrc

# create logs folder
echo "Creating logs folder..."
mkdir -p $HOME/logs/berty

# create config
echo "Creating AWS Logs..."
mkdir -p /etc/awslogs $HOME/.aws
cat << EOF > /tmp/awslogs.conf
[$HOME/logs/berty/berty.log.json]
datetime_format = %b %d %H:%M:%S
file = $HOME/logs/berty/berty.log.json
buffer_duration = 5000
log_stream_name = $(curl -s http://169.254.169.254/latest/meta-data/instance-id)
initial_position = start_of_file
log_group_name =  berty
EOF

sudo mv /tmp/awslogs.conf /etc/awslogs/awslogs.conf
cat /etc/awslogs/awslogs.conf

echo "starting AWS Logs service..."
sudo service awslogsd start
sudo systemctl enable awslogsd

echo "Done"
