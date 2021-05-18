package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
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
		Name:             composeTerraform.GenerateName(SubnetNamePrefix),
		CidrBlock:        SubnetCidrBlockDefault,
		AvailabilityZone: SubnetAvailabilityZoneDefault,
	}
}

func NewSubnetWithAttributes(vpc *Vpc) (c Subnet) {
	c = NewSubnet()
	c.Vpc = vpc

	return c
}

func (c Subnet) GetTemplate() string {
	return SubnetHCLTemplate
}

func (c Subnet) GetId() string {
	return fmt.Sprintf("aws_subnet.%s.id", c.Name)
}

func (c Subnet) GetType() string {
	return SubnetType
}

func (c Subnet) Validate() (composeTerraform.Component, error) {
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
