package parser

import (
	"sync"
	"time"

	"berty.tech/berty/tool/tyber/go/v2/format"
)

type Status struct {
	StatusType format.StatusType `json:"status"`
	Started    time.Time         `json:"started"`
	Finished   time.Time         `json:"finished"`
	statusLock sync.RWMutex
}

func (s *Status) isRunning() bool {
	s.statusLock.RLock()
	defer s.statusLock.RUnlock()
	return s.StatusType == format.Running
}

func (s *Status) setStatus(st format.StatusType) {
	s.statusLock.Lock()
	s.StatusType = st
	s.statusLock.Unlock()
}

func (s *Status) getStatus() format.StatusType {
	s.statusLock.RLock()
	defer s.statusLock.RUnlock()
	return s.StatusType
}

func (s *Status) setStartedTime(t time.Time) {
	s.statusLock.Lock()
	s.Started = t
	s.statusLock.Unlock()
}

func (s *Status) getStartedTime() time.Time {
	s.statusLock.RLock()
	defer s.statusLock.RUnlock()
	return s.Started
}

func (s *Status) setFinishedTime(t time.Time) {
	s.statusLock.Lock()
	s.Finished = t
	s.statusLock.Unlock()
}

func (s *Status) getFinishedTime() time.Time {
	s.statusLock.RLock()
	defer s.statusLock.RUnlock()
	return s.Finished
}
