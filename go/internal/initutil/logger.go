package initutil

import (
	"flag"
	"fmt"
	"strings"
	"sync"
	"time"

	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"go.uber.org/zap"
	"gopkg.in/natefinch/lumberjack.v2"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const defaultLoggingFilters = "info+:bty*,-*.grpc error+:*"

func (m *Manager) SetupLoggingFlags(fs *flag.FlagSet) {
	if m.Logging.FilePath == "" && m.Session.Kind != "" {
		m.Logging.FilePath = fmt.Sprintf("<store-dir>/logs/%s-<start-time>.log", m.Session.Kind)
	}
	fs.StringVar(&m.Logging.StderrFilters, "log.filters", m.Logging.StderrFilters, "stderr zapfilter configuration")
	fs.StringVar(&m.Logging.StderrFormat, "log.format", m.Logging.StderrFormat, "stderr logging format. can be: json, console, color, light-console, light-color")
	fs.StringVar(&m.Logging.FilePath, "log.file", m.Logging.FilePath, "log file path (pattern)")
	fs.UintVar(&m.Logging.RingSize, "log.ring-size", m.Logging.RingSize, `ring buffer size in MB`)
	fs.StringVar(&m.Logging.RingFilters, "log.ring-filters", m.Logging.RingFilters, "ring zapfilter configuration")
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
	logger.Named("init").Debug("logger initialized", zap.Any("manager", m))
}

func (m *Manager) getLogger() (*zap.Logger, error) {
	if m.Logging.zapLogger != nil {
		return m.Logging.zapLogger, nil
	}

	m.Logging.StderrFilters = strings.ReplaceAll(m.Logging.StderrFilters, KeywordDefault, defaultLoggingFilters)
	m.Logging.FileFilters = strings.ReplaceAll(m.Logging.FileFilters, KeywordDefault, defaultLoggingFilters)

	streams := []logutil.Stream{}
	if m.Logging.StderrFilters != "" {
		streams = append(streams, logutil.NewStdStream(m.Logging.StderrFilters, m.Logging.StderrFormat, "stderr"))
	}
	if m.Logging.RingSize > 0 {
		m.Logging.ring = zapring.New(m.Logging.RingSize * 1024 * 1024)
		streams = append(streams, logutil.NewRingStream(m.Logging.RingFilters, "json", m.Logging.ring))
	}
	if m.Logging.TyberHost != "" {
		streams = append(streams, logutil.NewTyberStream(m.Logging.TyberHost))
	}
	if m.Logging.FilePath != "" && m.Logging.FileFilters != "" {
		m.Logging.FilePath = strings.ReplaceAll(m.Logging.FilePath, "<store-dir>", m.Datastore.Dir)
		startTime := time.Now().Format("2006-01-02T15-04-05.000")
		m.Logging.FilePath = strings.ReplaceAll(m.Logging.FilePath, "<start-time>", startTime)
		opts := lumberjack.Logger{
			Filename:   m.Logging.FilePath,
			MaxSize:    100, // megabytes
			MaxBackups: 10,
			MaxAge:     7, // days
			Compress:   true,
		}
		streams = append(streams, logutil.NewLumberjackStream(m.Logging.FileFilters, "json", &opts))
	}
	logger, loggerCleanup, err := logutil.NewLogger(streams...)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Logging.zapLogger = logger
	m.Logging.cleanup = func() {
		loggerCleanup()
	}
	m.initLogger = logger.Named("init")
	m.initLogger.Info("logger initialized", zap.Any("manager", m))

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
