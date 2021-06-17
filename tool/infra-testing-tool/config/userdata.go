package config

import (
	"bytes"
	"errors"
	"fmt"
	"strconv"
	"text/template"
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
		values["RDVP"] = c.NodeAttributes.RDVPMaddr
		values["Relay"] = c.NodeAttributes.RelayMaddr
		values["Bootstrap"] = c.NodeAttributes.BootstrapMaddr

	case NodeTypeBootstrap:
		//TODO make this
		templ = bootstrapUserData

		values["Port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["RDVP"] = c.NodeAttributes.RDVPMaddr
		values["Relay"] = c.NodeAttributes.RelayMaddr
		values["Bootstrap"] = c.NodeAttributes.BootstrapMaddr

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
