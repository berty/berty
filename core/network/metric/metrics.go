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
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"go.uber.org/zap"
)

const LatencyEWMASmoothing = 0.1

type connKey string

// BertyMetric is a pstore.Metrics
var _ pstore.Metrics = (*BertyMetric)(nil)

// BertyMetric is a Metrics
var _ Metric = (*BertyMetric)(nil)

// BertyMetric is a inet.Notifiee
var _ inet.Notifiee = (*BertyMetric)(nil)

// TODO: Use only chan to subscribe to Notifee interface
type BertyMetric struct {
	host host.Host
	ping PingService

	peersHandlers []func(*Peer, error) error
	muHPeers      sync.Mutex

	bw *bw.BandwidthCounter

	latconn map[connKey]time.Duration
	latpeer map[peer.ID]time.Duration
	latcmu  sync.RWMutex
	latpmu  sync.RWMutex

	rootContext context.Context
}

func NewBertyMetric(ctx context.Context, h host.Host, ping PingService) *BertyMetric {
	tracer := tracing.EnterFunc(ctx, h, ping)
	defer tracer.Finish()

	m := &BertyMetric{
		host:          h,
		ping:          ping,
		peersHandlers: make([]func(*Peer, error) error, 0),
		bw:            bw.NewBandwidthCounter(),
		latconn:       make(map[connKey]time.Duration),
		latpeer:       make(map[peer.ID]time.Duration),
		rootContext:   ctx,
	}

	m.host.Network().Notify(m)

	return m
}

// RecordLatency records a new latency measurement
func (m *BertyMetric) getKeyForConn(c inet.Conn) (connKey, error) {
	k := fmt.Sprintf("%s:%s", c.RemoteMultiaddr().String(), c.RemotePeer().Pretty())
	kh, err := mh.Sum([]byte(k), mh.MURMUR3, -1)
	if err != nil {
		return "", err
	}
	return connKey(kh.String()), nil
}

// RecordConnLatency records a new latency measurement for a conn,
// Also add a records for a peer
func (m *BertyMetric) RecordConnLatency(c inet.Conn, next time.Duration) {
	key, err := m.getKeyForConn(c)
	if err != nil {
		logger().Warn("cannot get key from conn", zap.Error(err))
		return
	}
	m.latcmu.Lock()
	prev, found := m.latconn[key]
	if !found {
		m.latconn[key] = next // when no data, just take it as the mean.
	} else {
		m.latconn[key] = ewma(prev, next)
	}
	m.latcmu.Unlock()
}

// RecordLatency records a new latency measurement
func (m *BertyMetric) RecordLatency(p peer.ID, next time.Duration) {
	m.latpmu.Lock()
	prev, found := m.latpeer[p]
	if !found {
		m.latpeer[p] = next // when no data, just take it as the mean.
	} else {
		m.latpeer[p] = ewma(prev, next)
	}
	m.latpmu.Unlock()
}

// LatencyConnEWMA returns an exponentially-weighted moving avg.
// of all measurements of a conn latency.
// @FIXME: This method should not return a fixed time if no latency are set yet
func (m *BertyMetric) LatencyConnEWMA(c inet.Conn) time.Duration {
	key, err := m.getKeyForConn(c)
	if err != nil {
		logger().Warn("cannot get key from conn", zap.Error(err))
		return time.Minute
	}

	m.latcmu.RLock()
	defer m.latcmu.RUnlock()

	if lat, ok := m.latconn[key]; ok {
		return lat
	}

	return time.Minute
}

// LatencyEWMA returns an exponentially-weighted moving avg.
// of all measurements of a peer's latency.
// @FIXME: This method should not return a fixed time if no latency are set yet
func (m *BertyMetric) LatencyEWMA(p peer.ID) time.Duration {
	m.latpmu.RLock()
	defer m.latpmu.RUnlock()

	if lat, ok := m.latpeer[p]; ok {
		return lat

	}

	return time.Minute
}

func (m *BertyMetric) PingConn(ctx context.Context, c inet.Conn) (t time.Duration, err error) {
	var cp <-chan time.Duration

	cp, err = m.ping.PingConn(ctx, c)
	if err != nil {
		return
	}
	select {
	case <-ctx.Done():
		err = ctx.Err()
	case t = <-cp:
		m.RecordConnLatency(c, t)
	}

	return
}

func (m *BertyMetric) Ping(ctx context.Context, p peer.ID) (t time.Duration, err error) {
	var cp <-chan time.Duration

	cp, err = m.ping.Ping(ctx, p)
	if err != nil {
		return
	}
	select {
	case <-ctx.Done():
		err = ctx.Err()
	case t = <-cp:
		m.RecordLatency(p, t)
	}

	return
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
	// ping conn to score latency

	go func() {
		t, err := m.PingConn(context.TODO(), c)
		if err != nil {
			logger().Warn("ping error",
				zap.String("addr", c.RemoteMultiaddr().String()),
				zap.Error(err),
			)
		} else {
			logger().Debug("conn latency",
				zap.String("addr", c.RemoteMultiaddr().String()),
				zap.Duration("latency", t),
			)
		}
	}()

	go m.handlePeer(context.Background(), c.RemotePeer())
}

func (m *BertyMetric) Disconnected(s inet.Network, c inet.Conn) {
	go m.handlePeer(context.Background(), c.RemotePeer())
}

func ewma(prev, next time.Duration) time.Duration {
	prevf := float64(prev)
	nextf := float64(next)

	return time.Duration(((1.0 - LatencyEWMASmoothing) * prevf) + (LatencyEWMASmoothing * nextf))

}
