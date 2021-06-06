package main

import (
	"infratesting/cmd"
)

const (
	TESTCONFIGFILE = "testConfig.yaml"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		panic(err)
	}

}
