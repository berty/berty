package initutil

import (
	"flag"
	"strings"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/errcode"
	"go.uber.org/zap"
)

const defaultLoggingFilters = "info+:bty*,-*.grpc error+:*"

func (m *Manager) SetupLoggingFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Logging.Filters, "log.filters", defaultLoggingFilters, "zapfilter configuration")
	fs.StringVar(&m.Logging.Logfile, "log.file", "", "if specified, will log everything in JSON into a file and nothing on stderr")
	fs.StringVar(&m.Logging.Format, "log.format", "color", "can be: json, console, color, light-console, light-color")
	fs.StringVar(&m.Logging.Tracer, "log.tracer", "", `specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger`)
}

func (m *Manager) GetLogger() (*zap.Logger, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getLogger()
}

func (m *Manager) getLogger() (*zap.Logger, error) {
	if m.Logging.zapLogger != nil {
		return m.Logging.zapLogger, nil
	}

	m.Logging.Filters = strings.ReplaceAll(m.Logging.Filters, ":default:", defaultLoggingFilters)

	tracerFlush := tracer.InitTracer(m.Logging.Tracer, "berty")
	logger, loggerCleanup, err := logutil.NewLogger(
		m.Logging.Filters,
		m.Logging.Format,
		m.Logging.Logfile,
	)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Logging.zapLogger = logger

	m.Logging.cleanup = func() {
		tracerFlush()
		loggerCleanup()
	}
	m.initLogger = logger.Named("init")
	m.initLogger.Debug("logger initialized", zap.Any("manager", m))

	return m.Logging.zapLogger, nil
}
