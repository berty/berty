package testutil

import (
	"flag"
	"testing"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var debug = flag.Bool("debug", false, "is more verbose logging")

func Logger(t *testing.T) *zap.Logger {
	t.Helper()
	if !*debug {
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
	return logger
}
