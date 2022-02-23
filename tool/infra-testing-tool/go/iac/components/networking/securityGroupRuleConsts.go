package networking

const (
	// SecurityGroupRuleHCLTemplate is the Security Group template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	SecurityGroupRuleHCLTemplate = `
resource "aws_security_group_rule" "{{.Name }}" {
  type = "{{.RuleType }}"
  from_port = "{{.FromPort }}"
  to_port = "{{.ToPort }}"
  protocol = "{{.Protocol }}"
  security_group_id = {{.SecurityGroupId }}
{{if .Self }}
  self = true
{{else}}
  cidr_blocks = ["0.0.0.0/0"]
{{- end}}
}
`

	// SecurityGroupRuleNamePrefix is the prefix for the SecurityGroup type
	// can't use "sg" here as that causes a 400 when creating the component (because aws uses "sg")
	SecurityGroupRuleNamePrefix = "secgrrule"

	SecurityGroupRuleType = "securityGroupRule"

	RuleTypeIngress = "ingress"
	RuleTypeEgress  = "egress"

	// SecurityGroupRuleErrNoVpcId means there is no VpcId attached to the security group
	SecurityGroupRuleErrNoVpcId = "securityGroup has no attribute 'VpcId'"
	// SecurityGroupRuleErrNoVpc means there is no Vpc attached to the security group
	SecurityGroupRuleErrNoVpc = "securityGroup has no attribute 'Vpc'"
)
