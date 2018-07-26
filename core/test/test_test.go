package test

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"runtime"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/berty/berty/core/network/mock"
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
		out = append(out, len(app.node.ClientEventsChan()))
	}
	return out
}

//
// logging
//

func setupTestLogging() {
	// initialize zap
	config := zap.NewDevelopmentConfig()
	if os.Getenv("LOG_LEVEL") == "debug" {
		config.Level.SetLevel(zap.DebugLevel)
	} else {
		config.Level.SetLevel(zap.InfoLevel)
	}
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	zap.ReplaceGlobals(logger)
}
