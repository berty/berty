package jaeger

import (
	"io"

	opentracing "github.com/opentracing/opentracing-go"
	config "github.com/uber/jaeger-client-go/config"
	"go.uber.org/zap"
)

var Config struct {
	Address  string
	Disabled bool
}

func InitTracer(service string) (opentracing.Tracer, io.Closer, error) {
	cfg := &config.Configuration{
		ServiceName: service,
		Disabled:    Config.Disabled,
		Sampler: &config.SamplerConfig{
			Type:  "const",
			Param: 1,
		},
		Reporter: &config.ReporterConfig{
			LogSpans: true,
		},
	}

	if Config.Disabled == false {
		cfg.Reporter.LocalAgentHostPort = Config.Address
	}

	tracer, closer, err := cfg.NewTracer(
		config.Logger(&jaegerLogger{logger: zap.L().Named("vendor.jaeger")}),
	)
	if err != nil {
		return nil, nil, err
	}

	opentracing.SetGlobalTracer(tracer)

	return tracer, closer, nil
}
