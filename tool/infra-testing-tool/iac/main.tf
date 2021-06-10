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

resource "aws_subnet" subnet-87a206d6 {
  vpc_id = aws_vpc.connection_1.id
  cidr_block = "10.1.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "igateway-2e7aef54" {
  vpc_id = aws_vpc.connection_1.id
}

resource "aws_default_route_table" "rt-201a4666" {
  default_route_table_id = aws_vpc.connection_1.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igateway-2e7aef54.id
  }
}

resource "aws_security_group" "secgr-9140ca7d" {
  name = "secgr-9140ca7d"
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

resource "aws_network_interface" "ni-f0c14773" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-rdvp-53e36019" {
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
	network_interface_id = aws_network_interface.ni-f0c14773.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=3701
export PEER_ID=12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3
rdvp serve -pk CAESQCCPJRw3DYIqJsDiFPIOGzEkqVM9+khBj7taG309Ski8VCj4snZYYehlSn37pyKSMc7TuFoL0I/cgcS/fzmdkAY= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-rdvp-53e36019"
       Type = "rdvp"
   }
}

resource "aws_network_interface" "ni-bc469359" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-4ac80e4d" {
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
	network_interface_id = aws_network_interface.ni-bc469359.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=3322
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-4ac80e4d"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-c292ed10" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-bf1a33bc" {
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
	network_interface_id = aws_network_interface.ni-c292ed10.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=6032
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-bf1a33bc"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-7fb93d82" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-0d883b54" {
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
	network_interface_id = aws_network_interface.ni-7fb93d82.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=7422
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-0d883b54"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-5827f409" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-3689d71b" {
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
	network_interface_id = aws_network_interface.ni-5827f409.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4123
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-3689d71b"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-0efcd072" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-96abc8d2" {
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
	network_interface_id = aws_network_interface.ni-0efcd072.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=5536
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-96abc8d2"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-1b10f7e5" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-ea7d914f" {
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
	network_interface_id = aws_network_interface.ni-1b10f7e5.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4937
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-ea7d914f"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-31ae1a39" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-3e722183" {
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
	network_interface_id = aws_network_interface.ni-31ae1a39.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=2529
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-3e722183"
       Type = "peer"
   }
}

resource "aws_network_interface" "ni-4d764259" {
  subnet_id = aws_subnet.subnet-87a206d6.id
  security_groups = [
    aws_security_group.secgr-9140ca7d.id,
  ]
}
resource "aws_instance" "test-peers-1-0cb48308" {
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
	network_interface_id = aws_network_interface.ni-4d764259.id
  }

  user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=7756
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=/ip4/${aws_instance.test-rdvp-53e36019.public_ip}/tcp/3701/p2p/12D3KooWFUtehYhwkQf1AMtsm2jJ6dkJa6raC6XHVYx4Q8swopV3 \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
EOF

   tags = {
       Name = "test-peers-1-0cb48308"
       Type = "peer"
   }
}

