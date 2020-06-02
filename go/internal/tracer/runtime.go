package tracer

import (
	"context"
	"runtime"
	"strings"

	"go.opentelemetry.io/otel/api/kv"
	"go.opentelemetry.io/otel/api/trace"
)

type RuntimeProvider struct {
	root trace.Provider
}

func NewRuntimeProvider(root trace.Provider) *RuntimeProvider {
	return &RuntimeProvider{root}
}

func (rp *RuntimeProvider) Tracer(name string) trace.Tracer {
	return &RuntimeTracer{
		skipCall: 3,
		root:     rp.root.Tracer(name),
	}
}

type RuntimeTracer struct {
	skipCall int
	root     trace.Tracer
}

// Start identical to original start span, but automatically add runtime information to the span
func (rt *RuntimeTracer) Start(ctx context.Context, spanName string, opts ...trace.StartOption) (context.Context, trace.Span) {
	callerName, pkgName := retrieveCaller(rt.skipCall)
	opts = append(opts, trace.WithAttributes(
		kv.String("runtime.package", pkgName),
		kv.String("runtime.caller", callerName)))

	if spanName == "" {
		spanName = callerName
	}

	return rt.root.Start(ctx, spanName, opts...)
}

// WithSpan is identical to original start span, but automatically add runtime information to the span
func (rt *RuntimeTracer) WithSpan(ctx context.Context, spanName string, fn func(ctx context.Context) error, opts ...trace.StartOption) error {
	callerName, pkgName := retrieveCaller(rt.skipCall)
	opts = append(opts, trace.WithAttributes(
		kv.String("runtime.package", pkgName),
		kv.String("runtime.caller", callerName)))

	if spanName == "" {
		spanName = callerName
	}

	return rt.root.WithSpan(ctx, spanName, fn, opts...)
}

func retrieveCaller(skip int) (string, string) {
	pc, _, _, ok := runtime.Caller(skip)
	if !ok {
		return "undefined", "undefined"
	}
	parts := strings.Split(runtime.FuncForPC(pc).Name(), ".")
	pl := len(parts)
	packageName := ""
	funcName := parts[pl-1]

	if parts[pl-2][0] == '(' {
		funcName = parts[pl-2] + "." + funcName
		packageName = strings.Join(parts[0:pl-2], ".")
	} else {
		packageName = strings.Join(parts[0:pl-1], ".")
	}

	return packageName, funcName
}
