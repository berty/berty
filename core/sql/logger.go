package sql

import (
	"time"

	"go.uber.org/zap"
)

type zapLogger struct{}

func (l *zapLogger) Print(values ...interface{}) {
	if len(values) < 2 {
		return
	}

	logger := zap.L().With(
		//zap.String("gorm_level", values[0].(string)),
		zap.String("source", values[1].(string)), // if AddCallerSkip(6) is well defined, we can safely remove this field
	)

	switch values[0] {
	case "sql":
		logger.Debug("gorm.debug.sql",
			zap.Duration("duration", values[2].(time.Duration)),
			zap.Int64("affected-rows", values[5].(int64)),
			zap.String("query", values[3].(string)),
			zap.Any("values", values[4]),
		)
	default:
		logger.Debug("gorm.debug.other",
			zap.Any("values", values[2:]),
		)
	}
}
