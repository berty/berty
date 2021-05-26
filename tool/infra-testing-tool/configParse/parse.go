package configParse

import (
	"fmt"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/networking"
	"infratesting/composeTerraform/components/various"
	"os"
)

var (
	// groups holds all groups while parsing
	groups = make(map[string]Group)

	// connections holds all connections while parsing
	connections = make(map[string]Connection)

	// Components holds all HCLComponents
	Components []composeTerraform.Component

	// ConnectionComponents makes it easier to link Nodes to their respective networking stack
	// the key is Node.Connections[x].To
	// this way we only make 1 networking stack per connection group
	// Network Interfaces connected to these networking stacks are created at the Node level.
	ConnectionComponents = make(map[string][]composeTerraform.Component)

	NodeComponents []composeTerraform.Component

	// VPC defines the current VPC in the networking stack.
	// for the moment we only want one VPC per config file.
	// this could be changed later
	VPC networking.Vpc
)

func Parse(b []byte) (err error) {
	var c Config

	// unmarshal into Config struct
	err = yaml.Unmarshal(b, &c)
	if err != nil {
		return err
	}

	err = c.validate()
	if err != nil {
		panic(err)
	}

	// converting to a map[string]interface{} allows us to iterate over the config instead of having to manually do
	// ```for _, peer := range c.Peers {}```
	// for every type (of which there might be many in the future)
	var cMap map[string]interface{}
	err = mapstructure.Decode(c, &cMap)
	if err != nil {
		return err
	}

	// gathering information about networking and groups
	// this needs to be done in a separate pass
	// to make sure we don't create multiple networking stacks for the same connection type

	for _, component := range cMap {
		for _, subComponent := range component.([]Node) {
			subComponent.parseConnections()
			subComponent.parseGroups()
		}
	}

	// iterate over connections and compose appropriate HCL components
	for _, connection := range connections {

		err = connection.Validate()
		if err != nil {
			panic(err)
		}

		connection.composeComponents()
	}

	// iterate over nodes
	for _, component := range cMap {
		// iterate over components
		for _, subComponent := range component.([]Node) {
			subComponent.validate()
			subComponent.composeComponents()
		}
	}

	// iterate over network stacks
	for _, networkStack := range ConnectionComponents {
		// add networkStack to Components
		Components = append(Components, networkStack...)
	}

	// add NodeComponents to Components
	Components = append(Components, NodeComponents...)

	// prepend new provider
	provider := various.NewProvider()
	Components = append([]composeTerraform.Component{provider}, Components...)

	// iterate over components
	for _, Component := range Components {
		s, err := composeTerraform.ToHCL(Component)
		if err != nil {
			panic(err)
		}

		fmt.Println(s)

	}
	//fmt.Printf("generated HCL at %s\n", time.Now().Format(time.ANSIC))

	return err
}

func OpenConfig(filename string) (b []byte, err error) {
	f, err := os.OpenFile(filename, os.O_RDONLY, 0775)
	if err != nil {
		return nil, err
	}

	stat, err := f.Stat()
	if err != nil {
		return nil, err
	}

	b = make([]byte, stat.Size())
	_, err = f.Read(b)

	return b, err
}
