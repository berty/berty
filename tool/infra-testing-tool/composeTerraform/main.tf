provider "aws" {
  region = "eu-central-1"
}


resource "aws_network_interface" "ni-3a690641-a0da-4995-8569-41f5760afdf3" {
  subnet_id = aws_subnet.subnet-b8517278-ccde-434f-902d-dbed7144581f.id
  security_groups = [
    aws_security_group.secgr-6c1b6e13-6421-4eb7-866e-177eea097c9d.id,
  ]
}

resource "aws_instance" "test-rdvp-e744a16c" {
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
	network_interface_id = aws_network_interface.ni-3a690641-a0da-4995-8569-41f5760afdf3.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4081
export PEER_ID=12D3KooWFzu5ph4EUqjoNW9dZhfjkgXJFYotuA8AFmA1ZWyLRweX
rdvp serve -pk CAESQM2SDhClUvs/DiAQ0XLVnHqgdpEj6gxMQe+TAGTrI4bcW9jisVy7XRLEvy4ExBbB5Rodxr06uy2BxRTWsrDTVEg= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-rdvp-e744a16c"
       Type = "rdvp"
   }
}


resource "aws_network_interface" "ni-e7367328-d17b-47b9-bd67-72d864d83287" {
  subnet_id = aws_subnet.subnet-b8517278-ccde-434f-902d-dbed7144581f.id
  security_groups = [
    aws_security_group.secgr-6c1b6e13-6421-4eb7-866e-177eea097c9d.id,
  ]
}

resource "aws_instance" "test-peers1-e60a7d61" {
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
	network_interface_id = aws_network_interface.ni-e7367328-d17b-47b9-bd67-72d864d83287.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=9887
berty daemon \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-e744a16c.public_ip}/tcp/4081/p2p/12D3KooWFzu5ph4EUqjoNW9dZhfjkgXJFYotuA8AFmA1ZWyLRweX \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers1-e60a7d61"
       Type = "peer"
   }
}


resource "aws_network_interface" "ni-8e6c1e67-028b-47c6-b629-bb8d62b966c7" {
  subnet_id = aws_subnet.subnet-b8517278-ccde-434f-902d-dbed7144581f.id
  security_groups = [
    aws_security_group.secgr-6c1b6e13-6421-4eb7-866e-177eea097c9d.id,
  ]
}

resource "aws_instance" "test-peers2-17087df5" {
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
	network_interface_id = aws_network_interface.ni-8e6c1e67-028b-47c6-b629-bb8d62b966c7.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=5847
berty daemon \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-e744a16c.public_ip}/tcp/4081/p2p/12D3KooWFzu5ph4EUqjoNW9dZhfjkgXJFYotuA8AFmA1ZWyLRweX \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers2-17087df5"
       Type = "peer"
   }
}


resource "aws_vpc" "connection" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}


resource "aws_subnet" subnet-b8517278-ccde-434f-902d-dbed7144581f {
  vpc_id = aws_vpc.connection.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-2c5dcc0a-1a23-446e-9f02-4a078e91000e" {
  vpc_id = aws_vpc.connection.id
}


resource "aws_default_route_table" "rt-dd6736bd-4c82-46ba-8b82-0f68256f4d26" {
  default_route_table_id = aws_vpc.connection.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-2c5dcc0a-1a23-446e-9f02-4a078e91000e.id
  }
}


resource "aws_security_group" "secgr-6c1b6e13-6421-4eb7-866e-177eea097c9d" {
  name = "secgr-6c1b6e13-6421-4eb7-866e-177eea097c9d"
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

