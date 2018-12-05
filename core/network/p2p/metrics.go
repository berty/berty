package p2p

import (
	"context"
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
	opentracing "github.com/opentracing/opentracing-go"
	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

// Metrics is a network.Metrics
var _ network.Metrics = (*Metrics)(nil)

type Metrics struct {
	host host.Host

	peersHandlers []func(*p2p.Peer, error) error
	muHPeers      sync.Mutex

	bw     *bw.BandwidthCounter
	driver *Driver

	rootContext context.Context
}

func NewMetrics(ctx context.Context, d *Driver) network.Metrics {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx)
	defer span.Finish()

	m := &Metrics{
		host:          d.host,
		driver:        d,
		peersHandlers: make([]func(*p2p.Peer, error) error, 0),
		bw:            bw.NewBandwidthCounter(),
		rootContext:   ctx,
	}

	m.host.Network().Notify(m)
	return m
}

func (m *Metrics) Peers(ctx context.Context) *p2p.Peers {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

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
	defer m.muHPeers.Unlock()
	m.peersHandlers = append(m.peersHandlers, handler)
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
		if err := handler(nil, fmt.Errorf("monitor bandwidth peer: %s", err)); err != nil {
			logger().Error("failed to call handler", zap.Error(err))
		}
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

func (m *Metrics) handlePeer(ctx context.Context, id peer.ID) {
	span, _ := tracing.EnterFunc(ctx, id)
	defer span.Finish()

	pi := m.host.Peerstore().PeerInfo(id)
	peer := m.peerInfoToPeer(pi)

	m.muHPeers.Lock()
	var newPeersHandlers = make([]func(*p2p.Peer, error) error, 0)
	for _, h := range m.peersHandlers {
		if err := h(peer, nil); err == nil {
			newPeersHandlers = append(newPeersHandlers, h)
		}
	}
	m.peersHandlers = newPeersHandlers
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
	go m.handlePeer(m.rootContext, c.RemotePeer())
}

func (m *Metrics) Disconnected(s inet.Network, c inet.Conn) {
	go m.handlePeer(m.rootContext, c.RemotePeer())
}
