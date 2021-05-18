package networking

import (
	"errors"
	"infratesting/composeTerraform"
)

type DefaultRouteTable struct {
	Name string

	Vpc                    *Vpc
	VpcDefaultRouteTableId string

	InternetGateway   *InternetGateway
	InternetGatewayId string
}

func NewDefaultRouteTable() DefaultRouteTable {
	return DefaultRouteTable{
		Name: composeTerraform.GenerateName(DefaultRouteTableNamePrefix),
	}
}

func NewDefaultRouteTableWithAttributes(vpc *Vpc, ig *InternetGateway) (c DefaultRouteTable) {
	c = NewDefaultRouteTable()
	c.Vpc = vpc
	c.InternetGateway = ig

	return c
}

func (c DefaultRouteTable) GetTemplate() string {
	return DefaultRouteTableHCLTemplate
}

func (c DefaultRouteTable) GetType() string {
	return DefaultRouteTableType
}

func (c DefaultRouteTable) Validate() (composeTerraform.Component, error) {

	if c.Vpc == nil {
		if c.VpcDefaultRouteTableId == "" {
			return c, errors.New(DefaultRouteTableErrNoVpc)
		}
	} else {
		c.VpcDefaultRouteTableId = c.Vpc.GetDefaultRouteTableId()
	}

	if c.InternetGateway == nil {
		if c.InternetGatewayId == "" {
			return c, errors.New(DefaultRouteTableErrNoInternetGateway)
		}
	} else {
		c.InternetGatewayId = c.InternetGateway.GetId()
	}

	return c, nil
}
