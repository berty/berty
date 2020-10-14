package ipfsutil

import (
	metrics "github.com/libp2p/go-libp2p-core/metrics"
	prometheus "github.com/prometheus/client_golang/prometheus"
)

var (
	protocolsBandwidthInDesc = prometheus.NewDesc(
		prometheus.BuildFQName("ipfs", "bandwidth", "in"),
		"protocol bandwidth in",
		[]string{"protocol_id"}, nil,
	)
	protocolsBandwidthOutDesc = prometheus.NewDesc(
		prometheus.BuildFQName("ipfs", "bandwidth", "out"),
		"protocol bandwidth out",
		[]string{"protocol_id"}, nil,
	)
)

// BandwidthCollector is a prometheus.Collector
var _ prometheus.Collector = (*BandwidthCollector)(nil)

type BandwidthCollector struct {
	reporter *metrics.BandwidthCounter
}

func NewBandwidthCollector(reporter *metrics.BandwidthCounter) *BandwidthCollector {
	return &BandwidthCollector{reporter}
}

func (bc *BandwidthCollector) Collect(cmetric chan<- prometheus.Metric) {
	for p, s := range bc.reporter.GetBandwidthByProtocol() {
		if p == "" {
			continue
		}

		cmetric <- prometheus.MustNewConstMetric(
			protocolsBandwidthInDesc,
			prometheus.GaugeValue,
			s.RateIn, string(p))

		cmetric <- prometheus.MustNewConstMetric(
			protocolsBandwidthOutDesc,
			prometheus.GaugeValue,
			s.RateOut, string(p))
	}
}

func (bc *BandwidthCollector) Describe(ch chan<- *prometheus.Desc) {
	prometheus.DescribeByCollect(bc, ch)
}
