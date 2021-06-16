package config

import (
	"bytes"
	"errors"
	"fmt"
	"strconv"
	"text/template"
)

// This file contains all the user data / startup scripts for each of the different node types
// Find official Terraform documentation here:
// https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance#user_data
// Because the terraform documentation is very limited, here is some extra explanation:
// The userData argument contains a bash script that gets run as soon as the ec2 instance on AWS becomes available
// allowing us to automatically start for example a peer or a RDVP

const (
	// this is the base, any other data gets appended to it.
	baseUserData = `
#!/bin/bash
`

	peerUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT={{.Port }}
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/{{.defaultGrpcPort }}/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \{{if .RDVPMaddr }}
  -p2p.rdvp="{{.RDVPMaddr }}" \
{{- end}}
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
`

	// TODO: this isn't correct
	bootstrapUserData = `export PUBLIC_IP=0.0.0.0
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

	rdvpUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT={{.Port }}
export PEER_ID={{.PeerId }}
rdvp serve -pk {{.Pk | printf "%s" }} \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
`

	// TODO: this isn't correct
	relayUserData = `export PUBLIC_IP4=0X.0.0.0
export PROTOC=tcp
export PORT={{.Port }}
export PEER_ID={{.PeerId }}
rdvp serve -pk {{.Pk }} \
	-announce "/ip4/$PUBLIC_IP4/$PROTOC/$port" \
	-l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
`

	//TODO: this isn't correct
	replicationUserData = `
`
)

// GenerateUserData generates the user data for the node
// it combines the userdata templates for each type with the variables inside the node
// Look at userdata.go for more information on the user data
func (c *Node) GenerateUserData() (s string, err error) {

	// template
	var templ string
	// values
	values := make(map[string]interface{})

	switch c.NodeType {
	case NodeTypePeer:
		templ = peerUserData

		values["Port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["defaultGrpcPort"] = defaultGrpcPort

		values["RDVPMaddr"] = c.NodeAttributes.RDVPMaddr
		fmt.Println(c.NodeAttributes.RDVPMaddr)

	case NodeTypeBootstrap:
		//TODO make this
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
		//TODO make this
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

// getFullMultiAddr returns the full multiaddr with its ip (HCL formatted, will compile to an ipv4 ip address when executed trough terraform), protocol, port and peerId
func (c NodeGroup) getFullMultiAddr(i int) string {
	// this can only be done for RDVP and Relay
	// as other node types don't have a peerId pre-configured
	if len(c.Nodes) >= i-1 {
		if c.NodeType == NodeTypeRDVP || c.NodeType == NodeTypeRelay {
			return fmt.Sprintf("/ip4/%s/%s/%d/p2p/%s", c.Nodes[i].getPublicIP(), c.Nodes[i].NodeAttributes.Protocol, c.Nodes[i].NodeAttributes.Port, c.Nodes[i].NodeAttributes.PeerId)
		}
		panic(errors.New("cannot use function getFullMultiAddr on a node that is not of type RDVP or Relay"))
	}

	panic(errors.New("that node doesn't exist"))
}

// getPublicIP returns the terraform formatting of this Nodes ip
func (c Node) getPublicIP() string {
	return toHCLStringFormat(fmt.Sprintf("aws_instance.%s.public_ip", c.Name))
}
