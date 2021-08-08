packer {
    required_plugins {
        amazon = {
            version = ">= 0.0.1"
            source = "github.com/hashicorp/amazon"
        }
    }
}

variable "region" {
    type = string
    default = "eu-central-1"
}

source "amazon-ebs" "amazon-linux" {
    ami_name = "berty-ami"
    instance_type = "t3.2xlarge"
    region = var.region
    source_ami_filter {
        filters = {
            virtualization-type = "hvm"
            name = "amzn2-ami-hvm*"
            root-device-type = "ebs"
        }
        owners = ["amazon"]
        most_recent = true
    }
    ssh_username = "ec2-user"
}

build {
    sources = [
        "source.amazon-ebs.amazon-linux"
    ]

    provisioner "shell" {
        scripts = [
        "install-berty.sh",
        ]
    }
}
