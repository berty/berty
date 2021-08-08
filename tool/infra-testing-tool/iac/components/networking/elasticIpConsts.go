package networking

const (
	// ElasticIpHCLTemplate is the elastic ip template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	ElasticIpHCLTemplate = `
resource "aws_eip" "{{.Name }}" {
  network_interface = {{.NetworkInterfaceId }}

  tags = {
  	Name = "{{.Name }}"
  }
}
`

	// ElasticIpNamePrefix is the prefix for the ElasticIp type
	ElasticIpNamePrefix = "eip"

	ElasticIpType = "elasticIp"

	// ElasticIpErrNoNetworkInterface means there is no NetworkInterface attached to the elastic ip
	ElasticIpErrNoNetworkInterface = "elasticIp has no attributes 'NetworkInterface'"
)
