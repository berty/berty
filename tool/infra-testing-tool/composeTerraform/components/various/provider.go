package various

import (
	"errors"
	"infratesting/composeTerraform"
)

type Provider struct {
	Region string
}

func NewProvider() Provider {
	return Provider{
		Region: ProviderRegionDefault,
	}
}

func NewProviderWithAttribute(region string) (c Provider) {
	c = NewProvider()
	c.Region = region

	return c
}

func (c Provider) GetTemplate() string {
	return ProviderTemplate
}

// GetId should never be called but is required to make it an HCLComponent
func (c Provider) GetId() string {
	return ""
}

func (c Provider) GetType() string {
	return ProviderType
}

func (c Provider) Validate() (composeTerraform.Component, error) {
	if c.Region == "" {
		return c, errors.New(ProviderErrNoRegion)
	}

	return c, nil
}
