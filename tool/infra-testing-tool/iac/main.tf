provider "aws" {
  region = "eu-central-1"
}

variable "ami" {
    type = string
	default = "ami-0a40fe0d4cfc246cc"
}

resource "aws_vpc" "connection_1" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

resource "aws_subnet" subnet-944ae8a8 {
  vpc_id = aws_vpc.connection_1.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "igateway-ec5acb38" {
  vpc_id = aws_vpc.connection_1.id
}

resource "aws_default_route_table" "rt-0a4193c0" {
  default_route_table_id = aws_vpc.connection_1.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-ec5acb38.id
  }
}

resource "aws_security_group" "secgr-028dd8b4" {
  name = "secgr-028dd8b4"
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

resource "aws_network_interface" "ni-bc86df5e" {
  subnet_id = aws_subnet.subnet-944ae8a8.id
  security_groups = [
    aws_security_group.secgr-028dd8b4.id,
  ]
}
resource "aws_instance" "test-rdvp-b1a4eb5c" {
  ami = var.ami
  instance_type = "t3.small"
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
	network_interface_id = aws_network_interface.ni-bc86df5e.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2000
export PEER_ID=12D3KooWM6hAFzNq4Hxka5LsZ1PH5wKp1pfyCBsbvPg36zdEaiPu
rdvp serve -pk CAESQMaJTrCz7x17RdxXYi&#43;8B7XfO/i&#43;iXcnaqK/1Byf9Gowp59Ssw6VJsoOFY0BB9s1EsIALc0nqu/8E67adv&#43;RJCw= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-rdvp-b1a4eb5c"
       Type = "rdvp"
   }
}

resource "aws_network_interface" "ni-ab847437" {
  subnet_id = aws_subnet.subnet-944ae8a8.id
  security_groups = [
    aws_security_group.secgr-028dd8b4.id,
  ]
}
resource "aws_instance" "test-peers-1-7ed4bb7d" {
  ami = var.ami
  instance_type = "t3.small"
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
	network_interface_id = aws_network_interface.ni-ab847437.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2000
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-b1a4eb5c.public_ip}/tcp/2000/p2p/12D3KooWM6hAFzNq4Hxka5LsZ1PH5wKp1pfyCBsbvPg36zdEaiPu \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-7ed4bb7d"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-1cb572cb" {
  subnet_id = aws_subnet.subnet-944ae8a8.id
  security_groups = [
    aws_security_group.secgr-028dd8b4.id,
  ]
}
resource "aws_instance" "test-peers-1-6baabc01" {
  ami = var.ami
  instance_type = "t3.small"
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
	network_interface_id = aws_network_interface.ni-1cb572cb.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2000
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-b1a4eb5c.public_ip}/tcp/2000/p2p/12D3KooWM6hAFzNq4Hxka5LsZ1PH5wKp1pfyCBsbvPg36zdEaiPu \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-6baabc01"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-897759fa" {
  subnet_id = aws_subnet.subnet-944ae8a8.id
  security_groups = [
    aws_security_group.secgr-028dd8b4.id,
  ]
}
resource "aws_instance" "test-peers-1-beb96cff" {
  ami = var.ami
  instance_type = "t3.small"
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
	network_interface_id = aws_network_interface.ni-897759fa.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2000
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-b1a4eb5c.public_ip}/tcp/2000/p2p/12D3KooWM6hAFzNq4Hxka5LsZ1PH5wKp1pfyCBsbvPg36zdEaiPu \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-beb96cff"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-8421f29f" {
  subnet_id = aws_subnet.subnet-944ae8a8.id
  security_groups = [
    aws_security_group.secgr-028dd8b4.id,
  ]
}
resource "aws_instance" "test-peers-1-3f531095" {
  ami = var.ami
  instance_type = "t3.small"
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
	network_interface_id = aws_network_interface.ni-8421f29f.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2000
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-b1a4eb5c.public_ip}/tcp/2000/p2p/12D3KooWM6hAFzNq4Hxka5LsZ1PH5wKp1pfyCBsbvPg36zdEaiPu \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-3f531095"
       Type = "peer"
   }
}

