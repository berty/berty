package p2p

import (
	"context"
	"fmt"
	"reflect"
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

	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

// Metrics is a network.Metrics
var _ network.Metrics = (*Metrics)(nil)

type Metrics struct {
	host host.Host

	peersHandlers []func(*network.Peer, error) error
	muHPeers      sync.Mutex

	bw     *bw.BandwidthCounter
	driver *Driver

	rootContext context.Context
}

func (m *Metrics) Libp2PPing(ctx context.Context, channelID string) (bool, error) {
	newCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	psID, err := m.driver.FindProvidersAndWait(newCtx, channelID, false)
	if err != nil {
		// only there to silence possible context leak
		return false, nil
	}
	success := make([]chan bool, len(psID))
	for i, p := range psID {
		success[i] = make(chan bool, 1)
		go func(pi pstore.PeerInfo, index int) {
			pID := pi.ID
			if err := m.driver.Connect(newCtx, pi); err != nil {
				success[index] <- false
				return
			}
			ch, err := m.driver.PingSvc.Ping(newCtx, pID)
			if err != nil {
				success[index] <- false
				return
			}
			waiting := <-ch
			if waiting == 0 {
				success[index] <- false
				return
			}
			success[index] <- true
			cancel()
		}(p, i)
	}

	cases := make([]reflect.SelectCase, len(psID))
	for i, ch := range success {
		cases[i] = reflect.SelectCase{Dir: reflect.SelectRecv, Chan: reflect.ValueOf(ch)}
	}

	remaining := len(psID)
	for remaining > 0 {
		chosen, value, ok := reflect.Select(cases)
		remaining--
		if !ok {
			cases[chosen].Chan = reflect.ValueOf(nil)
			continue
		}
		if value.Bool() == true {
			return true, nil
		}
	}
	return false, nil
}

func (m *Metrics) GetListenAddrs(ctx context.Context) *network.ListAddrs {
	lAddr := m.host.Network().ListenAddresses()
	lSlice := []string{}
	for _, l := range lAddr {
		lSlice = append(lSlice, l.String())
	}

	return &network.ListAddrs{
		Addrs: lSlice,
	}
}

func (m *Metrics) GetListenInterfaceAddrs(ctx context.Context) (*network.ListAddrs, error) {
	iAddr, err := m.host.Network().InterfaceListenAddresses()
	if err != nil {
		return nil, err
	}

	iSlice := []string{}
	for _, i := range iAddr {
		iSlice = append(iSlice, i.String())
	}

	return &network.ListAddrs{
		Addrs: iSlice,
	}, nil
}

func NewMetrics(ctx context.Context, d *Driver) network.Metrics {
	tracer := tracing.EnterFunc(ctx, d)
	defer tracer.Finish()
	ctx = tracer.Context()

	m := &Metrics{
		host:          d.host,
		driver:        d,
		peersHandlers: make([]func(*network.Peer, error) error, 0),
		bw:            bw.NewBandwidthCounter(),
		rootContext:   ctx,
	}

	m.host.Network().Notify(m)
	return m
}

func (m *Metrics) Peers(ctx context.Context) *network.Peers {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	peers := m.peers()
	pis := &network.Peers{
		List: make([]*network.Peer, len(peers)),
	}

	for j, p := range peers {
		pis.List[j] = m.peerInfoToPeer(p)
	}

	return pis
}

func (m *Metrics) bandwidthToStats(b bw.Stats) *network.BandwidthStats {
	return &network.BandwidthStats{
		TotalIn:  b.TotalIn,
		TotalOut: b.TotalOut,
		RateIn:   b.RateIn,
		RateOut:  b.RateOut,
	}
}

func (m *Metrics) MonitorPeers(handler func(*network.Peer, error) error) {
	m.muHPeers.Lock()
	defer m.muHPeers.Unlock()
	m.peersHandlers = append(m.peersHandlers, handler)
}

func (m *Metrics) MonitorBandwidth(interval time.Duration, handler func(*network.BandwidthStats, error) error) {
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthTotals()

			logger().Debug("monitoring bandwidth", zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = network.MetricsType_GLOBAL
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) MonitorBandwidthProtocol(id string, interval time.Duration, handler func(*network.BandwidthStats, error) error) {
	pid := protocol.ID(id)
	ticker := time.NewTicker(interval)
	go func() {
		for {
			<-ticker.C
			out := m.bw.GetBandwidthForProtocol(pid)

			logger().Debug("monitoring bandwidth protocol", zap.String("protocol", id), zap.Int64("in", out.TotalIn), zap.Int64("out", out.TotalOut))

			stats := m.bandwidthToStats(out)
			stats.Type = network.MetricsType_PROTOCOL
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) MonitorBandwidthPeer(id string, interval time.Duration, handler func(*network.BandwidthStats, error) error) {
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
			stats.Type = network.MetricsType_PEER
			stats.ID = id
			if err := handler(stats, nil); err != nil {
				return
			}
		}
	}()
}

func (m *Metrics) handlePeer(ctx context.Context, id peer.ID) {
	tracer := tracing.EnterFunc(ctx, id.Pretty())
	defer tracer.Finish()
	// ctx = tracer.Context()

	pi := m.host.Peerstore().PeerInfo(id)
	peer := m.peerInfoToPeer(pi)

	m.muHPeers.Lock()
	var newPeersHandlers = make([]func(*network.Peer, error) error, 0)
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

func (m *Metrics) peerInfoToPeer(pi pstore.PeerInfo) *network.Peer {
	addrs := make([]string, len(pi.Addrs))
	for i, addr := range pi.Addrs {
		addrs[i] = addr.String()
	}

	var connection network.ConnectionType
	switch m.host.Network().Connectedness(pi.ID) {
	case inet.NotConnected:
		connection = network.ConnectionType_NOT_CONNECTED
		break
	case inet.Connected:
		connection = network.ConnectionType_CONNECTED
		break
	case inet.CanConnect:
		connection = network.ConnectionType_CAN_CONNECT
		break
	case inet.CannotConnect:
		connection = network.ConnectionType_CANNOT_CONNECT
		break
	default:
		connection = network.ConnectionType_NOT_CONNECTED

	}

	return &network.Peer{
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
