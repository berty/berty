package parser

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"berty.tech/berty/tool/tyber/go/v2/format"
	"github.com/gofrs/uuid"
)

type baseLog struct {
	Level   string  `json:"level"`
	Epoch   float64 `json:"ts"`
	Logger  string  `json:"logger"`
	Caller  string  `json:"caller"`
	Message string  `json:"msg"`
	Time    time.Time
}

type typedLog struct {
	baseLog
	LogType format.LogType `json:"tyberLogType"`
}

type traceLog struct {
	typedLog
	Trace format.Trace `json:"trace"`
}

type stepLog struct {
	typedLog
	Step format.Step `json:"step"`
}

type eventLog struct {
	typedLog
	Event format.Event `json:"event"`
}

func (bl *baseLog) epochToTime() {
	sec, dec := math.Modf(bl.Epoch)
	bl.Time = time.Unix(int64(sec), int64(dec*(1e9)))
}

func parseTypedLog(log string) *typedLog {
	tl := &typedLog{}
	if err := json.Unmarshal([]byte(log), tl); err != nil {
		return nil
	}
	tl.epochToTime()

	if tl.LogType != format.TraceType && tl.LogType != format.StepType && tl.LogType != format.EventType {
		return nil
	}

	return tl
}

func parseTraceLog(log string) (*traceLog, error) {
	tl := &traceLog{}
	if err := json.Unmarshal([]byte(log), tl); err != nil {
		return nil, err
	}
	tl.epochToTime()

	if _, err := uuid.FromString(tl.Trace.TraceID); err != nil {
		return nil, fmt.Errorf("invalid trace log: %s: %s", err.Error(), log)
	}
	if tl.Message == "" {
		return nil, fmt.Errorf("invalid trace log: message empty: %s", log)
	}

	return tl, nil
}

func parseStepLog(log string) (*stepLog, error) {
	sl := &stepLog{}
	if err := json.Unmarshal([]byte(log), sl); err != nil {
		return nil, err
	}
	sl.epochToTime()

	if _, err := uuid.FromString(sl.Step.ParentTraceID); err != nil {
		return nil, fmt.Errorf("invalid step log: %s: %s", err.Error(), log)
	}
	if sl.Message == "" {
		return nil, fmt.Errorf("invalid step log: message empty: %s", log)
	}
	if sl.Step.Status != format.Running && sl.Step.Status != format.Succeeded && sl.Step.Status != format.Failed {
		return nil, fmt.Errorf("invalid step log: invalid status: %s", log)
	}

	return sl, nil
}

func parseEventLog(log string) (*eventLog, error) {
	el := &eventLog{}
	if err := json.Unmarshal([]byte(log), el); err != nil {
		return nil, err
	}
	el.epochToTime()

	if el.Message == "" {
		return nil, fmt.Errorf("invalid event log: message empty: %s", log)
	}

	return el, nil
}
