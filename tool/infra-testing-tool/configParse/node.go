package configParse

import (
	"bytes"
	crand "crypto/rand"
	"encoding/base64"
	"fmt"
	"github.com/google/uuid"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"html/template"
	"infratesting/composeTerraform/components/ec2"
	"infratesting/composeTerraform/components/networking"
	"math/rand"
	"reflect"
	"strings"
)

const (
	// NodeTypePeer = iota + 1 to offset from it not being a valid type
	NodeTypePeer = iota + 1
	NodeTypeReplication
	NodeTypeRDVP
	NodeTypeRelay
	NodeTypeBootstrap

	lowerLimitPort = 2000
	upperLimitPort = 9999
)

type Node struct {
	Name        string       `yaml:"name"`
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`

	nodeType int
	nodeAttributes struct {
		port int
		protocol string
		pk string
		peerId string
	}
}

func (c *Node) validate() bool {

	// replace spaces in name
	// would cause error in terraform otherwise

	c.Name = fmt.Sprintf("%s-%s", strings.ReplaceAll(c.Name, " ", "-"), uuid.NewString()[:8])

	return true
}

// ParseConnections takes the connection, adds it to the global connections
func (c Node) parseConnections() {
	for _, con := range c.Connections {
		connections[con.To] = con
	}
}

//
func (c Node) composeComponents() {
	var networkInterfaces []*networking.NetworkInterface
	for _, connection := range c.Connections {
		key := connection.To
		networkStack := ConnectionComponents[key]

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
		NodeComponents = append(NodeComponents, ni)
	}

	instance := ec2.NewInstance()
	instance.Name = c.Name
	instance.NetworkInterfaces = networkInterfaces

	var err error
	instance.UserData, err = c.GenerateUserData()
	if err != nil {
		panic(err)
	}

	NodeComponents = append(NodeComponents, instance)

}

func (c *Node) GenerateUserData() (s string, err error) {

	var base = `
#!/bin/bash
`
	//var flags = make(map[string]string)

	var typeSpecific string

	switch c.nodeType {
	case NodeTypePeer:
		typeSpecific = `berty daemon \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \

  -p2p.tinder-dht-driver=false \
  -p2p.rdvp=':none' \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners='/ip4/$PRIVATE_IP_LAN_1/udp/$PORT/quic'
`

	case NodeTypeBootstrap:

		typeSpecific = `export PUBLIC_IP=0.0.0.0
export PORT=4424
berty daemon \
  -p2p.mdns=false \
  -p2p.bootstrap=':none:' \
  -p2p.rdvp=':none' \
  -p2p.static-relays=':none' \
  -p2p.tinder-dht-driver=false \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners="/ip4/$PUBLIC_IP/tcp/$PORT" \
  -log.file=/tmp/log \
`

	case NodeTypeRDVP:
		c.nodeAttributes.port = generatePort()

		c.nodeAttributes.pk, c.nodeAttributes.peerId, err = genkey()
		if err != nil {
			return s, err
		}

		typeSpecific = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=%d
export PEER_ID=%s
rdvp serve -pk %s \
    -l "/ip4/$PUBLIC_IP4/$PROTOC/$PORT"
`

		typeSpecific = fmt.Sprintf(typeSpecific, c.nodeAttributes.port, c.nodeAttributes.peerId, c.nodeAttributes.pk)

	case NodeTypeRelay:
		c.nodeAttributes.port = generatePort()

		c.nodeAttributes.pk, c.nodeAttributes.peerId, err = genkey()
		if err != nil {
			return s, err
		}

		typeSpecific = `export PUBLIC_IP4=0.0.0.0
export PROTOC=tcp
export PORT=%d
export PEER_ID=%s
rdvp serve -pk %s \
	-announce "/ip4/$PUBLIC_IP4/$PROTOC/$PORT" \
	-l "/ip4/$PUBLIC_IP4/$PROTOC/$PORT" \
	-log.file=/tmp/log
`
		typeSpecific = fmt.Sprintf(typeSpecific, c.nodeAttributes.port, c.nodeAttributes.peerId, c.nodeAttributes.pk)
	case NodeTypeReplication:
		typeSpecific = ""
	}

	return base + typeSpecific, nil
}

func (c Node) executeTemplate() (string, error) {
	v := reflect.ValueOf(c)
	values := make(map[string]interface{}, v.NumField())
	for i := 0; i < v.NumField(); i++ {
		if v.Field(i).CanInterface() {
			values[v.Type().Field(i).Name] = v.Field(i).Interface()
		}
	}

	// template
	var templ string
	var s string

	t := template.Must(template.New("").Parse(templ))
	buf := &bytes.Buffer{}
	err := t.Execute(buf, values)
	if err != nil {
		return s, err
	}

	s += buf.String()

	return s, nil
}

func toHCLStringFormat(s string) string {
	 return fmt.Sprintf("${%s}", s)
}

// generatePort generates a random port number between lowerLimitPort and upperLimitPort
func generatePort() int {
	return lowerLimitPort + rand.Intn(upperLimitPort-lowerLimitPort+1)
}

func genkey() (string, string, error) {
	priv, _, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.Ed25519, -1, crand.Reader)
	if err != nil {
		return "", "", err
	}

	pkBytes, err := libp2p_ci.MarshalPrivateKey(priv)
	if err != nil {
		return "", "", err
	}

	pk := base64.StdEncoding.EncodeToString(pkBytes)

	peerId, err := libp2p_peer.IDFromPublicKey(priv.GetPublic())
	if err != nil {
		return "", "", err
	}

	return pk, peerId.String(), err
}
