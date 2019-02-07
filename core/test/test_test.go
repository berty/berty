package test

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"runtime"
	"testing"
	"time"

	"berty.tech/core/entity"
	"berty.tech/core/network/mock"
)

func init() {
	rand.Seed(time.Now().UnixNano())
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
	now := time.Now().UTC()
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
	time.Sleep(10 * time.Millisecond) // we let a few time to the queue to be filled
	out := []int{}
	for _, app := range apps {
		app.node.AsyncWait(context.Background())
		out = append(out, len(app.networkDriver.(*mock.Enqueuer).Queue()))
		out = append(out, len(app.eventStream))
		if len(app.eventStream) > 99 {
			log.Println("!! QUEUE SHOULD NOT BE AS MUCH FILLED !!")
			log.Println("--- queue")
			for len(app.networkDriver.(*mock.Enqueuer).Queue()) > 0 {
				event := <-app.networkDriver.(*mock.Enqueuer).Queue()
				jsonPrint(event)
			}
			log.Println("--- eventStream")
			for len(app.eventStream) > 0 {
				event := <-app.eventStream
				jsonPrint(event)
			}
		}
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

//
// get async events with timeout
//

func asyncEventsWithTimeout(eventStream chan *entity.Event, n int) ([]*entity.Event, []*entity.Event, error) {
	var incomings, outgoings []*entity.Event

	for i := 0; i < n; i++ {
		select {
		case event := <-eventStream:
			if event.Direction == entity.Event_Incoming {
				incomings = append(incomings, event)
			} else {
				outgoings = append(outgoings, event)
			}
		case <-time.After(1 * time.Second): // max 1 sec timeout
			return nil, nil, fmt.Errorf("timeout")
		}
	}

	return incomings, outgoings, nil
}
