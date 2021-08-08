package networking

import (
	"errors"
	"fmt"
	"infratesting/iac"
)

type SecurityGroup struct {
	Name string

	Vpc   *Vpc
	VpcId string
}

func NewSecurityGroup() SecurityGroup {
	return SecurityGroup{
		Name: iac.GenerateName(SecurityGroupNamePrefix),
	}
}

func NewSecurityGroupWithAttributes(vpc *Vpc) (c SecurityGroup) {
	c = NewSecurityGroup()
	c.Vpc = vpc

	return c
}

// GetTemplate returns the SecurityGroup template
func (c SecurityGroup) GetTemplate() string {
	return SecurityGroupHCLTemplate
}

// GetId returns the terraform formatting of this SecurityGroup id
func (c SecurityGroup) GetId() string {
	return fmt.Sprintf("aws_security_group.%s.id", c.Name)
}

// GetType returns the SecurityGroup type
func (c SecurityGroup) GetType() string {
	return SecurityGroupType
}

// Validate validates the component
func (c SecurityGroup) Validate() (iac.Component, error) {
	if c.Vpc == nil {
		if c.VpcId == "" {
			return c, errors.New(SecurityGroupErrNoVpc)
		}
	} else {
		c.VpcId = c.Vpc.GetId()
	}

	return c, nil
}
