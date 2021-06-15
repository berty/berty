package config

import (
	"errors"
	"fmt"
	"infratesting/iac"
	"infratesting/iac/components/networking"
	"strconv"
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

// ParseConnections takes the connection, adds it to the global connections
func (c NodeGroup) parseConnections() error {
	for _, con := range c.Connections {
		config.Attributes.Connections[con.To] = con
	}

	return nil
}

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

// composeComponents composes the terraform components based on the Connection
func (c *Connection) composeComponents() {
	var components []iac.Component

	// create VPC
	var vpc networking.Vpc
	if config.Attributes.vpc == *new(networking.Vpc) {
		vpc = networking.NewVpc()
		vpc.Name = c.Name
		components = append(components, vpc)

		config.Attributes.vpc = vpc
	}

	vpc = config.Attributes.vpc

	// create a subnet
	subnet := networking.NewSubnetWithAttributes(&vpc)
	subnet.CidrBlock = generateNewSubnetCIDR()

	components = append(components, subnet)

	// add internet gateway and route table
	// we only need these types if it's actually connected to the internet
	if c.connType == ConnTypeInternet {
		ig := networking.NewInternetGatewayWithAttributes(&vpc)
		components = append(components, ig)

		rt := networking.NewDefaultRouteTableWithAttributes(&vpc, &ig)
		components = append(components, rt)
	}

	// add security group
	sg := networking.NewSecurityGroupWithAttributes(&vpc)
	components = append(components, sg)

	for i, comp := range components {
		comp, err := comp.Validate()
		if err != nil {
			panic(err)
		}

		components[i] = comp
	}

	// append components to configs' ConnectionComponents
	config.Attributes.connectionComponents[c.To] = append(config.Attributes.connectionComponents[c.To], components...)
}

// countSubnets returns the amount of subnets
func countSubnets() int {
	// config.Attributes.ConnectionComponents will always represent the amount of subnets
	// as there is a maximum and minimum of 1 subnet per network stack
	// we add one because ie: 10.0.0.0/24 is not a valid CIDR on AWS
	return len(config.Attributes.connectionComponents) + 1
}

// generateNewSubnetCIDR generates a new, valid CIDR Block for subnets to use based on the VPC and other subnets
func generateNewSubnetCIDR() string {
	var ip []string
	var cidr int

	vpcCidrBlock := config.Attributes.vpc.CidrBlock

	//TODO:
	// replace this with the `net` package, use IP and net.IPMask, etc
	// because this is really sketchy

	split := strings.Split(vpcCidrBlock, ".")
	ip = append(ip, split[:len(split)-1]...)

	split = strings.Split(split[len(split)-1], "/")
	ip = append(ip, split[0])
	cidr, _ = strconv.Atoi(split[1])

	switch cidr {
	case 16:
		return fmt.Sprintf("%v.%v.%v.%v/%v", ip[0], ip[1], countSubnets(), 0, 24)
	default:
		return ""
	}
}
