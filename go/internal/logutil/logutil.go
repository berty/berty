package logutil

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
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

func NewLogger(streams ...Stream) (*zap.Logger, func(), error) {
	cores := []zapcore.Core{}
	cleanup := func() {}
	withIPFS := false

	for _, opts := range streams {
		if opts.filters == "" {
			continue
		}
		var core zapcore.Core

		// configure zap
		var config zap.Config
		switch strings.ToLower(opts.format) {
		case "":
			config = zap.NewDevelopmentConfig()
		case "json":
			config = zap.NewProductionConfig()
			config.Development = true
			config.Encoding = jsonEncoding
		case "light-json":
			config = zap.NewProductionConfig()
			config.Encoding = jsonEncoding
			config.EncoderConfig.TimeKey = ""
			config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
			config.Development = false
			config.DisableStacktrace = true
			config.Sampling = &zap.SamplingConfig{Initial: 100, Thereafter: 100}
		case "light-console":
			config = zap.NewDevelopmentConfig()
			config.Encoding = consoleEncoding
			config.EncoderConfig.TimeKey = ""
			config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeName = stableWidthNameEncoder
			config.Development = false
			config.Sampling = &zap.SamplingConfig{Initial: 100, Thereafter: 100}
		case "light-color":
			config = zap.NewDevelopmentConfig()
			config.Encoding = consoleEncoding
			config.EncoderConfig.TimeKey = ""
			config.EncoderConfig.EncodeLevel = stableWidthCapitalColorLevelEncoder
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeName = stableWidthNameEncoder
			config.Development = false
			config.Sampling = &zap.SamplingConfig{Initial: 100, Thereafter: 100}
		case "console":
			config = zap.NewDevelopmentConfig()
			config.Encoding = consoleEncoding
			config.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder
			config.EncoderConfig.EncodeLevel = stableWidthCapitalLevelEncoder
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeName = stableWidthNameEncoder
			config.Development = true
		case "color":
			config = zap.NewDevelopmentConfig()
			config.Encoding = consoleEncoding
			config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
			config.EncoderConfig.EncodeDuration = zapcore.StringDurationEncoder
			config.EncoderConfig.EncodeLevel = stableWidthCapitalColorLevelEncoder
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeName = stableWidthNameEncoder
			config.Development = true
		default:
			return nil, nil, fmt.Errorf("unknown log format: %q", opts.format)
		}
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)

		var enc zapcore.Encoder
		switch config.Encoding {
		case consoleEncoding:
			enc = zapcore.NewConsoleEncoder(config.EncoderConfig)
		case jsonEncoding:
			enc = zapcore.NewJSONEncoder(config.EncoderConfig)
		}

		switch opts.kind {
		case typeStd:
			switch opts.path {
			case "":
			case "stdout", "stderr":
				config.OutputPaths = []string{opts.path}
			default:
				config.OutputPaths = []string{opts.path}
			}

			logger, err := config.Build()
			if err != nil {
				return nil, nil, err
			}
			core = logger.Core()
		case typeRing:
			ring := opts.ring.SetEncoder(enc)
			core = ring
		case typeLumberjack:
			w := zapcore.AddSync(opts.lumberOpts)
			core = zapcore.NewCore(enc, w, config.Level)
		case typeTyber:
			tyberLogger, err := NewTyberLogger(opts.tyberHost)
			if err != nil {
				return nil, nil, err
			}
			cleanup = u.CombineFuncs(cleanup, func() {
				tyberLogger.Close()
			})
			w := zapcore.AddSync(tyberLogger)
			core = zapcore.NewCore(enc, w, config.Level)
		default:
			return nil, nil, fmt.Errorf("unknown logger type: %q", opts.kind)
		}

		filter, err := zapfilter.ParseRules(opts.filters)
		if err != nil {
			return nil, nil, err
		}
		filtered := zapfilter.NewFilteringCore(core, filter)

		if !withIPFS && zapfilter.CheckAnyLevel(zap.New(filtered).Named("ipfs")) {
			withIPFS = true
		}
		cores = append(cores, filtered)
	}

	if len(cores) == 0 {
		return zap.NewNop(), cleanup, nil
	}

	// combine cores
	tee := zap.New(
		zapcore.NewTee(cores...),
		zap.AddCaller(),
	)
	cleanup = u.CombineFuncs(cleanup, func() { _ = tee.Sync() })

	// IPFS/libp2p logging
	if withIPFS {
		ipfsLogger := tee.Named("ipfs")
		proxyCleanup := setupIPFSLogProxy(ipfsLogger)
		cleanup = u.CombineFuncs(proxyCleanup, cleanup)
	}

	return tee.Named("bty"), cleanup, nil
}

// DecorateLogger can be used by external packages to configure zapfilter and libp2p logging on an existing zap.Logger.
func DecorateLogger(base *zap.Logger, filters string) (*zap.Logger, func(), error) {
	filter, err := zapfilter.ParseRules(filters)
	if err != nil {
		return nil, nil, err
	}

	logger := zap.New(zapfilter.NewFilteringCore(base.Core(), filter), zap.AddCaller())
	zap.ReplaceGlobals(logger.Named("other"))

	cleanup := func() {
		_ = logger.Sync()
	}

	// IPFS/libp2p logging
	{
		ipfsLogger := logger.Named("ipfs")
		if zapfilter.CheckAnyLevel(ipfsLogger) {
			proxyCleanup := setupIPFSLogProxy(ipfsLogger)
			cleanup = u.CombineFuncs(proxyCleanup, cleanup)
		}
	}

	return logger.Named("bty"), cleanup, nil
}

func setupIPFSLogProxy(logger *zap.Logger) func() {
	// FIXME: write a better bridge for IPFS logger.
	//        depends on https://github.com/ipfs/go-log/issues/102

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
				cpy := make([]byte, len(line))
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
