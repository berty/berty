package parser

import (
	"bufio"
	"fmt"
	"io"
	"sync"

	"berty.tech/berty/v2/tool/tyber/go/format"
	"berty.tech/berty/v2/tool/tyber/go/logger"
	"github.com/pkg/errors"
)

type Session struct {
	ID          string   `json:"id"`
	DisplayName string   `json:"displayName"`
	SrcName     string   `json:"srcName"`
	SrcType     SrcType  `json:"srcType"`
	Header      *Header  `json:"header"`
	Traces      []*Trace `json:"traces"`
	Status
	// Internals
	logger        *logger.Logger
	srcScanner    *bufio.Scanner
	srcCloser     io.Closer
	openned       bool
	canceled      bool
	tracesLock    sync.Mutex
	runningTraces map[string]*Trace
	// runningSteps map[string]*Step TODO
	eventChan chan interface{}
}

type SrcType string

const (
	FileType    SrcType = "file"
	NetworkType SrcType = "network"
)

func newSession(srcName string, srcType SrcType, srcIO io.ReadCloser, eventChan chan interface{}, l *logger.Logger) (*Session, error) {
	s := &Session{
		SrcName:       srcName,
		SrcType:       srcType,
		Traces:        []*Trace{},
		srcScanner:    bufio.NewScanner(srcIO),
		srcCloser:     srcIO,
		runningTraces: map[string]*Trace{},
		// runningSteps: map[string]*Step{}, TODO
		eventChan: eventChan,
	}

	if err := s.parseHeader(); err != nil {
		return nil, errors.Wrap(err, "parsing session header failed")
	}

	s.logger = l.Named(fmt.Sprintf("session %s", s.ID))

	return s, nil
}

func (s *Session) parseLogs() error {
	defer func() {
		s.srcCloser.Close()
		s.srcCloser = nil
		s.srcScanner = nil
	}()

	latestTime := s.getStartedTime()
	for s.srcScanner.Scan() {
		log := s.srcScanner.Text()
		tl := parseTypedLog(log)

		if tl == nil {
			// Not a Tyber log
			continue
		}

		latestTime = tl.Time

		switch tl.LogType {
		case format.TraceType:
			trl, err := parseTraceLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			trace := traceLogToTrace(trl)

			s.tracesLock.Lock()
			s.Traces = append(s.Traces, trace)
			s.runningTraces[trace.ID] = trace
			s.tracesLock.Unlock()

			if s.openned {
				s.eventChan <- traceToCreateEvent(trace)
			}

		case format.StepType:
			sl, err := parseStepLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			step := stepLogToStep(sl)

			s.tracesLock.Lock()
			parentTrace, ok := s.runningTraces[sl.Step.ParentTraceID]
			if !ok {
				s.logger.Errorf("parent trace not found in running traces: %s", log)
				s.tracesLock.Unlock()
				continue
			}

			parentTrace.Steps = append(parentTrace.Steps, step)
			// TODO
			// if step.Status == format.Running {
			// 	s.runningSteps[]
			// } elseif sl.Step.EndTrace {
			if sl.Step.EndTrace {
				parentTrace.setFinishedTime(step.Started)
				parentTrace.setStatus(step.StatusType)
				delete(s.runningTraces, parentTrace.ID)
			}
			s.tracesLock.Unlock()

			if s.openned {
				s.eventChan <- stepToCreateEvent(parentTrace.ID, step)
				if sl.Step.EndTrace {
					s.eventChan <- traceToUpdateEvent(parentTrace)
				}
			}

		case format.EventType:
			// TODO
		}
	}

	s.setFinishedTime(latestTime)

	if err := s.srcScanner.Err(); err != nil {
		s.setStatus(format.Failed)
		s.eventChan <- sessionToUpdateEvent(s)
		// TODO: ADD ERROR TO ALL RUNNING TRACES
		return errors.Wrap(err, "parsing traces failed")
	}

	s.setStatus(format.Succeeded)
	s.eventChan <- sessionToUpdateEvent(s)

	return nil
}
