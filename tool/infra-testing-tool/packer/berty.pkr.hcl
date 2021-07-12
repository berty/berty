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
    source_ami = "ami-0bad4a5e987bdebde"
    ssh_username = "ec2-user"
    assume_role {
       policy_arns = [
           "arn:aws:iam::043039367084:policy/packer_build_policy",
       ]
    }
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
