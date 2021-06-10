package config

import "C"
import (
	"fmt"
	"infratesting/iac"
	"infratesting/iac/components/networking"

	//relay "github.com/libp2p/go-libp2p-circuit"
	"gopkg.in/yaml.v3"
	"log"
)

type Config struct {
	RDVP      []NodeGroup `yaml:"rdvp"`
	Relay     []NodeGroup `yaml:"relay"`
	Bootstrap []NodeGroup `yaml:"bootstrap"`

	Replication []NodeGroup `yaml:"replication"`
	Peer        []NodeGroup `yaml:"peer"`
}

type ConfigAttributes struct {
	Connections map[string]Connection
	Groups      map[string]Group

	Vpc                  networking.Vpc
	ConnectionComponents map[string][]iac.Component
}

var (
	config           = Config{}
	configAttributes = ConfigAttributes{}
)

func init() {
	configAttributes.Connections = make(map[string]Connection)
	configAttributes.Groups = make(map[string]Group)
	configAttributes.ConnectionComponents = make(map[string][]iac.Component)
}

// validate validates the config
func (c *Config) validate() error {

	for i := range c.RDVP {

		_ = c.RDVP[i].validate()
		c.RDVP[i].NodeType = NodeTypeRDVP
	}

	for i := range c.Relay {

		_ = c.Relay[i].validate()
		c.Relay[i].NodeType = NodeTypeRelay
	}

	for i := range c.Bootstrap {

		_ = c.Bootstrap[i].validate()
		c.Bootstrap[i].NodeType = NodeTypeBootstrap
	}

	for i := range c.Replication {

		_ = c.Replication[i].validate()
		c.Replication[i].NodeType = NodeTypeReplication
	}

	for i := range c.Peer {

		_ = c.Peer[i].validate()
		c.Peer[i].NodeType = NodeTypePeer
	}

	// TODO
	// add more checks to validate if network topology is correct, etc

	return nil
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

func GetConfig() Config {
	return config
}
