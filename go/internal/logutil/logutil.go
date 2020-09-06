package logutil

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"

	ipfs_log "github.com/ipfs/go-log/v2"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/u"
	"moul.io/zapfilter"
)

const (
	consoleEncoding = "console"
	jsonEncoding    = "json"
)

func NewLogger(filters string, format string, logFile string) (*zap.Logger, func(), error) {
	if filters == "" {
		cleanup := func() {}
		return zap.NewNop(), cleanup, nil
	}

	// configure zap
	var config zap.Config
	switch logFile {
	case "":
		config = zap.NewDevelopmentConfig()
	case "stdout", "stderr":
		config = zap.NewDevelopmentConfig()
		config.OutputPaths = []string{logFile}
	default:
		config = zap.NewProductionConfig()
		config.OutputPaths = []string{logFile}
	}
	config.Level.SetLevel(zapcore.DebugLevel)

	stableWidthNameEncoder := func(loggerName string, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString(fmt.Sprintf("%-18s", loggerName))
	}
	stableWidthCapitalLevelEncoder := func(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString(fmt.Sprintf("%-5s", l.CapitalString()))
	}
	const (
		Black uint8 = iota + 30
		Red
		Green
		Yellow
		Blue
		Magenta
		Cyan
		White
	)
	stableWidthCapitalColorLevelEncoder := func(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
		switch l {
		case zapcore.DebugLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Magenta, "DEBUG"))
		case zapcore.InfoLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Blue, "INFO "))
		case zapcore.WarnLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Yellow, "WARN "))
		case zapcore.ErrorLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "ERROR"))
		case zapcore.DPanicLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "DPANIC"))
		case zapcore.PanicLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "PANIC"))
		case zapcore.FatalLevel:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "FATAL"))
		default:
			enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, l.CapitalString()))
		}
	}

	switch strings.ToLower(format) {
	case "":
	// noop
	case "json":
		config.Encoding = jsonEncoding
	case "light-json":
		config.Encoding = jsonEncoding
		config.EncoderConfig.TimeKey = ""
		config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
		config.DisableStacktrace = true
	case "light-console":
		config.Encoding = consoleEncoding
		config.EncoderConfig.TimeKey = ""
		config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeName = stableWidthNameEncoder
	case "light-color":
		config.Encoding = consoleEncoding
		config.EncoderConfig.TimeKey = ""
		config.EncoderConfig.EncodeLevel = stableWidthCapitalColorLevelEncoder
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeName = stableWidthNameEncoder
	case "console":
		config.Encoding = consoleEncoding
		config.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder
		config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeName = stableWidthNameEncoder
	case "color":
		config.Encoding = consoleEncoding
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		config.EncoderConfig.EncodeDuration = zapcore.StringDurationEncoder
		config.EncoderConfig.EncodeLevel = stableWidthCapitalColorLevelEncoder
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeName = stableWidthNameEncoder
	default:
		return nil, nil, fmt.Errorf("unknown log format: %q", format)
	}

	base, err := config.Build()
	if err != nil {
		return nil, nil, err
	}

	return DecorateLogger(base, filters)
}

func DecorateLogger(base *zap.Logger, filters string) (*zap.Logger, func(), error) {
	filter, err := zapfilter.ParseRules(filters)
	if err != nil {
		return nil, nil, err
	}

	logger := zap.New(zapfilter.NewFilteringCore(base.Core(), filter))
	zap.ReplaceGlobals(logger.Named("other"))

	cleanup := func() {
		_ = logger.Sync()
	}

	// IPFS/libp2p logging
	if os.Getenv("BERTY_LIBP2P_DEBUG") == "1" {
		// FIXME: only setup the proxy if filters allow it
		// depends on https://github.com/moul/zapfilter/pull/9
		// depends on https://github.com/ipfs/go-log/issues/102
		proxyCleanup := setupIPFSLogProxy(logger.Named("ipfs"))
		cleanup = u.CombineFuncs(proxyCleanup, cleanup)
	}

	return logger.Named("bty"), cleanup, nil
}

func setupIPFSLogProxy(logger *zap.Logger) func() {
	ipfs_log.SetupLogging(ipfs_log.Config{
		Stderr: false,
		Stdout: false,
	})
	ipfs_log.SetAllLoggers(ipfs_log.LevelDebug)
	pr := ipfs_log.NewPipeReader()
	r := bufio.NewReader(pr)
	var mutex sync.Mutex

	go func() {
		for {
			line, err := r.ReadString('\n')
			switch err {
			case io.EOF:
				return
			case nil:
				var cpy = make([]byte, len(line))
				copy(cpy, line)
				mutex.Lock()
				go func(line []byte) {
					defer mutex.Unlock()
					var entry struct {
						Level      string `json:"level"`
						Timestamp  string `json:"ts"`
						LoggerName string `json:"logger"`
						Message    string `json:"msg"`
					}
					err = json.Unmarshal(line, &entry)
					if err != nil {
						logger.Debug(string(line))
						return
					}

					// set logger name
					thisLogger := logger
					if entry.LoggerName != "" {
						thisLogger = thisLogger.Named(entry.LoggerName)
					}

					// FIXME: parse entry.Timestamp

					// escape message (sometimes they contains utf-8 chars that break the terminal)
					msg := fmt.Sprintf("%q", entry.Message)
					msg = msg[1 : len(msg)-1]

					switch entry.Level {
					case "debug":
						thisLogger.Debug(msg)
					case "info":
						thisLogger.Info(msg)
					case "warn":
						thisLogger.Warn(msg)
					case "error":
						thisLogger.Error(msg)
					case "dpanic":
						thisLogger.DPanic(msg)
					case "panic":
						thisLogger.Panic(msg)
					case "fatal":
						thisLogger.Fatal(msg)
					}
				}(cpy)
			}
		}
	}()

	cleanup := func() {
		_ = pr.Close()
	}
	return cleanup
}
