package configParse

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"log"
)

type Config struct {
	Peers              []Node `yaml:"peers"`
	ReplicationServers []Node `yaml:"replicationServer"`
	TokenServers       []Node `yaml:"tokenServer"`
}

func (c *Config) validate() error {
	for _, peer := range c.Peers {
		peer.nodeType = NodeTypePeer
	}

	for _, replicationServer := range c.ReplicationServers {
		replicationServer.nodeType = NodeTypeReplicationSever
	}

	for _, tokenServer := range c.TokenServers {
		tokenServer.nodeType = NodeTypeTokenServer
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
