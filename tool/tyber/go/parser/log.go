package parser

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"berty.tech/berty/v2/go/pkg/tyber"
)

type baseLog struct {
	Level   string  `json:"level"`
	Epoch   float64 `json:"ts"`
	Logger  string  `json:"logger"`
	Caller  string  `json:"caller"`
	Message string  `json:"msg"`
	Time    time.Time
}

func (bl *baseLog) epochToTime() {
	sec, dec := math.Modf(bl.Epoch)
	bl.Time = time.Unix(int64(sec), int64(dec*(1e9)))
}

type typedLog struct {
	baseLog
	LogType tyber.LogType `json:"tyberLogType"`
}

func parseTypedLog(log string) *typedLog {
	tl := &typedLog{}
	if err := json.Unmarshal([]byte(log), tl); err != nil {
		return nil
	}
	tl.epochToTime()

	if !tl.LogType.IsKnown() {
		return nil
	}

	return tl
}

// Trace

type traceLog struct {
	typedLog
	Trace tyber.Trace `json:"trace"`
}

func parseTraceLog(log string) (*traceLog, error) {
	tl := &traceLog{}
	if err := json.Unmarshal([]byte(log), tl); err != nil {
		return nil, err
	}
	tl.epochToTime()

	if tl.Message == "" {
		return nil, fmt.Errorf("invalid trace log: message empty: %s", log)
	}

	return tl, nil
}

func (tl *traceLog) toAppTrace() *AppTrace {
	return &AppTrace{
		ID:          tl.Trace.TraceID,
		Name:        tl.Message,
		InitialName: tl.Message,
		Steps:       []*AppStep{},
		Status: Status{
			StatusType: tyber.Running,
			Started:    tl.Time,
		},
	}
}

// Step

type stepLog struct {
	typedLog
	Step tyber.Step `json:"step"`
}

func parseStepLog(log string) (*stepLog, error) {
	sl := &stepLog{}
	if err := json.Unmarshal([]byte(log), sl); err != nil {
		return nil, err
	}
	sl.epochToTime()

	if sl.Message == "" {
		return nil, fmt.Errorf("invalid step log: message empty: %s", log)
	}
	if sl.Step.Status != tyber.Running && sl.Step.Status != tyber.Succeeded && sl.Step.Status != tyber.Failed {
		return nil, fmt.Errorf("invalid step log: invalid status: %s", log)
	}

	return sl, nil
}

func (sl *stepLog) toAppStep() *AppStep {
	return &AppStep{
		Name:    sl.Message,
		Details: sl.Step.Details,
		Status: Status{
			StatusType: sl.Step.Status,
			Started:    sl.Time,
		},
		ForceReopen:     sl.Step.ForceReopen,
		UpdateTraceName: sl.Step.UpdateTraceName,
	}
}

// Subscribe

type subscribeLog struct {
	typedLog
	Subscribe tyber.Subscribe `json:"subscribe"`
}

func parseSubscribeLog(log string) (*subscribeLog, error) {
	sl := &subscribeLog{}
	if err := json.Unmarshal([]byte(log), sl); err != nil {
		return nil, err
	}
	sl.epochToTime()

	if sl.Message == "" {
		return nil, fmt.Errorf("invalid step log: message empty: %s", log)
	}

	return sl, nil
}

func (subl *subscribeLog) toAppSubscribe() *AppSubscribe {
	sub := &AppSubscribe{
		TargetName:    subl.Subscribe.TargetStepName,
		TargetDetails: subl.Subscribe.TargetDetails,
		SubscribeStep: &AppStep{
			Name:    subl.Message,
			Details: append(subl.Subscribe.TargetDetails, tyber.Detail{Name: "TargetName", Description: subl.Subscribe.TargetStepName}),
			Status: Status{
				StatusType: tyber.Running,
				Started:    subl.Time,
			},
		},
	}
	return sub
}

// Event

type eventLog struct {
	typedLog
	Event tyber.Event `json:"event"`
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

func (el *eventLog) toAppStep(s tyber.Step) *AppStep {
	return &AppStep{
		Name:    el.Message,
		Details: append(el.Event.Details, s.Details...),
		Status: Status{
			StatusType: s.Status,
			Started:    el.Time,
		},
		ForceReopen:     s.ForceReopen,
		UpdateTraceName: s.UpdateTraceName,
	}
}
