package various

import (
	"errors"
	"infratesting/aws"
	"infratesting/iac"
)

type Ami struct {
	AmiID string
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
	resp, err := aws.GetImages(AmiDefaultName)

	if err != nil {
		return c, err
	}

	if len(resp.Images) < 1 {
		return nil, errors.New(ErrNoAMI)
	}

	// takes the first one
	// TODO improve this so it doesn't take the first one
	c.AmiID = *resp.Images[0].ImageId
	return c, nil
}
