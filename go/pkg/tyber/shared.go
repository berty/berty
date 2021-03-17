package tyber

type Detail struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type LogType string

const (
	TraceType LogType = "trace"
	StepType  LogType = "step"
	EventType LogType = "event"
)

type StatusType string

const (
	Running   StatusType = "running"
	Succeeded StatusType = "succeeded"
	Failed    StatusType = "failed"
)

type Trace struct {
	TraceID string `json:"traceID"`
}

type Step struct {
	ParentTraceID string     `json:"parentTraceID"`
	Details       []Detail   `json:"details"`
	Status        StatusType `json:"status"`
	EndTrace      bool       `json:"endTrace"`
}

type Event struct {
	Details []Detail `json:"details"`
}
