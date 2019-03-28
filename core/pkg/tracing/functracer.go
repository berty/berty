package tracing

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/gosimple/slug"
	opentracing "github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/log"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

// fixme: make debug configurable

type FuncTracer struct {
	ctx       context.Context
	span      opentracing.Span
	logger    *zap.Logger
	startTime time.Time
	caller    string
	mutex     sync.RWMutex
}

func (t *FuncTracer) Finish() {
	t.span.Finish()
	t.logger.Debug("func leave", zap.Duration("duration", time.Since(t.startTime)))
	t.SetMetadata("duration", fmt.Sprintf("%s", time.Since(t.startTime)))
}

func (t *FuncTracer) SetMetadata(key string, value string) {
	// check if is gRPC context
	if grpc.ServerTransportStreamFromContext(t.ctx) == nil {
		return
	}

	if err := grpc.SetTrailer(
		t.ctx,
		metadata.Pairs(
			slug.Make(fmt.Sprintf("%s %s", t.caller, key)),
			value,
		),
	); err != nil {
		logger().Warn("failed to set grpc trailer on context", zap.Error(err))
	}
}

func (t *FuncTracer) SetTag(key, value string) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.span.SetTag(key, value)
	t.logger = t.logger.With(zap.String(key, value))
}

func (t *FuncTracer) SetStringField(key, value string) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.span.LogFields(log.String(key, value))
	t.logger = t.logger.With(zap.String(key, value))
}

func (t *FuncTracer) SetAnyField(key string, value interface{}) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.span.LogFields(log.String(key, fmt.Sprintf("%v", value)))
	t.logger = t.logger.With(zap.Any(key, value))
}

func (t *FuncTracer) Span() opentracing.Span {
	t.mutex.RLock()
	defer t.mutex.RUnlock()
	return t.span
}

func (t *FuncTracer) Context() context.Context {
	return t.ctx
}

func EnterFunc(ctx context.Context, args ...interface{}) *FuncTracer {
	t := &FuncTracer{
		startTime: time.Now(),
		caller:    GetCallerName(1),
	}
	callTopic := fmt.Sprintf("call::%s", t.caller)
	t.logger = zap.L().Named("vendor.tracing").With(zap.String("topic", callTopic))

	if ctx == nil {
		ctx = context.Background()
		t.logger.Warn("context is not set")
	}

	t.span, t.ctx = opentracing.StartSpanFromContext(ctx, callTopic)
	// t.SetMetadata("spanid", t.span...)

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
