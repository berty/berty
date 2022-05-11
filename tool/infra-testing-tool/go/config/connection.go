package config

import (
	"fmt"
	"infratesting/iac"
	"infratesting/iac/components/networking"
	"strconv"
	"strings"
)

type Connection struct {
	To       string `yaml:"to"`
	Protocol string `yaml:"protocol"`

	connType      string
	infraToolOnly bool
}

const (
	ConnTypeInternet = "internet"
	ConnTypeLan      = "lan"
)

// parseConnections takes the connection, adds it to the global connections
func (c *NodeGroup) parseConnections() error {
	if len(c.Connections) == 0 {
		return fmt.Errorf("%s needs at least 1 connection", c.NodeType)
	}

	// replace spaces in name
	// would cause error in terraform otherwise
	c.Name = strings.ReplaceAll(c.Name, " ", "_")

	var hasInternet bool
	for i := range c.Connections {
		if strings.Contains(c.Connections[i].To, ConnTypeInternet) {
			c.Connections[i].connType = ConnTypeInternet
			hasInternet = true
		} else {
			c.Connections[i].connType = ConnTypeLan
		}

		// check protocol
		switch c.Connections[i].Protocol {
		case quic:
			// fmt.Println("quic")
			// ok
		case websocket:
			// ok
		case tcp:
			// ok
		case udp:
			// ok
		default:
			return fmt.Errorf("invalid protocol: %v", c.Connections[i].Protocol)
		}

		config.Attributes.Connections[c.Connections[i].To] = &c.Connections[i]
	}

	if !hasInternet {
		// supplementary connection for gRPC to talk to daemon
		var con = Connection{
			To:            ConnTypeInternet,
			Protocol:      tcp,
			connType:      ConnTypeInternet,
			infraToolOnly: true,
		}

		// prepend
		c.Connections = append(c.Connections, con)
		config.Attributes.Connections[ConnTypeInternet] = &con
	}

	return nil
}

// Validate validates the connections
func (c Connection) validate() error {
	return nil
}

// composeComponents composes the terraform components based on the Connection
func (c Connection) composeComponents() {
	var components []iac.Component

	// create VPC
	var vpc networking.Vpc
	if config.Attributes.vpc == *new(networking.Vpc) {
		vpc = networking.NewVpc()
		components = append(components, vpc)

		config.Attributes.vpc = vpc
	}

	vpc = config.Attributes.vpc

	// create a subnet
	subnet := networking.NewSubnetWithAttributes(&vpc)
	subnet.CidrBlock = generateNewSubnetCIDR()
	subnet.AvailabilityZone = generateSubnetAZ()

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

	if c.connType == ConnTypeInternet && c.infraToolOnly {

		// port 22, tcp, from anywhere for ssh
		components = append(components, makeInternetSGRules(22, tcp, false, sg)...)

		// port 9090, tcp, from anywhere for infra server
		components = append(components, makeInternetSGRules(9090, tcp, false, sg)...)

		// port 443, tcp, from anywhere for s3 upload
		components = append(components, makeInternetSGRules(443, tcp, false, sg)...)

	} else if c.connType == ConnTypeInternet {
		components = append(components, makeInternetSGRules(0, "-1", false, sg)...)
	} else {
		// all ports, any protocol, from anywhere
		components = append(components, makeInternetSGRules(0, "-1", true, sg)...)
	}

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

	// TODO:
	// replace this with the `net` package, use IP and net.IPMask, etc
	// because this is really sketchy

	split := strings.Split(vpcCidrBlock, ".")
	ip = append(ip, split[:len(split)-1]...)

	split = strings.Split(split[len(split)-1], "/")
	ip = append(ip, split[0])
	cidr, _ = strconv.Atoi(split[1])

	switch cidr {
	case 16:
		return fmt.Sprintf("%s.%s.%d.%d/%d", ip[0], ip[1], countSubnets(), 0, 24)
	default:
		return ""
	}
}

func generateSubnetAZ() string {
	// TODO
	// add support for more AZ's here
	return fmt.Sprintf("%sa", GetRegion())
}

// makeInternetSGRules is here to avoid DRY code
// it returns the components of 2 security group rules
// egress & ingress
func makeInternetSGRules(port int, protocol string, self bool, securityGroup networking.SecurityGroup) (comps []iac.Component) {
	sgre := networking.NewSecurityGroupRuleEgress()
	sgre.SetPorts(port)
	sgre.Protocol = protocol
	sgre.Self = self
	sgre.SecurityGroupId = securityGroup.GetId()

	comps = append(comps, sgre)

	sgri := networking.NewSecurityGroupRuleIngress()
	sgri.SetPorts(port)
	sgri.Protocol = protocol
	sgre.Self = self
	sgri.SecurityGroupId = securityGroup.GetId()

	comps = append(comps, sgri)

	return comps
}
