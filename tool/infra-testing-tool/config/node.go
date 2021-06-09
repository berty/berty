package config

import (
	"fmt"
	"github.com/google/uuid"
	"infratesting/iac"
	"infratesting/iac/components/ec2"
	"infratesting/iac/components/networking"
	"math/rand"
	"strings"
)

const (
	NodeTypePeer        = "peer"
	NodeTypeReplication = "repl"
	NodeTypeRDVP        = "rdvp"
	NodeTypeRelay       = "relay"
	NodeTypeBootstrap   = "bootstrap"

	lowerLimitPort = 2000
	upperLimitPort = 2000

	defaultGrpcPort = "9091"
)

type Node struct {
	Name        string       `yaml:"name"`
	Names 		[]string
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`

	NodeType       string
	NodeAttributes []NodeAttributes

	// attached components
	Components []iac.Component
}

type NodeAttributes struct {
	Port     int
	Protocol string
	Pk       string
	PeerId   string
}

func (c *Node) validate() bool {
	for i:=0; i<c.Amount; i+=1 {
		c.Names = append(c.Names, c.generateName())
	}

	return true
}

func (c *Node) composeComponents() {
	var (
		comps             []iac.Component
	)

	for i:=0; i<c.Amount; i+=1 {
		var networkInterfaces []*networking.NetworkInterface
		c.NodeAttributes = append(c.NodeAttributes, NodeAttributes{})

		for _, connection := range c.Connections {
			key := connection.To
			networkStack := configAttributes.ConnectionComponents[key]

			var assignedSecurityGroup networking.SecurityGroup
			var assignedSubnet networking.Subnet

			for _, component := range networkStack {
				if component.GetType() == networking.SecurityGroupType {
					assignedSecurityGroup = component.(networking.SecurityGroup)
				}

				if component.GetType() == networking.SubnetType {
					assignedSubnet = component.(networking.Subnet)
				}
			}

			ni := networking.NewNetworkInterfaceWithAttributes(&assignedSubnet, &assignedSecurityGroup)
			networkInterfaces = append(networkInterfaces, &ni)
			comps = append(comps, ni)
		}

		instance := ec2.NewInstance()
		instance.Name = c.Names[i]
		instance.NetworkInterfaces = networkInterfaces
		instance.NodeType = c.NodeType

		c.NodeAttributes[i].Port = generatePort()
		c.NodeAttributes[i].Protocol = "tcp"

		// only do this for RDVP and Relay
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
			c.NodeAttributes[i].Pk, c.NodeAttributes[i].PeerId, _ = genkey()
			fmt.Println(c.getFullMultiAddr(i))
		}

		var err error
		instance.UserData, err = c.GenerateUserData(i)
		if err != nil {
			panic(err)
		}

		comps = append(comps, instance)

	}
	c.Components = comps
}

// generatePort generates a random port number between lowerLimitPort and upperLimitPort
func generatePort() int {
	return lowerLimitPort + rand.Intn(upperLimitPort-lowerLimitPort+1)
}

func (c *Node) generateName() string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])
}

///ip4/${aws_instance.test-rdvp-50af72de.public_ip}/tcp/2000/p2p/12D3KooWP9x2eaFFFkxodN5Ujf1hX2ociNJsyWnpPA9k8Zmx7LQc
///ip4/${aws_instance.test-rdvp-c8e98a04.public_ip}/tcp/2000/p2p/12D3KooWSPwJqR7c4GcjAtfiQRF158WTsungf1S5vE9avuqDprnb
