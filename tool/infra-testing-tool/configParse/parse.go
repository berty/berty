package configParse

import (
	"encoding/json"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/various"
	"os"
)

func Parse(b []byte) (err error) {
	// unmarshal into Config struct
	err = yaml.Unmarshal(b, &config)
	if err != nil {
		return err
	}

	err = config.validate()
	if err != nil {
		panic(err)
	}

	// converting to a map[string]interface{} allows us to iterate over the config instead of having to manually do
	// ```for _, peer := range c.Peers {}```
	// for every type (of which there might be many in the future)
	var cMap map[string][]Node
	err = mapstructure.Decode(config, &cMap)
	if err != nil {
		return err
	}

	// gathering information about networking and groups
	// this needs to be done in a separate pass
	// to make sure we don't create multiple networking stacks for the same connection type

	for _, component := range cMap {
		for _, subComponent := range component {
			subComponent.parseConnections()
			subComponent.parseGroups()
		}
	}

	// iterate over connections and compose appropriate HCL components
	for _, connection := range configAttributes.Connections {
		err = connection.Validate()
		if err != nil {
			panic(err)
		}
		connection.composeComponents()
	}

	// Components holds all HCLComponents
	var Components []*[]composeTerraform.Component

	var types = []string{"RDVP", "Bootstrap", "Relay", "Peer", "Replication"}
	// iterate over type of nodes
	for _, t := range types {
		for j := range cMap[t] {
			cMap[t][j].composeComponents()
			Components = append(Components, &cMap[t][j].Components)
		}
	}

	// iterate over network stacks
	for _, networkStack := range configAttributes.ConnectionComponents {
		// add networkStack to Components
		Components = append(Components, &networkStack)
	}

	// prepend new provider
	provider := various.NewProvider()
	Components = prependComponents(Components, provider)

	// iterate over components
	for _, component := range Components {
		for _, subcomponent := range *component {
			s, err := composeTerraform.ToHCL(subcomponent)
			if err != nil {
				panic(err)
			}

			fmt.Println(s)
		}

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

func prependComponents(array []*[]composeTerraform.Component, item composeTerraform.Component) []*[]composeTerraform.Component {
	return append([]*[]composeTerraform.Component{{item}}, array...)
}

func GetConfigMarshalled() (string, error) {

	c, err := json.MarshalIndent(config, "", "	")
	if err != nil {
		return "", err
	}

	ca, err := json.MarshalIndent(configAttributes, "", "	")
	if err != nil {
		return "", err
	}

	return fmt.Sprintln(string(c), string(ca)), err

}

// requirements
// generate userdata and all other information before generating HCL
// generate data for RDVP, Relay & Bootstrap before peers/replication servers
//
// separate config for networking
// needs to be generated before the other ones.

