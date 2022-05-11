package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
)

type ElasticIp struct {
	Name string

	NetworkInterface   *NetworkInterface
	NetworkInterfaceId string
}

func NewElasticIp() ElasticIp {
	return ElasticIp{
		Name: iac.GenerateName(ElasticIpNamePrefix),
	}
}

func NewElasticIpWithAttributes(ni *NetworkInterface) (c ElasticIp) {
	c = NewElasticIp()
	c.NetworkInterface = ni

	return c
}

// GetTemplate returns the ElasticIps' template
func (c ElasticIp) GetTemplate() string {
	return ElasticIpHCLTemplate
}

// GetId returns the terraform formatting of this ElasticIps' id
func (c ElasticIp) GetId() string {
	return fmt.Sprintf("aws_network_interface.%s.id", c.Name)
}

// GetType returns the ElasticIps' type
func (c ElasticIp) GetType() string {
	return ElasticIpType
}

// Validate validates the component
func (c ElasticIp) Validate() (iac.Component, error) {

	// NetworkInterface
	if c.NetworkInterface == nil {
		if c.NetworkInterfaceId == "" {
			return c, errors.New(ElasticIpErrNoNetworkInterface)
		}
	} else {
		c.NetworkInterfaceId = c.NetworkInterface.GetId()
	}

	return c, nil
}
