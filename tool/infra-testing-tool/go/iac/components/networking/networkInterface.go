package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
)

type NetworkInterface struct {
	Name string

	Subnet   *Subnet
	SubnetId string

	SecurityGroups   []*SecurityGroup
	SecurityGroupIds []string

	Connection string
}

func NewNetworkInterface() NetworkInterface {
	return NetworkInterface{
		Name: iac.GenerateName(NetworkInterfaceNamePrefix),
	}
}

func NewNetworkInterfaceWithAttributes(subnet *Subnet, sgs []*SecurityGroup) (c NetworkInterface) {
	c = NewNetworkInterface()
	c.Subnet = subnet
	c.SecurityGroups = sgs

	return c
}

// GetTemplate returns the NetworkInterfaces' template
func (c NetworkInterface) GetTemplate() string {
	return NetworkInterfaceHCLTemplate
}

// GetId returns the terraform formatting of this NetworkInterfaces' id
func (c NetworkInterface) GetId() string {
	return fmt.Sprintf("aws_network_interface.%s.id", c.Name)
}

// GetType returns the NetworkInterfaces' type
func (c NetworkInterface) GetType() string {
	return NetworkInterfaceType
}

// GetAvailabilityZone returns the NetworkInterfaces' AWS Availability Zone
func (c NetworkInterface) GetAvailabilityZone() string {
	return c.Subnet.AvailabilityZone
}

// Validate validates the component
func (c NetworkInterface) Validate() (iac.Component, error) {

	// Subnet
	if c.Subnet == nil {
		if c.SubnetId == "" {
			return c, errors.New(NetworkInterfaceErrNoSubnet)
		}
	} else {
		c.SubnetId = c.Subnet.GetId()
	}

	// Security Groups
	if len(c.SecurityGroups) == 0 {
		if len(c.SecurityGroupIds) == 0 {
			return c, errors.New(NetworkInterfaceErrNoSecurityGroups)
		}
	} else {
		for _, sg := range c.SecurityGroups {
			c.SecurityGroupIds = append(c.SecurityGroupIds, sg.GetId())
		}
	}

	return c, nil
}
