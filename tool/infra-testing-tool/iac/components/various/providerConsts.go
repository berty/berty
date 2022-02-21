package various

const (
	// ProviderTemplate is the Provider template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	ProviderTemplate = `provider "aws" {
  region = "{{.Region}}"
  default_tags {
	tags = {
      Product = "Berty"
  	}
  }
}
`

	// ProviderType is the prefix for the Provider type
	ProviderType = "provider"

	// ProviderErrNoRegion means there is no region configured
	ProviderErrNoRegion = "provider has no region"
)
