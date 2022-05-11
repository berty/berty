package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
	"net"
)

type Subnet struct {
	Name             string
	Vpc              *Vpc
	VpcId            string
	CidrBlock        string
	AvailabilityZone string
}

func NewSubnet() Subnet {
	return Subnet{
		Name:      iac.GenerateName(SubnetNamePrefix),
		CidrBlock: SubnetCidrBlockDefault,
	}
}

func NewSubnetWithAttributes(vpc *Vpc) (c Subnet) {
	c = NewSubnet()
	c.Vpc = vpc

	return c
}

// GetTemplate returns the subnet template
func (c Subnet) GetTemplate() string {
	return SubnetHCLTemplate
}

// GetId returns the terraform formatting of this Subnets' id
func (c Subnet) GetId() string {
	return fmt.Sprintf("aws_subnet.%s.id", c.Name)
}

// GetType returns the Subnets type
func (c Subnet) GetType() string {
	return SubnetType
}

// Validate validates the component
func (c Subnet) Validate() (iac.Component, error) {
	// Validate CidrBlock
	_, _, err := net.ParseCIDR(c.CidrBlock)
	if err != nil {
		return c, errors.New(SubnetErrNoValidCidrBlock)
	}

	if c.Vpc == nil {
		if c.VpcId == "" {
			return c, errors.New(SubnetErrNoVpc)
		}
	} else {
		c.VpcId = c.Vpc.GetId()
	}

	return c, nil
}
