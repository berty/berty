package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
	"net"
)

type Vpc struct {
	Name      string
	CidrBlock string
}

func NewVpc() Vpc {
	return Vpc{
		Name:      iac.GenerateName(VpcNamePrefix),
		CidrBlock: VpcCidrBlockDefault,
	}
}

// GetTemplate returns the VPC template
func (c Vpc) GetTemplate() string {
	return VpcHCLTemplate
}

// GetId returns the terraform formatting of this Vpc's id
func (c Vpc) GetId() string {
	return fmt.Sprintf("aws_vpc.%s.id", c.Name)
}

// GetDefaultRouteTableId returns the terraform formatting of this Vpc's default route table id
func (c Vpc) GetDefaultRouteTableId() string {
	return fmt.Sprintf("aws_vpc.%s.default_route_table_id", c.Name)
}

// GetType returns the Vpc type
func (c Vpc) GetType() string {
	return VpcType
}

// Validate validates the component
func (c Vpc) Validate() (iac.Component, error) {
	// Validate CidrBlock
	_, _, err := net.ParseCIDR(c.CidrBlock)
	if err != nil {
		return c, errors.New(VpcErrNoValidCidrBlock)
	}

	return c, nil
}
