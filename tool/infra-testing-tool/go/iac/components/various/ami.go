package various

import (
	"infratesting/aws"
	"infratesting/iac"
)

type Ami struct {
	AmiID  string
	Region string
}

func NewAmi() Ami {
	return Ami{}
}

func (c Ami) GetTemplate() string {
	return AmiTemplate
}

// GetId should never be called but is required to make it an HCLComponent
func (c Ami) GetId() string {
	return ""
}

func (c Ami) GetType() string {
	return AmiType
}

func (c Ami) Validate() (iac.Component, error) {
	AmiID, err := aws.GetLatestAMI(AmiDefaultName)
	if err != nil {
		return c, err
	}

	c.AmiID = AmiID

	return c, nil
}
