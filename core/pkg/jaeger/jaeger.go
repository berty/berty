package jaeger

import (
	"io"

	opentracing "github.com/opentracing/opentracing-go"
	config "github.com/uber/jaeger-client-go/config"
	"go.uber.org/zap"
)

func InitTracer(address, name string) (opentracing.Tracer, io.Closer, error) {
	cfg := &config.Configuration{
		ServiceName: name,
		Sampler: &config.SamplerConfig{
			Type:  "const",
			Param: 1,
		},
		Reporter: &config.ReporterConfig{
			LogSpans:           true,
			LocalAgentHostPort: address,
		},
	}

	logger := zap.L().Named("vendor.jaeger")
	tracer, closer, err := cfg.NewTracer(
		config.Logger(&jaegerLogger{logger: logger}),
	)
	if err != nil {
		return nil, nil, err
	}

	opentracing.SetGlobalTracer(tracer)

	logger.Debug("jaeger tracer started",
		zap.String("addr", address),
		zap.String("name", name),
	)

	return tracer, closer, nil
}
