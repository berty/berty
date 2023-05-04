package initutil

import (
	"flag"
	"fmt"
	"net/http"
	"time"

	"github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"

	"berty.tech/weshnet/pkg/logutil"
)

const metricsHandler = "/metrics"

func (m *Manager) SetupMetricsFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Metrics.Listener, "metrics.listener", "", "Metrics listener, will enable metrics")
	fs.BoolVar(&m.Metrics.Pedantic, "metrics.pedantic", false, "Enable Metrics pedantic for debug")
}

func (m *Manager) GetMetricsRegistry() (prometheus.Registerer, error) {
	defer m.prepareForGetter()()

	return m.getMetricsRegistry()
}

func (m *Manager) getMetricsRegistry() (prometheus.Registerer, error) {
	m.applyDefaults()

	if m.Metrics.registerer != nil {
		return m.Metrics.registerer, nil
	}

	if m.Metrics.Listener == "" {
		m.Metrics.registerer = prometheus.DefaultRegisterer
		return m.Metrics.registerer, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, err
	}

	var registry *prometheus.Registry
	if m.Metrics.Pedantic {
		registry = prometheus.NewPedanticRegistry()
	} else {
		registry = prometheus.NewRegistry()
	}

	registry.MustRegister(collectors.NewBuildInfoCollector())
	registry.MustRegister(collectors.NewGoCollector())

	m.Metrics.registerer = registry

	laddr, err := multiaddr.NewMultiaddr(m.Metrics.Listener)
	if err != nil {
		return nil, fmt.Errorf("unable to parse multiaddr: %w", err)
	}

	mux := http.NewServeMux()
	l, err := manet.Listen(laddr)
	if err != nil {
		return nil, err
	}

	handerfor := promhttp.HandlerFor(
		registry,
		promhttp.HandlerOpts{Registry: registry},
	)

	mux.Handle(metricsHandler, handerfor)
	logger.Info("metrics listener",
		zap.String("handler", metricsHandler),
		logutil.PrivateString("listener", l.Addr().String()))

	server := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: time.Second * 5,
	}

	go func() {
		if err := server.Serve(manet.NetListener(l)); err != nil {
			logger.Info("unable to serve metrics",
				logutil.PrivateString("listener", l.Addr().String()),
				zap.Error(err))
		}
	}()

	ctx := m.getContext()
	go func() {
		<-ctx.Done()
		server.Close()
	}()

	return registry, nil
}
