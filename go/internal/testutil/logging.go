package testutil

import (
	"flag"
	"os"
	"strings"
	"sync"
	"testing"

	"berty.tech/berty/v2/go/internal/logutil"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

const defaultLoggingFilters = "info+:bty.test* error+:*,-ipfs*"

var (
	logFilters     = flag.String("log-filters", defaultLoggingFilters, "log namespaces")
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
		*logFilters = strings.ReplaceAll(*logFilters, ":default:", defaultLoggingFilters)

		var err error
		loggerInstance, loggerCleanup, err = logutil.NewLogger(*logFilters, *logFormat, *logFile)
		if !assert.NoError(t, err) {
			loggerInstance = zap.NewNop()
			loggerCleanup = func() {}
		}
	})

	return loggerInstance, loggerCleanup
}
