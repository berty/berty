package initutil

import (
	"flag"
	"net"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

const metricsHandler = "/metrics"

func (m *Manager) SetupMetricsFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Metrics.Listener, "metrics.listener", "", "Metrics listener, will enable metrics")
	fs.BoolVar(&m.Metrics.Pedantic, "metrics.pedantic", false, "Enable Metrics pedantic for debug")
}

func (m *Manager) GetMetricsRegistry() (*prometheus.Registry, error) {
	defer m.prepareForGetter()()

	return m.getMetricsRegistry()
}

func (m *Manager) getMetricsRegistry() (*prometheus.Registry, error) {
	m.applyDefaults()

	if m.Metrics.registry != nil {
		return m.Metrics.registry, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, err
	}

	if m.Metrics.Pedantic {
		m.Metrics.registry = prometheus.NewPedanticRegistry()
	} else {
		m.Metrics.registry = prometheus.NewRegistry()
	}

	m.Metrics.registry.MustRegister(collectors.NewBuildInfoCollector())
	m.Metrics.registry.MustRegister(collectors.NewGoCollector())

	mux := http.NewServeMux()
	var l net.Listener
	m.workers.Add(func() error {
		var err error

		l, err = net.Listen("tcp", m.Metrics.Listener)
		if err != nil {
			return err
		}

		handerfor := promhttp.HandlerFor(
			m.Metrics.registry,
			promhttp.HandlerOpts{Registry: m.Metrics.registry},
		)

		mux.Handle(metricsHandler, handerfor)
		logger.Info("metrics listener",
			zap.String("handler", metricsHandler),
			logutil.PrivateString("listener", l.Addr().String()))

		return http.Serve(l, mux)
	}, func(error) {
		if l != nil {
			l.Close()
		}
	})

	return m.Metrics.registry, nil
}
