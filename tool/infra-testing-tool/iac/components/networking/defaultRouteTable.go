package networking

import (
	"errors"
	"infratesting/iac"
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
		Name: iac.GenerateName(DefaultRouteTableNamePrefix),
	}
}

func NewDefaultRouteTableWithAttributes(vpc *Vpc, ig *InternetGateway) (c DefaultRouteTable) {
	c = NewDefaultRouteTable()
	c.Vpc = vpc
	c.InternetGateway = ig

	return c
}

// GetTemplate returns the RouteTable template
func (c DefaultRouteTable) GetTemplate() string {
	return DefaultRouteTableHCLTemplate
}

// GetType returns the RouteTable type
func (c DefaultRouteTable) GetType() string {
	return DefaultRouteTableType
}

// Validate validates the component
func (c DefaultRouteTable) Validate() (iac.Component, error) {

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
