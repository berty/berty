package configParse

import (
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/ec2"
	"infratesting/composeTerraform/components/networking"
)

const (
	NodeTypePeer = iota
	NodeTypeReplicationSever
	NodeTypeTokenServer
)

var HCLNodeComponents []composeTerraform.HCLComponent

type Node struct {
	Name string `yaml:"name"`
	Amount int `yaml:"amount"`
	Groups []Group `yaml:"groups"`
	Connections []Connection `yaml:"connections"`
	nodeType int
}

func (c *Config) ParseNodeTypes() {
	for _, peer := range c.Peers {
		peer.nodeType = NodeTypePeer
	}

	for _, replicationServer := range c.ReplicationServers {
		replicationServer.nodeType = NodeTypeReplicationSever
	}

	for _, tokenServer := range c.TokenServers {
		tokenServer.nodeType = NodeTypeTokenServer
	}
}


func (n Node) MakeHCLComponents() {
	for _, connection := range n.Connections {
		key := connection.To
		networkStack := HCLConnectionComponents[key]


		var assignedSecurityGroup = networking.SecurityGroup{}
		var assignedSubnet = networking.Subnet{}

		for _, HCLComponent := range networkStack {
			if HCLComponent.GetType() == networking.SecurityGroupType {
				assignedSecurityGroup = HCLComponent.(networking.SecurityGroup)
			}

			if HCLComponent.GetType() == networking.SubnetType {
				assignedSubnet = HCLComponent.(networking.Subnet)
			}
		}

		ni := networking.NewNetworkInterfaceWithAttributes(&assignedSubnet, &assignedSecurityGroup)
		HCLNodeComponents = append(HCLNodeComponents, ni)

		instance := ec2.NewInstanceWithAttributes(&ni)
		HCLNodeComponents = append(HCLNodeComponents, instance)

	}
}
