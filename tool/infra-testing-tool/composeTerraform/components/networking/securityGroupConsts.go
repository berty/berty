package networking

const (
	// SecurityGroupHCLTemplate is the Security Group template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	SecurityGroupHCLTemplate = `
resource "aws_security_group" "{{.Name }}" {
  name = "{{.Name }}"
  vpc_id = {{.VpcId }}

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
`

	// SecurityGroupNamePrefix is the prefix for the SecurityGroup type
	// can't use "sg" here as that causes a 400 when creating the component (because aws uses "sg")
	SecurityGroupNamePrefix = "secgr"

	SecurityGroupType = "securityGroup"

	// SecurityGroupErrNoVpcId means there is no VpcId attached to the security group
	SecurityGroupErrNoVpcId = "securityGroup has no attribute 'VpcId'"
	// SecurityGroupErrNoVpc means there is no Vpc attached to the security group
	SecurityGroupErrNoVpc = "securityGroup has no attribute 'Vpc'"
)
