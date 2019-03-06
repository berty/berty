package jaeger

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"time"

	opentracing "github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
	config "github.com/uber/jaeger-client-go/config"
	"go.uber.org/zap"
)

func isAgentReachable(address string) error {
	buf := make([]byte, 2048)
	result := make(chan bool)
	writeDone := make(chan struct{})

	destAddr, err := net.ResolveUDPAddr("udp", address)
	if err != nil {
		return err
	}

	conn, err := net.DialUDP(destAddr.Network(), nil, destAddr)
	if err != nil {
		return err
	}

	fmt.Fprintf(conn, "42")

	go func() {
		_, err = bufio.NewReader(conn).Read(buf)
		close(writeDone)
	}()

	go func() {
		select {
		case <-time.After(5 * time.Second):
			result <- true
		case <-writeDone:
			result <- false
		}
	}()

	if <-result == false {
		return err
	}
	conn.Close()

	return nil
}

func InitTracer(address, name string) (opentracing.Tracer, io.Closer, error) {
	if err := isAgentReachable(address); err != nil {
		return nil, nil, errors.Wrap(err, "jaeger agent unreachable")
	}

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

	jaegLogger := zap.L().Named("vendor.jaeger")
	tracer, closer, err := cfg.NewTracer(
		config.Logger(&jaegerLogger{logger: jaegLogger}),
	)
	if err != nil {
		return nil, nil, err
	}

	opentracing.SetGlobalTracer(tracer)

	logger().Debug("jaeger tracer started",
		zap.String("addr", address),
		zap.String("name", name),
	)

	return tracer, closer, nil
}
