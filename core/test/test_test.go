package test

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

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
