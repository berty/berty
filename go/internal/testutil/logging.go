package testutil

import (
	"flag"
	"os"
	"testing"

	ipfs_log "github.com/ipfs/go-log"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var debug = flag.Bool("debug", false, "is more verbose logging")

func Logger(t *testing.T) *zap.Logger {
	t.Helper()

	var (
		bertyDebug     = parseBoolFromEnv("BERTY_DEBUG") || *debug
		libp2pDebug    = parseBoolFromEnv("LIBP2P_DEBUG")
		orbitdbDebug   = parseBoolFromEnv("ORBITDB_DEBUG")
		bertylogfile   = os.Getenv("LOGFILE")
		isDebugEnabled = bertyDebug || orbitdbDebug || libp2pDebug
	)

	// if no logger configured, return a zap logger that only prints errors and above
	if !isDebugEnabled {
		config := zap.NewDevelopmentConfig()
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		config.Level.SetLevel(zap.ErrorLevel)
		if bertylogfile != "" {
			config.OutputPaths = []string{bertylogfile}
		}

		// build logger
		logger, err := config.Build()
		if err != nil {
			t.Errorf("setup debug logger error: `%v`", err)
			return zap.NewNop()
		}
		return logger
	}

	// setup zap config
	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	config.Level.SetLevel(zap.DebugLevel)
	if bertylogfile != "" {
		config.OutputPaths = []string{bertylogfile}
	}

	// build logger
	logger, err := config.Build()
	if err != nil {
		t.Errorf("setup debug logger error: `%v`", err)
		return zap.NewNop()
	}

	// configure extensions
	if libp2pDebug {
		ipfs_log.SetDebugLogging()
	}

	if orbitdbDebug {
		zap.ReplaceGlobals(logger)
	}

	return logger
}
