package networking

const (
	// NetworkInterfaceHCLTemplate is the Network Interface template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	NetworkInterfaceHCLTemplate = `
resource "aws_network_interface" "{{.Name }}" {
  subnet_id = {{.SubnetId }}
  security_groups = [
	{{- range $id := .SecurityGroupIds }}
    {{$id }},
	{{- end }}
  ]

  source_dest_check = false

  tags = {
  	Name = "{{.Name }}"
  }
}
`

	// NetworkInterfaceNamePrefix is the prefix for the NetworkInterface type
	NetworkInterfaceNamePrefix = "ni"

	NetworkInterfaceType = "networkInterface"

	// NetworkInterfaceErrNoSubnetId means there is no SubnetId attached to the network interface
	NetworkInterfaceErrNoSubnetId = "networkInterface has no attributes 'SubnetId'"
	// NetworkInterfaceErrNoSubnet means there is no Subnet attached to the network interface
	NetworkInterfaceErrNoSubnet = "networkInterface has no attributes 'Subnet'"

	// NetworkInterfaceErrNoSecurityGroupIds means there are no SecurityGroupIds attached to the network interface
	NetworkInterfaceErrNoSecurityGroupIds = "networkInterface has no attributes 'SecurityGroupIds'"
	// NetworkInterfaceErrNoSecurityGroups means there are no SecurityGroups attached to the network interface
	NetworkInterfaceErrNoSecurityGroups = "networkInterface has no attributes 'SecurityGroups'"
)
