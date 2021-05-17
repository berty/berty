package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
)

type NetworkInterface struct {
	Name string

	Subnet   *Subnet
	SubnetId string

	SecurityGroups   []*SecurityGroup
	SecurityGroupIds []string
}

func NewNetworkInterface() NetworkInterface {
	return NetworkInterface{
		Name: composeTerraform.GenerateName(NetworkInterfaceNamePrefix),
	}
}

func NewNetworkInterfaceWithAttributes(subnet *Subnet, sg *SecurityGroup) (c NetworkInterface) {
	c = NewNetworkInterface()
	c.Subnet = subnet
	c.SecurityGroups = []*SecurityGroup{
		sg,
	}

	return c
}

func (c NetworkInterface) GetTemplates() []string {
	return []string{
		NetworkInterfaceHCLTemplate,
	}
}

func (c NetworkInterface) GetId() string {
	return fmt.Sprintf("aws_network_interface.%s.id", c.Name)
}

func (c NetworkInterface) GetType() string {
	return NetworkInterfaceType
}

func (c NetworkInterface) Validate() ( composeTerraform.HCLComponent, error) {

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
