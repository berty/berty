packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type = string
  validation {
    condition     = length(var.aws_region) > 0
    error_message = "The aws_region var can't be empty."
  }
}

variable "github_remote" {
  type = string
  validation {
    condition     = length(var.github_remote) > 0
    error_message = "The github_remote var can't be empty."
  }
}

variable "github_branch" {
  type = string
  validation {
    condition     = length(var.github_branch) > 0
    error_message = "The github_branch var can't be empty."
  }
}

variable "server_go_version" {
  type = string
  validation {
    condition     = length(var.server_go_version) > 0
    error_message = "The server_go_version var can't be empty."
  }
}

source "amazon-ebs" "amazon-linux" {
  ami_name      = "berty-ami"
  instance_type = "t3.2xlarge"
  region        = var.aws_region
  source_ami_filter {
    filters = {
      virtualization-type = "hvm"
      name                = "amzn2-ami-hvm*"
      root-device-type    = "ebs"
    }
    owners      = ["amazon"]
    most_recent = true
  }
  ssh_username = "ec2-user"
}

build {
  sources = [
    "source.amazon-ebs.amazon-linux"
  ]

  provisioner "shell" {
    script = "install-berty.sh"
    environment_vars = [
      join("=", ["AWS_REGION", var.aws_region]),
      join("=", ["GITHUB_REMOTE", var.github_remote]),
      join("=", ["GITHUB_BRANCH", var.github_branch]),
      join("=", ["SERVER_GO_VERSION", var.server_go_version])
    ]
  }
}
