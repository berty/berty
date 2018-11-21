package core // import "berty.tech/core"

var (
	// Version is the core semver version
	Version = "1.0.0"

	// the following variables are updated at build phase using `go build -X`

	GitSha    = "undefined"
	GitTag    = "undefined"
	GitBranch = "undefined"
	BuildMode = "undefined"
)
