package tyber

import (
	"context"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

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

func FormatTraceLogFields(ctx context.Context) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(TraceType)),
		zap.Any("trace", Trace{
			TraceID: getTraceIDFromContext(ctx),
		}),
	}
}

func FormatStepLogFields(ctx context.Context, details []Detail, status StatusType, end bool) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(StepType)),
		zap.Any("step", Step{
			ParentTraceID: getTraceIDFromContext(ctx),
			Status:        status,
			Details:       details,
			EndTrace:      end,
		}),
	}
}

func FormatEventLogFields(ctx context.Context, details []Detail) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(EventType)),
		zap.Any("event", Event{
			Details: details,
		}),
	}
}
