package configParse

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/networking"
	"strings"
)

type Connection struct {
	Name     string `yaml:"name"`
	To       string `yaml:"to"`
	Protocol string `yaml:"protocol"`

	connType string
}

const (
	ConnTypeInternet = "internet"
	ConnTypeLan      = "lan"
)

// Validate validates the connections
func (c *Connection) Validate() error {

	// replace spaces in name
	// would cause error in terraform otherwise
	c.Name = strings.ReplaceAll(c.Name, " ", "_")

	switch strings.Split(c.To, "_")[0] {
	case ConnTypeInternet:
		c.connType = ConnTypeInternet
	case ConnTypeLan:
		c.connType = ConnTypeLan
	default:
		return errors.New("no valid connection type")
	}

	return nil
}

func (c *Connection) composeComponents() {
	var components []composeTerraform.Component


	if VPC == nil {
		vpc := networking.NewVpc()
		vpc.Name = c.Name
		components = append(components, vpc)

		VPC = vpc
	}

	vpc := VPC.(networking.Vpc)


	subnet := networking.NewSubnetWithAttributes(&vpc)
	subnet.CidrBlock = fmt.Sprintf("10.0.%v.0/24", countSubnets())

	components = append(components, subnet)

	// we only need these types if it's actually connected to the internet
	// CAUTION!
	// this will also not allow you to SSH into the peer
	if c.connType == ConnTypeInternet {
		ig := networking.NewInternetGatewayWithAttributes(&vpc)
		components = append(components, ig)

		rt := networking.NewDefaultRouteTableWithAttributes(&vpc, &ig)
		components = append(components, rt)
	}

	sg := networking.NewSecurityGroupWithAttributes(&vpc)
	components = append(components, sg)

	// range over components, append them to ConnectionComponents
	for _, component := range components {
		ConnectionComponents[c.To] = append(ConnectionComponents[c.To], component)
	}
}

func countSubnets() int {
	// ConnectionComponents will always represent the amount of subnets
	// as there is a maximum and minimum of 1 subnet per network stack
	// we add one because ie: 10.0.0.0/24 is not a valid CIDR on AWS
	return len(ConnectionComponents) + 1
}

// TODO:
// write better CIDR construction function
