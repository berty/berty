package parser

import (
	"bufio"
	"fmt"
	"io"
	"sync"

	"berty.tech/berty/tool/tyber/go/logger"
	"berty.tech/berty/v2/go/pkg/tyber"
	"github.com/pkg/errors"
)

type Session struct {
	ID          string      `json:"id"`
	DisplayName string      `json:"displayName"`
	SrcName     string      `json:"srcName"`
	SrcType     SrcType     `json:"srcType"`
	Header      *Header     `json:"header"`
	Traces      []*AppTrace `json:"traces"`
	Status
	// Internals
	logger        *logger.Logger
	srcScanner    *bufio.Scanner
	srcCloser     io.Closer
	openned       bool
	canceled      bool
	tracesLock    sync.Mutex
	runningTraces map[string]*AppTrace
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
		Traces:        []*AppTrace{},
		srcScanner:    bufio.NewScanner(srcIO),
		srcCloser:     srcIO,
		runningTraces: map[string]*AppTrace{},
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

	latestTime := s.Started
	for s.srcScanner.Scan() {
		log := s.srcScanner.Text()
		tl := parseTypedLog(log)

		if tl == nil {
			// Not a Tyber log
			continue
		}

		latestTime = tl.Time

		switch tl.LogType {
		case tyber.TraceType:
			trl, err := parseTraceLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			trace := trl.toAppTrace()

			s.tracesLock.Lock()
			s.Traces = append(s.Traces, trace)
			s.runningTraces[trace.ID] = trace
			s.tracesLock.Unlock()

			if s.openned {
				s.eventChan <- trace.ToCreateTraceEvent()
			}

		case tyber.StepType:
			sl, err := parseStepLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			step := sl.toAppStep()

			s.tracesLock.Lock()
			parentTrace, ok := s.runningTraces[sl.Step.ParentTraceID]
			if !ok && step.ForceReopen {
				for _, t := range s.Traces {
					if t.ID == sl.Step.ParentTraceID {
						parentTrace = t
						s.runningTraces[t.ID] = t
						ok = true
						break
					}
				}
			}

			if !ok {
				s.logger.Errorf("parent trace not found in running traces: %s", log)
				s.tracesLock.Unlock()
				continue
			}

			shouldUpdateTraceName := len(step.UpdateTraceName) > 0
			if shouldUpdateTraceName {
				parentTrace.Name = step.UpdateTraceName
			}
			parentTrace.Steps = append(parentTrace.Steps, step)
			// TODO
			// if step.Status == tyber.Running {
			// 	s.runningSteps[]
			// } elseif sl.Step.EndTrace {
			if sl.Step.EndTrace {
				parentTrace.Finished = step.Started
				parentTrace.StatusType = step.StatusType
				delete(s.runningTraces, parentTrace.ID)
			}
			s.tracesLock.Unlock()

			if s.openned {
				cse := step.ToCreateStepEvent(parentTrace.ID)
				s.eventChan <- cse
				if sl.Step.EndTrace || shouldUpdateTraceName {
					s.eventChan <- parentTrace.ToUpdateTraceEvent()
				}
			}
		case tyber.SubscribeType:
			subl, err := parseSubscribeLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			subscribe := subl.toAppSubscribe()

			s.tracesLock.Lock()
			parentTrace, ok := s.runningTraces[subl.Subscribe.StepToAdd.ParentTraceID]

			if !ok {
				s.logger.Errorf("parent trace not found in running traces: %s", log)
				continue
			}

			parentTrace.Subs = append(parentTrace.Subs, SubTarget{TargetName: subscribe.TargetName, TargetDetails: subscribe.TargetDetails, StepToAdd: subl.Subscribe.StepToAdd})
			s.tracesLock.Unlock()

		case tyber.EventType:
			el, err := parseEventLog(log)
			if err != nil {
				s.logger.Error(err.Error())
				continue
			}

			s.tracesLock.Lock()
			for _, parentTrace := range s.runningTraces {
				changed := false
				for _, sub := range parentTrace.Subs {
					if sub.TargetName == el.Message {
						match := true
						for _, tdet := range sub.TargetDetails {
							found := false
							for _, det := range el.Event.Details {
								if det.Name == tdet.Name && det.Description == tdet.Description {
									found = true
									break
								}
							}
							if !found {
								match = false
								break
							}
						}
						if match {
							step := el.toAppStep(sub.StepToAdd)
							parentTrace.Steps = append(parentTrace.Steps, step)
							if sub.StepToAdd.EndTrace {
								parentTrace.Finished = step.Started
								parentTrace.StatusType = step.StatusType
								delete(s.runningTraces, parentTrace.ID)
								changed = true
							}
						}
					}
				}
				if changed {
					s.eventChan <- parentTrace.ToUpdateTraceEvent()
				}
			}
			s.tracesLock.Unlock()
		}
	}

	s.Finished = latestTime

	if err := s.srcScanner.Err(); err != nil {
		s.StatusType = tyber.Failed
		s.eventChan <- sessionToUpdateEvent(s)
		// TODO: ADD ERROR TO ALL RUNNING TRACES
		return errors.Wrap(err, "parsing traces failed")
	}

	s.StatusType = tyber.Succeeded
	s.eventChan <- sessionToUpdateEvent(s)

	return nil
}
