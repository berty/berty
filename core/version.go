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

func CommitDate() string {
	if commitDate == "undefined" {
		return "undefined"
	}

	commitDateInt, err := strconv.ParseInt(commitDate, 10, 64)
	if err != nil {
		return "parse-error"
	}
	tm := time.Unix(commitDateInt, 0)
	return tm.Format(time.RFC3339)
}
