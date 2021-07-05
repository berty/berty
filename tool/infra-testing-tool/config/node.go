package config

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/google/uuid"
	core "github.com/libp2p/go-libp2p-core/crypto"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	crypto "github.com/libp2p/go-libp2p-crypto"
	ma "github.com/multiformats/go-multiaddr"
	"infratesting/iac"
	"infratesting/iac/components/ec2"
	"infratesting/iac/components/networking"
	"log"
	mrand "math/rand"
	"strings"
)

const (
	amountOfTypes = 6
	NodeTypePeer        = "peer"
	NodeTypeReplication = "repl"
	NodeTypeTokenServer = "token"
	NodeTypeRDVP        = "rdvp"
	NodeTypeRelay       = "relay"
	NodeTypeBootstrap   = "bootstrap"

	lowerLimitPort = 2000
	upperLimitPort = 8000

	defaultGrpcPort = "9091"
)

//var AllNodeTypes = []string{NodeTypePeer, NodeTypeReplication, NodeTypeTokenServer, NodeTypeRDVP, NodeTypeRelay, NodeTypeBootstrap}
var AllPeerTypes = []string{NodeTypePeer, NodeTypeReplication}

// NodeGroup contains the information about a "group" of nodes declared together (by the 'NodeGroup.Amount' field)
// Some attributes have slices as types ie: NodeGroup.Groups, NodeGroup.Connections, etc this is because it is possible that
// multiples of that type exist (like multiple connections/daemon, etc.)
// The individual node parameters that are not shared between nodes reside in NodeGroup.Nodes and further Node.NodeAttributes
// Each node is named as following: Node.Name = NodeGroup.Name + uuid.NewString()[:8]
type NodeGroup struct {
	// name prefix given in config
	Name string `yaml:"name"`
	// name given to individual nodes

	Nodes []Node `yaml:"nodes"`

	// Amount is the amount of nodes with this config you want to generate
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"daemon"`
	Connections []Connection `yaml:"connections"`
	Routers     []Router

	NodeType string `yaml:"nodeType"`

	// attached components
	components []iac.Component

	// for token server to know who he's attached to
	ReplicationAttachment 	int
}

type Node struct {
	Name           string         `yaml:"name"`
	NodeType       string         `yaml:"nodeType"`
	NodeAttributes NodeAttributes `yaml:"nodeAttributes"`
	instance 	   ec2.Instance
}

// NodeAttributes contains the node specific attributes
// like port, protocol
// for nodes of type NodeTypeRDVP or NodeTypeRelay an additional 2 attributes are generated:
// NodeAttributes.Pk and NodeAttributes.PeerId
type NodeAttributes struct {
	Port     int
	Protocol string
	Pk       string
	PeerId   string

	Secret []byte
	Sk []byte

	RDVPMaddr      string
	RelayMaddr     string
	BootstrapMaddr string

	// token server specific things
	ReplIp string
	ReplPort int
}

type Router struct {
	RouterType string `yaml:"type"`
	Address    string `yaml:"address"`
}

func (c *NodeGroup) validate() bool {
	// generate multiple nodes in nodegroup
	for i := 0; i < c.Amount; i += 1 {
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

		var hasInternet bool

		// check for double internet connection
		// which isn't allowed
		for _, con := range c.Connections {
			if con.connType == ConnTypeInternet	{
				if hasInternet == true {
					panic(fmt.Sprintf("nodegroup %s, cannot have more than one connection to the internet", c.Name))
				}

				hasInternet = true
			}
		}

		// GENERATING NETWORK INTERFACES
		if len(c.Connections) == 0 {
			panic(fmt.Sprintf("nodegroup %s has no connections", c.Name))
		}

		// loop over all connections (internet, lan_1, etc)
		for _, connection := range c.Connections {
			networkStack := config.Attributes.connectionComponents[connection.To]

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
			ni.Connection = connection.Name

			if len(c.Connections) > 1 {
				if connection.connType == ConnTypeInternet {
					eip := networking.NewElasticIpWithAttributes(&ni)
					comps = append(comps, eip)
				}
			}

			// add networkInterface to node's network interface array
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

		na.Protocol = c.Connections[0].Protocol
		//for _, c := range c.Connections {
		//	na.Protocol = c.Protocol
		//	continue
		//}

		// assign protocol

		// generate a peerid and pk
		// only do this for RDVP and Relay
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
			peerId, pk, err := genKey()
			if err != nil {
				log.Println(err)
			}

			na.Pk = pk
			na.PeerId = peerId
		}

		if c.NodeType == NodeTypeReplication {
			var err error
			na.Sk, err = genServiceKey()
			if err != nil {
				panic(err)
			}

			na.Secret, err = genSecretKey(na.Sk)
			if err != nil {
				panic(err)
			}
		}

		if c.NodeType == NodeTypeTokenServer {
			repl := config.Replication[c.ReplicationAttachment]

			// pick first one considering there always has to be one node
			na.ReplPort = repl.Nodes[0].NodeAttributes.Port
			na.ReplIp = repl.getPublicIP(0)

			var err error
			na.Sk, err = genServiceKey()
			if err != nil {
				panic(err)
			}

			na.Secret, err = genSecretKey(na.Sk)
			if err != nil {
				panic(err)
			}
		}

		na.RDVPMaddr, na.RelayMaddr, na.BootstrapMaddr = c.parseRouters()
		node.NodeAttributes = na

		// generate the actual userdata
		s, err := node.GenerateUserData()
		if err != nil {
			panic(err)
		}

		instance.UserData = s

		comps = append(comps, instance)

		c.Nodes[i] = node
		c.Nodes[i].instance = instance
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

// generateName generates an HCL compatible name
func (c *NodeGroup) generateName() string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])
}

// genkey generates a peerid and pk
func genKey() (peerid string, privatekey string, err error) {
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

	return pid.String(), base64.StdEncoding.EncodeToString(kBytes), nil
}

func seedFromEd25519PrivateKey(key crypto.PrivKey) ([]byte, error) {
	// Similar to (*ed25519).Seed()
	if key.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	r, err := key.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if len(r) != ed25519.PrivateKeySize {
		return nil, errcode.ErrInvalidInput
	}

	return r[:ed25519.PrivateKeySize-ed25519.PublicKeySize], nil
}

func genServiceKey() ([]byte, error) {
	priv, _, err := core.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, err
	}

	seed, err := seedFromEd25519PrivateKey(priv)
	if err != nil {
		panic(err)
	}

	return seed, err
}


func genSecretKey(servicekey []byte) ([]byte, error) {
	stdPrivKey := ed25519.NewKeyFromSeed(servicekey)
	_, pubKey, err := libp2p_ci.KeyPairFromStdKey(&stdPrivKey)
	if err != nil {
		return nil, err
	}

	pubKeyRaw, err := pubKey.Raw()
	if err != nil {
		return nil, err
	}

	return pubKeyRaw, nil

}

// parseRouters parses the router part of the config
func (c NodeGroup) parseRouters() (RDVP, Relay, Bootstrap string) {
	var RDVPMaddrs, RelayMaddrs, BootstrapMaddrs []string
	// generate router data
	for _, router := range c.Routers {
		switch strings.ToLower(router.RouterType) {
		case NodeTypeRDVP:
			maddr, err := ma.NewMultiaddr(router.Address)
			if err == nil {
				RDVPMaddrs = append(RDVPMaddrs, maddr.String())
				continue
			}

			for _, configrdvp := range config.RDVP {
				if configrdvp.Name == router.Address {
					for j := range configrdvp.Nodes {
						RDVPMaddrs = append(RDVPMaddrs, configrdvp.getFullMultiAddr(j))
					}
				}
			}

			for j, RDVPMaddr := range RDVPMaddrs {
				RDVP += RDVPMaddr

				// check if this is the last iteration
				if j+1 != len(RDVPMaddrs) {
					RDVP += ","
				}
			}

		case NodeTypeRelay:
			maddr, err := ma.NewMultiaddr(router.Address)
			if err == nil {
				RelayMaddrs = append(RelayMaddrs, maddr.String())
				continue
			}

			for _, configrelay := range config.Relay {
				if configrelay.Name == router.Address {
					for j := range configrelay.Nodes {
						RelayMaddrs = append(RelayMaddrs, configrelay.getFullMultiAddr(j))
					}
				}
			}

			for j, RelayMaddr := range RelayMaddrs {
				Relay += RelayMaddr

				// check if this is the last iteration
				if j+1 != len(RelayMaddrs) {
					Relay += ","
				}
			}

		case NodeTypeBootstrap:
			maddr, err := ma.NewMultiaddr(router.Address)
			if err == nil {
				BootstrapMaddrs = append(BootstrapMaddrs, maddr.String())
				continue
			}

			for _, configbs := range config.Bootstrap {
				if configbs.Name == router.Address {
					for j := range configbs.Nodes {
						BootstrapMaddrs = append(BootstrapMaddrs, configbs.getFullMultiAddr(j))
					}
				}
			}

			for j, BootstrapMaddr := range BootstrapMaddrs {
				Bootstrap += BootstrapMaddr

				// check if this is the last iteration
				if j+1 != len(BootstrapMaddrs) {
					Bootstrap += ","
				}
			}
		}
	}

	// if no RDVP is assigned, set RDVP to none
	if len(RDVPMaddrs) == 0 {
		RDVP = ":none:"
	}

	// if no Relay is assigned, set RDVP to none
	if len(RelayMaddrs) == 0 {
		Relay = ":none:"
	}

	// if no Bootstrap is assigned, set RDVP to none
	if len(BootstrapMaddrs) == 0 {
		Bootstrap = ":none:"
	}

	return RDVP, Relay, Bootstrap
}

// toHCLStringFormat wraps a string so it can be compiled by the HCL compiler
func toHCLStringFormat(s string) string {
	return fmt.Sprintf("${%s}", s)
}

// getFullMultiAddr returns the full multiaddr with its ip (HCL formatted, will compile to an ipv4 ip address when executed trough terraform), protocol, port and peerId
func (c NodeGroup) getFullMultiAddr(i int) string {
	// this can only be done for RDVP and Relay
	// as other node types don't have a peerId pre-configured
	if len(c.Nodes) >= i-1 {
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
			return fmt.Sprintf("/ip4/%s/%s/%d/p2p/%s", c.getPublicIP(i), c.Nodes[i].NodeAttributes.Protocol, c.Nodes[i].NodeAttributes.Port, c.Nodes[i].NodeAttributes.PeerId)
		}
		panic(errors.New("cannot use function getFullMultiAddr on a node that is not of type RDVP or Relay"))
	}

	panic(errors.New("that node doesn't exist"))
}

// getPublicIP returns the terraform formatting of this Nodes ip
func (c NodeGroup) getPublicIP(i int) string {
	for _, ni := range c.Nodes[i].instance.NetworkInterfaces {
		for _, conn := range c.Connections {
			if conn.Name == ni.Connection {
				return toHCLStringFormat(fmt.Sprintf("aws_network_interface.%s.private_ip", ni.Name))
			}
		}
	}

	panic(errors.New("no possible connection possible"))


	//
	//return toHCLStringFormat(fmt.Sprintf("aws_instance.%s.public_ip", c.Name))
}
