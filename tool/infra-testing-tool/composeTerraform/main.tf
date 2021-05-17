provider "aws" {
  region = "eu-central-1"
}

resource "aws_vpc" "connection_1" {
    cidr_block = "10.0.1.0/24"
    enable_dns_hostnames = true
    enable_dns_support = true
}


resource "aws_subnet" subnet-30c4d05a-0d79-4b73-804a-6388f99d2278 {
    vpc_id = aws_vpc.connection_1.id
    cidr_block = "10.0.1.0/24"
    map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-f81220f2-097d-4098-b95e-5cf998845640" {
    vpc_id = aws_vpc.connection_1.id
}


resource "aws_default_route_table" "rt-cba77743-a645-45fd-b0a5-ce73e8ad00b9" {
    default_route_table_id = aws_vpc.connection_1.default_route_table_id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igateway-f81220f2-097d-4098-b95e-5cf998845640.id
    }
}


resource "aws_security_group" "secgr-47002daf-5c07-4626-9e1f-25bb5c7e97d4" {
    name = "secgr-47002daf-5c07-4626-9e1f-25bb5c7e97d4"
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


resource "aws_network_interface" "ni-92f71220-7e3d-4720-b1ed-c2de2d2ab582" {
    subnet_id = aws_subnet.subnet-30c4d05a-0d79-4b73-804a-6388f99d2278.id
    security_groups = [
        aws_security_group.secgr-47002daf-5c07-4626-9e1f-25bb5c7e97d4.id,
    ]
}

resource "aws_instance" "ec2-1a829a28-3c07-4000-98e3-4bc0608ca7ce" {
    ami = "ami-018917cd40aae0c4e"
    instance_type = "t2.micro"
    key_name = "berty_key"

    // root block device
    root_block_device {
        volume_type = "gp2"
        volume_size = 8
    }

    // networking
    network_interface {
        device_index = 0
        network_interface_id = aws_network_interface.ni-92f71220-7e3d-4720-b1ed-c2de2d2ab582.id
    }

}




