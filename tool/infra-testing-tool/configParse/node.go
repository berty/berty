package configParse

import (
	"bytes"
	"html/template"
	"infratesting/composeTerraform/components/ec2"
	"infratesting/composeTerraform/components/networking"
	"reflect"
	"strings"
)

const (
	NodeTypePeer = iota
	NodeTypeReplicationSever
	NodeTypeTokenServer
)

type Node struct {
	Name        string       `yaml:"name"`
	Amount      int          `yaml:"amount"`
	Groups      []Group      `yaml:"groups"`
	Connections []Connection `yaml:"connections"`

	nodeType int
}

func (c *Node) validate() bool {

	// replace spaces in name
	// would cause error in terraform otherwise
	c.Name = strings.ReplaceAll(c.Name, " ", "_")

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

func (c Node) GenerateUserData() (string, error) {

	switch c.nodeType {
	case NodeTypeTokenServer:
		return "", nil
	case NodeTypeReplicationSever:
		return "", nil
	case NodeTypePeer:
		return "", nil
	default:
		return "", nil
	}

}

func (c Node) ExecuteTemplate() (string, error) {
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
