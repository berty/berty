package configParse

import "C"
import (
	"fmt"
	//relay "github.com/libp2p/go-libp2p-circuit"
	"gopkg.in/yaml.v3"
	"log"
)

type Config struct {

	RDVP []Node `yaml:"rdvp"`
	Relay []Node `yaml:"relay"`
	Bootstrap []Node `yaml:"bootstrap"`

	Peer              []Node `yaml:"peer"`
	Replication []Node `yaml:"replication"`
}

func (c *Config) validate() error {

	for i, _ := range c.RDVP {
		c.RDVP[i].nodeType = NodeTypeRDVP
	}

	for i, _ := range c.Relay {
		c.Relay[i].nodeType = NodeTypeRelay
	}

	for i, _ := range c.Bootstrap {
		c.Bootstrap[i].nodeType = NodeTypeBootstrap
	}

	for i, _ := range c.Peer {
		c.Peer[i].nodeType = NodeTypePeer
	}

	for i, _ := range c.Replication {
		c.Replication[i].nodeType = NodeTypeReplication
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
