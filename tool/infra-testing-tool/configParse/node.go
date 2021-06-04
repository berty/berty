package configParse

import (
	"bytes"
	crand "crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/google/uuid"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"html/template"
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/ec2"
	"infratesting/composeTerraform/components/networking"
	"math/rand"
	"strconv"
	"strings"
)

const (
	NodeTypePeer = "peer"
	NodeTypeReplication = "repl"
	NodeTypeRDVP = "rdvp"
	NodeTypeRelay = "relay"
	NodeTypeBootstrap = "bootstrap"

	lowerLimitPort = 2000
	upperLimitPort = 9999

	defaultGrpcPort = "9091"
)

type Node struct {
	Name        string       `yaml:"name"`
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`

	NodeType       string
	NodeAttributes struct {
		Port     int
		Protocol string
		Pk       string
		PeerId   string
	}

	// attached components
	Components []composeTerraform.Component
}

func (c *Node) validate() bool {

	// replace spaces in name and add uuid to it.
	c.Name = fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])

	return true
}

func (c *Node) composeComponents() () {
	var (
		comps []composeTerraform.Component
		networkInterfaces []*networking.NetworkInterface
	)
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
	instance.Name = c.Name
	instance.NetworkInterfaces = networkInterfaces
	instance.NodeType = c.NodeType


	c.NodeAttributes.Port = generatePort()
	c.NodeAttributes.Protocol = "tcp"

	// only do this for RDVP and Relay
	if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
		c.NodeAttributes.Pk, c.NodeAttributes.PeerId, _ = genkey()
	}

	var err error
	instance.UserData, err = c.GenerateUserData()
	if err != nil {
		panic(err)
	}

	comps = append(comps, instance)

	c.Components = comps
}


// GenerateUserData generates the user data for the node
// it combines the userdata templates for each type with the variables inside the node
// Look at userdata.go for more information on the user data
func (c *Node) GenerateUserData() (s string, err error) {

	// template
	var templ string
	// values
	values := make(map[string]string)

	switch c.NodeType {
	case NodeTypePeer:

		templ = peerUserData

		values["Port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["defaultGrpcPort"] = defaultGrpcPort

		// arbitrary choice for now
		// TODO decide RDVP (if not multiple) based on connections
		rdvp := config.RDVP[0]
		values["RDVPMaddr"] = rdvp.getFullMultiAddr()

	case NodeTypeBootstrap:

		templ = bootstrapUserData

	case NodeTypeRDVP:

		templ = rdvpUserData

		values["Port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["PeerId"] = c.NodeAttributes.PeerId
		values["Pk"] = c.NodeAttributes.Pk


	case NodeTypeRelay:
		templ = relayUserData

		values["Port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["PeerId"] = c.NodeAttributes.PeerId
		values["Pk"] = c.NodeAttributes.Pk

	case NodeTypeReplication:
		templ = replicationUserData
	}


	// execute the template
	// fill with values
	if len(values) > 0 {
		t := template.Must(template.New("").Parse(templ))
		buf := &bytes.Buffer{}
		err = t.Execute(buf, values)
		if err != nil {
			return s, err
		}

		s = baseUserData + buf.String()
	}

	return s, nil
}

// toHCLStringFormat wraps a string so it can be compiled by the HCL compiler
func toHCLStringFormat(s string) string {
	return fmt.Sprintf("${%s}", s)
}

// getPublicIP returns the terraform formatting of this Nodes ip
func (c Node) getPublicIP() string {
	return toHCLStringFormat(fmt.Sprintf("aws_instance.%s.public_ip", c.Name))
}

// getFullMultiAddr returns the full multiaddr with its ip (HCL formatted, will compile to an ipv4 ip address when executed trough terraform), protocol, port and peerId
func (c Node) getFullMultiAddr() string {
	// this can only be done for RDVP and Relay
	// as other node types don't have a peerId pre-configured
	if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
		return fmt.Sprintf("/ip4/%s/%s/%d/p2p/%s", c.getPublicIP(), c.NodeAttributes.Protocol, c.NodeAttributes.Port, c.NodeAttributes.PeerId)
	}

	panic(errors.New("cannot use function getFullMultiAddr on a node that is not of type RDVP or Relay"))
}

// generatePort generates a random port number between lowerLimitPort and upperLimitPort
func generatePort() int {
	return lowerLimitPort + rand.Intn(upperLimitPort-lowerLimitPort+1)
}

// genkey generates a private and public key
func genkey() (pk string, pid string, err error) {
	priv, _, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.Ed25519, -1, crand.Reader)
	if err != nil {
		return pk, pid, err
	}

	pkBytes, err := libp2p_ci.MarshalPrivateKey(priv)
	if err != nil {
		return pk, pid, err
	}

	pk = base64.StdEncoding.EncodeToString(pkBytes)

	peerId, err := libp2p_peer.IDFromPublicKey(priv.GetPublic())
	if err != nil {
		return pk, pid, err
	}

	return pk, peerId.String(), err
}
