package gormutils

import (
	"time"

	"go.uber.org/zap"
)

type zapLogger struct {
	logger *zap.Logger
}

func (l *zapLogger) Print(values ...interface{}) {
	if len(values) < 2 {
		return
	}

	switch values[0] {
	case "sql":
		l.logger.Debug("gorm.debug.sql",
			zap.String("query", values[3].(string)),
			zap.Any("values", values[4]),
			zap.Duration("duration", values[2].(time.Duration)),
			zap.Int64("affected-rows", values[5].(int64)),
			zap.String("source", values[1].(string)), // if AddCallerSkip(6) is well defined, we can safely remove this field
		)
	default:
		l.logger.Debug("gorm.debug.other",
			zap.Any("values", values[2:]),
			zap.String("source", values[1].(string)), // if AddCallerSkip(6) is well defined, we can safely remove this field
		)
	}
}
