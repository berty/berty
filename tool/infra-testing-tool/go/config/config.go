package config

import "C"
import (
	"errors"
	"fmt"
	"infratesting/aws"
	"infratesting/iac"
	"infratesting/iac/components/networking"
	"infratesting/logging"

	//relay "github.com/libp2p/go-libp2p-circuit"
	"gopkg.in/yaml.v3"
)

type Config struct {
	RDVP      []NodeGroup `yaml:"rdvp"`
	Relay     []NodeGroup `yaml:"relay"`
	Bootstrap []NodeGroup `yaml:"bootstrap"`

	Peer        []NodeGroup `yaml:"peer"`
	Replication []NodeGroup `yaml:"replication"`

	Attributes Attributes `yaml:"attributes"`

	Settings Settings `yaml:"settings"`
}

// Attributes are used at infra-compile time to aid with the generation of HCL
type Attributes struct {
	Connections map[string]*Connection
	Groups      map[string]*Group

	vpc                  networking.Vpc
	connectionComponents map[string][]iac.Component
}

type Settings struct {
	Region  string `yaml:"region"`
	KeyName string `yaml:"keyPairName"`
}

var (
	config = Config{}
)

func init() {
	config.Attributes.Connections = make(map[string]*Connection)
	config.Attributes.Groups = make(map[string]*Group)
	config.Attributes.connectionComponents = make(map[string][]iac.Component)
}

// Validate function validates the config, gives all NodeGroup's their correct type.
func (c *Config) Validate() error {
	// VALIDATING SETTINGS
	if c.Settings.Region == "" {
		return logging.LogErr(errors.New(aws.ErrNoRegion))
	}

	if !aws.IsValidRegion(c.Settings.Region) {
		return logging.LogErr(errors.New(aws.ErrInvalidRegion))
	}

	aws.SetRegion(c.Settings.Region)

	if c.Settings.KeyName != "" {
		valid, err := aws.IsValidKeyPair(c.Settings.KeyName)
		if err != nil {
			return logging.LogErr(err)
		}

		if !valid {
			return logging.LogErr(errors.New(aws.ErrInvalidKeypair))
		}
	} else {
		logging.Log(aws.InfoNoKeyPair)
	}



	for i := range c.RDVP {

		c.RDVP[i].NodeType = NodeTypeRDVP
		_ = c.RDVP[i].validate()

	}

	for i := range c.Relay {

		c.Relay[i].NodeType = NodeTypeRelay
		_ = c.Relay[i].validate()

	}

	for i := range c.Bootstrap {

		c.Bootstrap[i].NodeType = NodeTypeBootstrap
		_ = c.Bootstrap[i].validate()

	}

	for i := range c.Replication {

		c.Replication[i].NodeType = NodeTypeReplication
		_ = c.Replication[i].validate()

	}

	for i := range c.Peer {

		c.Peer[i].NodeType = NodeTypePeer
		_ = c.Peer[i].validate()

	}
	// TODO
	// add more checks to validate if network topology is correct, etc

	return nil
}

func NewConfig() Config {
	var c = Config{}

	s, err := yaml.Marshal(c)
	if err != nil {
		logging.Log(err)
	}
	fmt.Println(string(s))

	return c
}

func GetConfig() Config {
	return config
}

func (c Config) CountPeers() (i int) {
	for p := range c.Peer {
		i += c.Peer[p].Amount
	}

	return i
}

func (c Config) CountRepl() (i int) {
	for p := range c.Replication {
		i += c.Replication[p].Amount
	}

	return i
}

func GetRegion() string {
	return config.Settings.Region
}

func GetKeyPairName() string {
	return config.Settings.KeyName
}

func GetAllTypes() []string {
	return []string{
		NodeTypePeer,
		NodeTypeReplication,
		NodeTypeRDVP,
		NodeTypeRelay,
		NodeTypeBootstrap,
	}
}
