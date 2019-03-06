package logmanager

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"

	"berty.tech/core/pkg/filteredzap"
	"berty.tech/core/pkg/zapring"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"
)

type Manager struct {
	opts       Opts
	ring       *zapring.Ring
	fileLogger *lumberjack.Logger
	logger     *zap.Logger
}

type Opts struct {
	RingSize        int32
	LogDirectory    string
	LogLevel        string
	LogNamespaces   string
	AdditionalCores []zapcore.Core
}

func New(opts Opts) (*Manager, error) {
	m := &Manager{
		opts: opts,
	}
	if opts.RingSize > 0 {
		m.ring = zapring.New(uint(opts.RingSize))
	}
	return m, m.open()
}

func ZapLogLevel(logLevel string) (zapcore.Level, error) {
	switch logLevel {
	case "debug":
		return zap.DebugLevel, nil
	case "info":
		return zap.InfoLevel, nil
	case "warn":
		return zap.WarnLevel, nil
	case "error":
		return zap.ErrorLevel, nil
	}
	return zap.DebugLevel, fmt.Errorf("unknown log level: %q", logLevel)
}

func (m *Manager) open() error {
	logLevel, err := ZapLogLevel(m.opts.LogLevel)
	if err != nil {
		return err
	}

	// console core configuration
	consoleOutput := zapcore.Lock(os.Stderr)

	cores := []zapcore.Core{}

	// console core creation
	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEncoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)
	consoleLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= logLevel
	})
	consoleCore := zapcore.NewCore(consoleEncoder, consoleOutput, consoleLevel)

	// Add namespace filtering to consoleCore
	if m.opts.LogNamespaces != "*" {
		consoleCore = filteredzap.FilterByNamespace(
			consoleCore,
			m.opts.LogNamespaces,
		)
	}

	cores = append(cores, consoleCore)

	// ring core creation
	if m.opts.RingSize > 0 {
		encoder := zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig())
		level := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return true
		})
		ringCore := m.ring.Wrap(
			zapcore.NewCore(encoder, zapcore.AddSync(ioutil.Discard), level),
			encoder,
		)
		cores = append(cores, ringCore)
	}

	// local file logging
	if m.opts.LogDirectory != "" {
		encoder := zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig())
		level := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return true
		})
		m.fileLogger = &lumberjack.Logger{
			Filename:   path.Join(m.opts.LogDirectory, "berty.log"),
			MaxSize:    100,   // 100M
			MaxAge:     7,     // 1w
			MaxBackups: 100,   // keep 100 last logs max
			LocalTime:  false, // use UTC
			Compress:   true,
		}
		w := zapcore.AddSync(m.fileLogger)
		logFileCore := zapcore.NewCore(encoder, w, level)
		cores = append(cores, logFileCore)
	}

	cores = append(cores, m.opts.AdditionalCores...)

	// logger creation
	m.logger = zap.New(
		zapcore.NewTee(cores...),
		zap.ErrorOutput(consoleOutput),
		zap.Development(),
		zap.AddCaller(),
	)

	// configure p2p log
	// if err := p2pzap.Configure(m.Zap(), m.LogLevel()); err != nil {
	// 	return err
	// }

	zap.ReplaceGlobals(m.logger) // try to remove this and use our own logger global everywhere
	return nil
}

func (m *Manager) LogRotate() error {
	if m.fileLogger == nil {
		return nil
	}
	return m.fileLogger.Rotate()
}

func (m *Manager) Close() error {
	if m.ring != nil {
		m.ring.Close()
		m.ring = nil
	}
	if m.fileLogger != nil {
		if err := m.fileLogger.Close(); err != nil {
			return err
		}
		m.fileLogger = nil
	}
	return nil
}

func (m *Manager) Ring() *zapring.Ring  { return m.ring }
func (m *Manager) Zap() *zap.Logger     { return m.logger }
func (m *Manager) LogLevel() string     { return m.opts.LogLevel }
func (m *Manager) LogDirectory() string { return m.opts.LogDirectory }

//
// global
//

var global *Manager

func G() *Manager             { return global }
func (m *Manager) SetGlobal() { global = m }
