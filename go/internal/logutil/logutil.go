package logutil

import (
	"fmt"
	"strings"

	ipfs_log "github.com/ipfs/go-log/v2"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/u"
	"moul.io/zapfilter"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const (
	consoleEncoding = "console"
	jsonEncoding    = "json"
)

func NewLogger(streams ...Stream) (*zap.Logger, func(), error) {
	cores := []zapcore.Core{}
	cleanup := func() {}
	withIPFS := false
	withIPFSDebug := false

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
		case typeFile:
			writer, err := newFileWriteCloser(opts.path, opts.sessionKind)
			if err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			w := zapcore.AddSync(writer)
			core = zapcore.NewCore(enc, w, config.Level)
			cleanup = u.CombineFuncs(cleanup, func() { _ = writer.Close() })
		case typeCustom:
			core = opts.baseLogger.Core()
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
			if zapfilter.CheckLevel(zap.New(filtered).Named("ipfs"), zap.DebugLevel) {
				withIPFSDebug = true
			}
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

	if withIPFS {
		if withIPFSDebug {
			ipfs_log.SetDebugLogging()
		}
		ipfs_log.SetPrimaryCore(tee.Core())
	} else {
		ipfs_log.SetPrimaryCore(zapcore.NewNopCore())
	}

	cleanup = u.CombineFuncs(cleanup, func() { _ = tee.Sync() })

	return tee.Named("bty"), cleanup, nil
}
