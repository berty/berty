package networking

const (
	// InternetGatewayHCLTemplate is the Internet Gateway template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	InternetGatewayHCLTemplate = `
resource "aws_internet_gateway" "{{.Name}}" {
  vpc_id = {{.VpcId }}

  tags = {
  	Name = "{{.Name }}"
  }
}
`

	// InternetGatewayNamePrefix is the prefix for the InternetGateway tpe
	InternetGatewayNamePrefix = "igateway"

	InternetGatewayType = "internetGateway"

	// InternetGatewayErrNoVpcId means there is no VpcId attached to the internet gateway
	InternetGatewayErrNoVpcId = "internetGateway has no attribute 'VpcId'"
	// InternetGatewayErrNoVpc means there is no Vpc attached to the internet gateway
	InternetGatewayErrNoVpc = "internetGateway has no attribute 'Vpc'"
)
