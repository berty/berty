package jaeger

import (
	"go.uber.org/zap"
	"strings"
)

var connexionFailedOnce = false

// jaegerLogger is an implementation of the Logger interface that delegates to traefik log
type jaegerLogger struct {
	logger *zap.Logger
}

func (l *jaegerLogger) Error(msg string) {
	if strings.Contains(msg, "error when flushing the buffer: write udp") {
		if connexionFailedOnce == true {
			return
		}
		connexionFailedOnce = true
	}
	l.logger.Error("jaeger tracing error", zap.String("error", msg))
}

func (l *jaegerLogger) Infof(msg string, args ...interface{}) {
	l.logger.Sugar().Debugf(msg, args...)
}
