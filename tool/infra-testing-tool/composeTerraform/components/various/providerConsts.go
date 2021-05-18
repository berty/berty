package various

const (
	// ProviderTemplate is the Provider template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	ProviderTemplate = `
provider "aws" {
  region = "{{.Region}}"
}
`

	// ProviderRegionDefault is the default region
	ProviderRegionDefault = "eu-central-1"

	// ProviderType is the prefix for the Provider type
	ProviderType = "provider"

	// ProviderErrNoRegion means there is no region configured
	ProviderErrNoRegion = "provider has no region"
)
