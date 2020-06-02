package tracer

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/api/global"
	"go.opentelemetry.io/otel/api/trace"
)

func NewTestingProvider(t *testing.T, name string) trace.Provider {
	tracingFlag := os.Getenv("TRACER")
	cfg := &Config{
		RuntimeProvider: true,
		ServiceName:     name,
	}

	switch tracingFlag {
	case "": // None
		return global.TraceProvider()
	case "stdout": // Stdout
		cfg.ExporterType = ExporterTypeStdout
	default: // Jaeger
		cfg.ExporterType = ExporterTypeJaeger
		cfg.JaegerHost = tracingFlag
	}

	tp, cl, err := ConfigureProvider(cfg)
	require.NoError(t, err)

	t.Cleanup(cl)

	SetGlobalTraceProvider(tp)
	return tp
}
