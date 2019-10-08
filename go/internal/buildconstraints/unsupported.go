// +build !go1.12 go1.13

package buildconstraints

func error() {
	`Bad go version, please use go1.12`
}

// this file is called for (version<1.12 OR version>=go1.13)
// See https://golang.org/pkg/go/build/
