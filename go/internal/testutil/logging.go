package testutil

import (
	"flag"
	"os"
	"sync"
	"testing"

	"berty.tech/berty/v2/go/internal/logutil"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

var (
	logFilters     = flag.String("log-filters", "info+:bty.test error+:*", "log namespaces")
	logFile        = flag.String("log-file", "", "log to file")
	logFormat      = flag.String("log-format", "color", "json, console, color")
	loggerInstance *zap.Logger
	loggerCleanup  func()
	loggerInitOnce sync.Once
)

func Logger(t *testing.T) (*zap.Logger, func()) {
	t.Helper()

	loggerInitOnce.Do(func() {
		if val := os.Getenv("BERTY_LOGFILTERS"); val != "" {
			*logFilters = val
		}
		if val := os.Getenv("BERTY_LOGFILE"); val != "" {
			*logFile = val
		}
		if val := os.Getenv("BERTY_LOGFORMAT"); val != "" {
			*logFormat = val
		}

		var err error
		loggerInstance, loggerCleanup, err = logutil.NewLogger(*logFilters, *logFormat, *logFile)
		if !assert.NoError(t, err) {
			loggerInstance = zap.NewNop()
			loggerCleanup = func() {}
		}
	})

	return loggerInstance, loggerCleanup
}
