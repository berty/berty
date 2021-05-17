package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
	"net"
)

type Subnet struct {
	Name      string
	Vpc       *Vpc
	VpcId     string
	CidrBlock string
}

func NewSubnet() Subnet {
	return Subnet{
		Name:      composeTerraform.GenerateName(SubnetNamePrefix),
		CidrBlock: SubnetCidrBlockDefault,
	}
}

func NewSubnetWithAttributes(vpc *Vpc) (c Subnet) {
	c = NewSubnet()
	c.Vpc = vpc

	return c
}

func (c Subnet) GetTemplates() []string {
	return []string{
		SubnetHCLTemplate,
	}
}

func (c Subnet) GetId() string {
	return fmt.Sprintf("aws_subnet.%s.id", c.Name)
}

func (c Subnet) GetType() string {
	return SubnetType
}

func (c Subnet) Validate() (composeTerraform.HCLComponent, error) {
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
