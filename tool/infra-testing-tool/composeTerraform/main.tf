provider "aws" {
  region = "eu-central-1"
}


resource "aws_network_interface" "ni-1ad6f497-3146-4919-992e-1b183a5da017" {
  subnet_id = aws_subnet.subnet-0c5b1af7-61be-4335-8827-67a7ccf59c13.id
  security_groups = [
    aws_security_group.secgr-1addeab7-1861-40e0-8073-d3e0d1cdecf7.id,
  ]
}

resource "aws_instance" "test-rdvp-818ec43c" {
  ami = "ami-0886094d9531e6f03"
  instance_type = "t2.micro"
  key_name = "berty_key"

  // availability zone

  availability_zone = "eu-central-1a"

  // root block device
  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  // networking
  network_interface {
	device_index = 0
	network_interface_id = aws_network_interface.ni-1ad6f497-3146-4919-992e-1b183a5da017.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4081
export PEER_ID=12D3KooWRyznDgFG21F3u6fR81WjThXcGeGxaDgHaX9xt8ppZAbK
rdvp serve -pk CAESQPuH7Br5GqSGFsSmWUc1ccignpYJTxx4vpE7ngBusAXm8DKdcXzUJz01j/bI0BDxx29LfgoYNzfFECDT9+8oC5o= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-rdvp-818ec43c"
       Type = "rdvp"
   }
}


resource "aws_network_interface" "ni-cfc67bea-0a7f-4490-a61f-bc32ab033b70" {
  subnet_id = aws_subnet.subnet-0c5b1af7-61be-4335-8827-67a7ccf59c13.id
  security_groups = [
    aws_security_group.secgr-1addeab7-1861-40e0-8073-d3e0d1cdecf7.id,
  ]
}

resource "aws_instance" "test-peers1-ed476443" {
  ami = "ami-0886094d9531e6f03"
  instance_type = "t2.micro"
  key_name = "berty_key"

  // availability zone

  availability_zone = "eu-central-1a"

  // root block device
  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  // networking
  network_interface {
	device_index = 0
	network_interface_id = aws_network_interface.ni-cfc67bea-0a7f-4490-a61f-bc32ab033b70.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=9887
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-818ec43c.public_ip}/tcp/4081/p2p/12D3KooWRyznDgFG21F3u6fR81WjThXcGeGxaDgHaX9xt8ppZAbK \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers1-ed476443"
       Type = "peer"
   }
}


resource "aws_network_interface" "ni-792c8e79-be76-40f0-a2a9-751f3eed85cf" {
  subnet_id = aws_subnet.subnet-0c5b1af7-61be-4335-8827-67a7ccf59c13.id
  security_groups = [
    aws_security_group.secgr-1addeab7-1861-40e0-8073-d3e0d1cdecf7.id,
  ]
}

resource "aws_instance" "test-peers2-ab0d2a0e" {
  ami = "ami-0886094d9531e6f03"
  instance_type = "t2.micro"
  key_name = "berty_key"

  // availability zone

  availability_zone = "eu-central-1a"

  // root block device
  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  // networking
  network_interface {
	device_index = 0
	network_interface_id = aws_network_interface.ni-792c8e79-be76-40f0-a2a9-751f3eed85cf.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=5847
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-818ec43c.public_ip}/tcp/4081/p2p/12D3KooWRyznDgFG21F3u6fR81WjThXcGeGxaDgHaX9xt8ppZAbK \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers2-ab0d2a0e"
       Type = "peer"
   }
}


resource "aws_vpc" "connection_1" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}


resource "aws_subnet" subnet-0c5b1af7-61be-4335-8827-67a7ccf59c13 {
  vpc_id = aws_vpc.connection_1.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-0707de96-bb27-43a6-a96e-a4f69fc82d6d" {
  vpc_id = aws_vpc.connection_1.id
}


resource "aws_default_route_table" "rt-07f1cb46-0add-4e7a-bb2d-ab33e9f38853" {
  default_route_table_id = aws_vpc.connection_1.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-0707de96-bb27-43a6-a96e-a4f69fc82d6d.id
  }
}


resource "aws_security_group" "secgr-1addeab7-1861-40e0-8073-d3e0d1cdecf7" {
  name = "secgr-1addeab7-1861-40e0-8073-d3e0d1cdecf7"
  vpc_id = aws_vpc.connection_1.id

  ingress {
    cidr_blocks = [
      "0.0.0.0/0",
    ]

    ipv6_cidr_blocks = [
      "::/0"
    ]

    from_port = 0
    to_port = 0
    protocol = "-1"
  }

  egress {

    cidr_blocks = [
      "0.0.0.0/0",
    ]

    ipv6_cidr_blocks = [
      "::/0"
    ]

    from_port = 0
    to_port = 0
    protocol = "-1"
  }
}

