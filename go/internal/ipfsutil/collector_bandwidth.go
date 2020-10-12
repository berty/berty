package ipfsutil

import (
	"regexp"

	ipfs_core "github.com/ipfs/go-ipfs/core"
	prometheus "github.com/prometheus/client_golang/prometheus"
)

var reSpecialChar = regexp.MustCompile(`[^\w]+`)

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
	node *ipfs_core.IpfsNode
}

func NewBandwidthCollector(node *ipfs_core.IpfsNode) *BandwidthCollector {
	return &BandwidthCollector{node}
}

func (bc *BandwidthCollector) Collect(cmetric chan<- prometheus.Metric) {
	for p, s := range bc.node.Reporter.GetBandwidthByProtocol() {
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
