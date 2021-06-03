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
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/ec2"
	"infratesting/composeTerraform/components/networking"
	"math/rand"
	"reflect"
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
	c.NodeAttributes.Pk, c.NodeAttributes.PeerId, _ = genkey()



	var err error
	instance.UserData, err = c.GenerateUserData()
	if err != nil {
		panic(err)
	}

	comps = append(comps, instance)

	c.Components = comps
}

func (c *Node) GenerateUserData() (s string, err error) {

	var base = `
#!/bin/bash
`
	//var flags = make(map[string]string)

	var typeSpecific string

	switch c.NodeType {
	case NodeTypePeer:

		// arbitrary choice for now
		// wondering how we group these normally though.
		// this will be a challenge!
		rdvp := config.RDVP[0]

		typeSpecific = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=%d
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/9091/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp=%s \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
`
		typeSpecific = fmt.Sprintf(typeSpecific, c.NodeAttributes.Port, rdvp.getFullMultiAddr())

	case NodeTypeBootstrap:

		typeSpecific = `export PUBLIC_IP=0.0.0.0
export port=4424
berty daemon \
  -p2p.mdns=false \
  -p2p.bootstrap=':none:' \
  -p2p.rdvp=':none' \
  -p2p.static-relays=':none' \
  -p2p.tinder-dht-driver=false \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners="/ip4/$PUBLIC_IP/tcp/$PORT" \
  -log.file=/home/ubuntu/log
`

	case NodeTypeRDVP:
		typeSpecific = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT=%d
export PEER_ID=%s
rdvp serve -pk %s \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
`

		typeSpecific = fmt.Sprintf(typeSpecific, c.NodeAttributes.Port, c.NodeAttributes.PeerId, c.NodeAttributes.Pk)

	case NodeTypeRelay:
		typeSpecific = `export PUBLIC_IP4=0.0.0.0
export PROTOC=tcp
export PORT=%d
export PEER_ID=%s
rdvp serve -pk %s \
	-announce "/ip4/$PUBLIC_IP4/$PROTOC/$port" \
	-l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \p
	-log.file=/home/ubuntu/log
`
		typeSpecific = fmt.Sprintf(typeSpecific, c.NodeAttributes.Port, c.NodeAttributes.PeerId, c.NodeAttributes.Pk)
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

func (c Node) getPublicIP() string {
	return toHCLStringFormat(fmt.Sprintf("aws_instance.%s.public_ip", c.Name))
}

// getFullMultiAddr returns the full multiaddr with its ip (HCL formatted, will compile to an ipv4 ip address when executed trough terraform), protocol, port and peerId
func (c Node) getFullMultiAddr() string {
	return fmt.Sprintf("/ip4/%s/%s/%d/p2p/%s", c.getPublicIP(), c.NodeAttributes.Protocol, c.NodeAttributes.Port, c.NodeAttributes.PeerId)
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
