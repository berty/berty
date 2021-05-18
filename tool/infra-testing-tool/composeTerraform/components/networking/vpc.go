package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
	"net"
)

type Vpc struct {
	Name      string
	CidrBlock string
}

func NewVpc() Vpc {
	return Vpc{
		Name:      composeTerraform.GenerateName(VpcNamePrefix),
		CidrBlock: VpcCidrBlockDefault,
	}
}

func (c Vpc) GetTemplate() string {
	return VpcHCLTemplate
}

func (c Vpc) GetId() string {
	return fmt.Sprintf("aws_vpc.%s.id", c.Name)
}

func (c Vpc) GetDefaultRouteTableId() string {
	return fmt.Sprintf("aws_vpc.%s.default_route_table_id", c.Name)
}

func (c Vpc) GetType() string {
	return VpcType
}

func (c Vpc) Validate() (composeTerraform.Component, error) {
	// Validate CidrBlock
	_, _, err := net.ParseCIDR(c.CidrBlock)
	if err != nil {
		return c, errors.New(VpcErrNoValidCidrBlock)
	}

	return c, nil
}
