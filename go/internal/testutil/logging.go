package testutil

import (
	"flag"
	"os"
	"strconv"
	"testing"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var debug = flag.Bool("debug", false, "is more verbose logging")

func Logger(t *testing.T) *zap.Logger {
	t.Helper()

	envDebug, _ := strconv.ParseBool(os.Getenv("BERTY_DEBUG"))
	if !*debug && !envDebug {
		return zap.NewNop()
	}

	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	config.Level.SetLevel(zap.DebugLevel)
	logger, err := config.Build()
	if err != nil {
		t.Errorf("debug logger: %v", err)
		return zap.NewNop()
	}

	zap.ReplaceGlobals(logger)
	return logger
}
