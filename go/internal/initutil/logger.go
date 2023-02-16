package initutil

import (
	"flag"
	"fmt"
	"runtime"
	"strings"

	"go.uber.org/zap"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/pkg/logutil"
)

const DefaultLoggingFilters = "info+:bty*,-*.grpc,error+:*"

func (m *Manager) SetupLoggingFlags(fs *flag.FlagSet) {
	if m.Logging.FilePath == "" && m.Session.Kind != "" {
		m.Logging.FilePath = "<store-dir>/logs"
	}
	fs.BoolVar(&m.Logging.Native, "log.native", false, "enable native logger (android & darwin only)")
	fs.StringVar(&m.Logging.StderrFilters, "log.filters", m.Logging.StderrFilters, "stderr zapfilter configuration")
	fs.StringVar(&m.Logging.StderrFormat, "log.format", m.Logging.StderrFormat, "stderr logging format. can be: json, console, color, light-console, light-color")
	fs.StringVar(&m.Logging.FilePath, "log.file", m.Logging.FilePath, "log file path (pattern)")
	fs.StringVar(&m.Logging.FileFilters, "log.file-filters", m.Logging.FileFilters, "file zapfilter configuration")
	fs.UintVar(&m.Logging.RingSize, "log.ring-size", m.Logging.RingSize, `ring buffer size in MB`)
	fs.StringVar(&m.Logging.RingFilters, "log.ring-filters", m.Logging.RingFilters, "ring zapfilter configuration")
	fs.StringVar(&m.Logging.TyberAutoAttach, "log.tyber-auto-attach", m.Logging.TyberAutoAttach, "tyber host addresses to be automatically attached to")

	m.longHelp = append(m.longHelp, [2]string{
		"-log.filters=':default: CUSTOM'",
		fmt.Sprintf("equivalent to -log.filters='%s CUSTOM'", DefaultLoggingFilters),
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

	m.Logging.StderrFilters = strings.ReplaceAll(m.Logging.StderrFilters, KeywordDefault, DefaultLoggingFilters)
	m.Logging.FileFilters = strings.ReplaceAll(m.Logging.FileFilters, KeywordDefault, DefaultLoggingFilters)

	streams := m.Logging.DefaultLoggerStreams
	if m.Logging.StderrFilters != "" {
		streams = append(streams, logutil.NewStdStream(m.Logging.StderrFilters, m.Logging.StderrFormat, "stderr"))
	}
	if m.Logging.RingSize > 0 {
		m.Logging.ring = zapring.New(m.Logging.RingSize * 1024 * 1024)
		streams = append(streams, logutil.NewRingStream(m.Logging.RingFilters, "json", m.Logging.ring))
	}
	if m.Logging.FilePath != "" && m.Logging.FileFilters != "" {
		m.Logging.FilePath = strings.ReplaceAll(m.Logging.FilePath, "<store-dir>", m.Datastore.AppDir)
		streams = append(streams, logutil.NewFileStream(m.Logging.FileFilters, "json", m.Logging.FilePath, m.Session.Kind))
	}
	if m.Logging.Native && (runtime.GOOS == "darwin" || runtime.GOOS == "android") {
		nativeLogger := logutil.NewNativeLogger("tech.berty")
		streams = append(streams, logutil.NewCustomStream(m.Logging.StderrFilters, nativeLogger))
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
