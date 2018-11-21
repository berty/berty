package core // import "berty.tech/core"

import (
	"strconv"
	"time"
)

var (
	// Version is the core semver version
	Version = "1.0.0"

	// the following variables are updated at build phase using `go build -X`

	GitSha     = "undefined"
	GitTag     = "undefined"
	GitBranch  = "undefined"
	BuildMode  = "undefined"
	commitDate = "undefined"
)

func CommitDate() time.Time {
	if commitDate == "undefined" {
		return time.Time{}
	}

	commitDateInt, err := strconv.ParseInt(commitDate, 10, 64)
	if err != nil {
		return time.Time{}
	}
	return time.Unix(commitDateInt, 0)
}
