package cmd

import (
	"context"
	"errors"
	"log"
	"time"

	"berty.tech/berty/v2/tool/tyber/go/analyzer"
	"berty.tech/berty/v2/tool/tyber/go/config"
	"berty.tech/berty/v2/tool/tyber/go/logger"
	"berty.tech/berty/v2/tool/tyber/go/parser"
)

type Manager struct {
	ctx    context.Context
	cancel func()

	Config   *config.Config
	Parser   *parser.Parser
	Analyzer *analyzer.Analyzer
	DataPath string

	logger *logger.Logger
}

func New(ctx context.Context, cancel func()) *Manager {
	l := log.New(log.Writer(), log.Prefix(), log.Flags())
	logger := logger.New(l, func(log *logger.Log) {}).Named("manager")

	return &Manager{
		ctx:    ctx,
		cancel: cancel,
		logger: logger,
	}
}

func (m *Manager) Init() error {
	m.Config = config.New(m.ctx, m.logger)
	m.Parser = parser.New(m.ctx, m.logger)
	m.Analyzer = analyzer.New(m.ctx, m.logger)

	// init
	if err := m.Config.Init(m.DataPath); err != nil {
		m.cancel()
		return err
	}

	sessionPath, err := m.Config.GetSessionsPath()
	if err != nil {
		m.logger.Errorf("config getting session path failed: %v", err)
		m.cancel()
		return err
	}

	cerr := make(chan error)
	go func() {
		if err = m.Parser.Init(sessionPath); err != nil {
			m.logger.Errorf("parser init error: %v", err)
			m.cancel()
			cerr <- err
		}
		cerr <- nil
	}()

	select {
	case evt := <-m.Parser.EventChan:
		if _, ok := evt.([]parser.CreateSessionEvent); !ok {
			m.cancel()
			return errors.New("parser init: wrong event received")
		}
	case <-time.After(2 * time.Second):
		m.cancel()
		return errors.New("parser init timeout")
	}

	if err = <-cerr; err != nil {
		m.cancel()
		return err
	}

	return nil
}

func (m *Manager) Cancel() {
	if m.cancel != nil {
		m.cancel()
		m.cancel = nil
	}
}
