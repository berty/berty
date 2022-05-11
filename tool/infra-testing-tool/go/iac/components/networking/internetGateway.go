package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
)

type InternetGateway struct {
	Name string

	Vpc   *Vpc
	VpcId string
}

func NewInternetGateway() InternetGateway {
	return InternetGateway{
		Name: iac.GenerateName(InternetGatewayNamePrefix),
	}
}

func NewInternetGatewayWithAttributes(vpc *Vpc) (c InternetGateway) {
	c = NewInternetGateway()
	c.Vpc = vpc

	return c
}

// GetTemplate returns the InternetGateway template
func (c InternetGateway) GetTemplate() string {
	return InternetGatewayHCLTemplate
}

// GetId returns the terraform formatting of this InternetGateways' id
func (c InternetGateway) GetId() string {
	return fmt.Sprintf("aws_internet_gateway.%s.id", c.Name)
}

// GetType returns the InternetGateways type
func (c InternetGateway) GetType() string {
	return InternetGatewayType
}

// Validate validates the component
func (c InternetGateway) Validate() (iac.Component, error) {

	if c.Vpc == nil {
		if c.VpcId == "" {
			return c, errors.New(InternetGatewayErrNoVpc)
		}
	} else {
		c.VpcId = c.Vpc.GetId()
	}

	return c, nil
}
