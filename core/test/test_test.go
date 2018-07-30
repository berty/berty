package test

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/berty/berty/core/network/drivermock"
)

func jsonPrint(i interface{}) {
	out, _ := json.Marshal(i)
	fmt.Println(string(out))
}

func jsonPrintIndent(i interface{}) {
	out, _ := json.MarshalIndent(i, "", "  ")
	fmt.Println(string(out))
}

func nodeChansLens(apps ...*AppMock) []int {
	time.Sleep(1 * time.Millisecond) // FIXME: wait for an event instead of waiting for a fixed time
	out := []int{}
	for _, app := range apps {
		out = append(out, len(app.networkDriver.(*drivermock.Enqueuer).Queue()))
		out = append(out, len(app.node.ClientEventsChan()))
	}
	return out
}
