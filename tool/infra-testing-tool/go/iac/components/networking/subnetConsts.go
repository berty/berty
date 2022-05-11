package networking

const (
	// SubnetHCLTemplate is the Subnet template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	SubnetHCLTemplate = `
resource "aws_subnet" {{.Name }} {
  vpc_id = {{.VpcId }}
  cidr_block = "{{.CidrBlock }}"
  availability_zone = "{{.AvailabilityZone }}"
  map_public_ip_on_launch = true

  tags = {
  	Name = "{{.Name }}"
  }
}
`
	// SubnetCidrBlockDefault is the default value for CidrBlock
	SubnetCidrBlockDefault = "10.0.1.0/24"

	// SubnetNamePrefix is the prefix for the subnet type
	SubnetNamePrefix = "subnet"

	SubnetType = "subnet"

	// SubnetErrNoValidCidrBlock means the attached CidrBlock is not valid
	SubnetErrNoValidCidrBlock = "subnet has no valid attribute 'CidrBlock'"
	// SubnetErrNoVpcId means there is no VpcId attached to the subnet
	SubnetErrNoVpcId = "subnet has no attribute 'VpcId'"
	// SubnetErrNoVpc means there is no Vpc attached to the subnet
	SubnetErrNoVpc = "subnet has no attribute 'Vpc'"
)
