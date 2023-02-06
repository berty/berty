package tyber

import (
	"context"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Subscribe struct {
	TargetStepName string   `json:"targetStepName"`
	TargetDetails  []Detail `json:"targetDetails"`
	StepToAdd      Step     `json:"stepToAdd"`
}

func FormatSubscribeLogFields(ctx context.Context, targetName string, targetDetails []Detail, stepToAddMutators ...StepMutator) []zapcore.Field {
	sta := Step{
		ParentTraceID: GetTraceIDFromContext(ctx),
		Status:        Succeeded,
	}
	for _, m := range stepToAddMutators {
		sta = m(sta)
	}
	return []zapcore.Field{
		zap.String("tyberLogType", string(SubscribeType)),
		zap.Any("subscribe", Subscribe{
			TargetStepName: targetName,
			TargetDetails:  targetDetails,
			StepToAdd:      sta,
		}),
	}
}
