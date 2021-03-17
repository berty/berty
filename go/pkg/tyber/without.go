// +build withoutTyber

package tyber

import (
	"context"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func ContextWithTraceID(ctx context.Context) context.Context {
	return ctx
}

func ContextWithTraceIDFromSalt(ctx context.Context, _ ...[]byte) context.Context {
	return ctx
}

func MayTrace(context.Context, func(string, ...zap.Field), string) {}

func MayStep(context.Context, func(string, ...zap.Field), string, []Detail, StatusType, bool) {}

func FormatTraceLogFields(context.Context) []zapcore.Field {
	return nil
}

func FormatStepLogFields(context.Context, []Detail, StatusType, bool) []zapcore.Field {
	return nil
}

func FormatEventLogFields([]Detail) []zapcore.Field {
	return nil
}
