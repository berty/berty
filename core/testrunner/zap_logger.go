package testrunner

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func InitLogger() {
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
