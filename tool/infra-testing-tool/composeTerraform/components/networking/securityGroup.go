package networking

import (
	"errors"
	"fmt"
	"infratesting/composeTerraform"
)

type SecurityGroup struct {
	Name string

	Vpc   *Vpc
	VpcId string

	// TODO
	// add components to modify ingress and egress rules
	// ports, protocols, etc
}

func NewSecurityGroup() SecurityGroup {
	return SecurityGroup{
		Name: composeTerraform.GenerateName(SecurityGroupNamePrefix),
	}
}

func NewSecurityGroupWithAttributes(vpc *Vpc) (c SecurityGroup) {
	c = NewSecurityGroup()
	c.Vpc = vpc

	return c
}

func (c SecurityGroup) GetTemplate() string {
	return SecurityGroupHCLTemplate
}

func (c SecurityGroup) GetId() string {
	return fmt.Sprintf("aws_security_group.%s.id", c.Name)
}

func (c SecurityGroup) GetType() string {
	return SecurityGroupType
}

func (c SecurityGroup) Validate() (composeTerraform.Component, error) {
	if c.Vpc == nil {
		if c.VpcId == "" {
			return c, errors.New(SecurityGroupErrNoVpc)
		}
	} else {
		c.VpcId = c.Vpc.GetId()
	}

	return c, nil
}
