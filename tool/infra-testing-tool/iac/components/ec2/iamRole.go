package ec2

import (
	"infratesting/aws"
	"infratesting/iac"
	"infratesting/logging"
)

type IamRole struct {
	Name string
	PolicyName string
	ProfileName string
	S3Bucket string
}

func NewIamRole() IamRole {

	bucketName, err := aws.GetBucketName()
	if err != nil {
		_ = logging.LogErr(err)
		panic(err)
	}

	return IamRole{
		Name:        IamRoleDefaultName,
		PolicyName:  IamRolePolicyDefaultName,
		ProfileName: IamInstanceProfileDefaultName,
		S3Bucket: bucketName,
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
