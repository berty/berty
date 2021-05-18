package parser

import (
	"context"
	"fmt"
	"io"
	"net"
	"os"
	"sync"
	"time"

	"berty.tech/berty/tool/tyber/go/logger"
	"berty.tech/berty/v2/go/pkg/tyber"
	"github.com/pkg/errors"
	orderedmap "github.com/wk8/go-ordered-map"
)

type Parser struct {
	logger        *logger.Logger
	sessionPath   string
	listener      *net.TCPListener
	cancelNetwork context.CancelFunc
	initialized   bool
	initLock      sync.RWMutex
	sessions      *orderedmap.OrderedMap
	sessionsLock  sync.RWMutex
	openedSession *Session
	EventChan     chan interface{} // TODO: base event definition
}

func New(l *logger.Logger) *Parser {
	return &Parser{
		logger:    l.Named("parser"),
		sessions:  orderedmap.New(),
		EventChan: make(chan interface{}),
	}
}

func (p *Parser) Init(sessionPath string) error {
	p.sessionPath = sessionPath

	sessionsIndex, err := p.restoreSessionsIndexFile()
	if err != nil {
		return errors.Wrap(err, "listing persisted sessions failed")
	}

	start := time.Now()
	p.logger.Debug("partially restoring sessions started")

	var events []CreateSessionEvent
	for _, sessionID := range sessionsIndex {
		s, err := p.restoreSessionFile(sessionID)
		if err != nil {
			p.logger.Errorf("restoring session %s failed: %v", sessionID, err)
			continue
		}

		p.logger.Debugf("session %s restored successfully", sessionID)

		p.sessions.Set(sessionID, s)
		events = append(events, sessionToCreateEvent(s))
	}

	elapsed := time.Since(start)
	p.logger.Debugf("restoring sessions took: %s", elapsed)

	p.EventChan <- events

	p.initLock.Lock()
	p.initialized = true
	p.initLock.Unlock()

	p.logger.Infof("initialization successful with session path %s", p.sessionPath)

	return nil
}

func (p *Parser) isInitialized() bool {
	p.initLock.RLock()
	defer p.initLock.RUnlock()
	return p.initialized
}

func (p *Parser) ParseFile(path string) error {
	if !p.isInitialized() {
		return errors.New("parser not initialized")
	}

	file, err := os.Open(path)
	if err != nil {
		p.logger.Errorf("opening file failed: %v", err)
		return err
	}

	p.startSession(path, FileType, file)

	return nil
}

func (p *Parser) NetworkListen(address, port string) error {
	if !p.isInitialized() {
		return errors.New("parser not initialized")
	}

	if p.listener != nil {
		p.cancelNetwork()
		p.listener = nil
	}

	ctx, cancel := context.WithCancel(context.Background())
	p.cancelNetwork = cancel

	localAddr, err := net.ResolveTCPAddr("tcp", fmt.Sprintf("%s:%s", address, port))
	if err != nil {
		return err
	}

	p.listener, err = net.ListenTCP("tcp", localAddr)
	if err != nil {
		return err
	}

	go func(l *net.TCPListener) {
		p.logger.Infof("started listening on %s", l.Addr().String())
		defer l.Close()

		for {
			select {
			case <-ctx.Done():
				p.logger.Infof("stopped listening on %s", l.Addr().String())
				return

			default:
				if err := l.SetDeadline(time.Now().Add(time.Second)); err != nil {
					p.logger.Errorf("can't set deadline on tcp listener: %v", err)
					return
				}

				conn, err := l.Accept()
				if err != nil {
					if os.IsTimeout(err) {
						continue
					}
					p.logger.Errorf("TCP accept error: %v", err)
					return
				}

				p.startSession(conn.RemoteAddr().String(), NetworkType, conn)
			}
		}
	}(p.listener)

	return nil
}

func (p *Parser) OpenSession(sessionID string) error {
	if !p.isInitialized() {
		return errors.New("parser not initialized")
	}

	p.sessionsLock.RLock()
	v, ok := p.sessions.Get(sessionID)
	p.sessionsLock.RUnlock()

	if !ok {
		return errors.New(fmt.Sprintf("session %s not found", sessionID))
	}

	s := v.(*Session)
	p.sessionsLock.Lock()
	if p.openedSession != nil && p.openedSession.ID != s.ID && p.openedSession.isRunning() {
		p.openedSession.tracesLock.Lock()
		p.openedSession.openned = false
		p.openedSession.tracesLock.Unlock()
	}
	p.openedSession = s
	p.sessionsLock.Unlock()

	var events []CreateTraceEvent
	s.tracesLock.Lock()
	s.openned = true
	for _, t := range s.Traces {
		events = append(events, t.ToCreateTraceEvent())
	}
	p.EventChan <- events
	s.tracesLock.Unlock()

	return nil
}

func (p *Parser) DeleteSession(sessionID string) {
	if p.isInitialized() {
		p.sessionsLock.Lock()
		if p.openedSession != nil && p.openedSession.ID == sessionID {
			p.openedSession.tracesLock.Lock()
			p.openedSession.openned = false
			p.openedSession.tracesLock.Unlock()
			p.openedSession = nil
		}

		v, ok := p.sessions.Get(sessionID)
		if ok {
			s := v.(*Session)

			if s.isRunning() {
				s.canceled = true
				s.srcCloser.Close()
			} else {
				p.sessions.Delete(sessionID)
				if err := p.deleteSessionFile(sessionID); err != nil {
					p.logger.Errorf("deleting session %s file failed: %v", sessionID, err)
				}
				if err := p.saveSessionsIndexFile(); err != nil {
					p.logger.Errorf("saving sessions index file failed: %v", err)
				}
			}
		}
		p.EventChan <- DeleteSessionEvent{ID: sessionID}
		p.sessionsLock.Unlock()
	}
}

func (p *Parser) DeleteAllSessions() {
	if p.isInitialized() {
		p.sessionsLock.Lock()
		for pair := p.sessions.Oldest(); pair != nil; {
			s := pair.Value.(*Session)
			pair = pair.Next()

			if p.openedSession != nil && p.openedSession.ID == s.ID {
				p.openedSession.tracesLock.Lock()
				p.openedSession.openned = false
				p.openedSession.tracesLock.Unlock()
				p.openedSession = nil
			}

			if s.isRunning() {
				s.canceled = true
				s.srcCloser.Close()
			} else {
				if err := p.deleteSessionFile(s.ID); err != nil {
					p.logger.Errorf("deleting session %s file failed: %v", s.ID, err)
				}
			}
			p.sessions.Delete(s.ID)
		}
		if err := p.saveSessionsIndexFile(); err != nil {
			p.logger.Errorf("saving sessions index file failed: %v", err)
		}
		p.EventChan <- []CreateSessionEvent{}
		p.sessionsLock.Unlock()
	}
}

func (p *Parser) startSession(srcName string, srcType SrcType, srcIO io.ReadCloser) {
	s, err := newSession(srcName, srcType, srcIO, p.EventChan, p.logger)
	if err != nil {
		p.logger.Errorf("starting session failed with logs from %s (%s): %v", srcType, srcName, err)
		return
	}
	p.logger.Infof("started session %s with logs from %s (%s)", s.ID, srcType, srcName)

	s.StatusType = tyber.Running
	p.sessionsLock.Lock()
	p.sessions.Set(s.ID, s)
	p.sessionsLock.Unlock()
	p.EventChan <- sessionToCreateEvent(s)

	go func() {
		if err := s.parseLogs(); err != nil {
			p.logger.Errorf("parsing session %s logs from %s (%s) failed: %v", s.ID, srcType, srcName, err)
		} else {
			p.logger.Infof("successfully parsed session %s logs from %s (%s)", s.ID, srcType, srcName)
		}

		if s.canceled {
			return
		}

		p.sessionsLock.Lock()
		if err := p.saveSessionFile(s); err != nil {
			p.logger.Errorf("saving session %s logs from %s (%s) failed: %v", s.ID, srcType, srcName, err)
		} else {
			p.logger.Debugf("successfully saved session %s logs from %s (%s)", s.ID, srcType, srcName)
			if err = p.saveSessionsIndexFile(); err != nil {
				p.logger.Errorf("saving sessions index file failed: %v", err)
			}
		}
		p.sessionsLock.Unlock()
	}()
}
