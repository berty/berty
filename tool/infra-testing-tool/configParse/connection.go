package configParse

import (
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/networking"
	"strings"
)

var (
	connections = make(map[string]Connection)
	HCLConnectionComponents = make(map[string][]composeTerraform.HCLComponent)
	)

type Connection struct {
	Name     string `yaml:"name"`
	To       string `yaml:"to"`
	Protocol string `yaml:"protocol"`

	connType string
	Hcl		 map[string][]composeTerraform.HCLComponent
}

const (
	ConnTypeInternet = "internet"
	ConnTypeLan = "lan"
)

func (n Node) ParseConnections() {
	for _, con := range n.Connections {
		connections[con.To] = con
	}
}

func (c *Connection) Validate() bool {
	c.Name = strings.ReplaceAll(c.Name, " ", "_")

	return true
}

func (c *Connection) ParseConnectionType() {
	a := strings.Split(c.To, "_")

	switch a[0] {
	case ConnTypeInternet:
		c.connType = ConnTypeInternet
	case ConnTypeLan:
		c.connType = ConnTypeLan
	default:
		c.connType = ""
	}
}


func (c *Connection) MakeHCLComponents() {

	// abstraction to make it cleaner.
	// gets merged back in the end
	components := HCLConnectionComponents[c.To]

	vpc := networking.NewVpc()
	vpc.Name = c.Name
	components = append(components, vpc)

	subnet := networking.NewSubnetWithAttributes(&vpc)
	components = append(components, subnet)

	if c.connType == ConnTypeInternet {
		ig := networking.NewInternetGatewayWithAttributes(&vpc)
		components = append(components, ig)

		rt := networking.NewDefaultRouteTableWithAttributes(&vpc, &ig)
		components = append(components, rt)
	}

	sg := networking.NewSecurityGroupWithAttributes(&vpc)
	components = append(components, sg)

	HCLConnectionComponents[c.To] = components
}

func (c Connection) GetHCLComponents() (hcl []composeTerraform.HCLComponent){
	for key, _ := range c.Hcl {
		for _, value := range c.Hcl[key] {
			hcl = append(hcl, value)
		}
	}

	return hcl
}


