// +build !withoutTyber

package tyber

import (
	"context"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// MayTrace will start a trace with the given string as message but only if the context is tyber injected.
// The passed function is meant to be easly zap#Logger.{Error,Info,Debug}
func MayTrace(ctx context.Context, l func(string, ...zap.Field), msg string) {
	tid, ok := ctx.Value(traceIDKey).(string)
	if ok {
		l(msg, formatTraceLogFields(tid)...)
	}
}

func FormatTraceLogFields(ctx context.Context) []zapcore.Field {
	return formatTraceLogFields(getTraceIDFromContext(ctx))
}

// formatTraceLogFields mainly exists so MayTrace can be inlined.
func formatTraceLogFields(tid string) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(TraceType)),
		zap.Any("trace", Trace{
			TraceID: tid,
		}),
	}
}

// MayTrace will step a trace with the given string as message but only if the context is tyber injected.
// details, status and end will be passed to FormatStepLogFields.
// The passed function is meant to be easly zap#Logger.{Error,Info,Debug}
func MayStep(ctx context.Context, l func(string, ...zap.Field), msg string, details []Detail, status StatusType, end bool) {
	tid, ok := ctx.Value(traceIDKey).(string)
	if ok {
		l(msg, formatStepLogFields(tid, details, status, end)...)
	}
}

func FormatStepLogFields(ctx context.Context, details []Detail, status StatusType, end bool) []zapcore.Field {
	return formatStepLogFields(getTraceIDFromContext(ctx), details, status, end)
}

// formatStepLogFields mainly exists so MayStep can be inlined.
func formatStepLogFields(tid string, details []Detail, status StatusType, end bool) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(StepType)),
		zap.Any("step", Step{
			ParentTraceID: tid,
			Status:        status,
			Details:       details,
			EndTrace:      end,
		}),
	}
}

func FormatEventLogFields(details ...Detail) []zapcore.Field {
	return []zapcore.Field{
		zap.String("tyberLogType", string(EventType)),
		zap.Any("event", Event{
			Details: details,
		}),
	}
}
