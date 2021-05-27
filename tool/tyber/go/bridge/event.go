package bridge

import (
	"fmt"

	"berty.tech/berty/tool/tyber/go/parser"
)

// EventKind ...
type EventKind int

//
const (
	UnknownEventKind = EventKind(iota)
	ErrorEventKind
	CreateStepEventKind
	CreateTraceEventKind
	UpdateTraceEventKind
	ListSessionsEventKind
	CreateSessionEventKind
	UpdateSessionEventKind
	ListTracesEventKind
)

func interfaceToEventKind(e interface{}) EventKind {
	switch e.(type) {
	case []parser.CreateSessionEvent:
		return ListSessionsEventKind
	case parser.CreateSessionEvent:
		return CreateSessionEventKind
	case parser.UpdateSessionEvent:
		return UpdateSessionEventKind
	case []parser.CreateTraceEvent:
		return ListTracesEventKind
	case parser.CreateTraceEvent:
		return CreateTraceEventKind
	case parser.UpdateTraceEvent:
		return UpdateTraceEventKind
	case parser.CreateStepEvent:
		return CreateStepEventKind
	default:
		return UnknownEventKind
	}
}

var eventKindNames = map[EventKind]string{
	ErrorEventKind:         "error",
	CreateStepEventKind:    "create_step",
	CreateTraceEventKind:   "create_trace",
	UpdateTraceEventKind:   "update_trace",
	ListSessionsEventKind:  "list_sessions",
	CreateSessionEventKind: "create_session",
	UpdateSessionEventKind: "update_session",
	ListTracesEventKind:    "list_traces",
}

var eventKindByName = func() map[string]EventKind {
	m := make(map[string]EventKind)
	for k, v := range eventKindNames {
		m[v] = k
	}
	return m
}()

func EventKindFromString(s string) EventKind {
	if v, ok := eventKindByName[s]; ok {
		return v
	}
	return UnknownEventKind
}

func (ek EventKind) String() string {
	if s, ok := eventKindNames[ek]; ok {
		return s
	}
	return fmt.Sprintf("unknown_%d", ek)
}
