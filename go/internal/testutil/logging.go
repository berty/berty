package testutil

import (
	"flag"
	"fmt"
	"os"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
)

const defaultLoggingFilters = "info+:bty.test* error+:*,-ipfs*,-*.tyber"

var (
	logFilters     = flag.String("log-filters", defaultLoggingFilters, "log namespaces")
	logFile        = flag.String("log-file", "", "log to file")
	logFormat      = flag.String("log-format", "color", "json, console, color")
	loggerInstance *zap.Logger
	loggerCleanup  func()
	loggerInitOnce sync.Once
	loggerRing     *zapring.Core
)

func Logger(t testing.TB) (*zap.Logger, func()) {
	t.Helper()

	loggerInstance, _, loggerCleanup := LoggerWithRing(t)
	return loggerInstance, loggerCleanup
}

func LoggerWithRing(t testing.TB) (*zap.Logger, *zapring.Core, func()) {
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
		loggerRing = zapring.New(10 * 1024 * 1024)
		loggerInstance, loggerCleanup, err = logutil.NewLogger(
			logutil.NewStdStream(*logFilters, *logFormat, *logFile),
			logutil.NewRingStream(*logFilters, *logFormat, loggerRing),
		)
		if !assert.NoError(t, err) {
			loggerInstance = zap.NewNop()
			loggerCleanup = func() {}
		}
	})

	return loggerInstance, loggerRing, loggerCleanup
}

func LogTree(t *testing.T, log string, indent int, title bool, args ...interface{}) {
	t.Helper()
	if os.Getenv("SHOW_LOG_TREES") != "1" {
		return
	}

	if len(args) > 0 {
		log = fmt.Sprintf(log, args...)
	}

	if !title {
		log = "└── " + log
	}

	for i := 0; i < indent; i++ {
		log = "│  " + log
	}

	t.Log(log)
}
