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
	components []iac.Component

}

type Node struct {
	Name string `yaml:"name"`
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
	var comps []iac.Component

	// loop over nodes in NodeGroup
	for i, node := range c.Nodes {
		// placeholder for network interfaces
		var networkInterfaces []*networking.NetworkInterface

		// GENERATING NETWORK INTERFACES
		// loop over all connections (internet, lan_1, etc)
		for _, connection := range c.Connections {
			key := connection.To
			networkStack := config.Attributes.connectionComponents[key]

			var assignedSecurityGroup networking.SecurityGroup
			var assignedSubnet networking.Subnet

			// loop over the network stack
			for _, component := range networkStack {
				// if the component is a security group, add it to the temp var assignedSecurityGroup
				if component.GetType() == networking.SecurityGroupType {
					assignedSecurityGroup = component.(networking.SecurityGroup)
				}

				// if the component is a subnet, add it to the temp var assignedSubnet
				if component.GetType() == networking.SubnetType {
					assignedSubnet = component.(networking.Subnet)
				}
			}

			// make a network interface with subnet & security group
			ni := networking.NewNetworkInterfaceWithAttributes(&assignedSubnet, &assignedSecurityGroup)
			networkInterfaces = append(networkInterfaces, &ni)
			comps = append(comps, ni)
		}


		// make interface with name, networkInterface & nodeType
		instance := ec2.NewInstance()
		instance.Name = node.Name
		instance.NetworkInterfaces = networkInterfaces
		instance.NodeType = c.NodeType

		// GENERATE USERDATA (startup script)
		var na NodeAttributes

		// generate a port for multiaddr
		na.Port = generatePort()

		// assign protocol
		na.Protocol = "tcp"

		// generate a peerid and pk
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

		// generate the actual userdata
		s, err := node.GenerateUserData()
		if err != nil {
			panic(err)
		}

		instance.UserData = s

		comps = append(comps, instance)

		c.Nodes[i] = node
	}

	// validate each object
	// this happens in "infratesting/iac"
	for i, comp := range comps {
		c, err := comp.Validate()
		if err != nil {
			panic(err)
		}

		comps[i] = c
	}

	c.components = comps
}

// generatePort generates a random port number between lowerLimitPort and upperLimitPort
func generatePort() int {
	return lowerLimitPort + mrand.Intn(upperLimitPort-lowerLimitPort+1)
}

// generate a HCL compatible name
func (c *NodeGroup) generateName() string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])
}

// genkey generates a peerid and pk
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
