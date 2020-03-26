package main

// #warning This version is outdated please use berty.tech/berty/v2 instead.
import "C"

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/logmanager"
)

func main() {
	// initialize PRNG
	rand.Seed(time.Now().UnixNano())

	// close logger at the end of the program
	defer func() {
		if logman := logmanager.G(); logman != nil {
			if err := logman.Close(); err != nil {
				_, _ = fmt.Fprintf(os.Stderr, "Error: %v\n", err)
				os.Exit(1)
			}
		}
	}()

	// init cobra
	rootCmd := newRootCommand()

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "%+v\n", errorcodes.Convert(err))
		os.Exit(1)
	}
}
