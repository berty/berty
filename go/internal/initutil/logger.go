package initutil

import (
	"flag"
	"fmt"
	"strings"
	"sync"

	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"go.uber.org/zap"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const defaultLoggingFilters = "info+:bty*,-*.grpc error+:*"

func (m *Manager) SetupLoggingFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Logging.Filters, "log.filters", m.Logging.Filters, "zapfilter configuration")
	fs.StringVar(&m.Logging.RingFilters, "log.ring-filters", m.Logging.RingFilters, "zapfilter configuration for ring")
	fs.StringVar(&m.Logging.Logfile, "log.file", m.Logging.Logfile, "if specified, will log everything in JSON into a file and nothing on stderr")
	fs.StringVar(&m.Logging.Format, "log.format", m.Logging.Format, "can be: json, console, color, light-console, light-color")
	fs.StringVar(&m.Logging.Tracer, "log.tracer", m.Logging.Tracer, `specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger`)
	fs.StringVar(&m.Logging.Service, "log.service", m.Logging.Service, `service name, used by the tracer`)
	fs.UintVar(&m.Logging.RingSize, "log.ring-size", m.Logging.RingSize, `logging ring buffer size in MB`)
	fs.StringVar(&m.Logging.TyberHost, "log.tyber-host", m.Logging.TyberHost, `Tyber server HOST[:PORT] to stream logs to`)

	m.longHelp = append(m.longHelp, [2]string{
		"-log.filters=':default: CUSTOM'",
		fmt.Sprintf("equivalent to -log.filters='%s CUSTOM'", defaultLoggingFilters),
	})
	m.longHelp = append(m.longHelp, [2]string{
		"",
		"-> more info at https://github.com/moul/zapfilter",
	})
}

func (m *Manager) GetLogger() (*zap.Logger, error) {
	defer m.prepareForGetter()()

	return m.getLogger()
}

func (m *Manager) SetLogger(logger *zap.Logger) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// the following check is here to help developers avoid having
	// strange states by using multiple instances of the logger
	if m.Logging.zapLogger != nil {
		panic("initutil.SetLogger was called but there was already an existing value")
	}

	m.Logging.zapLogger = logger
}

func (m *Manager) getLogger() (*zap.Logger, error) {
	if m.Logging.zapLogger != nil {
		return m.Logging.zapLogger, nil
	}

	m.Logging.Filters = strings.ReplaceAll(m.Logging.Filters, KeywordDefault, defaultLoggingFilters)

	tracerFlush := tracer.InitTracer(m.Logging.Tracer, m.Logging.Service)
	streams := []logutil.Stream{
		logutil.NewStdStream(m.Logging.Filters, m.Logging.Format, m.Logging.Logfile),
	}
	if m.Logging.RingSize > 0 {
		m.Logging.ring = zapring.New(m.Logging.RingSize * 1024 * 1024)
		streams = append(streams, logutil.NewRingStream(m.Logging.RingFilters, "json", m.Logging.ring))
	}
	if m.Logging.TyberHost != "" {
		streams = append(streams, logutil.NewTyberStream(m.Logging.TyberHost))
	}

	logger, loggerCleanup, err := logutil.NewLogger(streams...)
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

var (
	// grpc logger should be set only once.
	// without this singleton, we can raise race conditions in unit tests => https://github.com/grpc/grpc-go/issues/1084
	grpcLoggerConfigured   bool
	muGRPCLoggerConfigured sync.Mutex
)

func ReplaceGRPCLogger(l *zap.Logger) {
	muGRPCLoggerConfigured.Lock()

	if !grpcLoggerConfigured {
		grpc_zap.ReplaceGrpcLoggerV2(l)
		grpcLoggerConfigured = true
	}

	muGRPCLoggerConfigured.Unlock()
}
