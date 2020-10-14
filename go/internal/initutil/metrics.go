package initutil

import (
	"flag"
	"net"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

const metricsHandler = "/metrics"

func (m *Manager) SetupMetricsFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Metrics.Listener, "metrics.listener", ":8888", "Metrics listeners")
	fs.BoolVar(&m.Metrics.Pedantic, "metrics.pedantic", true, "Enable Metrics pedantic")
}

func (m *Manager) GetMetricsRegistery() (*prometheus.Registry, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	return m.getMetricsRegistery()
}

func (m *Manager) getMetricsRegistery() (*prometheus.Registry, error) {
	if m.Metrics.Registery != nil {
		return m.Metrics.Registery, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, err
	}

	l, err := net.Listen("tcp", m.Metrics.Listener)
	if err != nil {
		return nil, err
	}

	if m.Metrics.Pedantic {
		m.Metrics.Registery = prometheus.NewPedanticRegistry()
	} else {
		m.Metrics.Registery = prometheus.NewRegistry()
	}

	m.Metrics.Registery.MustRegister(prometheus.NewBuildInfoCollector())
	m.Metrics.Registery.MustRegister(prometheus.NewGoCollector())

	mux := http.NewServeMux()
	m.workers.Add(func() error {
		handerfor := promhttp.HandlerFor(

			m.Metrics.Registery,
			promhttp.HandlerOpts{Registry: m.Metrics.Registery},
		)

		mux.Handle(metricsHandler, handerfor)
		logger.Info("metrics listener",
			zap.String("handler", metricsHandler),
			zap.String("listener", l.Addr().String()))
		return http.Serve(l, mux)
	}, func(error) {
		l.Close()
	})

	return m.Metrics.Registery, nil
}
