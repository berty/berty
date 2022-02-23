package ec2

import (
	"infratesting/iac"
)

type IamRole struct {
	Name        string
	PolicyName  string
	ProfileName string
	S3Bucket    string
}

func NewIamRole() IamRole {
	return IamRole{
		Name:        IamRoleDefaultName,
		PolicyName:  IamRolePolicyDefaultName,
		ProfileName: IamInstanceProfileDefaultName,
	}
}

func (c IamRole) GetTemplate() string {
	return IamRoleTemplate
}

// GetId should never be called but is required to make it an HCLComponent
func (c IamRole) GetId() string {
	return ""
}

func (c IamRole) GetType() string {
	return IamRoleType
}

func (c IamRole) Validate() (iac.Component, error) {

	return c, nil
}
