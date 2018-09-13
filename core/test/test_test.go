package test

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"runtime"
	"testing"
	"time"

	"berty.tech/core/network/mock"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

//
// json print helpers
//

func jsonPrint(i interface{}) {
	out, _ := json.Marshal(i)
	fmt.Println(string(out))
}

func jsonPrintIndent(i interface{}) {
	out, _ := json.MarshalIndent(i, "", "  ")
	fmt.Println(string(out))
}

//
// duration / bench helpers
//

var durations map[string][]time.Time

func printDuration(key string) {
	if durations == nil {
		durations = make(map[string][]time.Time)
	}
	_, fn, line, _ := runtime.Caller(1)
	now := time.Now()
	if _, found := durations[key]; found {
		log.Printf("\n[duration] %s: %s:%d diff=%s total=%s\n", key, fn, line, now.Sub(durations[key][1]), now.Sub(durations[key][0]))
		durations[key][1] = now
	} else {
		log.Printf("\n[duration] %s: %s:%d init\n", key, fn, line)
		durations[key] = []time.Time{now, now}
	}
}

//
// appmock helpers
//

func nodeChansLens(apps ...*AppMock) []int {
	time.Sleep(1 * time.Millisecond) // FIXME: wait for an event instead of waiting for a fixed time
	out := []int{}
	for _, app := range apps {
		out = append(out, len(app.networkDriver.(*mock.Enqueuer).Queue()))
		out = append(out, len(app.eventStream))
	}
	return out
}

//
// fail fast
//
// see e2e_test.go for examples
//
var lastTestSucceed = true

func shouldIContinue(t *testing.T) {
	if !lastTestSucceed {
		t.Skip("a previous test failed, stopping here")
	}
	lastTestSucceed = false
}

func everythingWentFine() {
	lastTestSucceed = true
}
