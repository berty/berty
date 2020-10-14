package ipfsutil

import (
	host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	prometheus "github.com/prometheus/client_golang/prometheus"
)

var (
	protocolsStreamsSumDesc = prometheus.NewDesc(
		prometheus.BuildFQName("ipfs", "host", "open_stream"),
		"number of open stream for this protocol",
		[]string{"protocol_id"}, nil,
	)
	connsSumOpts = prometheus.GaugeOpts{
		Name: prometheus.BuildFQName("ipfs", "host", "open_connection"),
		Help: "number of opened connections",
	}
	// protocolStreamDurationOpts = prometheus.HistogramOpts{
	// 	Name:    prometheus.BuildFQName("ipfs", "host", "stream_duration"),
	// 	Help:    "stream duration",
	// 	Buckets: prometheus.LinearBuckets(0, 10, 6),
	// }
)

const UnknownProtocol = "UnknownProtocol"

type HostCollector struct {
	host           host.Host
	connsCollector prometheus.Gauge
	// streamsCollector *prometheus.HistogramVec
}

func NewHostCollector(h host.Host) *HostCollector {
	gconns := prometheus.NewGauge(connsSumOpts)
	// hstreams := prometheus.NewHistogramVec(protocolStreamDurationOpts, []string{"protocol_id"})

	cc := &HostCollector{
		host:           h,
		connsCollector: gconns,
		// streamsCollector: hstreams,
	}
	h.Network().Notify(cc)
	return cc
}

func (cc *HostCollector) Collect(cmetric chan<- prometheus.Metric) {
	cc.connsCollector.Collect(cmetric)
	// cc.streamsCollector.Collect(cmetric)

	streamsMap := make(map[protocol.ID]int)
	for _, c := range cc.host.Network().Conns() {
		for _, s := range c.GetStreams() {
			if s.Protocol() != "" {
				streamsMap[s.Protocol()]++
			} else {
				streamsMap[UnknownProtocol]++
			}
		}
	}

	for p, ns := range streamsMap {
		cmetric <- prometheus.MustNewConstMetric(
			protocolsStreamsSumDesc,
			prometheus.GaugeValue,
			float64(ns), string(p))
	}
}

func (cc *HostCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- protocolsStreamsSumDesc

	cc.connsCollector.Describe(ch)
	// cc.streamsCollector.Describe(ch)
}

func (cc *HostCollector) Listen(network.Network, ma.Multiaddr)      {}
func (cc *HostCollector) ListenClose(network.Network, ma.Multiaddr) {}

func (cc *HostCollector) Connected(n network.Network, c network.Conn) {
	cc.connsCollector.Inc()
}

func (cc *HostCollector) Disconnected(n network.Network, c network.Conn) {
	cc.connsCollector.Dec()
}

func (cc *HostCollector) OpenedStream(n network.Network, s network.Stream) {}
func (cc *HostCollector) ClosedStream(n network.Network, s network.Stream) {
	// elpased := time.Since(s.Stat().Opened)
	// cc.streamsCollector.WithLabelValues(string(s.Protocol())).Observe(elpased.Seconds())
}
