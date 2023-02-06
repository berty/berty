package tyber

import (
	"context"

	"go.uber.org/zap"
)

const tyberLogNS = "tyber"

func LogError(ctx context.Context, logger *zap.Logger, text string, err error, mutators ...StepMutator) error {
	if logger == nil {
		return err
	}

	logger.Named(tyberLogNS).Error(
		text,
		FormatStepLogFields(ctx, []Detail{{Name: "Error", Description: err.Error()}}, mutators...)...,
	)

	// returning the input error for better usage syntax
	return err
}

func LogFatalError(ctx context.Context, logger *zap.Logger, text string, err error, mutators ...StepMutator) error {
	return LogError(ctx, logger, text, err, append(mutators, Fatal)...)
}

func LogTraceEnd(ctx context.Context, logger *zap.Logger, text string, mutators ...StepMutator) {
	logger.Named(tyberLogNS).Debug(text, FormatStepLogFields(ctx, []Detail{}, append(mutators, EndTrace)...)...)
}

func LogTraceStart(ctx context.Context, logger *zap.Logger, text string) {
	logger.Named(tyberLogNS).Debug(text, FormatTraceLogFields(ctx)...)
}

func LogStep(ctx context.Context, logger *zap.Logger, text string, mutators ...StepMutator) {
	logger.Named(tyberLogNS).Debug(text, FormatStepLogFields(ctx, []Detail{}, mutators...)...)
}
