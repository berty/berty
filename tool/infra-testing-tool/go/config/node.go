package config

import (
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"infratesting/iac"
	"infratesting/iac/components/ec2"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	mrand "math/rand"
	"strconv"
	"strings"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/google/uuid"
	crypto "github.com/libp2p/go-libp2p/core/crypto"
	pb "github.com/libp2p/go-libp2p/core/crypto/pb"
	libp2p_peer "github.com/libp2p/go-libp2p/core/peer"
	ma "github.com/multiformats/go-multiaddr"
)

const (
	NodeTypePeer        = "peer"
	NodeTypeReplication = "repl"
	NodeTypeRDVP        = "rdvp"
	NodeTypeRelay       = "relay"
	NodeTypeBootstrap   = "bootstrap"

	udp       = "udp"
	tcp       = "tcp"
	quic      = "quic"
	websocket = "ws"

	lowerLimitPort = 9095
	upperLimitPort = 30000

	none = ":none:"
)

var AllPeerTypes = []string{NodeTypePeer, NodeTypeReplication}

// NodeGroup contains the information about a "group" of nodes declared together (by the 'NodeGroup.Amount' field)
// Some attributes have slices as types ie: NodeGroup.Groups, NodeGroup.Connections, etc this is because it is possible that
// multiples of that type exist (like multiple connections/groups, etc.)
// The individual node parameters that are not shared between nodes reside in NodeGroup.Nodes and further Node.NodeAttributes
// Each node is named as following: Node.Name = NodeGroup.Name + uuid.NewString()[:8]
type NodeGroup struct {
	// name prefix given in config
	Name string `yaml:"name"`
	// name given to individual nodes

	Nodes []Node `yaml:"nodes"`

	Reliability string `yaml:"reliability"`

	// Amount is the amount of nodes with this config you want to generate
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`
	Routers     []Router

	NodeType string `yaml:"nodeType"`

	// attached components
	components []iac.Component
}

type Node struct {
	Name           string         `yaml:"name"`
	NodeType       string         `yaml:"nodeType"`
	NodeAttributes NodeAttributes `yaml:"nodeAttributes"`
	instance       ec2.Instance
}

// NodeAttributes contains the node specific attributes
// like ports, protocols
// for nodes of type NodeTypeRDVP or NodeTypeRelay an additional 2 attributes are generated:
// NodeAttributes.Pk and NodeAttributes.PeerId
type NodeAttributes struct {
	Ports     []int
	Protocols []string
	Listener  string
	Announce  string

	Pk     string
	PeerId string

	Secret []byte
	Sk     []byte

	RDVPMaddr      string
	RelayMaddr     string
	BootstrapMaddr string

	// token server specific things
	TokenSecret []byte
	TokenSk     []byte

	Reliability Reliability
}

type Reliability struct {
	Timeout int64
	Odds    int64
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

	var r Reliability
	var err error

	if c.Reliability == "" || c.Reliability == "0,0" {
		r.Timeout = 0
		r.Odds = 0
	} else {
		s := strings.Split(c.Reliability, ",")
		if len(s) != 2 {
			panic(fmt.Sprintf("reliability setting %s is not valid. Please us the format: timeout,int ie: 120,5 for a 1 in 5 chance the peer is unreachable 120 seconds", c.Reliability))
		}

		r.Timeout, err = strconv.ParseInt(s[0], 10, 64)
		if err != nil {
			panic(fmt.Sprintf("reliability timeout %s is not valid", s[0]))
		}

		if r.Timeout < 0 {
			panic(fmt.Sprintf("reliability timeout %d is too small", r.Timeout))
		}

		r.Odds, err = strconv.ParseInt(s[1], 10, 64)
		if err != nil {
			panic(fmt.Sprintf("reliability odds %s is not valid", s[1]))
		}

		if r.Odds < 0 {
			panic(fmt.Sprintf("reliability odds %d is too small", r.Odds))
		}
	}

	// loop over nodes in NodeGroup
	for i := range c.Nodes {
		if len(c.Connections) == 0 {
			panic(fmt.Sprintf("nodegroup %s has no connections", c.Name))
		}

		c.Nodes[i].NodeAttributes.Reliability = r

		// placeholder for network interfaces
		var networkInterfaces []*networking.NetworkInterface

		// // check for double internet connection
		// // which isn't allowed
		// var hasInternet bool
		// for _, con := range c.Connections {
		// 	if con.connType == ConnTypeInternet {
		// 		if hasInternet {
		// 			panic(fmt.Sprintf("nodegroup %s, cannot have more than one connection to the internet", c.Name))
		// 		}

		// 		hasInternet = true
		// 	}
		// }

		// generate a port for multiaddr
		for _, connection := range c.Connections {
			c.Nodes[i].NodeAttributes.Protocols = append(c.Nodes[i].NodeAttributes.Protocols, connection.Protocol)
			c.Nodes[i].NodeAttributes.Ports = append(c.Nodes[i].NodeAttributes.Ports, c.generatePort(i))
		}

		// GENERATING NETWORK INTERFACES

		var securityGroups []*networking.SecurityGroup

		for _, connection := range c.Connections {
			for _, component := range config.Attributes.connectionComponents[connection.To] {
				if component.GetType() == networking.SecurityGroupType {
					sg := component.(networking.SecurityGroup)
					securityGroups = append(securityGroups, &sg)
				}
			}
		}

		// loop over all connections (internet, lan_1, etc)
		for _, connection := range c.Connections {
			networkStack := config.Attributes.connectionComponents[connection.To]

			assignedSecurityGroups := securityGroups
			var assignedSubnet networking.Subnet

			// loop over the network stack
			for _, component := range networkStack {
				// if the component is a subnet, add it to the temp var assignedSubnet
				if component.GetType() == networking.SubnetType {
					assignedSubnet = component.(networking.Subnet)
				}
			}

			// make a network interface with subnet & security group
			ni := networking.NewNetworkInterfaceWithAttributes(&assignedSubnet, assignedSecurityGroups)
			ni.Connection = connection.To

			comps = append(comps, ni)

			// prepend the internet connection
			// so the internet is always first
			if connection.connType == ConnTypeInternet {
				networkInterfaces = append([]*networking.NetworkInterface{&ni}, networkInterfaces...)
			} else {
				networkInterfaces = append(networkInterfaces, &ni)
			}

			if connection.connType == ConnTypeInternet {
				eip := networking.NewElasticIpWithAttributes(&ni)
				comps = append(comps, eip)
			}
		}

		// make interface with name, networkInterface & nodeType
		instance := ec2.NewInstance()
		instance.KeyName = GetKeyPairName()
		instance.Name = c.Nodes[i].Name
		instance.NetworkInterfaces = networkInterfaces
		instance.NodeType = c.NodeType

		// get correct instance type (depends on amount of connections)
		instance.InstanceType = c.GetCorrectInstanceType()

		// generate listener maddrs
		// generate announce maddrs
		var listenerMaddrs []string
		var announceMaddrs []string
		for p := range c.Nodes[i].NodeAttributes.Protocols {
			listenerMaddrs = append(listenerMaddrs, c.getSwarmListenerMultiAddr("0.0.0.0", i, p, p))
			announceMaddrs = append(announceMaddrs, c.getSwarmAnnounceMultiAddr(i, p, p))
		}

		for x := range listenerMaddrs {
			c.Nodes[i].NodeAttributes.Listener += listenerMaddrs[x]
			c.Nodes[i].NodeAttributes.Announce += announceMaddrs[x]

			// check if this is the last iteration
			if x+1 != len(listenerMaddrs) {
				c.Nodes[i].NodeAttributes.Listener += ","
				c.Nodes[i].NodeAttributes.Announce += ","
			}
		}

		// generate a peerId and pk
		// only do this for RDVP, Relay and Bootstrap
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay || c.NodeType == NodeTypeBootstrap {
			peerId, pk, err := genKey()
			if err != nil {
				logging.Log(err)
			}

			c.Nodes[i].NodeAttributes.Pk = pk
			c.Nodes[i].NodeAttributes.PeerId = peerId
		}

		// generate keys for replication
		if c.NodeType == NodeTypeReplication {
			var err error
			c.Nodes[i].NodeAttributes.Sk, err = genServiceKey()
			if err != nil {
				panic(err)
			}

			c.Nodes[i].NodeAttributes.Secret, err = genSecretKey(c.Nodes[i].NodeAttributes.Sk)
			if err != nil {
				panic(err)
			}

			// this needs some work
			c.Nodes[i].NodeAttributes.TokenSk, err = genServiceKey()
			if err != nil {
				panic(err)
			}

			c.Nodes[i].NodeAttributes.TokenSecret, err = genSecretKey(c.Nodes[i].NodeAttributes.TokenSk)
			if err != nil {
				panic(err)
			}
		}

		// parse the routers for maddrs
		c.Nodes[i].NodeAttributes.RDVPMaddr, c.Nodes[i].NodeAttributes.RelayMaddr, c.Nodes[i].NodeAttributes.BootstrapMaddr = c.parseRouters()

		// generate and compile userdata
		s, err := c.Nodes[i].GenerateUserData()
		if err != nil {
			panic(err)
		}

		instance.UserData = s
		c.Nodes[i].instance = instance

		comps = append(comps, instance)

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

// parseRouters parses the router part of the config
func (c *NodeGroup) parseRouters() (RDVP, Relay, Bootstrap string) {
	var RDVPMaddrs, RelayMaddrs, BootstrapMaddrs []string
	// generate router data
	for _, router := range c.Routers {
		router.Address = strings.ReplaceAll(router.Address, " ", "_")

		switch strings.ToLower(router.RouterType) {
		case NodeTypeRDVP:
			maddr, err := ma.NewMultiaddr(router.Address)
			if err == nil {
				RDVPMaddrs = append(RDVPMaddrs, maddr.String())
			}

			for _, configrdvp := range config.RDVP {
				var conIndex = -1
				for i, con1 := range configrdvp.Connections {
					for _, con2 := range c.Connections {
						if con1.To == con2.To {
							conIndex = i
						}
					}

					if configrdvp.Name == router.Address {
						if conIndex == -1 {
							panic(fmt.Sprintf("router names match up, but protocols do not: %s-%s", router.RouterType, router.Address))
						}

						for j := range configrdvp.Nodes {
							RDVPMaddrs = append(RDVPMaddrs, configrdvp.getFullMultiAddrWithPeerId(j, conIndex, conIndex))
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
			}

		case NodeTypeRelay:
			maddr, err := ma.NewMultiaddr(router.Address)
			if err == nil {
				RelayMaddrs = append(RelayMaddrs, maddr.String())
			}

			for _, configrelay := range config.Relay {
				var conIndex = -1
				for i, con1 := range configrelay.Connections {
					for _, con2 := range c.Connections {
						if con1.To == con2.To && con1.Protocol == con2.Protocol {
							conIndex = i
						}
					}
				}

				if configrelay.Name == router.Address {
					if conIndex == -1 {
						panic(fmt.Sprintf("router names match up, but protocols do not: %s-%s", router.RouterType, router.Address))
					}

					for j := range configrelay.Nodes {
						RelayMaddrs = append(RelayMaddrs, configrelay.getFullMultiAddrWithPeerId(j, conIndex, conIndex))
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
			}

			for _, configBs := range config.Bootstrap {
				var conIndex = -1
				for i, con1 := range configBs.Connections {
					for _, con2 := range c.Connections {
						if con1.To == con2.To && con1.Protocol == con2.Protocol {
							conIndex = i
						}
					}
				}

				if configBs.Name == router.Address {
					if conIndex == -1 {
						panic(fmt.Sprintf("router names match up, but protocols do not: %s-%s", router.RouterType, router.Address))
					}

					for j := range configBs.Nodes {
						BootstrapMaddrs = append(BootstrapMaddrs, configBs.getFullMultiAddrWithPeerId(j, conIndex, conIndex))
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
		RDVP = none
	}

	// if no Relay is assigned, set RDVP to none
	if len(RelayMaddrs) == 0 {
		Relay = none
	}

	// if no Bootstrap is assigned, set RDVP to none
	if len(BootstrapMaddrs) == 0 {
		Bootstrap = none
	}

	return RDVP, Relay, Bootstrap
}

// toHCLStringFormat wraps a string so it can be compiled by the HCL compiler
func toHCLStringFormat(s string) string {
	return fmt.Sprintf("${%s}", s)
}

// getFullMultiAddr returns the full multiaddr with its ip (HCL formatted, will compile to an ipv4 ip address when executed trough terraform), protocol, port and peerId
func (c NodeGroup) getFullMultiAddrWithPeerId(nodeIndex, protocolIndex, portIndex int) string {
	// this can only be done for RDVP and Relay
	// as other node types don't have a peerId pre-configured
	if len(c.Nodes) >= nodeIndex-1 {
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay || c.NodeType == NodeTypeBootstrap {
			switch c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex] {
			case quic:
				return fmt.Sprintf("/ip4/%s/udp/%d/quic/p2p/%s",
					c.getPublicIP(nodeIndex),
					c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
					c.Nodes[nodeIndex].NodeAttributes.PeerId,
				)
			case websocket:
				return fmt.Sprintf("/ip4/%s/tcp/%d/ws/p2p/%s",
					c.getPublicIP(nodeIndex),
					c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
					c.Nodes[nodeIndex].NodeAttributes.PeerId,
				)
			default:
				return fmt.Sprintf("/ip4/%s/%s/%d/p2p/%s",
					c.getPublicIP(nodeIndex),
					c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex],
					c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
					c.Nodes[nodeIndex].NodeAttributes.PeerId,
				)
			}
		}
		panic(errors.New("cannot use function getFullMultiAddr on a node that is not of type RDVP or Relay"))
	}

	panic(errors.New("trying to access multiAddr of node that doesn't exist"))
}

// getSwarmListenerMultiAddr generates swarm listener multi addr
func (c NodeGroup) getSwarmListenerMultiAddr(ip string, nodeIndex, protocolIndex, portIndex int) string {
	switch c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex] {
	case quic:
		return fmt.Sprintf("/ip4/%s/udp/%d/quic",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	case websocket:
		return fmt.Sprintf("/ip4/%s/tcp/%d/ws",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	default:
		return fmt.Sprintf("/ip4/%s/%s/%d",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex],
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	}
}

// getSwarmListenerMultiAddr generates swarm listener multi addr
func (c NodeGroup) getSwarmAnnounceMultiAddr(nodeIndex, protocolIndex, portIndex int) string {
	var ip string

	if c.Connections[protocolIndex].To == ConnTypeInternet {
		ip = "$publicIp"
	} else {
		ip = fmt.Sprintf("$localIp%v", protocolIndex)
	}

	switch c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex] {
	case quic:
		return fmt.Sprintf("/ip4/%s/udp/%d/quic",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	case websocket:
		return fmt.Sprintf("/ip4/%s/tcp/%d/ws",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	default:
		return fmt.Sprintf("/ip4/%s/%s/%d",
			ip,
			c.Nodes[nodeIndex].NodeAttributes.Protocols[protocolIndex],
			c.Nodes[nodeIndex].NodeAttributes.Ports[portIndex],
		)
	}
}

// getPublicIP returns the terraform formatting of this Nodes ip
func (c NodeGroup) getPublicIP(i int) string {
	for _, ni := range c.Nodes[i].instance.NetworkInterfaces {
		for _, conn := range c.Connections {
			if conn.To == ni.Connection {
				return toHCLStringFormat(fmt.Sprintf("aws_network_interface.%s.private_ip", ni.Name))
			}
		}
	}

	panic(errors.New("no possible connection possible"))
}

// generatePorts generates random port numbers between lowerLimitPort and upperLimitPort
func (c NodeGroup) generatePort(node int) int {
	port := lowerLimitPort + mrand.Intn(upperLimitPort-lowerLimitPort+1)

	var dupe bool
	for _, p := range c.Nodes[node].NodeAttributes.Ports {
		if p == port {
			dupe = true
		}
	}

	if !dupe {
		return port
	}

	return c.generatePort(node)
}

// generateName generates an HCL compatible name
func (c *NodeGroup) generateName() string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])
}

// genKey generates a peerid and pk
func genKey() (peerid string, privatekey string, err error) {
	// generate private key
	priv, _, err := crypto.GenerateKeyPairWithReader(crypto.Ed25519, -1, crand.Reader)
	if err != nil {
		return "", "", err
	}

	// convert to bytes
	kBytes, err := crypto.MarshalPrivateKey(priv)
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

// seedFromEd25519PrivateKey returns something
// not really sure what this function does
// but needed to make keys work
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

// genServiceKey generates a service key
func genServiceKey() ([]byte, error) {
	priv, _, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, err
	}

	seed, err := seedFromEd25519PrivateKey(priv)
	if err != nil {
		panic(err)
	}

	return seed, err
}

// genSecretKey generates a secret key
func genSecretKey(servicekey []byte) ([]byte, error) {
	stdPrivKey := ed25519.NewKeyFromSeed(servicekey)
	_, pubKey, err := crypto.KeyPairFromStdKey(&stdPrivKey)
	if err != nil {
		return nil, err
	}

	pubKeyRaw, err := pubKey.Raw()
	if err != nil {
		return nil, err
	}

	return pubKeyRaw, nil

}

// GetCorrectInstanceType returns a string with the correct AWS Instance type
// this is based on the amount of connections
// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#AvailableIpPerENI
func (c *NodeGroup) GetCorrectInstanceType() string {
	switch len(c.Connections) {
	case 0, 1, 2:
		return "t3.nano"
	case 3:
		return "t3.small"
	case 4:
		return "t3.xlarge"
	case 5, 6, 7, 8:
		return "c4.4xlarge"
	default:
		panic("too much connections on one peer")
	}
}
