
provider "aws" {
  region = "eu-central-1"
}


resource "aws_vpc" "connection" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}


resource "aws_subnet" subnet-894d922a-ade0-4dd5-9a5b-209a43387c2b {
  vpc_id = aws_vpc.connection.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-6330d13d-23b1-45cf-933a-177b6182c4f4" {
  vpc_id = aws_vpc.connection.id
}


resource "aws_default_route_table" "rt-934de52c-12a1-4fb5-a24e-614262b17767" {
  default_route_table_id = aws_vpc.connection.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-6330d13d-23b1-45cf-933a-177b6182c4f4.id
  }
}


resource "aws_security_group" "secgr-f4370f8d-8726-4183-8235-bd487d9ae51e" {
  name = "secgr-f4370f8d-8726-4183-8235-bd487d9ae51e"
  vpc_id = aws_vpc.connection.id

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


resource "aws_network_interface" "ni-45dec97e-e3b0-4172-97ad-05c59d714b17" {
  subnet_id = aws_subnet.subnet-894d922a-ade0-4dd5-9a5b-209a43387c2b.id
  security_groups = [
    aws_security_group.secgr-f4370f8d-8726-4183-8235-bd487d9ae51e.id,
  ]
}

resource "aws_instance" "test-relay-2fe653c1" {
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
	network_interface_id = aws_network_interface.ni-45dec97e-e3b0-4172-97ad-05c59d714b17.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP4=0.0.0.0
export PROTOC=tcp
export PORT=4081
export PEER_ID=
rdvp serve -pk  \
	-announce "/ip4/$PUBLIC_IP4/$PROTOC/$PORT" \
	-l "/ip4/$PUBLIC_IP4/$PROTOC/$PORT" \
	-log.file=/tmp/log
EOF
}

