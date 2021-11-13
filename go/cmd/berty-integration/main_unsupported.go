//go:build windows || darwin
// +build windows darwin

package main

import (
	"fmt"
	"os"
	"runtime"
)

func main() {
	fmt.Println(runtime.GOOS + "/" + runtime.GOARCH + " not supported")
	os.Exit(1)
}
