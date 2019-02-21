package metric

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/core/pkg/tracing"
	host "github.com/libp2p/go-libp2p-host"
	bw "github.com/libp2p/go-libp2p-metrics"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// BertyMetric is a BertyMetric
var _ Metric = (*BertyMetric)(nil)
var _ inet.Notifiee = (*BertyMetric)(nil)

// TODO: Use only chan to subscribe to Notifee interface
type BertyMetric struct {
	host host.Host
	ping *ping.PingService

	peersHandlers []func(*Peer, error) error
	muHPeers      sync.Mutex

	bw *bw.BandwidthCounter

	rootContext context.Context
}

func NewBertyMetric(ctx context.Context, h host.Host, ping *ping.PingService) *BertyMetric {
	tracer := tracing.EnterFunc(ctx, h, ping)
	defer tracer.Finish()

	m := &BertyMetric{
		host:          h,
		ping:          ping,
		peersHandlers: make([]func(*Peer, error) error, 0),
		bw:            bw.NewBandwidthCounter(),
		rootContext:   ctx,
	}

	m.host.Network().Notify(m)

	return m
}

// TODO: remove this and use Notifiee to know peer connection and disconnections
// TODO: PR have already update this func
func (m *BertyMetric) Libp2PPing(ctx context.Context, contactID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// WARN: should not work, contactID is not peerID
	_, err := m.ping.Ping(ctx, peer.ID(contactID))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (m *BertyMetric) GetListenAddrs(ctx context.Context) *ListAddrs {
	lAddr := m.host.Network().ListenAddresses()
	lSlice := []string{}
	for _, l := range lAddr {
		lSlice = append(lSlice, l.String())
	}

	return &ListAddrs{
		Addrs: lSlice,
	}
}

func (m *BertyMetric) GetListenInterfaceAddrs(ctx context.Context) (*ListAddrs, error) {
	iAddr, err := m.host.Network().InterfaceListenAddresses()
	if err != nil {
		return nil, err
	}

	iSlice := []string{}
	for _, i := range iAddr {
		iSlice = append(iSlice, i.String())
	}

	return &ListAddrs{
		Addrs: iSlice,
	}, nil
}

func (m *BertyMetric) Peers(ctx context.Context) *Peers {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	peers := m.peers()
	pis := &Peers{
		List: make([]*Peer, len(peers)),
	}

	for j, p := range peers {
		pis.List[j] = m.peerInfoToPeer(p)
	}

	return pis
}

func (m *BertyMetric) bandwidthToStats(b bw.Stats) *BandwidthStats {
	return &BandwidthStats{
		TotalIn:  b.TotalIn,
		TotalOut: b.TotalOut,
		RateIn:   b.RateIn,
		RateOut:  b.RateOut,
	}
}

func (m *BertyMetric) MonitorPeers(handler func(*Peer, error) error) {
	m.muHPeers.Lock()
	defer m.muHPeers.Unlock()
	m.peersHandlers = append(m.peersHandlers, handler)
}

func (m *BertyMetric) MonitorBandwidth(interval time.Duration, handler func(*BandwidthStats, error) error) {
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthTotals()

			logger().Debug("monitoring bandwidth", zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = MetricsType_GLOBAL
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *BertyMetric) MonitorBandwidthProtocol(id string, interval time.Duration, handler func(*BandwidthStats, error) error) {
	pid := protocol.ID(id)
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthForProtocol(pid)

			logger().Debug("monitoring bandwidth protocol", zap.String("protocol", id), zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = MetricsType_PROTOCOL
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *BertyMetric) MonitorBandwidthPeer(id string, interval time.Duration, handler func(*BandwidthStats, error) error) {
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
			stats.Type = MetricsType_PEER
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *BertyMetric) handlePeer(ctx context.Context, id peer.ID) {
	tracer := tracing.EnterFunc(ctx, id.Pretty())
	defer tracer.Finish()
	// ctx = tracer.Context()

	pi := m.host.Peerstore().PeerInfo(id)
	peer := m.peerInfoToPeer(pi)

	m.muHPeers.Lock()
	var newPeersHandlers = make([]func(*Peer, error) error, 0)
	for _, h := range m.peersHandlers {
		if err := h(peer, nil); err == nil {
			newPeersHandlers = append(newPeersHandlers, h)
		}
	}
	m.peersHandlers = newPeersHandlers
	m.muHPeers.Unlock()
}

func (m *BertyMetric) peers() []pstore.PeerInfo {
	return pstore.PeerInfos(m.host.Peerstore(), m.host.Peerstore().Peers())
}

func (m *BertyMetric) peerInfoToPeer(pi pstore.PeerInfo) *Peer {
	addrs := make([]string, len(pi.Addrs))
	for i, addr := range pi.Addrs {
		addrs[i] = addr.String()
	}

	var connection ConnectionType
	switch m.host.Network().Connectedness(pi.ID) {
	case inet.NotConnected:
		connection = ConnectionType_NOT_CONNECTED
		break
	case inet.Connected:
		connection = ConnectionType_CONNECTED
		break
	case inet.CanConnect:
		connection = ConnectionType_CAN_CONNECT
		break
	case inet.CannotConnect:
		connection = ConnectionType_CANNOT_CONNECT
		break
	default:
		connection = ConnectionType_NOT_CONNECTED

	}

	return &Peer{
		ID:         pi.ID.Pretty(),
		Addrs:      addrs,
		Connection: connection,
	}
}

func (m *BertyMetric) Listen(net inet.Network, a ma.Multiaddr)      {}
func (m *BertyMetric) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (m *BertyMetric) OpenedStream(net inet.Network, s inet.Stream) {}
func (m *BertyMetric) ClosedStream(net inet.Network, s inet.Stream) {}

func (m *BertyMetric) Connected(s inet.Network, c inet.Conn) {
	go m.handlePeer(m.rootContext, c.RemotePeer())
}

func (m *BertyMetric) Disconnected(s inet.Network, c inet.Conn) {
	go m.handlePeer(m.rootContext, c.RemotePeer())
}
