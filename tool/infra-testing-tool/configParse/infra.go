package configParse

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"infratesting/composeTerraform"
	"log"

	"github.com/mitchellh/mapstructure"
)

type Config struct {
	Peers              []Node              `yaml:"peers"`
	ReplicationServers []Node `yaml:"replicationServer"`
	TokenServers       []Node       `yaml:"tokenServer"`
}

var HCLComponents []composeTerraform.HCLComponent

func Parse(b []byte) (err error) {
	var c Config
	err = yaml.Unmarshal(b, &c)
	if err != nil {
		return err
	}

	c.ParseNodeTypes()

	// conveting to a map[string]interface{} allows us to interate over the config instead of having to manually do
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
			subComponent.ParseConnections()
			subComponent.ParseGroups()
		}
	}

	// here we will iterate over the existing connections and create HCLComponents
	for _, connection := range connections {
		if !connection.Validate() {
			panic("connection type validation failed!")
		}

		connection.ParseConnectionType()
		connection.MakeHCLComponents()
	}


	for _, component := range cMap {
		for _, subComponent := range component.([]Node) {
			subComponent.MakeHCLComponents()
		}
	}


	for _, networkStack := range HCLConnectionComponents {
		for _, components := range networkStack {
			HCLComponents = append(HCLComponents, components)
		}
	}

	for _, components := range HCLNodeComponents {
		HCLComponents = append(HCLComponents, components)
	}

	for _, HCLcomponent := range HCLComponents {
		s, err := composeTerraform.ToHCL(HCLcomponent)
		if err != nil {
			panic(err)
		}

		fmt.Println(s)
	}


	return err

}

func NewConfig() Config {
	var c = Config{}

	s, err := yaml.Marshal(c)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(string(s))

	return c
}

