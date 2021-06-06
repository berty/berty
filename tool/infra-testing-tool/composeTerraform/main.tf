provider "aws" {
  region = "eu-central-1"
}


resource "aws_vpc" "connection" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}


resource "aws_subnet" subnet-bf42806e {
  vpc_id = aws_vpc.connection.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-e62316e7" {
  vpc_id = aws_vpc.connection.id
}


resource "aws_default_route_table" "rt-d992308a" {
  default_route_table_id = aws_vpc.connection.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-e62316e7.id
  }
}


resource "aws_security_group" "secgr-d953cccc" {
  name = "secgr-d953cccc"
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


resource "aws_network_interface" "ni-234c9739" {
  subnet_id = aws_subnet.subnet-bf42806e.id
  security_groups = [
    aws_security_group.secgr-d953cccc.id,
  ]
}

resource "aws_instance" "test-rdvp-f014328c" {
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
	network_interface_id = aws_network_interface.ni-234c9739.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4081
export PEER_ID=12D3KooWJ3TGQiUyuaESPHP2pHD6J78tc6SrATXsxkCJBHXhAUoo
rdvp serve -pk CAESQFjIFmwutuj8L&#43;YDRHfcGQE4X7nQu2trzDC8Gdh5Bz0UejfPVPeNwBvE78XCTdVsGaXDcHPBg3dDQwCO8VDKjA4= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-rdvp-f014328c"
       Type = "rdvp"
   }
}


resource "aws_network_interface" "ni-556679ce" {
  subnet_id = aws_subnet.subnet-bf42806e.id
  security_groups = [
    aws_security_group.secgr-d953cccc.id,
  ]
}

resource "aws_instance" "test-peers1-f5bbf18d" {
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
	network_interface_id = aws_network_interface.ni-556679ce.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT= 9887
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-f014328c.public_ip}/tcp/4081/p2p/12D3KooWJ3TGQiUyuaESPHP2pHD6J78tc6SrATXsxkCJBHXhAUoo \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers1-f5bbf18d"
       Type = "peer"
   }
}


resource "aws_network_interface" "ni-ea838e71" {
  subnet_id = aws_subnet.subnet-bf42806e.id
  security_groups = [
    aws_security_group.secgr-d953cccc.id,
  ]
}

resource "aws_instance" "test-peers2-b9fb77d8" {
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
	network_interface_id = aws_network_interface.ni-ea838e71.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT= 5847
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-f014328c.public_ip}/tcp/4081/p2p/12D3KooWJ3TGQiUyuaESPHP2pHD6J78tc6SrATXsxkCJBHXhAUoo \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers2-b9fb77d8"
       Type = "peer"
   }
}

