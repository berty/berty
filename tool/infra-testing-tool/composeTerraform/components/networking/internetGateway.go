package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
)

type InternetGateway struct {
	Name string

	Vpc   *Vpc
	VpcId string
}

func NewInternetGateway() InternetGateway {
	return InternetGateway{
		Name: composeTerraform.GenerateName(InternetGatewayNamePrefix),
	}
}

func NewInternetGatewayWithAttributes(vpc *Vpc) (c InternetGateway) {
	c = NewInternetGateway()
	c.Vpc = vpc

	return c
}

func (c InternetGateway) GetTemplate() string {
	return InternetGatewayHCLTemplate
}

func (c InternetGateway) GetId() string {
	return fmt.Sprintf("aws_internet_gateway.%s.id", c.Name)
}

func (c InternetGateway) GetType() string {
	return InternetGatewayType
}

func (c InternetGateway) Validate() (composeTerraform.Component, error) {

	if c.Vpc == nil {
		if c.VpcId == "" {
			return c, errors.New(InternetGatewayErrNoVpc)
		}
	} else {
		c.VpcId = c.Vpc.GetId()
	}

	return c, nil
}
