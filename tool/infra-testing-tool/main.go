package main

import (
	"infratesting/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		panic(err)
	}

}
