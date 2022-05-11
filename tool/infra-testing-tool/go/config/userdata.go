package config

import (
	"bytes"
	"encoding/base64"
	"infratesting/iac/components/networking"
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

		values["listener"] = c.NodeAttributes.Listener
		values["announce"] = c.NodeAttributes.Announce
		values["defaultGrpcPort"] = networking.BertyGRPCPort
		values["rdvp"] = c.NodeAttributes.RDVPMaddr
		values["relay"] = c.NodeAttributes.RelayMaddr
		values["bootstrap"] = c.NodeAttributes.BootstrapMaddr

	case NodeTypeBootstrap:
		templ = bootstrapUserData

		values["listener"] = c.NodeAttributes.Listener
		values["rdvp"] = c.NodeAttributes.RDVPMaddr
		values["relay"] = c.NodeAttributes.RelayMaddr
		values["bootstrap"] = c.NodeAttributes.BootstrapMaddr

	case NodeTypeRDVP:
		templ = rdvpUserData

		values["listener"] = c.NodeAttributes.Listener
		values["peerId"] = c.NodeAttributes.PeerId
		values["pk"] = c.NodeAttributes.Pk

	case NodeTypeRelay:
		templ = relayUserData

		values["announce"] = c.NodeAttributes.Announce
		values["listener"] = c.NodeAttributes.Listener
		values["peerId"] = c.NodeAttributes.PeerId
		values["pk"] = c.NodeAttributes.Pk

	case NodeTypeReplication:
		templ = replicationUserData

		values["defaultGrpcPort"] = networking.BertyGRPCPort
		values["sk"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Sk)
		values["secret"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Secret)

		values["tokenSk"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Sk)
		values["tokenSecret"] = base64.RawStdEncoding.EncodeToString(c.NodeAttributes.Secret)

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
