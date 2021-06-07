package configParse

import (
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"infratesting/composeTerraform"
	"infratesting/composeTerraform/components/various"
)

// Parse parses the config bytes.
// it does this in multiple steps.
// first it converts it to a map containing nodes
// then it figures out the different groups and networks
// then it creates the network stacks (internet, lan_1, lan_2, etc)
// then it ranges over the nodes and composes a config for them
// then it iterates over every component in Components and generates HCL
// for now it just gets printed out to console
func Parse(b []byte) (c Config, components []*[]composeTerraform.Component, err error) {
	// unmarshal into Config struct
	err = yaml.Unmarshal(b, &config)
	if err != nil {
		return config, components, err
	}

	err = config.validate()
	if err != nil {
		return config, components, err
	}

	// converting to a map[string]interface{} allows us to iterate over the config instead of having to manually do
	// ```for _, peer := range c.Peers {}```
	// for every type (of which there might be many in the future)
	var cMap map[string][]Node
	err = mapstructure.Decode(config, &cMap)
	if err != nil {
		return config, components, err
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

	// iterate over network stacks
	for _, networkStack := range configAttributes.ConnectionComponents {
		// add networkStack to Components
		components = append(components, &networkStack)
	}

	// iterate over individual node types
	var types = []string{"RDVP", "Bootstrap", "Relay", "Peer", "Replication"}
	// iterate over type of nodes
	for _, t := range types {
		for j := range cMap[t] {
			cMap[t][j].composeComponents()
			components = append(components, &cMap[t][j].Components)
		}
	}

	// prepend new provider (provider aws)
	// this is always required!
	provider := various.NewProvider()
	components = prependComponents(components, provider)

	return config, components, err
}

func prependComponents(array []*[]composeTerraform.Component, item composeTerraform.Component) []*[]composeTerraform.Component {
	return append([]*[]composeTerraform.Component{{item}}, array...)
}

func ToHCL(components []*[]composeTerraform.Component) (hcl string) {
	for _, component := range components {
		for _, subcomponent := range *component {
			// convert the components into HCL compatible strings
			s, err := composeTerraform.ToHCL(subcomponent)
			if err != nil {
				panic(err)
			}

			hcl += s
		}
	}

	return hcl
}
