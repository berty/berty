package networking

const (
	// DefaultRouteTableHCLTemplate is the Default Route Table template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	DefaultRouteTableHCLTemplate = `
resource "aws_default_route_table" "{{.Name }}" {
  default_route_table_id = {{.VpcDefaultRouteTableId }}

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = {{.InternetGatewayId}}
  }

  tags = {
  	Name = "{{.Name }}"
  }
}
`

	// DefaultRouteTableNamePrefix is the prefix for the RouteTable type
	DefaultRouteTableNamePrefix = "rt"

	DefaultRouteTableType = "defaultRouteTable"

	// DefaultRouteTableErrNoVpc means there is no Vpc attached to the default route table
	DefaultRouteTableErrNoVpc = "defaultRouteTable has no attribute Vpc"

	// DefaultRouteTableErrNoInternetGateway means there is no internet gateway attached to the default route table
	DefaultRouteTableErrNoInternetGateway = "defaultRouteTable has no attribute Vpc"
)
