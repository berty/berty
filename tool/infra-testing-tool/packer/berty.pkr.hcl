packer {
    required_plugins {
        amazon = {
            version = ">= 0.0.1"
            source = "github.com/hashicorp/amazon"
        }
    }
}

source "amazon-ebs" "ubuntu" {
    ami_name = "berty-ami"
    instance_type = "t3.2xlarge"
    region = "eu-central-1"
    source_ami_filter {
        filters = {
            name                = "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*"
            root-device-type    = "ebs"
            virtualization-type = "hvm"
        }
        most_recent = true
        owners      = ["099720109477"]
    }
    ssh_username = "ubuntu"
}

build {
    sources = [
        "source.amazon-ebs.ubuntu"
    ]

    provisioner "shell" {
        scripts = [
        "install-berty.sh",
        ]
    }
}
