package tracer

import (
	"context"
	"fmt"
	"log"
	"runtime"

	"go.opentelemetry.io/otel/api/global"
	"go.opentelemetry.io/otel/api/trace"
	"go.opentelemetry.io/otel/exporters/stdout"
	"go.opentelemetry.io/otel/exporters/trace/jaeger"
	"go.opentelemetry.io/otel/label"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

type Cleanup func()

type ExporterType int

const (
	ExporterTypeNone ExporterType = iota
	ExporterTypeStdout
	ExporterTypeJaeger
)

type Config struct {
	ExporterType    ExporterType
	ServiceName     string
	RuntimeProvider bool

	// Jaeger config
	JaegerHost string
}

func InitTracer(flag, service string) func() {
	cfg := &Config{
		RuntimeProvider: true,
		ServiceName:     service,
	}

	switch flag {
	case "": // None
		return func() {}
	case "stdout": // Stdout
		cfg.ExporterType = ExporterTypeStdout
	default: // Jaeger
		cfg.ExporterType = ExporterTypeJaeger
		cfg.JaegerHost = flag
	}

	pt, cl, err := ConfigureProvider(cfg)
	if err != nil {
		log.Fatalf("unable to init tracer: `%s`", err)
	}

	SetGlobalTraceProvider(pt)
	return cl
}

func ConfigureProvider(cfg *Config) (pt trace.Provider, cl Cleanup, err error) {
	switch cfg.ExporterType {
	case ExporterTypeJaeger:
		pt, cl, err = NewJaegerProvider(cfg.JaegerHost, cfg.ServiceName)
	case ExporterTypeStdout:
		pt, err = NewStdoutProvider()
	default:
		pt, cl, err = &trace.NoopProvider{}, func() {}, nil
		return
	}

	if cfg.RuntimeProvider {
		pt = NewRuntimeProvider(pt)
	}

	return
}

func SetGlobalTraceProvider(tp trace.Provider) {
	global.SetTraceProvider(tp)
}

func NewStdoutProvider() (trace.Provider, error) {
	exporter, err := stdout.NewExporter(stdout.Options{PrettyPrint: true})
	if err != nil {
		return nil, err
	}
	return sdktrace.NewProvider(sdktrace.WithConfig(
		sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}),
		sdktrace.WithSyncer(exporter),
	)
}

func NewJaegerProvider(host, service string) (trace.Provider, func(), error) {
	host = fmt.Sprintf("https://%s/api/traces", host)
	return jaeger.NewExportPipeline(
		jaeger.WithCollectorEndpoint(host),
		jaeger.WithProcess(jaeger.Process{
			ServiceName: service,
			Tags: []label.KeyValue{
				label.String("exporter", "jaeger"),
				label.String("os", runtime.GOOS),
				label.String("arch", runtime.GOARCH),
				label.String("go", runtime.Version()),
			},
		}),
		jaeger.WithSDK(&sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}),
	)
}

func New(name string) trace.Tracer {
	return global.Tracer(name)
}

func From(ctx context.Context) trace.Tracer {
	return trace.SpanFromContext(ctx).Tracer()
}
