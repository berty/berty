package config

import (
	crand "crypto/rand"
	"encoding/base64"
	"fmt"
	"github.com/google/uuid"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"infratesting/iac"
	"infratesting/iac/components/ec2"
	"infratesting/iac/components/networking"
	"log"
	mrand "math/rand"
	"strings"
)

const (
	NodeTypePeer        = "peer"
	NodeTypeReplication = "repl"
	NodeTypeRDVP        = "rdvp"
	NodeTypeRelay       = "relay"
	NodeTypeBootstrap   = "bootstrap"

	lowerLimitPort = 2000
	upperLimitPort = 8000

	defaultGrpcPort = "9091"
)

type NodeGroup struct {
	// name prefix given in config
	Name        string       `yaml:"name"`
	// name given to individual nodes

	Nodes []Node `yaml:"nodes"`

	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`

	NodeType       string `yaml:"nodeType"`

	// attached components
	Components []iac.Component

}

type Node struct {
	Name string `yaml:"name"`
	Ip  string `yaml:"ip"`
	NodeType       string `yaml:"nodeType"`
	NodeAttributes NodeAttributes `yaml:"nodeAttributes"`
}

type NodeAttributes struct {
	Port     int
	Protocol string
	Pk       string
	PeerId   string
}

func (c *NodeGroup) validate() bool {
	for i:=0; i<c.Amount; i+=1 {
		c.Nodes = append(c.Nodes, Node{Name: c.generateName(), NodeType: c.NodeType})
	}

	return true
}

func (c *NodeGroup) composeComponents() {
	var (
		comps             []iac.Component
	)

	for i, node := range c.Nodes {
		var networkInterfaces []*networking.NetworkInterface

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

		var na NodeAttributes

		instance := ec2.NewInstance()
		instance.Name = node.Name
		instance.NetworkInterfaces = networkInterfaces
		instance.NodeType = c.NodeType

		na.Port = generatePort()
		na.Protocol = "tcp"

		// only do this for RDVP and Relay
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
			peerId, pk, err := genkey()
			if err != nil {
				log.Println(err)
			}

			na.Pk = pk
			na.PeerId = peerId

		}

		node.NodeAttributes = na

		s, err := node.GenerateUserData()
		if err != nil {
			panic(err)
		}

		instance.UserData = s

		comps = append(comps, instance)

		c.Nodes[i] = node
	}

	for i, comp := range comps {
		c, err := comp.Validate()
		if err != nil {
			panic(err)
		}

		comps[i] = c
	}

	c.Components = comps
}

// generatePort generates a random port number between lowerLimitPort and upperLimitPort
func generatePort() int {
	return lowerLimitPort + mrand.Intn(upperLimitPort-lowerLimitPort+1)
}

func (c *NodeGroup) generateName() string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])
}

// genkey generates a pk and peerid
func genkey() (string, string, error) {
	// generate private key
	priv, _, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.Ed25519, -1, crand.Reader)
	if err != nil {
		return "", "", err
	}

	// convert to bytes
	kBytes, err := libp2p_ci.MarshalPrivateKey(priv)
	if err != nil {
		return "", "", err
	}


	// Obtain Peer ID from public key
	pid, err := libp2p_peer.IDFromPublicKey(priv.GetPublic())
	if err != nil {
		return "", "", err
	}

	return  pid.String(), base64.StdEncoding.EncodeToString(kBytes), nil
}

///ip4/${aws_instance.test-rdvp-50af72de.public_ip}/tcp/2000/p2p/12D3KooWP9x2eaFFFkxodN5Ujf1hX2ociNJsyWnpPA9k8Zmx7LQc
///ip4/${aws_instance.test-rdvp-c8e98a04.public_ip}/tcp/2000/p2p/12D3KooWSPwJqR7c4GcjAtfiQRF158WTsungf1S5vE9avuqDprnb
