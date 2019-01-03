package tracing

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	opentracing "github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/log"
	"go.uber.org/zap"
)

// fixme: make debug configurable

type FuncTracer struct {
	ctx       context.Context
	span      opentracing.Span
	logger    *zap.Logger
	startTime time.Time
}

func (t *FuncTracer) Finish() {
	t.span.Finish()
	t.logger.Debug("func leave", zap.Duration("duration", time.Since(t.startTime)))
}

func (t *FuncTracer) SetTag(key, value string) {
	// FIXME: mutex
	t.span.SetTag(key, value)
	t.logger = t.logger.With(zap.String(key, value))
}

func (t *FuncTracer) SetStringField(key, value string) {
	// FIXME: mutex
	t.span.LogFields(log.String(key, value))
	t.logger = t.logger.With(zap.String(key, value))
}

func (t *FuncTracer) SetAnyField(key string, value interface{}) {
	// FIXME: mutex
	t.span.LogFields(log.String(key, fmt.Sprintf("%v", value)))
	t.logger = t.logger.With(zap.Any(key, value))
}

func (t *FuncTracer) Span() opentracing.Span {
	return t.span
}

func (t *FuncTracer) Context() context.Context {
	return t.ctx
}

func EnterFunc(ctx context.Context, args ...interface{}) *FuncTracer {
	t := &FuncTracer{
		startTime: time.Now(),
	}

	topic := GetCallerName("call", 1)
	t.logger = zap.L().Named("vendor.tracing").With(zap.String("topic", topic))

	if ctx == nil {
		ctx = context.Background()
		t.logger.Warn("context is not set")
	}

	t.span, t.ctx = opentracing.StartSpanFromContext(ctx, topic)

	if len(args) > 0 {
		for idx, arg := range args {
			outBytes, err := json.Marshal(arg)
			out := string(outBytes)
			argName := fmt.Sprintf("arg%d", idx)

			if err != nil {
				out = fmt.Sprintf("%v", arg)
			}
			t.SetStringField(argName, out)
		}
	}

	t.SetTag("component", "core.call") // FIXME: why this?
	t.logger.Debug("func enter")
	return t
}
