package parser

import (
	"time"

	"berty.tech/berty/v2/go/pkg/tyber"
)

type Status struct {
	StatusType tyber.StatusType `json:"status"`
	Started    time.Time        `json:"started"`
	Finished   time.Time        `json:"finished"`
}

func (s *Status) isRunning() bool {
	return s.StatusType == tyber.Running
}

// Session

type CreateSessionEvent struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"displayName"`
	SrcName     string  `json:"srcName"`
	SrcType     SrcType `json:"srcType"`
	Header      Header  `json:"header"`
	Status
}

func sessionToCreateEvent(s *Session) CreateSessionEvent {
	return CreateSessionEvent{
		ID:          s.ID,
		DisplayName: s.DisplayName,
		SrcName:     s.SrcName,
		SrcType:     s.SrcType,
		Header:      *s.Header,
		Status:      s.Status,
	}
}

type UpdateSessionEvent struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Status
}

func sessionToUpdateEvent(s *Session) UpdateSessionEvent {
	return UpdateSessionEvent{
		ID:          s.ID,
		DisplayName: s.DisplayName,
		Status:      s.Status,
	}
}

type DeleteSessionEvent struct {
	ID string `json:"id"`
}

/*
func sessionToDeleteEvent(s *Session) DeleteSessionEvent {
	return DeleteSessionEvent{s.ID}
}
*/

// Trace

type CreateTraceEvent struct {
	AppTrace
}

type UpdateTraceEvent struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Status
}

// Step

type CreateStepEvent struct {
	ID string `json:"parentID"`
	AppStep
}

// TODO
// type UpdateStepEvent struct {
// 	ID     string `json:"id"`
// 	Detail string `json:"detail"`
// 	Status
// }
