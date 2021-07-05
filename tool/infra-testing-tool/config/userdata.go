package config

import (
	"bytes"
	"encoding/base64"
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

		values["port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["defaultGrpcPort"] = defaultGrpcPort
		values["rdvp"] = c.NodeAttributes.RDVPMaddr
		values["relay"] = c.NodeAttributes.RelayMaddr
		values["bootstrap"] = c.NodeAttributes.BootstrapMaddr
		values["protocol"] = c.NodeAttributes.Protocol

	case NodeTypeBootstrap:
		templ = bootstrapUserData

		values["port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["rdvp"] = c.NodeAttributes.RDVPMaddr
		values["relay"] = c.NodeAttributes.RelayMaddr
		values["bootstrap"] = c.NodeAttributes.BootstrapMaddr
		values["protocol"] = c.NodeAttributes.Protocol

	case NodeTypeRDVP:
		templ = rdvpUserData

		values["port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["peerId"] = c.NodeAttributes.PeerId
		values["pk"] = c.NodeAttributes.Pk
		values["protocol"] = c.NodeAttributes.Protocol

	case NodeTypeRelay:
		templ = relayUserData

		values["port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["peerId"] = c.NodeAttributes.PeerId
		values["pk"] = c.NodeAttributes.Pk
		values["protocol"] = c.NodeAttributes.Protocol

	case NodeTypeReplication:
		templ = replicationUserData

		values["defaultGrpcPort"] = defaultGrpcPort
		values["sk"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Sk)
		values["secret"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Secret)

	case NodeTypeTokenServer:
		templ = tokenServerUserData

		values["port"] = strconv.Itoa(c.NodeAttributes.Port)
		values["replIp"] = c.NodeAttributes.ReplIp
		values["replPort"] = strconv.Itoa(c.NodeAttributes.ReplPort)
		values["sk"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Sk)
		values["secret"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Secret)

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

