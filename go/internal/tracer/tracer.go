package tracer

import (
	"context"
	"fmt"
	"log"
	"runtime"
	"strings"

	"go.opentelemetry.io/otel/api/core"
	"go.opentelemetry.io/otel/api/global"
	"go.opentelemetry.io/otel/api/key"
	"go.opentelemetry.io/otel/api/trace"
	"go.opentelemetry.io/otel/exporters/trace/jaeger"
	"go.opentelemetry.io/otel/exporters/trace/stdout"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func InitTracer(flag, service string) func() {
	noop := func() {}

	if flag == "stdout" {
		initStdoutTracer()
	} else if flag != "" {
		return initJaegerTracer(flag, service)
	}

	return noop
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
	global.SetTraceProvider(tp)
}

func initJaegerTracer(host, service string) func() {
	_, flush, err := jaeger.NewExportPipeline(
		jaeger.WithCollectorEndpoint(fmt.Sprintf("http://%s/api/traces", host)),
		jaeger.WithProcess(jaeger.Process{
			ServiceName: service,
			Tags: []core.KeyValue{
				key.String("exporter", "jaeger"),
				key.String("os", runtime.GOOS),
				key.String("arch", runtime.GOARCH),
				key.String("go", runtime.Version()),
			},
		}),
		jaeger.RegisterAsGlobal(),
		jaeger.WithSDK(&sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}),
	)
	if err != nil {
		log.Fatalf("jaeger tracer init error: %v", err)
	}

	return flush
}

func NewSpan(ctx context.Context) (context.Context, trace.Span) {
	packageName, funcName := retrieveCaller()

	tr := global.Tracer(packageName)
	ctx, span := tr.Start(ctx, funcName)
	span.SetAttributes([]core.KeyValue{
		key.String("package", packageName),
		key.String("function", funcName),
	}...)

	return ctx, span
}

func NewNamedSpan(ctx context.Context, name string) (context.Context, trace.Span) {
	packageName, funcName := retrieveCaller()

	tr := global.Tracer(packageName)
	ctx, span := tr.Start(ctx, name)
	span.SetAttributes([]core.KeyValue{
		key.String("package", packageName),
		key.String("function", funcName),
		key.String("name", name),
	}...)

	return ctx, span
}

func retrieveCaller() (string, string) {
	pc, _, _, _ := runtime.Caller(2)
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
