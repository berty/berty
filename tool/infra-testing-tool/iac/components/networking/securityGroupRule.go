package networking

import (
	"fmt"
	"infratesting/iac"
)

type SecurityGroupRule struct {
	Name            string
	RuleType        string
	FromPort        int
	ToPort          int
	Protocol        string
	SecurityGroupId string

	Self bool
}

func NewSecurityGroupRule() SecurityGroupRule {
	return SecurityGroupRule{
		Name: iac.GenerateName(SecurityGroupRuleNamePrefix),
	}
}

func NewSecurityGroupRuleIngress() (c SecurityGroupRule) {
	c = NewSecurityGroupRule()
	c.RuleType = RuleTypeIngress

	return c
}

func NewSecurityGroupRuleEgress() (c SecurityGroupRule) {
	c = NewSecurityGroupRule()
	c.RuleType = RuleTypeEgress

	return c
}

func (c *SecurityGroupRule) SetPorts(port int) {
	c.FromPort = port
	c.ToPort = port
}

// GetTemplate returns the SecurityGroupRule template
func (c SecurityGroupRule) GetTemplate() string {
	return SecurityGroupRuleHCLTemplate
}

// GetId returns the terraform formatting of this SecurityGroupRule id
func (c SecurityGroupRule) GetId() string {
	return fmt.Sprintf("aws_security_group_rule.%s.id", c.Name)
}

// GetType returns the SecurityGroupRule type
func (c SecurityGroupRule) GetType() string {
	return SecurityGroupRuleType
}

// Validate validates the component
func (c SecurityGroupRule) Validate() (iac.Component, error) {

	return c, nil
}
