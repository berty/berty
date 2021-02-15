package parser

import "berty.tech/berty/tool/tyber/go/v2/format"

type Trace struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Steps []*Step `json:"steps"`
	Status
}

type Step struct {
	Name    string          `json:"name"`
	Details []format.Detail `json:"details"`
	Status
}

func traceLogToTrace(tl *traceLog) *Trace {
	return &Trace{
		ID:    tl.Trace.TraceID,
		Name:  tl.Message,
		Steps: []*Step{},
		Status: Status{
			StatusType: format.Running,
			Started:    tl.Time,
		},
	}
}

func stepLogToStep(sl *stepLog) *Step {
	s := &Step{
		Name:    sl.Message,
		Details: sl.Step.Details,
		Status: Status{
			StatusType: sl.Step.Status,
			Started:    sl.Time,
		},
	}

	// TODO
	// if s.Status != format.Running {
	// 	s.Finished = s.Started
	// }

	return s
}
