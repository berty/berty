package p2p

import (
	"fmt"
	"sync"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	bw "github.com/libp2p/go-libp2p-metrics"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
)

// Metrics is a network.Metrics
var _ network.Metrics = (*Metrics)(nil)

type Metrics struct {
	host host.Host

	peersHandlers []func(*p2p.Peer, error) error
	muHPeers      sync.Mutex

	bw     *bw.BandwidthCounter
	driver *Driver
}

func NewMetrics(d *Driver) network.Metrics {
	m := &Metrics{
		host:          d.host,
		driver:        d,
		peersHandlers: make([]func(*p2p.Peer, error) error, 0),
		bw:            bw.NewBandwidthCounter(),
	}

	m.host.Network().Notify(m)
	return m
}

func (m *Metrics) Peers() *p2p.Peers {
	peers := m.peers()
	pis := &p2p.Peers{
		List: make([]*p2p.Peer, len(peers)),
	}

	for j, p := range peers {
		pis.List[j] = m.peerInfoToPeer(p)
	}

	return pis
}

func (m *Metrics) bandwidthToStats(b bw.Stats) *p2p.BandwidthStats {
	return &p2p.BandwidthStats{
		TotalIn:  b.TotalIn,
		TotalOut: b.TotalOut,
		RateIn:   b.RateIn,
		RateOut:  b.RateOut,
	}
}

func (m *Metrics) MonitorPeers(handler func(*p2p.Peer, error) error) {
	m.muHPeers.Lock()
	m.peersHandlers = append(m.peersHandlers, handler)
	m.muHPeers.Unlock()
}

func (m *Metrics) MonitorBandwidth(interval time.Duration, handler func(*p2p.BandwidthStats, error) error) {
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthTotals()

			logger().Debug("monitoring bandwidth", zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = p2p.MetricsType_GLOBAL
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) MonitorBandwidthProtocol(id string, interval time.Duration, handler func(*p2p.BandwidthStats, error) error) {
	pid := protocol.ID(id)
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthForProtocol(pid)

			logger().Debug("monitoring bandwidth protocol", zap.String("protocol", id), zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = p2p.MetricsType_PROTOCOL
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) MonitorBandwidthPeer(id string, interval time.Duration, handler func(*p2p.BandwidthStats, error) error) {
	peerid, err := peer.IDFromString(id)
	if err != nil {
		handler(nil, fmt.Errorf("monitor bandwidth peer", err))
		return
	}

	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthForPeer(peerid)

			logger().Debug("monitor bandwidth peer", zap.String("peer id", id), zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = p2p.MetricsType_PEER
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) handlePeer(id peer.ID) {
	pi := m.host.Peerstore().PeerInfo(id)
	peer := m.peerInfoToPeer(pi)

	m.muHPeers.Lock()
	for i, h := range m.peersHandlers {
		if err := h(peer, nil); err != nil {
			m.peersHandlers = append(m.peersHandlers[:i], m.peersHandlers[i+1:]...)
		}
	}
	m.muHPeers.Unlock()
}

func (m *Metrics) peers() []pstore.PeerInfo {
	return pstore.PeerInfos(m.host.Peerstore(), m.host.Peerstore().Peers())
}

func (m *Metrics) peerInfoToPeer(pi pstore.PeerInfo) *p2p.Peer {
	addrs := make([]string, len(pi.Addrs))
	for i, addr := range pi.Addrs {
		addrs[i] = addr.String()
	}

	var connection p2p.ConnectionType
	switch m.host.Network().Connectedness(pi.ID) {
	case inet.NotConnected:
		connection = p2p.ConnectionType_NOT_CONNECTED
		break
	case inet.Connected:
		connection = p2p.ConnectionType_CONNECTED
		break
	case inet.CanConnect:
		connection = p2p.ConnectionType_CAN_CONNECT
		break
	case inet.CannotConnect:
		connection = p2p.ConnectionType_CANNOT_CONNECT
		break
	default:
		connection = p2p.ConnectionType_NOT_CONNECTED

	}

	return &p2p.Peer{
		ID:         pi.ID.Pretty(),
		Addrs:      addrs,
		Connection: connection,
	}
}

func (m *Metrics) Listen(net inet.Network, a ma.Multiaddr)      {}
func (m *Metrics) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (m *Metrics) OpenedStream(net inet.Network, s inet.Stream) {}
func (m *Metrics) ClosedStream(net inet.Network, s inet.Stream) {}

func (m *Metrics) Connected(s inet.Network, c inet.Conn) {
	go m.handlePeer(c.RemotePeer())
}

func (m *Metrics) Disconnected(s inet.Network, c inet.Conn) {
	go m.handlePeer(c.RemotePeer())
}
