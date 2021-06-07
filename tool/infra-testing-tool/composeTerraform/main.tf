provider "aws" {
    region = "eu-central-1"
}

resource "aws_vpc" "connection" {
    cidr_block = "10.1.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true
}

resource "aws_subnet" subnet-064b3d97 {
    vpc_id = aws_vpc.connection.id
    cidr_block = "10.1.1.0/24"
    availability_zone = "eu-central-1a"
    map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "igateway-e8aaaaf6" {
    vpc_id = aws_vpc.connection.id
}

resource "aws_default_route_table" "rt-80516bd9" {
    default_route_table_id = aws_vpc.connection.default_route_table_id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igateway-e8aaaaf6.id
    }
}

resource "aws_security_group" "secgr-a3805f94" {
    name = "secgr-a3805f94"
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

resource "aws_network_interface" "ni-361b1c9d" {
    subnet_id = aws_subnet.subnet-064b3d97.id
    security_groups = [
        aws_security_group.secgr-a3805f94.id,
    ]
}
resource "aws_instance" "test-rdvp-f6ca69a1" {
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
        network_interface_id = aws_network_interface.ni-361b1c9d.id
    }

    user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=4081
export PEER_ID=12D3KooWF9GhsnnbhnKjSKnivvFYCQNPyiSqfyqovNN333e2NPPL
rdvp serve -pk CAESQGtEbFIPqJs0QZPGpkzvxrL2XAr/D4CtqmcabRD808F0TyJK7kfhLFoRh2IfXRXbxhZNjrkmAVoPZZ7FSLutmh8= \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
        -log.file=/home/ubuntu/log
EOF

    tags = {
        Name = "test-rdvp-f6ca69a1"
        Type = "rdvp"
    }
}

resource "aws_network_interface" "ni-168a73c1" {
    subnet_id = aws_subnet.subnet-064b3d97.id
    security_groups = [
        aws_security_group.secgr-a3805f94.id,
    ]
}
resource "aws_instance" "test-peers1-593df622" {
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
        network_interface_id = aws_network_interface.ni-168a73c1.id
    }

    user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT= 9887
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -log.file=/home/ubuntu/log
EOF

    tags = {
        Name = "test-peers1-593df622"
        Type = "peer"
    }
}

resource "aws_network_interface" "ni-c40a7fb6" {
    subnet_id = aws_subnet.subnet-064b3d97.id
    security_groups = [
        aws_security_group.secgr-a3805f94.id,
    ]
}
resource "aws_instance" "test-peers2-aa8ea881" {
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
        network_interface_id = aws_network_interface.ni-c40a7fb6.id
    }

    user_data = <<EOF
#!/bin/bash
export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT= 5847
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -log.file=/home/ubuntu/log
EOF

    tags = {
        Name = "test-peers2-aa8ea881"
        Type = "peer"
    }
}
