package main

import (
	"fmt"
	"io"
	"os"

	opentracing "github.com/opentracing/opentracing-go"
	jaeger "github.com/uber/jaeger-client-go"
	config "github.com/uber/jaeger-client-go/config"
)

func initTracer(service string) (opentracing.Tracer, io.Closer, error) {
	cfg := &config.Configuration{
		ServiceName: service,
		Sampler: &config.SamplerConfig{
			Type:  "const",
			Param: 1,
		},
		Reporter: &config.ReporterConfig{
			LogSpans: true,
		},
	}

	host, existHost := os.LookupEnv("JAEGER_AGENT_HOST")
	port, existPort := os.LookupEnv("JAEGER_AGENT_PORT")

	if existHost && existPort {
		cfg.Reporter.LocalAgentHostPort = fmt.Sprintf("%s:%s", host, port)
	}

	tracer, closer, err := cfg.NewTracer(config.Logger(jaeger.StdLogger))
	if err != nil {
		return nil, nil, err
	}

	opentracing.SetGlobalTracer(tracer)

	return tracer, closer, nil
}
