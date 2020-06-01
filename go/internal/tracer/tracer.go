package tracer

import (
	"context"
	"fmt"
	"log"
	"runtime"
	"strings"

	"go.opentelemetry.io/otel/api/global"
	"go.opentelemetry.io/otel/api/kv"
	"go.opentelemetry.io/otel/api/trace"
	"go.opentelemetry.io/otel/exporters/trace/jaeger"
	"go.opentelemetry.io/otel/exporters/trace/stdout"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

var EnabledTracer = false

var noopTracer = &trace.NoopTracer{}

func InitTracer(flag, service string) func() {
	noop := func() {}

	if flag == "stdout" {
		initStdoutTracer()
	} else if flag != "" {
		return initJaegerTracer(flag, service)
	}

	return noop
}

func SetTraceProvider(tp trace.Provider) {
	global.SetTraceProvider(tp)
	EnabledTracer = true
}

func initStdoutTracer() {
	exporter, err := stdout.NewExporter(stdout.Options{PrettyPrint: true})
	if err != nil {
		log.Fatalf("stdout tracer init error: %v", err)
	}
	tp, err := sdktrace.NewProvider(sdktrace.WithConfig(
		sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}),
		sdktrace.WithSyncer(exporter),
	)
	if err != nil {
		log.Fatalf("stdout tracer init error: %v", err)
	}

	SetTraceProvider(tp)
}

func initJaegerTracer(host, service string) func() {
	tp, flush, err := jaeger.NewExportPipeline(
		jaeger.WithCollectorEndpoint(fmt.Sprintf("http://%s/api/traces", host)),
		jaeger.WithProcess(jaeger.Process{
			ServiceName: service,
			Tags: []kv.KeyValue{
				kv.String("exporter", "jaeger"),
				kv.String("os", runtime.GOOS),
				kv.String("arch", runtime.GOARCH),
				kv.String("go", runtime.Version()),
			},
		}),
		jaeger.WithSDK(&sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}),
	)
	if err != nil {
		log.Fatalf("jaeger tracer init error: %v", err)
	}

	SetTraceProvider(tp)
	return flush
}

func Tracer(name string) trace.Tracer {
	return global.Tracer(name)
}

func NewNamedSpan(ctx context.Context, name string, opts ...trace.StartOption) (context.Context, trace.Span) {
	if !EnabledTracer {
		return noopTracer.Start(ctx, name)
	}

	packageName, funcName := retrieveCaller()
	ctx, span := global.Tracer(packageName).Start(ctx, name, opts...)
	span.SetAttributes(
		kv.String("runtime.package", packageName),
		kv.String("runtime.function", funcName),
	)

	return ctx, span
}

func NewSpan(ctx context.Context, opts ...trace.StartOption) (context.Context, trace.Span) {
	if !EnabledTracer {
		return noopTracer.Start(ctx, "")
	}

	packageName, funcName := retrieveCaller()
	ctx, span := global.Tracer(packageName).Start(ctx, funcName, opts...)
	span.SetAttributes(
		kv.String("package", packageName),
		kv.String("function", funcName),
	)

	return ctx, span
}

func retrieveCaller() (string, string) {
	pc, _, _, ok := runtime.Caller(2)
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
