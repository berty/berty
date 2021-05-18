provider "aws" {
    region = "eu-central-1"
}


resource "aws_vpc" "connection_1" {
    cidr_block = "10.1.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true
}


resource "aws_subnet" subnet-7e09af42-e282-4048-972a-2fcd3f5e9e8f {
    vpc_id = aws_vpc.connection_1.id
    cidr_block = "10.0.1.0/24"
    availability_zone = "eu-central-1a"
    map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "igateway-83a2fe52-6a9f-4735-b496-0701d77b559c" {
    vpc_id = aws_vpc.connection_1.id
}


resource "aws_default_route_table" "rt-505ac9b9-9b7d-4084-98f9-1fda19375c87" {
    default_route_table_id = aws_vpc.connection_1.default_route_table_id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igateway-83a2fe52-6a9f-4735-b496-0701d77b559c.id
    }
}


resource "aws_security_group" "secgr-35e2978f-a576-41b6-a240-d00e42dcdadb" {
    name = "secgr-35e2978f-a576-41b6-a240-d00e42dcdadb"
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


resource "aws_network_interface" "ni-3945d610-5460-47c1-98a7-c8fdeccb2f75" {
    subnet_id = aws_subnet.subnet-7e09af42-e282-4048-972a-2fcd3f5e9e8f.id
    security_groups = [
        aws_security_group.secgr-35e2978f-a576-41b6-a240-d00e42dcdadb.id,
    ]
}

resource "aws_instance" "test_peers" {
    ami = "ami-018917cd40aae0c4e"
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
        network_interface_id = aws_network_interface.ni-3945d610-5460-47c1-98a7-c8fdeccb2f75.id
    }

}
